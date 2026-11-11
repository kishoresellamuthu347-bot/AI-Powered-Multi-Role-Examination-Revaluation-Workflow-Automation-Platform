import React, { useState } from "react";
import { FileText, BookOpen, CheckCircle2, ChevronRight, HelpCircle, Layers, Award } from "lucide-react";
import { Badge, Card } from "./ui";

// Standard Question Paper fallback dataset if backend API object is not fully populated
const QUESTION_PAPER_FALLBACKS = {
  CS301: {
    paper_code: "CS301-QP-2025",
    total_marks: 100,
    duration_hours: 3.0,
    instructions: "Answer all questions in Part A and Part B. Show step-by-step traces for full credit.",
    questions: [
      {
        question_number: "Q1",
        part: "Part A",
        question_text: "Explain Merge Sort recurrence relation and analyze its time complexity using Master Theorem with an 8-element array example.",
        max_marks: 35,
        expected_answer_key: "T(n) = 2T(n/2) + O(n), Master Theorem Case 2 => Theta(n log n). Correct 2-way split and merge tree."
      },
      {
        question_number: "Q2",
        part: "Part B",
        question_text: "Construct an AVL tree by inserting [15, 20, 24, 10, 13, 7, 30, 36, 25]. Show balance factors and rotations performed.",
        max_marks: 35,
        expected_answer_key: "Balance factor in {-1, 0, 1}. Single Left rotation on 15, Double Left-Right rotation on 10/15. Balanced final tree."
      },
      {
        question_number: "Q3",
        part: "Part B",
        question_text: "Formulate Dijkstra Single-Source Shortest Path algorithm with priority queue relaxation and complexity analysis.",
        max_marks: 30,
        expected_answer_key: "Non-negative edge weights constraint. Min-heap relaxation: dist[v] = min(dist[v], dist[u] + w). Complexity: O((V+E)log V)."
      }
    ]
  },
  CS304: {
    paper_code: "CS304-QP-2025",
    total_marks: 100,
    duration_hours: 3.0,
    instructions: "Attempt all questions. Clearly state functional dependencies and transaction isolation levels.",
    questions: [
      {
        question_number: "Q1",
        part: "Part A",
        question_text: "Explain ACID properties of database transactions with a bank account transfer scenario.",
        max_marks: 35,
        expected_answer_key: "Atomicity (all or nothing), Consistency (sum balance invariant), Isolation (serializability), Durability (WAL write ahead log)."
      },
      {
        question_number: "Q2",
        part: "Part B",
        question_text: "Explain Relational Database Normalization from 1NF to BCNF with Functional Dependencies.",
        max_marks: 35,
        expected_answer_key: "1NF atomic values, 2NF no partial dependency, 3NF no transitive dependency, BCNF strict superkey constraint for X->Y."
      },
      {
        question_number: "Q3",
        part: "Part B",
        question_text: "Compare Two-Phase Locking (2PL) vs Timestamp Ordering concurrency control protocols.",
        max_marks: 30,
        expected_answer_key: "Growing and shrinking phase in 2PL. Strict 2PL prevents cascading aborts. Timestamp ordering uses Read-TS and Write-TS."
      }
    ]
  },
  MA205: {
    paper_code: "MA205-QP-2025",
    total_marks: 100,
    duration_hours: 3.0,
    instructions: "Mathematical rigor, clear induction base/hypothesis, and planar graph formulations are mandatory.",
    questions: [
      {
        question_number: "Q1",
        part: "Part A",
        question_text: "Prove by the Principle of Mathematical Induction that 1 + 2 + ... + n = n(n+1)/2 for all integers n >= 1.",
        max_marks: 35,
        expected_answer_key: "Base step n=1 LHS=1, RHS=1. Hypothesis: assume P(k). Inductive step: P(k+1) = k(k+1)/2 + (k+1) = (k+1)(k+2)/2. QED."
      },
      {
        question_number: "Q2",
        part: "Part B",
        question_text: "State and prove Euler's Formula V - E + F = 2 for connected planar graphs using induction on edges.",
        max_marks: 35,
        expected_answer_key: "Base tree E = V - 1, F = 1. V - (V-1) + 1 = 2. Adding edge creates cycle, splitting face: E+1, F+1 keeps invariant."
      },
      {
        question_number: "Q3",
        part: "Part B",
        question_text: "Solve recurrence relation a_n = 5 a_{n-1} - 6 a_{n-2} with initial conditions a_0 = 1, a_1 = 4.",
        max_marks: 30,
        expected_answer_key: "Characteristic equation r^2 - 5r + 6 = 0 => (r-2)(r-3)=0. General solution a_n = A(2^n) + B(3^n). A= -1, B=2."
      }
    ]
  },
  CS310: {
    paper_code: "CS310-QP-2025",
    total_marks: 100,
    duration_hours: 3.0,
    instructions: "Include safety algorithms, resource matrices, and page fault replacement traces.",
    questions: [
      {
        question_number: "Q1",
        part: "Part A",
        question_text: "Explain Deadlock Avoidance using Dijkstra's Banker's Algorithm with a worked 5-process allocation matrix.",
        max_marks: 35,
        expected_answer_key: "Need = Max - Allocation. Safety search loop: Work = Available, Finish[i] = false. Find safe sequence <P1, P3, P4, P0, P2>."
      },
      {
        question_number: "Q2",
        part: "Part B",
        question_text: "Simulate FIFO, LRU, and Optimal page replacement for reference string with 3 page frames. Note Belady's anomaly.",
        max_marks: 35,
        expected_answer_key: "FIFO: 15 faults (Belady anomaly). LRU: 12 faults. Optimal: 9 faults (theoretical lowest benchmark)."
      },
      {
        question_number: "Q3",
        part: "Part B",
        question_text: "Describe Critical Section Problem and implement mutual exclusion using Semaphores and Peterson's solution.",
        max_marks: 30,
        expected_answer_key: "Mutual exclusion, Progress, Bounded waiting. Wait(S) and Signal(S) atomic operations."
      }
    ]
  },
  CS305: {
    paper_code: "CS305-QP-2025",
    total_marks: 100,
    duration_hours: 3.0,
    instructions: "Show packet sequence diagrams, CIDR subnet bit calculations, and routing tables.",
    questions: [
      {
        question_number: "Q1",
        part: "Part A",
        question_text: "Explain TCP 3-Way Handshake connection establishment and sliding window flow control mechanism.",
        max_marks: 35,
        expected_answer_key: "SYN, SYN-ACK, ACK sequence. Sequence number increment. Flow control rwnd receiver advertized window bound."
      },
      {
        question_number: "Q2",
        part: "Part B",
        question_text: "Subnet base network 192.168.10.0/24 into 4 equal subnets. Calculate mask, network IDs, usable hosts and broadcast.",
        max_marks: 35,
        expected_answer_key: "Borrow 2 bits -> /26 (mask 255.255.255.192). Block size 64. 4 subnets each with 62 usable host addresses."
      },
      {
        question_number: "Q3",
        part: "Part B",
        question_text: "Compare Link State (Dijkstra) vs Distance Vector (Bellman-Ford) routing algorithms. Explain Count-to-Infinity problem.",
        max_marks: 30,
        expected_answer_key: "Global topology vs neighbor exchange. Split horizon and poison reverse prevent count-to-infinity loop in Bellman-Ford."
      }
    ]
  }
};

export default function QuestionPaperViewer({ questionPaper, subjectCode }) {
  const [selectedPart, setSelectedPart] = useState("all"); // 'all' | 'Part A' | 'Part B'

  // Resolve question paper data: use props if present, otherwise fallback to subject standard QP
  const activePaper = (questionPaper && questionPaper.questions && questionPaper.questions.length > 0)
    ? questionPaper
    : (QUESTION_PAPER_FALLBACKS[subjectCode] || QUESTION_PAPER_FALLBACKS.CS301);

  const filteredQuestions = selectedPart === "all" 
    ? activePaper.questions 
    : activePaper.questions.filter(q => q.part === selectedPart);

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
              <Badge tone="forest">{activePaper.paper_code}</Badge>
            </div>
            <p className="text-xs text-charcoal-300 font-mono mt-0.5 font-semibold">
              TIME: {activePaper.duration_hours || 3.0} HOURS · MAX MARKS: <span className="text-blue-400 font-bold">{activePaper.total_marks || 100} MARKS</span>
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
      {activePaper.instructions && (
        <div className="bg-[#0D1526] px-4 py-2 border-b border-blue-900/40 text-[11px] font-mono text-blue-200 flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">INSTRUCTIONS:</span>
          {activePaper.instructions}
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
