
import React from 'react';
import { Hammer, AlertTriangle } from 'lucide-react';

const MaintenanceScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#070312] flex flex-col items-center justify-center p-8 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-[#00f2ff] blur-[100px] opacity-20 animate-pulse" />
        <div className="glass p-8 rounded-full border border-[#00f2ff]/30">
          <Hammer size={80} className="text-[#00f2ff]" />
        </div>
      </div>
      <h1 className="text-4xl md:text-6xl font-black mb-4">SYSTEM <span className="text-[#ff00c8]">RECONSTRUCTION</span></h1>
      <p className="text-white/50 max-w-md text-lg leading-relaxed">
        Our neural architects are currently upgrading the studio core. 
        We'll be back online with enhanced intelligence shortly.
      </p>
      <div className="mt-12 flex items-center gap-2 text-[#00ff9d] font-bold uppercase tracking-widest text-sm">
        <AlertTriangle size={18} /> Estimated Restore Time: 2 Hours
      </div>
    </div>
  );
};

export default MaintenanceScreen;
