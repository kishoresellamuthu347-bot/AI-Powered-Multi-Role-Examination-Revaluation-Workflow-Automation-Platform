import React, { useEffect, useState, useCallback } from "react";
import {
  ClipboardList, AlertTriangle, Award, Users, CheckCircle2, XCircle, X,
} from "lucide-react";
import Shell from "../components/Shell";
import { Card, Badge, PrimaryButton, GhostButton, StatCard, SectionHeader } from "../components/ui";
import { api } from "../api";

export default function OfficerDashboard({ onLogout, notify }) {
  const [active, setActive] = useState("queue");
  const [user, setUser] = useState({ name: localStorage.getItem("revalai_name") || "Examination Officer", department: "Examination Cell" });
  const [apps, setApps] = useState([]);
  const [evaluators, setEvaluators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [assignEvaluatorId, setAssignEvaluatorId] = useState("");
  const [busy, setBusy] = useState(false);

  const nav = [
    { id: "queue", label: "Application Queue", icon: ClipboardList },
    { id: "flags", label: "AI Flags", icon: AlertTriangle },
    { id: "publish", label: "Publish Results", icon: Award },
  ];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, a, e] = await Promise.all([
        api.me().catch(() => null),
        api.allApplications().catch((err) => { console.error("Error loading applications:", err); return []; }),
        api.listEvaluators().catch((err) => { console.error("Error loading evaluators:", err); return []; }),
      ]);
      if (u) {
        setUser(u);
        if (u.name) localStorage.setItem("revalai_name", u.name);
      }
      setApps(a);
      setEvaluators(e);
    } catch (e) {
      notify("error", e.message);
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { load(); }, [load]);

  const openReviewModal = async (a) => {
    setSelected(a);
    let currentEvs = evaluators;
    try {
      const evs = await api.listEvaluators();
      if (evs && evs.length) {
        currentEvs = evs;
        setEvaluators(evs);
      }
    } catch (_) {}

    if (a.assigned_evaluator_id) {
      setAssignEvaluatorId(String(a.assigned_evaluator_id));
    } else if (currentEvs && currentEvs.length > 0) {
      setAssignEvaluatorId(String(currentEvs[0].id));
    } else {
      setAssignEvaluatorId("");
    }
  };

  async function verify(app) {
    setBusy(true);
    try {
      const updated = await api.verify(app.id, "Verified by examination cell");
      if (assignEvaluatorId) {
        const assignedApp = await api.assignEvaluator(app.id, parseInt(assignEvaluatorId));
        notify("success", `${app.code} verified and assigned to evaluator.`);
        setSelected(assignedApp);
      } else {
        notify("success", `${app.code} verified.`);
        setSelected(updated);
      }
      await load();
    } catch (e) { notify("error", e.message); } finally { setBusy(false); }
  }

  async function reject(app) {
    setBusy(true);
    try {
      await api.reject(app.id, "Documentation insufficient");
      notify("success", `${app.code} rejected.`);
      await load(); setSelected(null);
    } catch (e) { notify("error", e.message); } finally { setBusy(false); }
  }

  async function assign(app) {
    if (!assignEvaluatorId) return;
    setBusy(true);
    try {
      const updated = await api.assignEvaluator(app.id, parseInt(assignEvaluatorId));
      notify("success", `Evaluator assigned to ${app.code}.`);
      await load(); setSelected(updated);
    } catch (e) { notify("error", e.message); } finally { setBusy(false); }
  }

  async function publish(app) {
    setBusy(true);
    try {
      await api.publish(app.id);
      notify("success", `Result published for ${app.code}.`);
      await load();
    } catch (e) { notify("error", e.message); } finally { setBusy(false); }
  }

  const flagged = apps.filter((a) => a.duplicate_flag || a.anomaly_flag);
  const readyToPublish = apps.filter((a) => a.status === "Officer Review");

  return (
    <Shell roleName={user.name || "Examination Officer"} roleSub={user.department || "Examination Cell"} nav={nav} active={active} setActive={setActive}
      onLogout={onLogout} notifCount={flagged.length}>

      {loading ? <p className="text-sm text-[#9B9585]">Loading…</p> : (
        <>
          {active === "queue" && (
            <>
              <SectionHeader title="Application Queue" sub="Verify, assign evaluators, and move applications forward." />
              <div className="grid sm:grid-cols-4 gap-4 mb-8">
                <StatCard icon={ClipboardList} label="Total applications" value={apps.length} tone="navy" />
                <StatCard icon={AlertTriangle} label="AI flagged" value={flagged.length} tone="rose" />
                <StatCard icon={Users} label="Awaiting assignment" value={apps.filter((a) => a.status === "Verified").length} tone="gold" />
                <StatCard icon={CheckCircle2} label="In evaluation" value={apps.filter((a) => ["Evaluator Assigned", "Under Evaluation"].includes(a.status)).length} tone="forest" />
              </div>

              <Card className="overflow-hidden border border-[#192B22] bg-[#0A0F0C]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#0D1612] text-left text-gray-400 border-b border-[#1A2E24] text-xs font-mono uppercase tracking-wider">
                      <th className="px-5 py-3.5 font-bold">Application</th>
                      <th className="px-5 py-3.5 font-bold">Status</th>
                      <th className="px-5 py-3.5 font-bold">Flags</th>
                      <th className="px-5 py-3.5 font-bold">Assigned Evaluator</th>
                      <th className="px-5 py-3.5 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apps.map((a) => (
                      <tr key={a.id} className="border-t border-[#14231B] hover:bg-[#0E1813] transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-white font-mono">{a.code}</p>
                          <p className="text-xs text-gray-400">{a.subject.code} — {a.subject.name}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge tone={a.status?.toLowerCase() === "rejected" ? "rose" : a.status?.toLowerCase() === "published" ? "forest" : "gold"}>
                            {a.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5">
                          {!a.duplicate_flag && !a.anomaly_flag ? <span className="text-xs text-gray-500 font-mono">None</span> : (
                            <div className="flex gap-1.5">
                              {a.duplicate_flag && <Badge tone="rose">duplicate</Badge>}
                              {a.anomaly_flag && <Badge tone="rose">anomaly</Badge>}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs">
                            {a.assigned_evaluator_id ? (
                              <span className="font-semibold text-orange-400 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                {evaluators.find(e => e.id === a.assigned_evaluator_id)?.name || `Evaluator #${a.assigned_evaluator_id}`}
                              </span>
                            ) : (
                              <span className="text-amber-400 font-medium">⚠️ Awaiting Assignment</span>
                            )}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button onClick={() => openReviewModal(a)} className="px-3 py-1.5 rounded-xl bg-charcoal-850 border border-charcoal-700 hover:border-orange-500/60 text-xs font-bold text-orange-400 transition-all hover:shadow-[0_0_12px_rgba(255,107,0,0.2)]">
                            Manage / Assign →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              {selected && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
                  <Card className="max-w-lg w-full p-6 shadow-[0_15px_60px_rgba(0,0,0,0.95)] border border-charcoal-800 bg-charcoal-900" rainbow onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-start justify-between mb-4 pb-3 border-b border-charcoal-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold text-white text-lg font-mono">{selected.code}</p>
                          <Badge tone={selected.status?.toLowerCase() === "rejected" ? "rose" : selected.status?.toLowerCase() === "published" ? "fiery" : "orange"}>
                            {selected.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-charcoal-300 mt-0.5 font-semibold">{selected.subject.code} — {selected.subject.name}</p>
                      </div>
                      <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg text-charcoal-400 hover:text-white hover:bg-charcoal-800"><X size={18} /></button>
                    </div>

                    {selected.duplicate_flag && (
                      <div className="flex gap-2 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 mb-3 text-xs text-rose-300">
                        <AlertTriangle size={16} className="shrink-0 mt-0.5 text-rose-400" /> Duplicate application detected for this student and subject.
                      </div>
                    )}
                    {selected.anomaly_flag && (
                      <div className="flex gap-2 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 mb-3 text-xs text-rose-300">
                        <AlertTriangle size={16} className="shrink-0 mt-0.5 text-rose-400" /> Payment/documentation anomaly detected.
                      </div>
                    )}

                    <div className="space-y-2 text-sm mb-5 bg-charcoal-950 p-4 rounded-xl border border-charcoal-800">
                      <div className="flex justify-between py-1 border-b border-charcoal-850 text-xs"><span className="text-charcoal-400">Fee paid</span><span className="font-bold text-white">₹{selected.fee_amount} {selected.fee_paid ? "✓ Paid" : "(pending)"}</span></div>
                      <div className="flex justify-between py-1 border-b border-charcoal-850 text-xs"><span className="text-charcoal-400">Submitted</span><span className="font-mono text-charcoal-300">{new Date(selected.created_at).toLocaleDateString()}</span></div>
                      <div className="flex justify-between py-1 text-xs">
                        <span className="text-charcoal-400">Current Evaluator</span>
                        <span className="font-bold text-orange-400">
                          {selected.assigned_evaluator_id ? (
                            `✓ ${evaluators.find(e => e.id === selected.assigned_evaluator_id)?.name || `Evaluator #${selected.assigned_evaluator_id}`}`
                          ) : (
                            <span className="text-amber-400 font-medium">None assigned</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Section 1: If pending verification */}
                    {selected.status?.toLowerCase() === "pending verification" && (
                      <div className="space-y-4 mb-4 pb-4 border-b border-charcoal-800">
                        <div>
                          <label className="text-xs font-bold text-charcoal-300 mb-1.5 block">Select Evaluator for Assignment</label>
                          <select 
                            value={assignEvaluatorId} 
                            onChange={(e) => setAssignEvaluatorId(e.target.value)} 
                            className="w-full px-3 py-2.5 rounded-xl border border-charcoal-700 text-sm bg-charcoal-950 text-white font-medium focus:border-orange-500 focus:outline-none"
                          >
                            <option value="">{evaluators.length === 0 ? "Loading evaluators…" : "Select an evaluator…"}</option>
                            {evaluators.map((ev) => <option key={ev.id} value={ev.id}>{ev.name} ({ev.department || "General"})</option>)}
                          </select>
                        </div>
                        <div className="flex gap-3">
                          <GhostButton icon={XCircle} disabled={busy} onClick={() => reject(selected)}>Reject</GhostButton>
                          <PrimaryButton icon={CheckCircle2} disabled={busy} onClick={() => verify(selected)}>
                            {assignEvaluatorId ? "Verify & Assign Evaluator" : "Verify Only"}
                          </PrimaryButton>
                        </div>
                      </div>
                    )}

                    {/* Section 2: Universal Evaluator Assignment & Reassignment (Always available unless rejected/published) */}
                    {!["rejected", "published"].includes(selected.status?.toLowerCase()) && (
                      <div className="space-y-3 pt-1">
                        <div>
                          <label className="text-xs font-bold text-orange-400 mb-1.5 block uppercase tracking-wider font-mono">
                            {selected.assigned_evaluator_id ? "Change Assigned Evaluator:" : "Assign an Evaluator to this Paper:"}
                          </label>
                          <div className="flex gap-2">
                            <select 
                              value={assignEvaluatorId} 
                              onChange={(e) => setAssignEvaluatorId(e.target.value)} 
                              className="w-full px-3 py-2.5 rounded-xl border border-charcoal-700 text-sm bg-charcoal-950 text-white font-medium focus:border-orange-500 focus:outline-none"
                            >
                              <option value="">{evaluators.length === 0 ? "No evaluators found" : "Choose evaluator…"}</option>
                              {evaluators.map((ev) => (
                                <option key={ev.id} value={ev.id}>
                                  {ev.name} — {ev.department || "General"}
                                </option>
                              ))}
                            </select>
                            <PrimaryButton 
                              disabled={busy || !assignEvaluatorId} 
                              onClick={() => assign(selected)}
                            >
                              {busy ? "Saving…" : selected.assigned_evaluator_id ? "Reassign" : "Assign Now"}
                            </PrimaryButton>
                          </div>
                          {!assignEvaluatorId && (
                            <p className="text-[11px] text-gray-500 mt-1 font-mono">Please select an evaluator from the list above to enable assignment.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              )}
            </>
          )}

          {active === "flags" && (
            <>
              <SectionHeader title="AI Flags" sub="Applications the system has automatically flagged for officer review." />
              {flagged.length === 0 ? (
                <Card className="p-10 text-center"><p className="text-sm text-[#7A7566]">No flagged applications right now.</p></Card>
              ) : (
                <div className="space-y-4">
                  {flagged.map((a) => (
                    <Card key={a.id} className="p-5 flex items-center gap-4 flex-wrap">
                      <AlertTriangle size={20} className="text-rose shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-ink">{a.code}</p>
                        <p className="text-xs text-[#9B9585]">{a.subject.code} — {a.subject.name}</p>
                      </div>
                      {a.duplicate_flag && <Badge tone="rose">duplicate</Badge>}
                      {a.anomaly_flag && <Badge tone="rose">anomaly</Badge>}
                      <GhostButton onClick={() => { setSelected(a); setActive("queue"); }}>Investigate</GhostButton>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {active === "publish" && (
            <>
              <SectionHeader title="Publish Results" sub="Applications with completed evaluations, ready for final publication." />
              {readyToPublish.length === 0 ? (
                <Card className="p-10 text-center"><p className="text-sm text-[#7A7566]">No applications awaiting publication.</p></Card>
              ) : (
                <div className="space-y-3">
                  {readyToPublish.map((a) => (
                    <Card key={a.id} className="p-5 flex items-center gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-sm text-white">{a.code}</p>
                        <p className="text-xs text-gray-300 font-bold">{a.subject.code} — {a.subject.name} · Revised marks: <span className="text-orange-400 font-black">{a.revised_marks}</span></p>
                      </div>
                      <PrimaryButton icon={Award} disabled={busy} onClick={() => publish(a)}>Approve & publish</PrimaryButton>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </Shell>
  );
}
