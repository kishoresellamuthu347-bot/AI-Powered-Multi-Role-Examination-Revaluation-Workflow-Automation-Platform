import React, { useEffect, useState, useCallback } from "react";
import {
  Activity, Award, FileText, ClipboardList, AlertCircle, CheckCircle2,
  CreditCard, Bell, Eye, X,
} from "lucide-react";
import Shell from "../components/Shell";
import { Card, Badge, PrimaryButton, GhostButton, StatCard, SectionHeader } from "../components/ui";
import AnswerScriptViewer from "../components/AnswerScriptViewer";
import { api } from "../api";

const STATUS_FLOW = [
  "Submitted", "AI Screening", "Pending Verification", "Verified",
  "Evaluator Assigned", "Under Evaluation", "Officer Review", "Published",
];

export default function StudentDashboard({ onLogout, notify }) {
  const [active, setActive] = useState("dashboard");
  const [user, setUser] = useState({ name: localStorage.getItem("revalai_name") || "Student", roll_number: "", department: "" });
  const [results, setResults] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null); // result being applied for
  const [paying, setPaying] = useState(null);
  const [viewingPaper, setViewingPaper] = useState(null); // subject result object being inspected

  const nav = [
    { id: "dashboard", label: "Dashboard", icon: Activity },
    { id: "results", label: "Results", icon: Award },
    { id: "track", label: "Track Applications", icon: ClipboardList },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, r, a, n] = await Promise.all([
        api.me().catch(() => null),
        api.myResults(),
        api.myApplications(),
        api.myNotifications()
      ]);
      if (u) {
        setUser(u);
        if (u.name) localStorage.setItem("revalai_name", u.name);
      }
      setResults(r);
      setApplications(a);
      setNotifications(n);
    } catch (e) {
      notify("error", e.message);
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { load(); }, [load]);

  async function handleApply(result) {
    try {
      await api.apply(result.id);
      notify("success", `Application submitted for ${result.subject.code}.`);
      await load();
      setActive("track");
    } catch (e) {
      notify("error", e.message);
    }
  }

  async function handlePay(applicationId) {
    setPaying(applicationId);
    try {
      await api.pay(applicationId);
      notify("success", "Payment confirmed — application moving through AI screening.");
      await load();
    } catch (e) {
      notify("error", e.message);
    } finally {
      setPaying(null);
    }
  }

  const unpaid = applications.filter((a) => !a.fee_paid);
  const roleSubtitle = [user.roll_number, user.department].filter(Boolean).join(" · ") || "Student";
  const firstName = user.name ? user.name.split(" ")[0] : "Student";

  return (
    <Shell roleName={user.name || "Student"} roleSub={roleSubtitle} nav={nav} active={active} setActive={setActive}
      onLogout={onLogout} notifCount={notifications.filter((n) => !n.read).length}>

      {loading ? <p className="text-sm text-[#9B9585]">Loading…</p> : (
        <>
          {active === "dashboard" && (
            <>
              <SectionHeader title={`Welcome back, ${firstName}`} sub="Here's where your revaluation activity stands today." />
              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                <StatCard icon={ClipboardList} label="Active applications" value={applications.length} tone="navy" />
                <StatCard icon={CreditCard} label="Awaiting payment" value={unpaid.length} tone="gold" />
                <StatCard icon={CheckCircle2} label="Eligible subjects" value={results.filter((r) => r.eligible_for_revaluation).length} tone="forest" />
              </div>
              {unpaid.length > 0 && (
                <Card className="p-5 mb-6 flex items-center gap-4 flex-wrap">
                  <AlertCircle size={18} className="text-gold shrink-0" />
                  <p className="text-sm text-[#3A362E] flex-1">
                    You have {unpaid.length} application(s) awaiting payment before they can be screened.
                  </p>
                  <PrimaryButton onClick={() => setActive("track")}>Go to applications</PrimaryButton>
                </Card>
              )}
              <Card className="p-6 bg-[#0B0D12] border border-[#1A222E]">
                <p className="font-black text-white text-base mb-4 flex items-center gap-2">
                  <Bell size={18} className="text-orange-400 stroke-[2.5]" />
                  Recent notifications
                </p>
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-300 font-bold">No notifications yet.</p>
                ) : (
                  <div className="space-y-3">
                    {notifications.slice(0, 5).map((n) => (
                      <div key={n.id} className="flex items-start gap-3 text-sm p-3 rounded-xl bg-[#0F131A] border border-[#1B2330]">
                        <Bell size={16} className="text-orange-400 mt-0.5 shrink-0 stroke-[2.5]" />
                        <span className="text-white font-extrabold leading-snug">{n.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}

          {active === "results" && (
            <>
              <SectionHeader title="Examination Results" />
              <Card className="overflow-hidden border border-[#1B222E] bg-[#0B0D12]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#0F131A] text-left text-white border-b border-[#1B222E] text-xs font-mono uppercase font-black tracking-wider">
                      <th className="px-5 py-3.5">Subject</th>
                      <th className="px-5 py-3.5">Marks Obtained</th>
                      <th className="px-5 py-3.5">Revaluation Eligibility</th>
                      <th className="px-5 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => {
                      const alreadyApplied = applications.some((a) => a.subject.code === r.subject.code);
                      return (
                        <tr key={r.id} className="border-t border-[#161C26] hover:bg-[#12161F] transition-colors">
                          <td className="px-5 py-3.5">
                            <p className="font-black text-white text-base">{r.subject.code}</p>
                            <p className="text-xs text-gray-300 font-bold">{r.subject.name}</p>
                          </td>
                        <td className="px-5 py-3.5 font-mono font-black text-white text-base">{r.marks} <span className="text-gray-400 font-bold text-sm">/ {r.max_marks}</span></td>
                        <td className="px-5 py-3.5">
                          {r.eligible_for_revaluation ? <Badge tone="orange">Eligible</Badge> : <Badge tone="slate">Not eligible</Badge>}
                        </td>
                          <td className="px-5 py-3.5 text-right flex items-center justify-end gap-2.5">
                            <button
                              onClick={() => setViewingPaper(r)}
                              className="px-3.5 py-1.5 rounded-xl border border-charcoal-700 bg-charcoal-900 text-charcoal-200 hover:text-white hover:border-orange-500/60 text-xs font-bold transition-all flex items-center gap-1.5"
                            >
                              <Eye size={13} className="text-orange-400" />
                              View Script
                            </button>
                            {r.eligible_for_revaluation && !alreadyApplied && (
                              <button onClick={() => handleApply(r)} className="px-4 py-2 rounded-xl bg-orange-glow text-xs font-black text-black hover:brightness-110 transition-all shadow-[0_0_15px_rgba(255,107,0,0.45)]">
                                Apply for Revaluation →
                              </button>
                            )}
                            {alreadyApplied && <span className="text-xs text-orange-400 font-mono font-black">Already applied ✓</span>}
                          </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          </>
        )}

        {active === "track" && (
          <>
            <SectionHeader title="Track Applications" sub="Real-time timeline and verification progress of your revaluation requests." />
            {applications.length === 0 ? (
              <Card className="p-12 text-center border-dashed border-charcoal-800 bg-charcoal-900">
                <FileText size={32} className="text-orange-400/40 mx-auto mb-3" />
                <p className="text-sm font-semibold text-white">No revaluation applications yet.</p>
                <p className="text-xs text-charcoal-400 mt-1">Apply from the Results tab to start revaluation.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => {
                  const idx = STATUS_FLOW.indexOf(app.status);
                  return (
                    <Card key={app.id} className="p-6 border border-charcoal-800 bg-charcoal-900 hover:border-orange-500/40" rainbow={idx >= 3}>
                      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <div>
                          <p className="font-extrabold font-mono text-white text-base tracking-wide flex items-center gap-2">
                            {app.code}
                            <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_#FF6B00] animate-pulse" />
                          </p>
                          <p className="text-xs text-charcoal-300 mt-0.5 font-semibold">{app.subject.code} — {app.subject.name}</p>
                        </div>
                        <Badge tone={app.status === "Rejected" ? "rose" : app.status === "Published" ? "fiery" : "orange"}>{app.status}</Badge>
                      </div>

                      {!app.fee_paid && app.status === "Submitted" && (
                        <div className="mb-4">
                          <PrimaryButton icon={CreditCard} disabled={paying === app.id} onClick={() => handlePay(app.id)}>
                            {paying === app.id ? "Processing Payment…" : `Pay ₹${app.fee_amount} to Continue`}
                          </PrimaryButton>
                        </div>
                      )}

                      {(app.duplicate_flag || app.anomaly_flag) && (
                        <div className="flex items-center gap-2 text-xs text-rose-300 mb-4 bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/40 font-bold">
                          <AlertCircle size={14} className="shrink-0 text-rose-400" /> Flagged for review: {[app.duplicate_flag && "duplicate", app.anomaly_flag && "anomaly"].filter(Boolean).join(", ")}
                        </div>
                      )}

                      {app.revised_marks != null && (
                        <div className="flex items-center gap-2 text-xs text-[#FFAA00] font-mono font-black mb-4 bg-charcoal-850 p-3 rounded-xl border border-orange-500/50 shadow-[0_0_20px_rgba(255,107,0,0.3)]">
                          <CheckCircle2 size={16} className="text-orange-400 stroke-[3]" /> PUBLISHED REVISED MARKS: {app.revised_marks}
                        </div>
                      )}

                      <div className="mb-5 flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-charcoal-800">
                        <span className="text-xs text-charcoal-300 font-mono font-bold">DIGITAL PAPER & OCR RECORD:</span>
                        <GhostButton 
                          icon={Eye} 
                          onClick={() => setViewingScriptApp(app)} 
                          className="!py-1.5 !px-3.5 text-xs font-bold text-orange-400 border-charcoal-700 hover:border-orange-500"
                        >
                          View Answer Paper & OCR Scan
                        </GhostButton>
                      </div>

                      {/* Animatic Glowing Progress Tracker */}
                      {idx >= 0 && (
                        <div className="flex items-center overflow-x-auto pb-2 pt-2 bg-charcoal-950 p-3 rounded-xl border border-charcoal-800">
                          {STATUS_FLOW.map((s, i) => (
                            <React.Fragment key={s}>
                              <div className="flex flex-col items-center gap-2 shrink-0">
                                <div className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                                  i <= idx 
                                    ? "bg-orange-500 shadow-[0_0_12px_#FF6B00] scale-110" 
                                    : "bg-charcoal-800 border border-charcoal-700"
                                }`} />
                                <span className={`text-[10px] text-center w-20 font-mono tracking-tight font-bold ${
                                  i <= idx ? "text-orange-400" : "text-charcoal-400"
                                }`}>{s}</span>
                              </div>
                              {i < STATUS_FLOW.length - 1 && (
                                <div className={`w-6 h-0.5 shrink-0 transition-colors ${
                                  i < idx ? "fiery-bar shadow-[0_0_8px_#FF6B00]" : "bg-charcoal-800"
                                }`} />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Student View Answer Paper Modal */}
            {viewingPaper && (
              <div 
                className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6" 
                onClick={() => setViewingPaper(null)}
              >
                <div 
                  className="max-w-5xl w-full max-h-[92vh] overflow-y-auto bg-charcoal-950 border border-charcoal-700 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.98)] p-5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-charcoal-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-white font-serif">Original Answer Script (Digital Copy)</h2>
                        <Badge tone="orange">{viewingPaper.subject.code}</Badge>
                      </div>
                      <p className="text-xs text-charcoal-300 mt-0.5">{viewingPaper.subject.name} · Score Awarded: <span className="font-bold text-orange-400 font-mono">{viewingPaper.marks} / {viewingPaper.max_marks}</span></p>
                    </div>
                    <button 
                      onClick={() => setViewingPaper(null)}
                      className="p-2 rounded-xl hover:bg-charcoal-800 text-charcoal-400 hover:text-white transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <AnswerScriptViewer 
                    subjectCode={viewingPaper.subject.code}
                    applicationCode={viewingPaper.code || `RES-${viewingPaper.subject.code}`}
                    readOnly={true}
                    onClose={() => setViewingPaper(null)}
                  />
                </div>
              </div>
            )}
          </>
        )}

          {active === "notifications" && (
            <>
              <SectionHeader title="Notifications" />
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <Card className="p-8 text-center bg-[#0B0D12] border border-[#1A222E]">
                    <Bell size={28} className="text-orange-500/50 mx-auto mb-2" />
                    <p className="text-sm text-white font-bold">No notifications yet.</p>
                  </Card>
                ) : notifications.map((n) => (
                  <Card key={n.id} className="p-5 flex items-center gap-3.5 bg-[#0B0D12] border border-[#1E2736] hover:border-orange-500/60 shadow-md">
                    <div className="w-8 h-8 rounded-xl bg-orange-glow/20 border border-orange-glow/40 flex items-center justify-center shrink-0">
                      <Bell size={16} className="text-orange-400 stroke-[2.5]" />
                    </div>
                    <span className="text-sm text-white font-extrabold leading-snug">{n.message}</span>
                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </Shell>
  );
}
