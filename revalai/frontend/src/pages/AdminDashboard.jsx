import React, { useEffect, useState, useCallback } from "react";
import { BarChart3, Users, History, ClipboardList, TrendingUp, AlertTriangle, Award, CheckCircle2, XCircle, X } from "lucide-react";
import Shell from "../components/Shell";
import { Card, Badge, StatCard, SectionHeader, PrimaryButton, GhostButton } from "../components/ui";
import { api } from "../api";

export default function AdminDashboard({ onLogout, notify }) {
  const [active, setActive] = useState("overview");
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [user, setUser] = useState({ name: localStorage.getItem("revalai_name") || "System Admin", department: "Platform Administration" });

  const [evaluators, setEvaluators] = useState([]);
  const [selected, setSelected] = useState(null);
  const [assignEvaluatorId, setAssignEvaluatorId] = useState("");

  const nav = [
    { id: "overview", label: "Analytics", icon: BarChart3 },
    { id: "queue", label: "Application Queue", icon: ClipboardList },
    { id: "publish", label: "Publish Results", icon: Award },
    { id: "users", label: "User Management", icon: Users },
    { id: "audit", label: "Audit Logs", icon: History },
  ];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, an, usrList, l, a, evs] = await Promise.all([
        api.me().catch(() => null),
        api.analytics(),
        api.listUsers(),
        api.auditLogs(),
        api.allApplications().catch(() => []),
        api.listEvaluators().catch(() => []),
      ]);
      if (u) {
        setUser(u);
        if (u.name) localStorage.setItem("revalai_name", u.name);
      }
      setAnalytics(an); setUsers(usrList); setLogs(l); setApps(a); setEvaluators(evs);
    } catch (e) {
      notify("error", e.message);
    } finally {
      setLoading(false);
    }
  }, [notify]);

  const openReviewModal = async (a) => {
    setSelected(a);
    setAssignEvaluatorId(a.assigned_evaluator_id ? String(a.assigned_evaluator_id) : "");
    try {
      const evs = await api.listEvaluators();
      if (evs && evs.length) setEvaluators(evs);
    } catch (_) {}
  };

  async function handleVerify(app) {
    setBusy(true);
    try {
      const updated = await api.verify(app.id, "Verified by administration");
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

  async function handleAssign(app) {
    if (!assignEvaluatorId) return;
    setBusy(true);
    try {
      const updated = await api.assignEvaluator(app.id, parseInt(assignEvaluatorId));
      notify("success", `Evaluator assigned to ${app.code}.`);
      await load(); setSelected(updated);
    } catch (e) { notify("error", e.message); } finally { setBusy(false); }
  }

  async function handleReject(app) {
    setBusy(true);
    try {
      await api.reject(app.id, "Documentation insufficient");
      notify("success", `${app.code} rejected.`);
      await load(); setSelected(null);
    } catch (e) { notify("error", e.message); } finally { setBusy(false); }
  }

  async function handlePublish(app) {
    setBusy(true);
    try {
      await api.publish(app.id);
      notify("success", `Result published for ${app.code}.`);
      await load();
    } catch (e) {
      notify("error", e.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { load(); }, [load]);

  return (
    <Shell roleName={user.name || "System Admin"} roleSub={user.department || "Platform Administration"} nav={nav} active={active} setActive={setActive} onLogout={onLogout}>
      {loading || !analytics ? <p className="text-sm text-[#9B9585]">Loading…</p> : (
        <>
          {active === "overview" && (
            <>
              <SectionHeader title="Platform Analytics" sub="Live overview of revaluation activity, pulled directly from the database." />
              <div className="grid sm:grid-cols-4 gap-4 mb-8">
                <StatCard icon={ClipboardList} label="Total applications" value={analytics.total_applications} tone="navy" />
                <StatCard icon={AlertTriangle} label="Flagged" value={analytics.flagged} tone="rose" />
                <StatCard icon={Users} label="Active evaluators" value={analytics.active_evaluators} tone="forest" />
                <StatCard icon={TrendingUp} label="Registered users" value={users.length} tone="gold" />
              </div>
              <Card className="p-6">
                <p className="font-medium text-ink mb-4">Applications by status</p>
                <div className="space-y-3">
                  {Object.entries(analytics.by_status).map(([status, count]) => (
                    <div key={status}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#5B564C]">{status}</span><span className="font-medium text-ink">{count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#F0EDE4] overflow-hidden">
                        <div className="h-full rounded-full bg-ink" style={{ width: `${analytics.total_applications ? (count / analytics.total_applications) * 100 : 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {active === "queue" && (
            <>
              <SectionHeader title="Application Queue" sub="Verify applications and assign evaluators directly as an Administrator." />
              <Card className="overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-parchment text-left text-[#7A7566]">
                      <th className="px-5 py-3 font-medium">Application</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Flags</th>
                      <th className="px-5 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {apps.map((a) => (
                      <tr key={a.id} className="border-t border-[#F0EDE4]">
                        <td className="px-5 py-3">
                          <p className="font-medium text-ink">{a.code}</p>
                          <p className="text-xs text-[#9B9585]">{a.subject.code} — {a.subject.name}</p>
                        </td>
                        <td className="px-5 py-3">
                          <Badge tone={a.status === "Rejected" ? "rose" : a.status === "Published" ? "forest" : "gold"}>{a.status}</Badge>
                        </td>
                        <td className="px-5 py-3">
                          {!a.duplicate_flag && !a.anomaly_flag ? <span className="text-xs text-[#B8B2A0]">None</span> : (
                            <div className="flex gap-1">
                              {a.duplicate_flag && <Badge tone="rose">duplicate</Badge>}
                              {a.anomaly_flag && <Badge tone="rose">anomaly</Badge>}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button onClick={() => openReviewModal(a)} className="text-xs font-medium text-ink hover:underline">Review & Assign</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              {selected && (
                <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
                  <Card className="max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-medium text-ink">{selected.code}</p>
                        <p className="text-xs text-[#9B9585]">{selected.subject.code} — {selected.subject.name}</p>
                      </div>
                      <button onClick={() => setSelected(null)}><X size={18} className="text-[#9B9585]" /></button>
                    </div>

                    <div className="space-y-2 text-sm mb-5">
                      <div className="flex justify-between py-2 border-b border-[#F0EDE4]"><span className="text-[#7A7566]">Fee paid</span><span className="font-medium">₹{selected.fee_amount} {selected.fee_paid ? "✓" : "(pending)"}</span></div>
                      <div className="flex justify-between py-2 border-b border-[#F0EDE4]"><span className="text-[#7A7566]">Submitted</span><span className="font-medium">{new Date(selected.created_at).toLocaleDateString()}</span></div>
                      <div className="flex justify-between py-2 border-b border-[#F0EDE4]">
                        <span className="text-[#7A7566]">Current Status</span>
                        <Badge tone={selected.status === "Rejected" ? "rose" : "gold"}>{selected.status}</Badge>
                      </div>
                    </div>

                    {selected.status === "Pending Verification" && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-medium text-[#7A7566] mb-1.5 block">Assign Evaluator (Optional)</label>
                          <select value={assignEvaluatorId} onChange={(e) => setAssignEvaluatorId(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-[#E4E0D6] text-sm bg-white">
                            <option value="">{evaluators.length === 0 ? "No evaluators available" : "Select an evaluator…"}</option>
                            {evaluators.map((ev) => <option key={ev.id} value={ev.id}>{ev.name} ({ev.department || "General"})</option>)}
                          </select>
                        </div>
                        <div className="flex gap-3">
                          <GhostButton icon={XCircle} disabled={busy} onClick={() => handleReject(selected)}>Reject</GhostButton>
                          <PrimaryButton icon={CheckCircle2} disabled={busy} onClick={() => handleVerify(selected)}>
                            {assignEvaluatorId ? "Verify & Assign" : "Verify & Approve"}
                          </PrimaryButton>
                        </div>
                      </div>
                    )}

                    {["Verified", "Evaluator Assigned", "Under Evaluation"].includes(selected.status) && (
                      <div className="space-y-3">
                        {selected.assigned_evaluator_id && (
                          <div className="p-3 bg-parchment rounded-lg text-xs text-[#7A7566] flex justify-between items-center">
                            <span>Currently Assigned:</span>
                            <span className="font-semibold text-ink">
                              {evaluators.find(e => e.id === selected.assigned_evaluator_id)?.name || `Evaluator #${selected.assigned_evaluator_id}`}
                            </span>
                          </div>
                        )}
                        <div>
                          <label className="text-xs font-medium text-[#7A7566] mb-2 block">
                            {selected.assigned_evaluator_id ? "Change / Reassign Evaluator" : "Assign Evaluator"}
                          </label>
                          <div className="flex gap-2">
                            <select 
                              value={assignEvaluatorId} 
                              onChange={(e) => setAssignEvaluatorId(e.target.value)} 
                              className="w-full px-3 py-2.5 rounded-lg border border-[#E4E0D6] text-sm bg-white text-ink"
                            >
                              <option value="">{evaluators.length === 0 ? "No evaluators available" : "Select an evaluator…"}</option>
                              {evaluators.map((ev) => <option key={ev.id} value={ev.id}>{ev.name} ({ev.department || "General"})</option>)}
                            </select>
                            <PrimaryButton 
                              disabled={busy || !assignEvaluatorId} 
                              onClick={() => handleAssign(selected)}
                            >
                              {busy ? "Saving…" : selected.assigned_evaluator_id ? "Reassign" : "Assign"}
                            </PrimaryButton>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              )}
            </>
          )}

          {active === "publish" && (
            <>
              <SectionHeader title="Publish Results" sub="Applications with completed evaluations, ready for final publication by the Administrator." />
              {apps.filter((a) => a.status === "Officer Review").length === 0 ? (
                <Card className="p-10 text-center"><p className="text-sm text-[#7A7566]">No applications awaiting publication right now.</p></Card>
              ) : (
                <div className="space-y-3">
                  {apps.filter((a) => a.status === "Officer Review").map((a) => (
                    <Card key={a.id} className="p-5 flex items-center gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-ink">{a.code}</p>
                        <p className="text-xs text-[#9B9585]">{a.subject.code} — {a.subject.name} · Revised marks: {a.revised_marks}</p>
                      </div>
                      <PrimaryButton icon={Award} disabled={busy} onClick={() => handlePublish(a)}>
                        {busy ? "Publishing…" : "Publish Result"}
                      </PrimaryButton>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {active === "users" && (
            <>
              <SectionHeader title="User Management" sub="Overview of all registered students, evaluators, exam officers, and administrators." />
              <Card className="overflow-hidden border border-[#192B22] bg-[#0A0F0C]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#0D1612] text-left text-gray-400 border-b border-[#1A2E24] text-xs font-mono uppercase tracking-wider">
                      <th className="px-5 py-3.5 font-bold">Name</th>
                      <th className="px-5 py-3.5 font-bold">Role</th>
                      <th className="px-5 py-3.5 font-bold">Department</th>
                      <th className="px-5 py-3.5 font-bold">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-t border-[#14231B] hover:bg-[#0E1813] transition-colors">
                        <td className="px-5 py-3.5 font-bold text-white">{u.name}</td>
                        <td className="px-5 py-3.5"><Badge tone="navy">{u.role}</Badge></td>
                        <td className="px-5 py-3.5 text-gray-300 font-mono text-xs">{u.department || "—"}</td>
                        <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">{u.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </>
          )}

          {active === "audit" && (
            <>
              <SectionHeader title="Audit Logs" sub="Immutable cryptographic record of all platform activities and automated AI screenings." />
              <Card className="p-0 overflow-hidden border border-[#192B22] bg-[#0A0F0C]">
                {logs.length === 0 ? (
                  <p className="p-8 text-sm text-gray-500 font-mono">No audit events recorded yet.</p>
                ) : logs.map((l, i) => (
                  <div key={i} className={`flex items-center gap-4 px-5 py-3.5 text-sm hover:bg-charcoal-800 transition-colors ${i !== logs.length - 1 ? "border-b border-charcoal-800" : ""}`}>
                    <span className="text-xs text-charcoal-500 font-mono w-20 shrink-0">{new Date(l.created_at).toLocaleTimeString()}</span>
                    <span className="font-bold text-orange-400 font-mono text-xs w-44 shrink-0 truncate">{l.actor}</span>
                    <span className="text-charcoal-200 text-xs flex-1">{l.action}</span>
                    <Badge tone={l.category === "ai" ? "orange" : "slate"}>{l.category}</Badge>
                  </div>
                ))}
              </Card>
            </>
          )}
        </>
      )}
    </Shell>
  );
}
