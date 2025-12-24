import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  id: string;
  name: string;
  location: string | null;
  rating: number;
  comment: string;
  created_at: string;
}

const StarRating = ({ rating, interactive = false, onRatingChange }: { 
  rating: number; 
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 transition-colors ${
            star <= (hoverRating || rating)
              ? "fill-gold text-gold"
              : "fill-none text-muted-foreground/30"
          } ${interactive ? "cursor-pointer" : ""}`}
          onClick={() => interactive && onRatingChange?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
        />
      ))}
    </div>
  );
};

const ReviewForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !comment.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in your name and review.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const payload = {
        name: name.trim(),
        location: location.trim() || null,
        rating,
        comment: comment.trim(),
      };

      // Prefer immediate visibility if the schema/policies allow it.
      const attempt1 = await supabase.from('reviews').insert({ ...payload, is_approved: true });
      if (attempt1.error) {
        const attempt2 = await supabase.from('reviews').insert(payload);
        if (attempt2.error) throw attempt2.error;
      }

      toast({
        title: "Thank you!",
        description: "Your review is now visible to everyone."
      });
      
      setName("");
      setLocation("");
      setRating(5);
      setComment("");
      onSuccess();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Your Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          maxLength={100}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="location">Location (optional)</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., Mumbai, Delhi"
          maxLength={100}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Rating *</Label>
        <StarRating rating={rating} interactive onRatingChange={setRating} />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="comment">Your Review *</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with RēForma..."
          rows={4}
          maxLength={500}
          required
        />
      </div>
      
      <Button type="submit" className="w-full luxury-btn-primary" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffInDays / 365)} year${Math.floor(diffInDays / 365) > 1 ? 's' : ''} ago`;
};

const CustomerReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('id,name,location,rating,comment,created_at,is_approved')
        .or('is_approved.is.null,is_approved.eq.true')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      const next = (data || []).map((r: any) => ({
        id: String(r.id),
        name: String(r.name ?? ''),
        location: r.location === null || r.location === undefined ? null : String(r.location),
        rating: Number(r.rating ?? 0),
        comment: String(r.comment ?? ''),
        created_at: String(r.created_at ?? new Date().toISOString()),
      }))
      .filter((r) => r.id && r.name && r.comment && r.rating >= 1 && r.rating <= 5);

      setReviews(next);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast({
        title: "Reviews unavailable",
        description: "Couldn't load reviews right now.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleReviewSuccess = () => {
    setIsDialogOpen(false);
    fetchReviews();
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "5.0";
  const totalReviews = reviews.length;

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-card scroll-fade-in">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="serif-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-reforma-brown luxury-heading">
            What Our Customers Say
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-6">
            Hear from the thoughtful minds who choose RēForma.
          </p>
          
          {/* Overall Rating */}
          <motion.div
            className="flex items-center justify-center gap-3 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-6 w-6 fill-gold text-gold"
                />
              ))}
            </div>
            <span className="text-2xl font-semibold text-reforma-brown">{averageRating}</span>
            <span className="text-muted-foreground">({totalReviews}+ reviews)</span>
          </motion.div>

          {/* Write Review Button */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="luxury-btn-outline">
                <PenLine className="mr-2 h-4 w-4" />
                Write a Review
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="serif-heading text-xl text-reforma-brown">
                  Share Your Experience
                </DialogTitle>
              </DialogHeader>
              <ReviewForm onSuccess={handleReviewSuccess} />
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Reviews Grid */}
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                className="bg-background rounded-lg p-6 shadow-soft hover:shadow-luxury transition-shadow duration-300 border border-border/50"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
              >
                {/* Rating */}
                <div className="mb-4">
                  <StarRating rating={review.rating} />
                </div>
                
                {/* Comment */}
                <p className="text-foreground/80 leading-relaxed mb-4 italic">
                  "{review.comment}"
                </p>
                
                {/* Author */}
                <div className="flex items-center justify-between pt-4 border-t border-border/30">
                  <div>
                    <p className="font-medium text-reforma-brown">{review.name}</p>
                    {review.location && (
                      <p className="text-sm text-muted-foreground">{review.location}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(review.created_at)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="text-muted-foreground text-lg mb-4">
              Be the first to share your experience!
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default CustomerReviews;
