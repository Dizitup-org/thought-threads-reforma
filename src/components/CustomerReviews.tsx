import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface Review {
  id: number;
  name: string;
  location: string;
  rating: number;
  comment: string;
  date: string;
}

const reviews: Review[] = [
  {
    id: 1,
    name: "Arjun Mehta",
    location: "Mumbai",
    rating: 5,
    comment: "The quality of the fabric is exceptional. Every piece feels like it was made with intention and care. Truly conscious fashion.",
    date: "2 weeks ago"
  },
  {
    id: 2,
    name: "Priya Sharma",
    location: "Delhi",
    rating: 5,
    comment: "Finally found a brand that understands minimalist luxury. The fit is perfect and the attention to detail is remarkable.",
    date: "1 month ago"
  },
  {
    id: 3,
    name: "Vikram Singh",
    location: "Bangalore",
    rating: 4,
    comment: "Sophisticated designs that speak volumes without being loud. The Introspection tee is my new favorite.",
    date: "3 weeks ago"
  },
  {
    id: 4,
    name: "Ananya Reddy",
    location: "Hyderabad",
    rating: 5,
    comment: "The packaging, the quality, the philosophy - everything about RēForma resonates with me. Worth every rupee.",
    date: "1 week ago"
  },
  {
    id: 5,
    name: "Rahul Kapoor",
    location: "Pune",
    rating: 5,
    comment: "These aren't just clothes, they're statements. The craftsmanship is unmatched in this price range.",
    date: "2 months ago"
  },
  {
    id: 6,
    name: "Meera Iyer",
    location: "Chennai",
    rating: 4,
    comment: "Elegant and thoughtful designs. The fabric quality exceeded my expectations. Will definitely order again.",
    date: "1 month ago"
  }
];

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-gold text-gold"
              : "fill-none text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
};

const CustomerReviews = () => {
  const averageRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);
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
            className="flex items-center justify-center gap-3"
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
        </motion.div>

        {/* Reviews Grid */}
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
                  <p className="text-sm text-muted-foreground">{review.location}</p>
                </div>
                <span className="text-xs text-muted-foreground">{review.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
