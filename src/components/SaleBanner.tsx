import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
      const { data, error } = await supabase
        .from('sale_banners')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  if (banners.length === 0) return null;

  return (
    <div className="bg-primary text-primary-foreground py-3 overflow-hidden relative transition-all duration-300 hover:py-4">
      <div className="animate-marquee whitespace-nowrap flex items-center">
        {banners.map((banner, index) => (
          <span key={banner.id} className="inline-block px-8 text-sm font-medium animate-pulse-subtle">
            {banner.message}
            {index < banners.length - 1 && <span className="mx-4">•</span>}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SaleBanner;