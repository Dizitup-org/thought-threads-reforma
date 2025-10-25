import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, User, Mail, Phone } from "lucide-react";

interface WelcomeAnimationProps {
  onComplete: (userData: { name: string; email: string; phone: string }) => void;
}

const WelcomeAnimation = ({ onComplete }: WelcomeAnimationProps) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.8,
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setStep(2);
    } else {
      toast({
        title: "Please enter your name",
        description: "We'd love to know what to call you!",
        variant: "destructive",
      });
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
      setStep(3);
    } else {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneRegex = /^[0-9]{10}$/;
    if (phoneRegex.test(phone.replace(/[^0-9]/g, ''))) {
      setIsLoading(true);
      
      try {
        // Save user data to guest_users table
        const { data, error } = await supabase
          .from('guest_users')
          .insert([
            {
              name: name.trim(),
              email: email.trim(),
              phone: phone.trim()
            }
          ])
          .select();
        
        if (error) {
          console.error('Error saving guest user data:', error);
          // Still proceed with onboarding even if save fails
        }
        
        onComplete({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim()
        });
      } catch (error) {
        console.error('Error during onboarding:', error);
        onComplete({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim()
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-gradient-to-br from-reforma-cream to-reforma-brown/5 border-reforma-gold/20 shadow-xl">
          <CardContent className="p-8">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="text-center"
            >
              <motion.div
                variants={itemVariants}
                className="flex justify-center mb-6"
              >
                <div className="relative">
                  <Sparkles className="h-12 w-12 text-reforma-gold animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-reforma-gold rounded-full animate-ping"></div>
                </div>
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="serif-heading text-3xl font-bold text-reforma-brown mb-2"
              >
                Welcome to R<span className="relative">ē</span>Forma
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-muted-foreground mb-8"
              >
                Luxury reimagined for the conscious individual
              </motion.p>

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2 text-reforma-brown">
                        <User className="h-4 w-4" />
                        What should we call you?
                      </Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="input-reforma text-center text-lg py-6"
                        autoFocus
                      />
                    </div>
                    <Button 
                      onClick={handleNameSubmit}
                      className="btn-reforma w-full py-6 text-lg"
                      disabled={!name.trim()}
                    >
                      Continue
                    </Button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2 text-reforma-brown">
                        <Mail className="h-4 w-4" />
                        Your email address?
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="input-reforma text-center text-lg py-6"
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1 border-reforma-brown text-reforma-brown hover:bg-reforma-brown/5 py-6"
                      >
                        Back
                      </Button>
                      <Button 
                        onClick={handleEmailSubmit}
                        className="flex-1 btn-reforma py-6 text-lg"
                        disabled={!email.trim()}
                      >
                        Continue
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2 text-reforma-brown">
                        <Phone className="h-4 w-4" />
                        Your phone number?
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="1234567890"
                        className="input-reforma text-center text-lg py-6"
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        variant="outline"
                        onClick={() => setStep(2)}
                        className="flex-1 border-reforma-brown text-reforma-brown hover:bg-reforma-brown/5 py-6"
                      >
                        Back
                      </Button>
                      <Button 
                        onClick={handlePhoneSubmit}
                        className="flex-1 btn-reforma py-6 text-lg"
                        disabled={isLoading || !phone.trim()}
                      >
                        {isLoading ? "Creating Profile..." : "Complete Profile"}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                variants={itemVariants}
                className="mt-8 pt-6 border-t border-reforma-gold/20"
              >
                <p className="text-xs text-muted-foreground">
                  By continuing, you agree to our privacy policy and terms of service
                </p>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default WelcomeAnimation;