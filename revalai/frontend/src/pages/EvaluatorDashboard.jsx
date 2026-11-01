import React, { useEffect, useState, useCallback } from "react";
import {
  ClipboardList, History, ChevronLeft, FileSearch, Edit3, Eye, ScanLine,
  Brain, Sparkles, CheckCircle2, Send, AlertCircle, ListChecks,
} from "lucide-react";
import Shell from "../components/Shell";
import { Card, Badge, PrimaryButton, GhostButton, StatCard, SectionHeader } from "../components/ui";
import AnswerScriptViewer from "../components/AnswerScriptViewer";
import { api } from "../api";

export default function EvaluatorDashboard({ onLogout, notify }) {
  const [active, setActive] = useState("assignments");
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCase, setOpenCase] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [running, setRunning] = useState(false);
  const [marks, setMarks] = useState("");
  const [comment, setComment] = useState("");
  const [user, setUser] = useState({ name: localStorage.getItem("revalai_name") || "Evaluator", department: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, a] = await Promise.all([
        api.me().catch(() => null),
        api.myAssignments()
      ]);
      if (u) {
        setUser(u);
        if (u.name) localStorage.setItem("revalai_name", u.name);
      }
      setAssignments(a);
    } catch (e) {
      notify("error", e.message);
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { load(); }, [load]);

  const nav = [
    { id: "assignments", label: "Assignments", icon: ClipboardList },
    { id: "history", label: "Evaluation History", icon: History },
  ];

  function openPaper(app) {
    setOpenCase(app);
    setAnalysis(null);
    setMarks("");
    setComment("");
    setActive("evaluate");
  }

  async function runPipeline() {
    setRunning(true);
    try {
      const result = await api.runAI(openCase.id);
      setAnalysis(result);
      setMarks(String(result.suggested_marks));
    } catch (e) {
      notify("error", e.message);
    } finally {
      setRunning(false);
    }
  }

  async function submit() {
    setSubmitting(true);
    try {
      await api.submitEvaluation(openCase.id, parseFloat(marks), comment);
      notify("success", `Evaluation for ${openCase.code} submitted.`);
      await load();
      setActive("assignments");
    } catch (e) {
      notify("error", e.message);
    } finally {
      setSubmitting(false);
    }
  }

  const pending = assignments.filter((a) => a.status !== "Officer Review" && a.status !== "Published");
  const completed = assignments.filter((a) => a.status === "Officer Review" || a.status === "Published");

  return (
    <Shell roleName={user.name || "Evaluator"} roleSub={user.department ? `${user.department} Department` : "Evaluator"} nav={nav} active={active} setActive={setActive}
      onLogout={onLogout} notifCount={pending.length}>

      {loading ? <p className="text-sm text-[#9B9585]">Loading…</p> : (
        <>
          {active === "assignments" && (
            <>
              <SectionHeader title="Your Assignments" sub="Papers assigned to you for revaluation, awaiting review." />
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <StatCard icon={ClipboardList} label="Pending" value={pending.length} tone="gold" />
                <StatCard icon={CheckCircle2} label="Completed" value={completed.length} tone="forest" />
              </div>
              {assignments.length === 0 ? (
                <Card className="p-10 text-center">
                  <ListChecks size={28} className="text-[#B8B2A0] mx-auto mb-3" />
                  <p className="text-sm text-[#7A7566]">No papers assigned to you yet.</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {assignments.map((item) => {
                    const done = item.status === "Officer Review" || item.status === "Published";
                    return (
                      <Card key={item.id} className="p-5 flex items-center gap-4 flex-wrap">
                        <div className="w-10 h-10 rounded-xl bg-parchment flex items-center justify-center shrink-0">
                          <FileSearch size={17} className="text-ink" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-ink text-sm">{item.subject.code} — {item.subject.name}</p>
                          <p className="text-xs text-[#9B9585]">{item.code}</p>
                        </div>
                        {done ? <Badge tone="forest">Completed</Badge> : <Badge tone="gold">{item.status}</Badge>}
                        <GhostButton onClick={() => openPaper(item)} icon={done ? Eye : Edit3}>{done ? "View" : "Evaluate"}</GhostButton>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {active === "evaluate" && openCase && (
            <>
              <button onClick={() => setActive("assignments")} className="flex items-center gap-1.5 text-sm text-[#7A7566] hover:text-ink mb-4">
                <ChevronLeft size={15} /> Back to assignments
              </button>
              <SectionHeader title={`${openCase.subject.code} — ${openCase.subject.name}`} sub={openCase.code} />

              <div className="space-y-6">
                {/* Visual Answer Script with OCR and AI tabs */}
                <AnswerScriptViewer 
                  subjectCode={openCase.subject.code}
                  applicationCode={openCase.code}
                  onRunOCR={runPipeline}
                  analysis={analysis}
                  running={running}
                  isEvaluator={true}
                />

                {/* Evaluation Marks & Recommendation Form */}
                <div className="grid lg:grid-cols-5 gap-6">
                  <div className="lg:col-span-3 space-y-5">
                    {analysis ? (
                      <>
                        <Card className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider">Final Evaluator Marks</p>
                            <span className="text-xs text-orange-400 font-medium">✓ AI Suggested: {analysis.suggested_marks}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="number" step="0.5" min={0} max={analysis.max_marks}
                              value={marks} onChange={(e) => setMarks(e.target.value)}
                              className="w-28 px-3 py-2 rounded-xl border border-charcoal-700 bg-charcoal-950 text-base text-center font-bold text-orange-400 focus:border-orange-500 focus:outline-none"
                            />
                            <span className="text-base font-semibold text-charcoal-400">/ {analysis.max_marks}</span>
                          </div>
                        </Card>

                        <Card className="p-6">
                          <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-2">Evaluator Remarks & Notes</p>
                          <textarea
                            value={comment} onChange={(e) => setComment(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-charcoal-700 bg-charcoal-950 text-white text-sm h-24 focus:border-orange-500 focus:outline-none leading-relaxed"
                            placeholder="Add evaluation remarks or notes justifying any deviation from the AI score…"
                          />
                          <PrimaryButton className="mt-4 w-full" icon={Send} disabled={submitting || !marks} onClick={submit}>
                            {submitting ? "Submitting Final Evaluation…" : "Submit Final Evaluation & Forward to Officer"}
                          </PrimaryButton>
                        </Card>
                      </>
                    ) : (
                      <Card className="p-8 text-center bg-charcoal-900 border-charcoal-800">
                        <ScanLine size={32} className="mx-auto text-orange-400/50 mb-2" />
                        <p className="text-sm font-semibold text-white">Ready for Optical Character Recognition (OCR)</p>
                        <p className="text-xs text-charcoal-400 mt-1 mb-4">Click "Evaluate with OCR & AI" in the viewer above or button below to scan and evaluate.</p>
                        <PrimaryButton icon={ScanLine} disabled={running} onClick={runPipeline}>
                          {running ? "Scanning Paper…" : "Evaluate with OCR & AI"}
                        </PrimaryButton>
                      </Card>
                    )}
                  </div>

                  <div className="lg:col-span-2">
                    <Card className="p-6 sticky top-24" rainbow={Boolean(analysis)}>
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles size={18} className="text-orange-400" />
                        <p className="font-semibold text-white text-sm">AI Recommendation Engine</p>
                      </div>
                      {!analysis ? (
                        <div className="text-sm text-charcoal-400 space-y-2">
                          <p>Click <strong>Evaluate with OCR & AI</strong> to:</p>
                          <ul className="list-disc pl-4 text-xs space-y-1 text-charcoal-400">
                            <li>Digitize the handwritten paper via OCR</li>
                            <li>Highlight formulas and algorithms</li>
                            <li>Compute marks against rubric criteria</li>
                          </ul>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-4 bg-charcoal-950 rounded-xl border border-charcoal-800">
                            <p className="text-xs text-charcoal-400 mb-1">AI Suggested Score</p>
                            <p className="text-3xl font-bold text-orange-400 orange-glow-text">{analysis.suggested_marks} <span className="text-base font-normal text-charcoal-400">/ {analysis.max_marks}</span></p>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-charcoal-800">
                            <span className="text-xs text-charcoal-400">Confidence Level</span>
                            <Badge tone={analysis.confidence > 0.85 ? "rainbow" : "orange"}>{Math.round(analysis.confidence * 100)}% Verified</Badge>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-charcoal-400 mb-1.5 uppercase tracking-wider">AI Analysis Explanation</p>
                            <p className="text-xs text-charcoal-200 leading-relaxed bg-charcoal-950 p-3 rounded-xl border border-charcoal-800">{analysis.explanation}</p>
                          </div>
                          <div className="pt-2 flex items-start gap-2">
                            <AlertCircle size={14} className="text-orange-400 mt-0.5 shrink-0" />
                            <p className="text-[11px] text-charcoal-400 leading-snug">Evaluator has full authority to modify the final score before submission.</p>
                          </div>
                        </div>
                      )}
                    </Card>
                  </div>
                </div>
              </div>
            </>
          )}

          {active === "history" && (
            <>
              <SectionHeader title="Evaluation History" />
              {completed.length === 0 ? (
                <Card className="p-10 text-center">
                  <ListChecks size={28} className="text-[#B8B2A0] mx-auto mb-3" />
                  <p className="text-sm text-[#7A7566]">No completed evaluations yet.</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {completed.map((item) => (
                    <Card key={item.id} className="p-5 flex items-center gap-4">
                      <CheckCircle2 size={18} className="text-forest" />
                      <div>
                        <p className="font-medium text-sm text-ink">{item.subject.code} — {item.subject.name}</p>
                        <p className="text-xs text-[#9B9585]">{item.code} · Revised marks: {item.revised_marks}</p>
                      </div>
                      <Badge tone="forest" className="ml-auto">{item.status}</Badge>
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
