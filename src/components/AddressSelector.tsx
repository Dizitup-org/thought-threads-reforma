import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, MapPin } from 'lucide-react';

interface Address {
  id: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

interface AddressSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onAddressSelected: (address: Address) => void;
  userId: string;
}

export default function AddressSelector({ isOpen, onClose, onAddressSelected, userId }: AddressSelectorProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    address_line: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && userId) {
      fetchAddresses();
    }
  }, [isOpen, userId]);

  const fetchAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const saveNewAddress = async () => {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .insert([{ ...newAddress, user_id: userId }])
        .select()
        .single();

      if (error) throw error;

      toast({ title: "Address added successfully!" });
      setAddresses([data, ...addresses]);
      setNewAddress({ address_line: '', city: '', state: '', pincode: '', country: 'India' });
      setShowNewAddressForm(false);
      onAddressSelected(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddressSelect = (address: Address) => {
    onAddressSelected(address);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Delivery Address</DialogTitle>
          <DialogDescription>
            Choose an existing address or add a new one for your order.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!showNewAddressForm && (
            <>
              <Button 
                onClick={() => setShowNewAddressForm(true)}
                className="w-full"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Address
              </Button>

              {addresses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No addresses saved yet</p>
                  <p className="text-sm">Add your first address to continue</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <Card 
                      key={address.id} 
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => handleAddressSelect(address)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{address.address_line}</p>
                            <p className="text-sm text-muted-foreground">
                              {address.city}, {address.state} - {address.pincode}
                            </p>
                            <p className="text-sm text-muted-foreground">{address.country}</p>
                          </div>
                          <Button size="sm">Select</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {showNewAddressForm && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Add New Address</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowNewAddressForm(false)}
                >
                  Cancel
                </Button>
              </div>
              
              <div className="space-y-3">
                <Input
                  placeholder="Address Line (House No, Street, Area)"
                  value={newAddress.address_line}
                  onChange={(e) => setNewAddress({ ...newAddress, address_line: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  />
                  <Input
                    placeholder="State"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Pincode"
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                  />
                  <Input
                    placeholder="Country"
                    value={newAddress.country}
                    onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                  />
                </div>
                <Button 
                  onClick={saveNewAddress}
                  className="w-full"
                  disabled={!newAddress.address_line || !newAddress.city || !newAddress.state || !newAddress.pincode}
                >
                  Save Address & Select
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}