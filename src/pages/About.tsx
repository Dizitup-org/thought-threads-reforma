import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Brain, Heart, Lightbulb, ArrowRight } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Brain,
      title: "Deep Thinking",
      description: "We celebrate the minds that question, analyze, and explore the depths of existence. Every design is crafted for the intellectual soul."
    },
    {
      icon: Heart,
      title: "Authentic Expression",
      description: "Your clothing should reflect your inner world. We create pieces that resonate with introverts and thoughtful individuals."
    },
    {
      icon: Lightbulb,
      title: "Creative Vision",
      description: "Inspired by cinema, philosophy, and art, each collection tells a story that speaks to the creative overthinker in all of us."
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">
            <span className="text-primary">THREADS OF</span>
            <br />
            <span className="glitch" data-text="THOUGHT">THOUGHT</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            More than streetwear. We're a philosophy woven into fabric, 
            a movement for the minds that think differently, deeply, and deliberately.
          </p>
        </div>

        {/* Philosophy Section */}
        <div className="mb-20">
          <Card className="bg-gradient-cosmic border-border p-8 md:p-12">
            <CardContent className="space-y-6">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-8">
                Our <span className="text-primary">Philosophy</span>
              </h2>
              
              <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
                <p className="text-lg leading-relaxed">
                  In a world of noise, we create for the quiet minds. The overthinkers. 
                  The dreamers who find beauty in complexity and meaning in the mundane.
                </p>
                
                <p className="text-lg leading-relaxed">
                  REFORMA isn't just about what you wear—it's about who you are. 
                  We design for the introverts who speak volumes through their choices, 
                  the deep thinkers who see art in algorithms, poetry in code, 
                  and philosophy in everyday moments.
                </p>
                
                <p className="text-lg leading-relaxed">
                  Every piece carries the weight of contemplation, the spark of creativity, 
                  and the quiet confidence of minds that refuse to think small. 
                  This is streetwear with substance. Fashion with feeling. 
                  <span className="text-primary font-semibold"> Threads of Thought.</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-12">
            What We <span className="text-primary">Stand For</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card 
                key={value.title} 
                className="product-card text-center p-6 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardContent className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-bold">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Story Section */}
        <div className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="font-heading text-3xl md:text-4xl font-bold">
                The <span className="text-primary">Story</span> Behind the Brand
              </h2>
              
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Born from late-night contemplations and endless cups of coffee, 
                  REFORMA emerged from a simple observation: the fashion world rarely 
                  speaks to the depth of the thinking mind.
                </p>
                
                <p>
                  We found inspiration in the shadows of Inception, the digital 
                  landscapes of Black Mirror, and the quiet corners where introverts 
                  find their power. Each design is a conversation starter for those 
                  who prefer meaningful exchanges over small talk.
                </p>
                
                <p>
                  Today, we continue to create for the community of deep thinkers, 
                  creative souls, and philosophical minds who understand that what 
                  you wear can be as profound as what you think.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-neon p-8 rounded-lg">
                <div className="bg-card p-6 rounded-lg">
                  <blockquote className="text-lg italic text-center">
                    "Fashion fades, but the thoughts that inspire it are eternal. 
                    We don't just make clothes—we craft conversations for the curious mind."
                  </blockquote>
                  <footer className="text-center mt-4 text-muted-foreground">
                    — REFORMA Collective
                  </footer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-card p-12 rounded-lg border border-border">
          <h2 className="font-heading text-3xl font-bold mb-4">
            Ready to Join the <span className="text-primary">Collective?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover streetwear that matches the depth of your thoughts. 
            Every piece tells a story—what will yours say?
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="btn-hero text-accent-foreground font-semibold">
              <Link to="/shop">
                Explore Collection
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Link to="/contact">
                Connect With Us
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;