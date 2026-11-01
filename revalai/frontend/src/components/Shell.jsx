import React, { useState } from "react";
import { GraduationCap, Bell, LogOut, Menu, X, Sparkles } from "lucide-react";

export default function Shell({ roleName, roleSub, nav, active, setActive, onLogout, children, notifCount = 0 }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#060709] text-white flex bg-charcoal-grid font-sans font-bold">
      {/* Sidebar Navigation */}
      <aside className={`fixed lg:static z-40 inset-y-0 left-0 w-64 bg-[#0B0D12]/98 backdrop-blur-xl border-r border-[#1B222E] flex flex-col transition-transform duration-300
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 shadow-[6px_0_30px_rgba(0,0,0,0.9)]`}>
        
        {/* Animated Fiery Bar at the very top of Sidebar */}
        <div className="h-1.5 w-full fiery-bar shadow-[0_0_15px_#FF6B00]" />

        {/* Brand Header */}
        <div className="p-5 flex items-center gap-3 border-b border-[#1B222E]">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF4500] via-[#FF6B00] to-[#FFAA00] flex items-center justify-center shadow-[0_0_22px_rgba(255,107,0,0.65)] animate-flame-pulse">
            <GraduationCap size={20} className="text-black stroke-[3]" />
          </div>
          <div>
            <span className="font-black font-display text-xl text-white tracking-wide flex items-center gap-1">
              Reval<span className="fiery-text font-black">AI</span>
            </span>
            <span className="text-[10px] text-[#FFAA00] font-mono tracking-widest block uppercase font-black">Portal v2.6</span>
          </div>
          <button className="ml-auto lg:hidden text-white hover:text-orange-400" onClick={() => setMobileOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {nav.map((n) => {
            const isActive = active === n.id;
            return (
              <button
                key={n.id}
                onClick={() => { setActive(n.id); setMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-black tracking-wide transition-all duration-200 group
                  ${isActive 
                    ? "bg-[#FF6B00]/25 text-white border border-[#FF6B00] shadow-[0_0_25px_rgba(255,107,0,0.4)]" 
                    : "text-white hover:bg-[#12161E] hover:text-[#FFA055] hover:border-[#263140] border border-transparent"}`}
              >
                <n.icon size={18} className={`${isActive ? "text-[#FF6B00]" : "text-gray-300 group-hover:text-[#FFA055]"} transition-colors stroke-[2.5]`} />
                <span className="text-white font-extrabold">{n.label}</span>
                {isActive && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-[#FF6B00] shadow-[0_0_10px_#FF6B00] animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Quick Info & Sign out */}
        <div className="p-3 border-t border-[#1B222E] space-y-2">
          <div className="px-3 py-2 rounded-xl bg-[#0F131A] border border-[#222B38] flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B00] animate-pulse shadow-[0_0_10px_#FF6B00]" />
            <div className="min-w-0 flex-1 text-left">
              <p className="text-xs font-black text-white truncate">{roleName}</p>
              <p className="text-[10px] text-gray-300 font-mono truncate font-bold">{roleSub}</p>
            </div>
          </div>
          <button 
            onClick={onLogout} 
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-black text-rose-300 hover:text-white hover:bg-rose-950/60 transition-colors"
          >
            <LogOut size={15} className="stroke-[2.5]" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 min-w-0 flex flex-col bg-[#060709]">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-[#090B0F]/95 backdrop-blur-xl border-b border-[#1B222E] px-4 lg:px-8 py-4 flex items-center gap-4 shadow-md relative">
          {/* Fiery line indicator across the bottom of the header */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] fiery-bar shadow-[0_0_12px_#FF6B00]" />

          <button 
            className="lg:hidden p-2 rounded-xl border border-[#2B323D] text-[#FF6B00] hover:bg-[#1E232B]" 
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>
          
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider font-mono text-[#FF8533] leading-none mb-1 font-bold">{roleSub}</p>
            <p className="font-bold text-white text-base leading-none tracking-tight">{roleName}</p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-[#1C2027] border border-[#2E3642] flex items-center justify-center text-gray-300 hover:text-[#FF6B00] hover:border-[#FF6B00]/40 transition-colors cursor-pointer">
                <Bell size={16} />
              </div>
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-[#FF6B00] to-rose-600 text-white text-[11px] font-bold flex items-center justify-center shadow-[0_0_10px_rgba(255,107,0,0.6)] animate-pulse">
                  {notifCount}
                </span>
              )}
            </div>

            {/* Avatar Pill */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B00]/25 to-[#EA580C]/15 border border-[#FF6B00]/50 text-[#FF6B00] flex items-center justify-center text-xs font-bold font-mono shadow-[0_0_15px_rgba(255,107,0,0.25)]">
              {roleName.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
