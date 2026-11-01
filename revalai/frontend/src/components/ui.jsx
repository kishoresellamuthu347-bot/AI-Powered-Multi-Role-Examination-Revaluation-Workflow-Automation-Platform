import React from "react";

export function Badge({ tone = "slate", children }) {
  const tones = {
    slate: "bg-[#12161D] text-white border border-[#26303E] font-bold",
    gold: "bg-amber-950/70 text-amber-200 border border-amber-500/50 font-extrabold",
    forest: "bg-emerald-950/70 text-emerald-200 border border-emerald-500/50 font-extrabold",
    rose: "bg-rose-950/70 text-rose-200 border border-rose-500/50 font-extrabold",
    orange: "bg-[#1E0F07] text-[#FFAA66] border border-[#FF6B00]/70 shadow-[0_0_12px_rgba(255,107,0,0.35)] font-black",
    fiery: "bg-gradient-to-r from-[#FF4500] via-[#FF6B00] to-[#FFAA00] text-black border border-[#FF8533] font-black shadow-[0_0_15px_rgba(255,107,0,0.6)]",
    navy: "bg-[#1E0F07] text-[#FFAA66] border border-[#FF6B00]/60 shadow-[0_0_12px_rgba(255,107,0,0.3)] font-black",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs tracking-wide font-sans ${tones[tone] || tones.slate}`}>
      {children}
    </span>
  );
}

export function Card({ children, className = "", onClick, fiery = false, rainbow = false }) {
  const isFiery = fiery || rainbow;
  return (
    <div 
      onClick={onClick}
      className={`${isFiery ? "fiery-border-box" : ""} bg-[#0B0D12] text-white rounded-2xl border border-[#1A222E] shadow-[0_8px_32px_rgba(0,0,0,0.9)] hover:border-orange-500/80 hover:shadow-[0_0_35px_-5px_rgba(255,107,0,0.4)] transition-all duration-200 ${className}`}
    >
      {children}
    </div>
  );
}

export function PrimaryButton({ children, onClick, disabled, className = "", icon: Icon, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl 
        bg-gradient-to-r from-[#FF4500] via-[#FF6B00] to-[#FF8533] text-white text-sm font-black tracking-wide font-sans
        shadow-[0_0_24px_rgba(255,107,0,0.55)] hover:shadow-[0_0_38px_rgba(255,107,0,0.9)] hover:brightness-110
        active:scale-[0.98] transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none disabled:shadow-none ${className}`}
    >
      {Icon && <Icon size={16} className="text-white stroke-[3]" />}
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, className = "", icon: Icon, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl 
        border border-[#263140] bg-[#0E1218] text-white text-sm font-bold
        hover:border-[#FF6B00] hover:text-[#FFA055] hover:bg-[#18110D] hover:shadow-[0_0_18px_rgba(255,107,0,0.3)]
        active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none ${className}`}
    >
      {Icon && <Icon size={16} className="text-white stroke-[2.5]" />}
      {children}
    </button>
  );
}

export function StatCard({ icon: Icon, label, value, tone = "navy" }) {
  const tones = {
    navy: "text-[#FF6B00] bg-[#FF6B00]/15 border border-[#FF6B00]/40 shadow-[0_0_18px_rgba(255,107,0,0.3)]",
    gold: "text-amber-400 bg-amber-400/10 border border-amber-400/30",
    forest: "text-emerald-400 bg-emerald-950/50 border border-emerald-500/40",
    rose: "text-rose-400 bg-rose-950/40 border border-rose-500/30",
  };
  return (
    <Card className="p-5 flex items-center gap-4 hover:translate-y-[-2px] transition-transform">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${tones[tone]}`}>
        <Icon size={22} className="stroke-[2.5]" />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider font-extrabold text-charcoal-400 font-sans">{label}</p>
        <p className="text-2xl lg:text-3xl font-black font-display text-white tracking-tight mt-0.5">{value}</p>
      </div>
    </Card>
  );
}

export function SectionHeader({ title, sub, action }) {
  return (
    <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
      <div>
        <h1 className="text-2xl lg:text-3xl font-black text-white font-display tracking-tight flex items-center gap-2.5">
          {title}
          <span className="inline-block w-3 h-3 rounded-full bg-[#FF6B00] shadow-[0_0_14px_#FF6B00] animate-pulse" />
        </h1>
        {sub && <p className="text-sm font-medium text-charcoal-300 mt-1.5 font-sans leading-relaxed">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Toast({ toast }) {
  if (!toast) return null;
  const tones = { 
    success: "bg-[#1E251F] text-emerald-400 border border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.35)]", 
    error: "bg-[#2A161A] text-rose-400 border border-rose-500/60 shadow-[0_0_25px_rgba(244,63,94,0.4)]", 
    info: "bg-[#1F242C] text-[#FF6B00] border border-[#FF6B00]/40 shadow-2xl" 
  };
  return (
    <div className={`fixed bottom-6 right-6 z-[100] px-5 py-3.5 rounded-2xl text-sm font-semibold flex items-center gap-3 backdrop-blur-xl ${tones[toast.tone]}`}>
      {toast.msg}
    </div>
  );
}
