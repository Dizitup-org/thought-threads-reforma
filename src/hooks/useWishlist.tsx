import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WishlistContextType {
  wishlistCount: number;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlistCount, setWishlistCount] = useState(0);

  const refreshWishlist = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setWishlistCount(0);
        return;
      }

      // Get user profile to get the internal user_id
      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!profile) {
        setWishlistCount(0);
        return;
      }

      const { count } = await supabase
        .from('wishlist')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id);

      setWishlistCount(count || 0);
    } catch (error) {
      console.error('Error fetching wishlist count:', error);
      setWishlistCount(0);
    }
  };

  useEffect(() => {
    refreshWishlist();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      refreshWishlist();
    });

    // Subscribe to wishlist changes
    const wishlistChannel = supabase
      .channel('wishlist-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'wishlist'
      }, () => {
        refreshWishlist();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(wishlistChannel);
    };
  }, []);

  return (
    <WishlistContext.Provider value={{ wishlistCount, refreshWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
