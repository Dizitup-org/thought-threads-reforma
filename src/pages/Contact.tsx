import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageCircle, Instagram, Twitter, Clock, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Welcome to the collective!",
      description: "You've been added to our newsletter. Prepare for deep thoughts.",
    });
    
    setEmail("");
    setIsSubmitting(false);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({
        title: "All fields required",
        description: "Please fill in all fields to send your message",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message sent!",
      description: "We'll get back to you soon. Deep thoughts take time to process.",
    });
    
    setName("");
    setEmail("");
    setMessage("");
    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      description: "hello@reforma.store",
      action: "mailto:hello@reforma.store"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      description: "+1 (555) 123-4567",
      action: "https://wa.me/15551234567"
    },
    {
      icon: Instagram,
      title: "Instagram",
      description: "@reforma.threads",
      action: "https://instagram.com/reforma.threads"
    },
    {
      icon: Twitter,
      title: "Twitter",
      description: "@ReformaThreads",
      action: "https://twitter.com/ReformaThreads"
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            <span className="glitch" data-text="CONNECT">CONNECT</span> <span className="text-primary">WITH US</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Got questions? Ideas? Deep thoughts to share? We're here to listen. 
            Connect with fellow thinkers and join the conversation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Form */}
          <Card className="product-card">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Send us a message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="bg-input border-border focus:border-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="bg-input border-border focus:border-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your thoughts, questions, or ideas..."
                    rows={5}
                    className="bg-input border-border focus:border-primary resize-none"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full btn-hero text-accent-foreground font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info & Newsletter */}
          <div className="space-y-8">
            {/* Newsletter */}
            <Card className="product-card">
              <CardHeader>
                <CardTitle className="font-heading text-2xl text-primary">
                  Join the Thought Collective
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Be the first to know about new drops, exclusive designs, and philosophical musings. 
                  No spam, just deep thoughts delivered to your inbox.
                </p>
                
                <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="flex-1 bg-input border-border focus:border-primary"
                    />
                    <Button 
                      type="submit" 
                      className="btn-hero text-accent-foreground font-semibold px-6"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "..." : "Subscribe"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Contact Methods */}
            <Card className="product-card">
              <CardHeader>
                <CardTitle className="font-heading text-2xl">Get in touch</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {contactInfo.map((info, index) => (
                    <a
                      key={info.title}
                      href={info.action}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary transition-colors group"
                    >
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                        <info.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{info.title}</p>
                        <p className="text-sm text-muted-foreground">{info.description}</p>
                      </div>
                    </a>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                    <Clock className="h-4 w-4" />
                    <span>Response Time: Within 24-48 hours</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>Based in: The Digital Realm of Deep Thoughts</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <Card className="bg-gradient-cosmic border-border">
          <CardHeader className="text-center">
            <CardTitle className="font-heading text-3xl">
              Frequently <span className="text-primary">Asked Questions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">How do I place an order?</h4>
                  <p className="text-muted-foreground">
                    Click "Order via WhatsApp" on any product, select your size, and we'll handle the rest through WhatsApp.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">What's your return policy?</h4>
                  <p className="text-muted-foreground">
                    We offer 30-day returns for unworn items. Deep thoughts sometimes need time to settle.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Do you ship internationally?</h4>
                  <p className="text-muted-foreground">
                    Yes! We ship thoughtful designs worldwide. Delivery times vary by location.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">How do I join the admin dashboard?</h4>
                  <p className="text-muted-foreground">
                    Contact us directly for admin access to upload new products and manage the collection.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;