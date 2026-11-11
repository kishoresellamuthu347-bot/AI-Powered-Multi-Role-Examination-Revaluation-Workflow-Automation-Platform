import React, { useState } from "react";
import { FileText, BookOpen, CheckCircle2, ChevronRight, HelpCircle, Layers, Award } from "lucide-react";
import { Badge, Card } from "./ui";

export default function QuestionPaperViewer({ questionPaper, subjectCode }) {
  const [selectedPart, setSelectedPart] = useState("all"); // 'all' | 'Part A' | 'Part B'

  if (!questionPaper || !questionPaper.questions || questionPaper.questions.length === 0) {
    return (
      <Card className="p-6 text-center border-dashed border-charcoal-800 bg-charcoal-900">
        <HelpCircle size={28} className="text-orange-400/50 mx-auto mb-2" />
        <p className="text-sm font-semibold text-white">Official Question Paper</p>
        <p className="text-xs text-charcoal-400 mt-1">Syllabus standard questions indexed against {subjectCode}.</p>
      </Card>
    );
  }

  const filteredQuestions = selectedPart === "all" 
    ? questionPaper.questions 
    : questionPaper.questions.filter(q => q.part === selectedPart);

  return (
    <div className="rounded-2xl border border-charcoal-700 bg-charcoal-950 overflow-hidden shadow-[0_15px_45px_rgba(0,0,0,0.9)]">
      {/* Accent Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-1.5 w-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />

      {/* Header Info */}
      <div className="bg-charcoal-900 border-b border-charcoal-800 p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-[0_0_16px_rgba(59,130,246,0.3)]">
            <BookOpen size={18} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm font-display tracking-wide">Official End-Semester Question Paper</span>
              <Badge tone="forest">{questionPaper.paper_code}</Badge>
            </div>
            <p className="text-xs text-charcoal-300 font-mono mt-0.5 font-semibold">
              TIME: {questionPaper.duration_hours} HOURS · MAX MARKS: <span className="text-blue-400 font-bold">{questionPaper.total_marks} MARKS</span>
            </p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center bg-charcoal-950 border border-charcoal-700 rounded-xl p-1 gap-1 text-xs font-bold">
          <button
            onClick={() => setSelectedPart("all")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              selectedPart === "all" ? "bg-blue-600 text-white shadow-sm" : "text-charcoal-400 hover:text-white"
            }`}
          >
            All Parts
          </button>
          <button
            onClick={() => setSelectedPart("Part A")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              selectedPart === "Part A" ? "bg-blue-600 text-white shadow-sm" : "text-charcoal-400 hover:text-white"
            }`}
          >
            Part A
          </button>
          <button
            onClick={() => setSelectedPart("Part B")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              selectedPart === "Part B" ? "bg-blue-600 text-white shadow-sm" : "text-charcoal-400 hover:text-white"
            }`}
          >
            Part B
          </button>
        </div>
      </div>

      {/* Instructions bar */}
      {questionPaper.instructions && (
        <div className="bg-[#0D1526] px-4 py-2 border-b border-blue-900/40 text-[11px] font-mono text-blue-200 flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">INSTRUCTIONS:</span>
          {questionPaper.instructions}
        </div>
      )}

      {/* Questions List */}
      <div className="p-4 space-y-3.5 max-h-[640px] overflow-y-auto">
        {filteredQuestions.map((q, idx) => (
          <div key={q.id || idx} className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 hover:border-blue-500/40 transition-all">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg bg-blue-500/20 border border-blue-500/30 font-mono text-xs font-black text-blue-300">
                  {q.question_number}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-charcoal-400 font-bold">
                  {q.part}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-charcoal-950 font-mono text-xs font-extrabold text-blue-400 border border-charcoal-700">
                {q.max_marks} MARKS
              </span>
            </div>

            <p className="text-sm font-sans font-medium text-white leading-relaxed mb-3">
              {q.question_text}
            </p>

            {q.expected_answer_key && (
              <div className="p-2.5 rounded-lg bg-[#070D18] border border-blue-900/30 text-xs">
                <p className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold mb-1 flex items-center gap-1.5">
                  <CheckCircle2 size={12} /> Expected Evaluation Key (Rubric Base):
                </p>
                <p className="font-mono text-charcoal-300 text-[11px] leading-relaxed">
                  {q.expected_answer_key}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
