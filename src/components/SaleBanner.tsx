import { useState, useEffect } from "react";

interface SaleBanner {
  id: string;
  message: string;
  is_active: boolean;
}

const SaleBanner = () => {
  const [banners, setBanners] = useState<SaleBanner[]>([]);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/banners');
      if (!response.ok) throw new Error('Failed to fetch banners');
      
      const data: SaleBanner[] = await response.json();
      // Filter for active banners as the backend returns all banners
      const activeBanners = data.filter(banner => banner.is_active);
      setBanners(activeBanners);
    } catch (error) {
      console.error('Error fetching banners:', error);
      setBanners([]);
    }
  };

  if (banners.length === 0) return null;

  return (
    <div className="bg-primary text-primary-foreground py-2 overflow-hidden relative">
      <div className="animate-marquee whitespace-nowrap inline-block">
        {[...banners, ...banners, ...banners, ...banners, ...banners, ...banners].map((banner, index) => (
          <span key={`${banner.id}-${index}`} className="inline-block px-8 text-sm font-medium">
            {banner.message}
            <span className="mx-4">•</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default SaleBanner;