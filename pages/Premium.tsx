
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { ref, push, set } from 'firebase/database';
import { db } from '../firebase';
import { Check, Crown, X, Copy, Zap, Diamond, ShieldCheck, Clock, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';

interface PremiumProps {
  user: UserProfile | null;
}

const Premium: React.FC<PremiumProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'Cheap' | 'Standard' | 'Ultra'>('Cheap');
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);

  const getCategoryTheme = (tab: string) => {
    switch (tab) {
      case 'Cheap':
        return {
          primary: '#00ff9d',
          accent: '#00ff9d',
          bg: 'bg-[#00ff9d]',
          text: 'text-[#00ff9d]',
          border: 'border-[#00ff9d]/20',
          hoverBorder: 'hover:border-[#00ff9d]/50',
          shadow: 'shadow-[#00ff9d]/20',
          btnShadow: 'hover:shadow-[0_0_25px_rgba(0,255,157,0.4)]',
          gradient: 'from-[#00ff9d]/10 to-transparent'
        };
      case 'Standard':
        return {
          primary: '#00f2ff',
          accent: '#00f2ff',
          bg: 'bg-[#00f2ff]',
          text: 'text-[#00f2ff]',
          border: 'border-[#00f2ff]/20',
          hoverBorder: 'hover:border-[#00f2ff]/50',
          shadow: 'shadow-[#00f2ff]/20',
          btnShadow: 'hover:shadow-[0_0_25px_rgba(0,242,255,0.4)]',
          gradient: 'from-[#00f2ff]/10 to-transparent'
        };
      case 'Ultra':
        return {
          primary: '#ff00c8',
          accent: '#ff85e1',
          bg: 'bg-gradient-to-r from-[#ff00c8] to-[#ff85e1]',
          text: 'text-[#ff00c8]',
          border: 'border-[#ff00c8]/30',
          hoverBorder: 'hover:border-[#ff00c8]/60',
          shadow: 'shadow-[#ff00c8]/20',
          btnShadow: 'hover:shadow-[0_0_25px_rgba(255,0,200,0.4)]',
          gradient: 'from-[#ff00c8]/20 to-[#ff85e1]/5'
        };
      default:
        return {
          primary: '#00f2ff',
          accent: '#00f2ff',
          bg: 'bg-[#00f2ff]',
          text: 'text-[#00f2ff]',
          border: 'border-[#00f2ff]/20',
          hoverBorder: 'hover:border-[#00f2ff]/50',
          shadow: 'shadow-[#00f2ff]/20',
          btnShadow: 'hover:shadow-[0_0_25px_rgba(0,242,255,0.4)]',
          gradient: 'from-[#00f2ff]/10 to-transparent'
        };
    }
  };

  const theme = getCategoryTheme(activeTab);

  const getRemainingDays = () => {
    if (!user?.is_premium || !user?.premium_expiry_timestamp) return 0;
    const diff = user.premium_expiry_timestamp - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const commonBenefits = ["Unlimited AI Access", "Ad-Free Environment", "Custom Profile UI", "Priority Support"];

  const planCategories = {
    Cheap: [
      { id: 'c1', name: 'MINI PULSE', price: '9', duration: '3 DAYS', days: 3, icon: Zap, benefits: ["Basic AI Model", "No Ads", "72h Validity"] },
      { id: 'cquick', name: 'QUICK START', price: '19', duration: '5 DAYS', days: 5, icon: Zap, benefits: ["Standard AI Access", "5 Days Validity", "No Ads"] },
      { id: 'clite', name: 'LITE ARCHITECT', price: '29', duration: '7 DAYS', days: 7, icon: Zap, benefits: ["Full Core Access", "7 Days Validity", "No Ads"] },
      { id: 'cbronze', name: 'BRONZE DEV', price: '150', duration: '15 DAYS', days: 15, icon: Zap, benefits: ["Pro Logic Engine", "15 Days Validity", "All Free Tools"] },
    ],
    Standard: [
      { id: 'smonth', name: 'MONTHLY LITE', price: '200', duration: '20 DAYS', days: 20, icon: Diamond, benefits: ["20 Days Pro Access", "Custom Theme Engine", "Fast Response"] },
      { id: 'sstand', name: 'STANDARD DEV', price: '250', duration: '30 DAYS', days: 30, icon: Diamond, benefits: ["30 Days Full Pro", "Neural Architecture", "No Latency"] },
      { id: 'spro', name: 'PRO BUILDER', price: '300', duration: '40 DAYS', days: 40, icon: Diamond, benefits: ["40 Days Access", "Advanced Tools", "Dedicated Support"] },
      { id: 'sqart', name: 'QUARTERLY DEV', price: '500', duration: '90 DAYS', days: 90, icon: Diamond, benefits: ["90 Days Premium", "Unlimited Generation", "Priority Node"] },
    ],
    Ultra: [
      { id: 'uelite', name: 'ELITE ARCHITECT', price: '600', duration: '120 DAYS', days: 120, icon: Crown, benefits: ["120 Days Ultra Access", "Max Performance", "Exclusive UI"] },
      { id: 'uultra', name: 'ULTRA STUDIO', price: '650', duration: '150 DAYS', days: 150, icon: Crown, benefits: ["150 Days Access", "VIP Beta Access", "Everything Unlimited"] },
      { id: 'udiam', name: 'DIAMOND DEV', price: '700', duration: '180 DAYS', days: 180, icon: Crown, benefits: ["Half Year Pro Access", "Top Priority Support", "Diamond Status"] },
      { id: 'uyear', name: 'ULTRA YEARLY', price: '999', duration: '365 DAYS', days: 365, icon: Crown, benefits: ["Full Year Access", "Ultra High Priority", "Developer API Access"] },
    ]
  };

  const handleCheckout = (plan: any) => {
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const submitRequest = async () => {
    if (!transactionId) return alert('Enter Transaction ID');
    setLoading(true);
    try {
      const requestRef = push(ref(db, 'premium_requests'));
      await set(requestRef, {
        uid: user?.uid,
        username: user?.username,
        plan_name: selectedPlan.name,
        plan_price: `₹${selectedPlan.price}`,
        duration_days: selectedPlan.days,
        transaction_id: transactionId,
        payment_screenshot_url: 'https://i.supaimg.com/1432f5fd-4d60-4493-9cd2-01074a0fcd40.jpg',
        status: 'pending',
        created_at: Date.now()
      });

      const notifRef = push(ref(db, 'notifications'));
      await set(notifRef, {
        title: 'New Premium Request',
        message: `${user?.username} requested ${selectedPlan.name} (${selectedPlan.duration}).`,
        type: 'premium_request',
        is_read: false,
        created_at: Date.now(),
        priority: 'high'
      });

      setShowCheckout(false);
      setTransactionId('');
      alert('Request Submitted! Plan will activate after Admin Verification.');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentPlanList = planCategories[activeTab];

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      <div className="mb-10">
        <h3 className="text-white/30 text-[10px] font-black tracking-[0.3em] uppercase mb-4 px-2">ACCOUNT STATUS</h3>
        <div className="relative overflow-hidden rounded-[50px] bg-gradient-to-br from-[#0c051a] to-[#05020d] border border-white/10 p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 blur-[100px] pointer-events-none"></div>
          
          <div className="flex items-center gap-6 mb-8">
            <div className={`w-24 h-24 rounded-[35px] flex items-center justify-center shadow-2xl ${user?.is_premium ? 'bg-gradient-to-br from-[#ff00c8] to-[#8000ff]' : 'bg-white/5'}`}>
              <Crown size={48} className={user?.is_premium ? 'text-white' : 'text-white/10'} />
            </div>
            
            <div>
              <h2 className="text-2xl font-black tracking-tight mb-1 uppercase truncate max-w-[200px]">
                {user?.is_premium ? 'BASIC PRO LITE' : 'FREE ARCHITECT'}
              </h2>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-black tracking-widest uppercase ${user?.is_premium ? 'text-pink-500' : 'text-white/20'}`}>
                  PREMIUM {user?.is_premium ? 'ACTIVE' : 'INACTIVE'}
                </span>
                <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">ALPHA AI</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-[35px] border border-white/5 p-6 backdrop-blur-xl flex flex-col justify-center">
               <span className="text-[9px] font-black text-white/30 tracking-widest uppercase mb-1">STATUS</span>
               <span className="text-lg font-black text-[#00ff9d] tracking-tighter uppercase">ONLINE</span>
            </div>
            <div className="bg-white/5 rounded-[35px] border border-white/5 p-6 backdrop-blur-xl flex flex-col justify-center">
               <span className="text-[9px] font-black text-white/30 tracking-widest uppercase mb-1">TIME REMAINING</span>
               <div className="flex items-baseline gap-1">
                 <span className="text-lg font-black text-pink-500 tracking-tighter uppercase">
                   {user?.is_premium ? `${getRemainingDays()} DAYS` : `${Math.floor((user?.remaining_ai_seconds || 0) / 60)} MINS`}
                 </span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4 px-2">
        <h3 className="text-3xl font-black tracking-tight">STUDIO <span style={{ color: theme.primary }}>PLANS</span></h3>
        <div className="h-[1px] flex-1 bg-white/5"></div>
      </div>

      <div className="bg-[#0f0a1d] rounded-[30px] p-2 mb-10 flex gap-2 border border-white/5 mx-2">
        {(['Cheap', 'Standard', 'Ultra'] as const).map((tab) => {
          const tabTheme = getCategoryTheme(tab);
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 rounded-[25px] font-black text-[10px] tracking-widest uppercase transition-all duration-300 ${
                activeTab === tab 
                  ? `${tabTheme.bg} text-black shadow-lg ${tabTheme.shadow}` 
                  : 'text-white/30 hover:text-white/50'
              }`}
            >
              {tab === 'Ultra' ? 'ULTRA PRO' : tab}
            </button>
          );
        })}
      </div>

      <div className="px-2 space-y-8">
        {currentPlanList.map((plan) => (
          <div 
            key={plan.id}
            className={`group relative overflow-hidden rounded-[50px] bg-[#05020d] border ${theme.border} ${theme.hoverBorder} transition-all duration-500 p-8 shadow-xl`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${theme.gradient} blur-[50px] opacity-50 group-hover:opacity-100`}></div>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black tracking-tight uppercase mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-black tracking-tighter ${activeTab === 'Ultra' ? 'bg-gradient-to-r from-[#ff00c8] to-[#ff85e1] bg-clip-text text-transparent' : theme.text}`}>
                    ₹{plan.price}
                  </span>
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{plan.duration}</span>
                </div>
              </div>
              <div className={`p-4 rounded-3xl bg-white/5 ${theme.text}`}>
                <plan.icon size={28} />
              </div>
            </div>

            <div className="space-y-3 mb-8">
              {plan.benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${theme.bg} text-black`}>
                    <Check size={12} />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-white/70">{benefit}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => handleCheckout(plan)}
              className={`w-full py-5 rounded-[30px] ${theme.bg} text-black font-black text-[11px] tracking-[0.2em] uppercase ${theme.btnShadow} transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2`}
            >
              <Sparkles size={16} /> UNLOCK NOW
            </button>
          </div>
        ))}
      </div>

      {showCheckout && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[120] flex items-center justify-center p-6">
          <div className="glass p-8 rounded-[50px] w-full max-w-lg border border-white/10 relative animate-in zoom-in duration-300 overflow-y-auto max-h-[90vh]">
            <button onClick={() => setShowCheckout(false)} className="absolute top-8 right-8 text-white/40 hover:text-white p-2">
              <X size={28} />
            </button>
            <h2 className="text-3xl font-black mb-1 italic tracking-tight uppercase">ACTIVATE <span style={{ color: theme.primary }}>PRO</span></h2>
            <p className="text-white/40 text-[11px] font-black tracking-widest mb-10 uppercase">Verify payment for {selectedPlan.name}</p>

            <div className="flex flex-col items-center gap-8 mb-10">
              <div className="bg-white p-6 rounded-[45px] shadow-2xl shadow-black">
                <img src="https://i.supaimg.com/1432f5fd-4d60-4493-9cd2-01074a0fcd40.jpg" alt="QR Code" className="w-48 h-48 object-contain" />
              </div>
              
              <div className="w-full space-y-4">
                <div className="bg-white/5 p-5 rounded-3xl border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] text-white/30 uppercase font-black tracking-widest mb-1">UPI GATEWAY</p>
                    <p className="font-black text-[#ff00c8] text-sm">9358197207@fam</p>
                  </div>
                  <button className="text-[#00f2ff] p-3 hover:bg-white/5 rounded-2xl transition-all" onClick={() => { navigator.clipboard.writeText('9358197207@fam'); alert('UPI ID Copied!'); }}>
                    <Copy size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <input 
                type="text" 
                placeholder="ENTER TRANSACTION ID" 
                className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white focus:outline-none focus:border-[#00f2ff] font-mono text-center tracking-[0.2em]"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
              <button 
                onClick={submitRequest}
                disabled={loading}
                className="w-full py-6 rounded-3xl bg-[#00f2ff] text-black font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all"
              >
                {loading ? 'VERIFYING...' : 'CONFIRM PAYMENT'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Premium;
