
import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  isPremium: boolean;
}

const AdBanner: React.FC<AdBannerProps> = ({ isPremium }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Completely skip if user is premium
    if (isPremium) return;

    const loadAd = () => {
      if (!containerRef.current) return;

      // Reset container
      containerRef.current.innerHTML = '';

      // Define atOptions on the window object so the invoke script can access it globally
      (window as any).atOptions = {
        'key': '2f1c0e84be141656c8ee986596066a27',
        'format': 'iframe',
        'height': 90,
        'width': 728,
        'params': {}
      };

      // Create the configuration script element
      const configScript = document.createElement('script');
      configScript.type = 'text/javascript';
      configScript.innerHTML = `
        atOptions = {
          'key' : '2f1c0e84be141656c8ee986596066a27',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;

      // Create the invocation script element
      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = 'https://www.highperformanceformat.com/2f1c0e84be141656c8ee986596066a27/invoke.js';
      invokeScript.async = true;

      // Append scripts to the container
      containerRef.current.appendChild(configScript);
      containerRef.current.appendChild(invokeScript);
    };

    // Execute with a slight delay to ensure DOM stability
    const timer = setTimeout(loadAd, 500);
    return () => clearTimeout(timer);
  }, [isPremium]);

  if (isPremium) return null;

  return (
    <div className="w-full flex flex-col items-center justify-center my-10 px-4 animate-in fade-in duration-1000">
      <div className="text-[8px] font-black text-white/10 uppercase tracking-[0.5em] mb-3 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></div>
        ACTIVE NEURAL AD STREAM
      </div>
      
      <div 
        ref={containerRef}
        className="min-h-[90px] w-full max-w-[728px] flex items-center justify-center bg-black/40 border border-white/5 rounded-[28px] overflow-hidden shadow-2xl backdrop-blur-md"
      >
        <div className="text-[10px] font-black text-white/5 uppercase tracking-widest animate-pulse">
          INITIALIZING AD NODE...
        </div>
      </div>
    </div>
  );
};

export default AdBanner;
