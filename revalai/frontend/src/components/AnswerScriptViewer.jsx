import React, { useState } from "react";
import { 
  FileText, Sparkles, CheckCircle2, ChevronRight, ChevronLeft, ZoomIn, ZoomOut, 
  RotateCw, Eye, EyeOff, Layers, AlertCircle, Scan, Cpu, BookOpen
} from "lucide-react";
import { Badge, PrimaryButton, GhostButton, Card } from "./ui";

// Realistic handwritten examination answer scripts mapped to 5 subjects with multiple pages and 100 marks scale
export const SCRIPT_MOCK_DATA = {
  CS301: {
    title: "Data Structures & Algorithms - End Semester Exam",
    paperCode: "CS301-2025-A",
    studentRoll: "Candidate #21CS114",
    totalQuestions: "5 Questions (100 Marks Total)",
    maxMarks: 100,
    date: "12 Nov 2025",
    pages: [
      {
        pageNumber: 1,
        question: "PART A - Q1. Explain Merge Sort recurrence relation and analyze its time complexity with an example (20 Marks).",
        handwrittenContent: [
          { text: "Ans 1: Merge Sort Recurrence Relation & Complexity Analysis", style: "title" },
          { text: "Merge sort is a Divide and Conquer paradigm algorithm.", style: "body" },
          { text: "1. Divide: Split array into two halves at mid = (low + high) / 2", style: "body" },
          { text: "2. Conquer: Recursively sort left subarray and right subarray.", style: "body" },
          { text: "3. Combine: Merge the two sorted halves into single sorted array.", style: "body" },
          { text: "Recurrence Relation:", style: "subtitle" },
          { text: "    T(n) = 2 T(n/2) + O(n)       [for n > 1]", style: "math" },
          { text: "    T(1) = O(1)                  [base condition]", style: "math" },
          { text: "Applying Master's Theorem: a = 2, b = 2, f(n) = n^1", style: "body" },
          { text: "Since log_b(a) = log_2(2) = 1, f(n) = Theta(n^(log_b a))", style: "math" },
          { text: "=> Case 2 of Master Theorem applies: T(n) = Theta(n log n)", style: "highlight" },
          { text: "Worked Example on Array [38, 27, 43, 3, 9, 82, 10]:", style: "subtitle" },
          { text: "Split 1: [38, 27, 43, 3]  and  [9, 82, 10]", style: "diagram" },
          { text: "Split 2: [38, 27], [43, 3]  and  [9, 82], [10]", style: "diagram" },
          { text: "Merge level 1: [27, 38], [3, 43]  and  [9, 82], [10]", style: "diagram" },
          { text: "Merge level 2: [3, 27, 38, 43]  and  [9, 10, 82]", style: "diagram" },
          { text: "Final Merged Array: [3, 9, 10, 27, 38, 43, 82]  (Sorted)", style: "highlight" },
          { text: "Space Complexity: O(n) auxiliary memory for merge buffer.", style: "body" }
        ],
        ocrRecognitions: [
          { line: "T(n) = 2 T(n/2) + O(n)", confidence: 98, tag: "Recurrence Formula" },
          { line: "T(n) = Theta(n log n)", confidence: 96, tag: "Master Theorem Application" },
          { line: "Merge split & recombine flow", confidence: 94, tag: "Trace Example" },
          { line: "Space Complexity: O(n)", confidence: 92, tag: "Auxiliary Memory" }
        ]
      },
      {
        pageNumber: 2,
        question: "PART B - Q2. Construct an AVL Tree by inserting [15, 20, 24, 10, 13, 7, 30, 36, 25] with rotations (20 Marks).",
        handwrittenContent: [
          { text: "Ans 2: AVL Tree Construction & Balance Factor Analysis", style: "title" },
          { text: "An AVL Tree is a Self-Balancing Binary Search Tree where Balance Factor (BF) in {-1, 0, +1}.", style: "body" },
          { text: "Formula: BF(Node) = Height(Left_Subtree) - Height(Right_Subtree)", style: "math" },
          { text: "Step 1: Insert 15, then 20 -> Root=15 (BF = -1), Right=20 (BF=0). Balanced.", style: "body" },
          { text: "Step 2: Insert 24 -> 15 (BF = -2) -> RR Imbalance at Node 15.", style: "subtitle" },
          { text: "   Apply Left Rotation (LL) on Node 15 -> New Subtree Root = 20, Left=15, Right=24.", style: "highlight" },
          { text: "Step 3: Insert 10, 13 -> 15 has left=10, right child 13 -> LR Imbalance.", style: "body" },
          { text: "   Apply Double Rotation (Left Rotate on 10, Right Rotate on 15).", style: "math" },
          { text: "Step 4: Final AVL Tree representation after all insertions:", style: "subtitle" },
          { text: "             [ 20 ]               (BF = 0)", style: "diagram" },
          { text: "           /        \\            ", style: "diagram" },
          { text: "        [ 13 ]      [ 30 ]        (BF = 0)", style: "diagram" },
          { text: "       /    \\      /    \\        ", style: "diagram" },
          { text: "     [7]   [15]  [24]  [36]       (BF = 0)", style: "diagram" },
          { text: "All node balance factors strictly within {-1, 0, 1}. Search Time O(log n).", style: "highlight" }
        ],
        ocrRecognitions: [
          { line: "BF = Height(L) - Height(R)", confidence: 97, tag: "Formula" },
          { line: "RR Rotation around 15 -> 20 pivot", confidence: 95, tag: "Tree Rotation" },
          { line: "Double LR Rotation solved", confidence: 94, tag: "Imbalance Correction" },
          { line: "Final balanced tree verified", confidence: 98, tag: "Verification" }
        ]
      },
      {
        pageNumber: 3,
        question: "PART B - Q3. Dijkstra's Shortest Path Algorithm & Complexity Analysis (20 Marks).",
        handwrittenContent: [
          { text: "Ans 3: Dijkstra's Single Source Shortest Path Algorithm", style: "title" },
          { text: "Applicability: Directed/Undirected graphs with NON-NEGATIVE edge weights.", style: "body" },
          { text: "Data Structures Used: Min-Heap / Priority Queue Q, Distance array dist[V].", style: "body" },
          { text: "Pseudo-Algorithm:", style: "subtitle" },
          { text: "  1. Initialize dist[src] = 0; dist[v] = INF for all other v in V.", style: "math" },
          { text: "  2. Insert all vertices into Min-Priority Queue Q.", style: "math" },
          { text: "  3. While Q is not empty:", style: "math" },
          { text: "       u = Extract_Min(Q);", style: "math" },
          { text: "       For each neighbor v of u with edge weight w(u, v):", style: "math" },
          { text: "           if dist[u] + w(u, v) < dist[v]:", style: "highlight" },
          { text: "               dist[v] = dist[u] + w(u, v)   [Relaxation step]", style: "highlight" },
          { text: "Time Complexity: With Binary Min-Heap: O((V + E) log V). Space: O(V).", style: "highlight" }
        ],
        ocrRecognitions: [
          { line: "Non-negative edge weights constraint", confidence: 99, tag: "Precondition" },
          { line: "Relaxation condition dist[u]+w < dist[v]", confidence: 97, tag: "Relaxation" },
          { line: "Time Complexity: O((V+E) log V)", confidence: 96, tag: "Asymptotic Analysis" }
        ]
      }
    ]
  },
  CS304: {
    title: "Database Management Systems - End Semester Exam",
    paperCode: "CS304-2025-B",
    studentRoll: "Candidate #21CS114",
    totalQuestions: "5 Questions (100 Marks Total)",
    maxMarks: 100,
    date: "15 Nov 2025",
    pages: [
      {
        pageNumber: 1,
        question: "PART A - Q1. Explain ACID properties with a real-world transaction scenario (20 Marks).",
        handwrittenContent: [
          { text: "Ans 1: ACID Properties of Database Transactions", style: "title" },
          { text: "A transaction is a logical unit of database processing that includes one or more access operations.", style: "body" },
          { text: "1. Atomicity: 'All or Nothing' property.", style: "subtitle" },
          { text: "   Example: Transfer ₹5000 from Account A to Account B.", style: "body" },
          { text: "   Debiting A and crediting B must both succeed, or system rolls back.", style: "math" },
          { text: "2. Consistency: Database transforms from one valid state to another valid state.", style: "subtitle" },
          { text: "   Sum of balances (Bal_A + Bal_B) must remain preserved before and after.", style: "body" },
          { text: "3. Isolation: Concurrent transactions execute without mutual interference.", style: "subtitle" },
          { text: "   Intermediate uncommitted states are not visible to other transactions.", style: "body" },
          { text: "4. Durability: Once committed, updates persist even in power failure/crash.", style: "subtitle" },
          { text: "   Write-Ahead Logging (WAL) ensures committed records survive reboots.", style: "highlight" }
        ],
        ocrRecognitions: [
          { line: "Atomicity: All or Nothing guarantee", confidence: 97, tag: "Concept Definition" },
          { line: "Banking transaction debit/credit example", confidence: 95, tag: "Worked Scenario" },
          { line: "Consistency preserving invariant balance", confidence: 94, tag: "State Integrity" },
          { line: "Write-Ahead Logging WAL for Durability", confidence: 93, tag: "Recovery" }
        ]
      },
      {
        pageNumber: 2,
        question: "PART B - Q2. Explain Normalization up to BCNF with Functional Dependencies (20 Marks).",
        handwrittenContent: [
          { text: "Ans 2: Relational Database Normalization (1NF to BCNF)", style: "title" },
          { text: "Purpose: Eliminate data redundancies and avoid insertion, deletion, update anomalies.", style: "body" },
          { text: "1NF: All attribute values are atomic; no repeating groups/arrays.", style: "subtitle" },
          { text: "2NF: Must be in 1NF and no Partial Dependency (Non-prime attribute fully dependent on Candidate Key).", style: "subtitle" },
          { text: "3NF: Must be in 2NF and no Transitive Dependency (X -> Y where Y is non-prime => X is Superkey).", style: "subtitle" },
          { text: "BCNF (Boyce-Codd NF): For every functional dependency X -> Y, X MUST be a Superkey.", style: "highlight" },
          { text: "Example decomposition shown with Student-Course-Instructor relation.", style: "body" }
        ],
        ocrRecognitions: [
          { line: "1NF Atomic attributes check", confidence: 96, tag: "1NF" },
          { line: "2NF No Partial Dependencies", confidence: 95, tag: "2NF" },
          { line: "3NF No Transitive Dependencies", confidence: 94, tag: "3NF" },
          { line: "BCNF Superkey condition strictly met", confidence: 97, tag: "BCNF" }
        ]
      }
    ]
  },
  CS310: {
    title: "Operating Systems - End Semester Exam",
    paperCode: "CS310-2025-C",
    studentRoll: "Candidate #21CS114",
    totalQuestions: "5 Questions (100 Marks Total)",
    maxMarks: 100,
    date: "18 Nov 2025",
    pages: [
      {
        pageNumber: 1,
        question: "PART A - Q1. Explain Deadlock Avoidance using Dijkstra's Banker's Algorithm with a worked matrix example (20 Marks).",
        handwrittenContent: [
          { text: "Ans 1: Deadlock Avoidance - Banker's Algorithm", style: "title" },
          { text: "Banker's Algorithm tests for safety by simulating the allocation of predetermined maximum possible amounts.", style: "body" },
          { text: "Data Structures:", style: "subtitle" },
          { text: "  1. Available[m]: Available instances of resource R_j.", style: "math" },
          { text: "  2. Max[n][m]: Maximum demand of process P_i.", style: "math" },
          { text: "  3. Allocation[n][m]: Resources currently allocated to P_i.", style: "math" },
          { text: "  4. Need[n][m] = Max[n][m] - Allocation[n][m]", style: "highlight" },
          { text: "Safety Algorithm Evaluation:", style: "subtitle" },
          { text: "  Work = Available; Finish[i] = false for all i.", style: "body" },
          { text: "  Find process P_i such that: Finish[i] == false && Need_i <= Work", style: "math" },
          { text: "  Work = Work + Allocation_i; Finish[i] = true;", style: "math" },
          { text: "  Found Safe Sequence: <P1, P3, P4, P0, P2>. Hence system is in SAFE STATE.", style: "highlight" }
        ],
        ocrRecognitions: [
          { line: "Need = Max - Allocation formula", confidence: 98, tag: "Matrix Invariant" },
          { line: "Safety Algorithm search loop", confidence: 95, tag: "Algorithm Logic" },
          { line: "Safe sequence <P1, P3, P4, P0, P2> verified", confidence: 97, tag: "Outcome State" }
        ]
      },
      {
        pageNumber: 2,
        question: "PART B - Q2. Page Replacement Algorithms (FIFO, LRU, Optimal) for reference string (20 Marks).",
        handwrittenContent: [
          { text: "Ans 2: Page Replacement Simulation (Frame Size = 3)", style: "title" },
          { text: "Reference String: 7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1", style: "body" },
          { text: "1. FIFO (First In First Out): Total Page Faults = 15. Suffers from Belady's Anomaly.", style: "subtitle" },
          { text: "2. LRU (Least Recently Used): Total Page Faults = 12. Implemented via stack / counters.", style: "highlight" },
          { text: "3. Optimal Page Replacement: Total Page Faults = 9 (Theoretical lower bound benchmark).", style: "highlight" }
        ],
        ocrRecognitions: [
          { line: "Belady anomaly note on FIFO", confidence: 94, tag: "OS Concept" },
          { line: "LRU Page Fault count: 12", confidence: 96, tag: "Simulation Trace" },
          { line: "Optimal Page Replacement: 9 faults", confidence: 98, tag: "Optimal Benchmark" }
        ]
      }
    ]
  },
  MA205: {
    title: "Discrete Mathematics - End Semester Exam",
    paperCode: "MA205-2025-D",
    studentRoll: "Candidate #21CS114",
    totalQuestions: "5 Questions (100 Marks Total)",
    maxMarks: 100,
    date: "20 Nov 2025",
    pages: [
      {
        pageNumber: 1,
        question: "PART A - Q1. Prove by Mathematical Induction that 1 + 2 + ... + n = n(n+1)/2 for all n >= 1 (20 Marks).",
        handwrittenContent: [
          { text: "Ans 1: Proof by Principle of Mathematical Induction (PMI)", style: "title" },
          { text: "Let P(n): 1 + 2 + 3 + ... + n = n(n + 1) / 2", style: "body" },
          { text: "Base Step (n = 1):", style: "subtitle" },
          { text: "LHS = 1;  RHS = 1(1 + 1)/2 = 2/2 = 1. Hence P(1) is TRUE.", style: "math" },
          { text: "Inductive Hypothesis:", style: "subtitle" },
          { text: "Assume P(k) is true for some positive integer k >= 1.", style: "body" },
          { text: "1 + 2 + ... + k = k(k + 1) / 2   --- (Equation 1)", style: "math" },
          { text: "Inductive Step (Prove P(k + 1) is true):", style: "subtitle" },
          { text: "LHS = [1 + 2 + ... + k] + (k + 1) = k(k + 1)/2 + (k + 1)", style: "math" },
          { text: "     = (k + 1) [k/2 + 1] = (k + 1)(k + 2)/2", style: "highlight" },
          { text: "     = (k + 1)((k + 1) + 1)/2 = RHS.", style: "highlight" },
          { text: "Therefore, P(k + 1) holds true whenever P(k) is true.", style: "body" },
          { text: "By PMI, the statement holds for all integers n >= 1. Q.E.D.", style: "highlight" }
        ],
        ocrRecognitions: [
          { line: "Base Step P(1) validated", confidence: 99, tag: "Base Case" },
          { line: "Inductive Hypothesis formulation", confidence: 97, tag: "Hypothesis" },
          { line: "LHS manipulation: (k+1)(k+2)/2", confidence: 96, tag: "Inductive Proof" },
          { line: "Conclusion by PMI Q.E.D.", confidence: 95, tag: "Rigor & Notation" }
        ]
      },
      {
        pageNumber: 2,
        question: "PART B - Q2. State and prove Euler's Formula for connected planar graphs (20 Marks).",
        handwrittenContent: [
          { text: "Ans 2: Euler's Formula for Planar Graphs: V - E + F = 2", style: "title" },
          { text: "Theorem: For any connected planar graph G with V vertices, E edges, and F faces, V - E + F = 2.", style: "body" },
          { text: "Proof by induction on number of edges E:", style: "subtitle" },
          { text: "Base case: Tree with E = V - 1. Faces F = 1 (only unbounded face).", style: "math" },
          { text: "V - (V - 1) + 1 = 1 + 1 = 2. Holds true for base case.", style: "highlight" },
          { text: "Inductive step: Adding an edge creating a cycle splits an existing face into 2 faces.", style: "body" },
          { text: "E increases by 1, F increases by 1 -> V - (E+1) + (F+1) = V - E + F = 2. Proved.", style: "highlight" }
        ],
        ocrRecognitions: [
          { line: "Euler characteristic formula V - E + F = 2", confidence: 98, tag: "Formula" },
          { line: "Base tree induction step", confidence: 96, tag: "Base Case" },
          { line: "Cycle face split inductive proof", confidence: 95, tag: "Induction" }
        ]
      }
    ]
  },
  CS305: {
    title: "Computer Networks - End Semester Exam",
    paperCode: "CS305-2025-E",
    studentRoll: "Candidate #21CS114",
    totalQuestions: "5 Questions (100 Marks Total)",
    maxMarks: 100,
    date: "23 Nov 2025",
    pages: [
      {
        pageNumber: 1,
        question: "PART A - Q1. Explain TCP 3-Way Handshake and Sliding Window Flow Control (20 Marks).",
        handwrittenContent: [
          { text: "Ans 1: Transmission Control Protocol (TCP) Connection & Flow Control", style: "title" },
          { text: "TCP is a connection-oriented, reliable byte-stream protocol in the Transport Layer.", style: "body" },
          { text: "3-Way Handshake Connection Establishment:", style: "subtitle" },
          { text: "  1. Client -> Server: SYN = 1, Seq = X (Client ISN)", style: "math" },
          { text: "  2. Server -> Client: SYN = 1, ACK = 1, Seq = Y, Ack_Num = X + 1", style: "math" },
          { text: "  3. Client -> Server: ACK = 1, Seq = X + 1, Ack_Num = Y + 1 [Connection ESTABLISHED]", style: "highlight" },
          { text: "Sliding Window Flow Control:", style: "subtitle" },
          { text: "  - Receiver advertises window size 'rwnd' in TCP header.", style: "body" },
          { text: "  - Sender transmits up to min(cwnd, rwnd) unacknowledged bytes.", style: "math" },
          { text: "  - Prevents fast sender from overwhelming buffer-constrained receiver.", style: "highlight" }
        ],
        ocrRecognitions: [
          { line: "SYN, SYN-ACK, ACK 3-way sequence", confidence: 98, tag: "Handshake Sequence" },
          { line: "ISN Sequence number increment", confidence: 96, tag: "Protocol Logic" },
          { line: "Sender buffer bounded by min(cwnd, rwnd)", confidence: 95, tag: "Flow Control" }
        ]
      },
      {
        pageNumber: 2,
        question: "PART B - Q2. IPv4 Subnetting and Classless Inter-Domain Routing (CIDR) (20 Marks).",
        handwrittenContent: [
          { text: "Ans 2: Subnetting 192.168.10.0/24 into 4 Equal Subnets", style: "title" },
          { text: "Given Base Network: 192.168.10.0/24. Subnet mask: 255.255.255.0", style: "body" },
          { text: "Need 4 subnets: 2^2 = 4 -> Borrow 2 bits from host portion.", style: "subtitle" },
          { text: "New Subnet Mask: /26 = 255.255.255.192. Block size = 256 - 192 = 64.", style: "highlight" },
          { text: "Subnet 1: 192.168.10.0/26 (Hosts: 192.168.10.1 - 192.168.10.62, Broadcast: .63)", style: "math" },
          { text: "Subnet 2: 192.168.10.64/26 (Hosts: 192.168.10.65 - 192.168.10.126, Broadcast: .127)", style: "math" },
          { text: "Subnet 3: 192.168.10.128/26 (Hosts: 192.168.10.129 - 192.168.10.190, Broadcast: .191)", style: "math" },
          { text: "Subnet 4: 192.168.10.192/26 (Hosts: 192.168.10.193 - 192.168.10.254, Broadcast: .255)", style: "math" },
          { text: "Each subnet provides 62 usable valid host IP addresses.", style: "highlight" }
        ],
        ocrRecognitions: [
          { line: "Borrow 2 bits for 4 subnets -> /26", confidence: 99, tag: "CIDR Math" },
          { line: "Subnet mask 255.255.255.192", confidence: 97, tag: "Mask Calculation" },
          { line: "Valid host ranges correctly calculated", confidence: 98, tag: "IP Ranges" }
        ]
      }
    ]
  }
};

export default function AnswerScriptViewer({ 
  subjectCode, 
  applicationCode, 
  onRunOCR, 
  analysis, 
  running,
  isEvaluator = false,
  readOnly = false,
  onClose = null
}) {
  const [zoom, setZoom] = useState(1);
  const [showOverlay, setShowOverlay] = useState(true);
  const [activeTab, setActiveTab] = useState("paper"); // 'paper' | 'ocr' | 'ai'
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const scriptData = SCRIPT_MOCK_DATA[subjectCode] || SCRIPT_MOCK_DATA.CS301;
  const totalPages = scriptData.pages.length;
  const page = scriptData.pages[currentPageIndex] || scriptData.pages[0];

  return (
    <div className="rounded-2xl border border-charcoal-700 bg-charcoal-950 overflow-hidden shadow-[0_15px_45px_rgba(0,0,0,0.9)]">
      {/* Fiery accent top bar */}
      <div className="fiery-bar h-1.5 w-full shadow-[0_0_15px_#FF6B00]" />

      {/* Header Bar */}
      <div className="bg-charcoal-900 border-b border-charcoal-800 p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-glow/20 border border-orange-glow/50 flex items-center justify-center text-orange-400 shadow-[0_0_16px_rgba(255,107,0,0.35)] animate-ember-flicker">
            <FileText size={18} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm font-display tracking-wide">{scriptData.title}</span>
              <Badge tone="orange">{scriptData.paperCode}</Badge>
            </div>
            <p className="text-xs text-charcoal-300 font-mono mt-0.5 font-semibold">
              ROLL NO: <span className="font-bold text-white">{scriptData.studentRoll}</span> · MAX MARKS: <span className="text-orange-400 font-bold">{scriptData.maxMarks} MARKS</span> · DATE: {scriptData.date}
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          {/* Page Selector Controls */}
          <div className="flex items-center bg-charcoal-950 border border-charcoal-700 rounded-xl px-2 py-1 text-xs text-charcoal-200 gap-1.5 font-bold">
            <button
              onClick={() => setCurrentPageIndex(prev => Math.max(0, prev - 1))}
              disabled={currentPageIndex === 0}
              className="p-1 hover:text-orange-400 hover:bg-charcoal-800 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-mono text-orange-400 font-extrabold px-1">
              Page {page.pageNumber} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPageIndex(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPageIndex === totalPages - 1}
              className="p-1 hover:text-orange-400 hover:bg-charcoal-800 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center bg-charcoal-950 border border-charcoal-700 rounded-xl px-2 py-1 text-xs text-charcoal-200 gap-1 font-bold">
            <button 
              onClick={() => setZoom(prev => Math.max(0.85, prev - 0.1))} 
              className="p-1 hover:text-orange-400 hover:bg-charcoal-800 rounded transition-colors"
              title="Zoom out"
            >
              <ZoomOut size={14} />
            </button>
            <span className="w-10 text-center font-mono text-orange-400 font-extrabold">{Math.round(zoom * 100)}%</span>
            <button 
              onClick={() => setZoom(prev => Math.min(1.25, prev + 0.1))} 
              className="p-1 hover:text-orange-400 hover:bg-charcoal-800 rounded transition-colors"
              title="Zoom in"
            >
              <ZoomIn size={14} />
            </button>
          </div>

          {/* OCR overlay toggle */}
          {analysis && (
            <button
              onClick={() => setShowOverlay(!showOverlay)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                showOverlay 
                  ? "bg-orange-glow/20 border-orange-glow/70 text-orange-300 shadow-[0_0_18px_rgba(255,107,0,0.35)]" 
                  : "border-charcoal-700 text-charcoal-300 hover:bg-charcoal-800 hover:text-white"
              }`}
            >
              <Layers size={14} />
              {showOverlay ? "AI Overlay: ON" : "AI Overlay: OFF"}
            </button>
          )}

          {/* Evaluate / Run OCR button if in evaluator mode & not analyzed yet */}
          {isEvaluator && !analysis && (
            <PrimaryButton 
              icon={Scan} 
              disabled={running} 
              onClick={onRunOCR}
              className="!py-1.5 !px-3.5 text-xs font-black shadow-[0_0_20px_rgba(255,107,0,0.45)]"
            >
              {running ? "Scanning & Running OCR…" : "Evaluate with OCR & AI"}
            </PrimaryButton>
          )}

          {onClose && (
            <button 
              onClick={onClose}
              className="px-3 py-1 rounded-xl bg-charcoal-800 text-white hover:bg-charcoal-700 text-xs font-bold border border-charcoal-600 transition-colors ml-1"
            >
              ✕ Close
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-charcoal-800 bg-charcoal-900 px-4 text-xs font-bold text-charcoal-300">
        <button
          onClick={() => setActiveTab("paper")}
          className={`py-3.5 px-4 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "paper" ? "border-orange-500 text-orange-400 shadow-[0_4px_14px_-2px_rgba(255,107,0,0.4)] font-extrabold" : "border-transparent hover:text-white"
          }`}
        >
          <FileText size={15} />
          Original Answer Sheet (Page {page.pageNumber})
        </button>
        <button
          onClick={() => setActiveTab("ocr")}
          className={`py-3.5 px-4 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "ocr" ? "border-orange-500 text-orange-400 shadow-[0_4px_14px_-2px_rgba(255,107,0,0.4)] font-extrabold" : "border-transparent hover:text-white"
          }`}
        >
          <Cpu size={15} />
          OCR Digitized Transcription
        </button>
        {analysis && (
          <button
            onClick={() => setActiveTab("ai")}
            className={`py-3.5 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "ai" ? "border-orange-500 text-orange-400 shadow-[0_4px_14px_-2px_rgba(255,107,0,0.4)] font-extrabold" : "border-transparent hover:text-white"
            }`}
          >
            <Sparkles size={15} />
            AI Rubric Evaluation ({analysis.suggested_marks}/{analysis.max_marks || 100})
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-6 bg-[#08090C] min-h-[580px] max-h-[750px] overflow-y-auto flex justify-center items-start">
        {/* Tab 1: Simulated Physical Answer Paper */}
        {activeTab === "paper" && (
          <div 
            style={{ transform: `scale(${zoom})`, transformOrigin: "top center", transition: "transform 0.15s ease-out" }}
            className="w-full max-w-3xl bg-[#FAF7EE] text-[#1E1B18] rounded-xl p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-[#E3DAC9] relative font-serif select-none"
          >
            {/* Paper Header (University exam style) */}
            <div className="border-b-2 border-[#2C2416] pb-4 mb-6 text-center">
              <p className="text-xs uppercase tracking-[0.2em] font-sans font-extrabold text-[#7A6E5D]">NATIONAL EXAMINATION REVALUATION BOARD</p>
              <h2 className="text-lg font-bold font-serif text-[#1C170E] mt-1">{scriptData.title}</h2>
              <div className="flex justify-between items-center text-xs font-mono text-[#5A5145] mt-2 border-t border-dashed border-[#C5BBAA] pt-2">
                <span>ROLL: {scriptData.studentRoll}</span>
                <span>SUBJECT: {subjectCode}</span>
                <span>MAX: 100 MARKS</span>
                <span className="font-bold text-[#9E3E00]">PAGE: {page.pageNumber} OF {totalPages}</span>
              </div>
            </div>

            {/* Question prompt */}
            <div className="bg-[#EFE8D8] p-3.5 rounded-lg border border-[#D5CAA8] mb-6 font-sans text-xs font-bold text-[#2E281F]">
              <span className="text-[#A74100] mr-2 font-mono">EXAM PROMPT:</span>
              {page.question}
            </div>

            {/* Handwritten Simulated Answer Lines */}
            <div className="space-y-3.5 relative font-handwriting leading-relaxed text-[#0B1536]">
              {page.handwrittenContent.map((line, idx) => {
                let styleClass = "text-base font-medium";
                if (line.style === "title") styleClass = "text-xl font-black underline text-[#091D5C] pt-2";
                if (line.style === "subtitle") styleClass = "text-base font-bold text-[#142A75] pt-2";
                if (line.style === "math") styleClass = "font-mono text-sm bg-[#E8E2D2]/60 px-3 py-1.5 rounded border border-[#D9D1BE] text-[#0A2647] font-semibold";
                if (line.style === "diagram") styleClass = "font-mono text-xs bg-[#E5DFC9] p-2 rounded text-[#051C33] whitespace-pre";
                if (line.style === "highlight") styleClass = "text-base font-semibold text-[#091D5C] bg-[#FFF2B2]/60 px-2 py-0.5 rounded";

                return (
                  <div key={idx} className="relative group">
                    <p className={`${styleClass} transition-colors`}>{line.text}</p>
                    
                    {/* Simulated OCR Detection Bounding Box Overlay */}
                    {showOverlay && analysis && (
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-1 -left-2 -right-2 -bottom-1 border border-orange-500/70 bg-orange-500/10 rounded pointer-events-none transition-opacity flex items-center justify-end pr-2 text-[9px] font-mono text-orange-700 font-bold">
                        OCR CONFIDENCE: 98%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Paper Seal & Pagination */}
            <div className="mt-12 pt-4 border-t border-[#D5CAA8] flex justify-between items-center text-[10px] font-mono text-[#7A6E5D]">
              <span>AUTHENTIC DIGITAL SCRIPT SCAN ID: #EXP-2025-{subjectCode}</span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#E5DFC9] rounded font-bold text-[#2C2416]">PAGE {page.pageNumber}/{totalPages}</span>
                <span>SIGNATURE: [VERIFIED CONTROLLER OF EXAMINATIONS]</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: OCR Digitized Extraction */}
        {activeTab === "ocr" && (
          <div className="w-full max-w-3xl space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Cpu size={18} className="text-orange-400" />
                  <p className="font-bold text-white text-base">Digitized OCR Extraction & Segmentation</p>
                </div>
                <Badge tone="orange">Confidence: 96.4%</Badge>
              </div>

              <div className="space-y-4">
                <div className="p-5 bg-charcoal-900 rounded-xl border border-charcoal-700 font-mono text-sm leading-relaxed text-orange-200 font-semibold shadow-inner">
                  "{analysis ? analysis.ocr_text : page.handwrittenContent.map(l => l.text).join(' ')}"
                </div>

                <p className="text-xs font-mono font-extrabold text-orange-400 uppercase tracking-wider mt-4">Detected Semantic Segments:</p>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {page.ocrRecognitions.map((item, idx) => (
                    <div key={idx} className="p-3 bg-charcoal-900 rounded-xl border border-charcoal-700 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-white">{item.line}</p>
                        <p className="text-[10px] text-charcoal-400 font-mono font-semibold">{item.tag}</p>
                      </div>
                      <Badge tone="orange">{item.confidence}%</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tab 3: AI Rubric Breakdown */}
        {activeTab === "ai" && analysis && (
          <div className="w-full max-w-3xl space-y-4">
            <Card className="p-6" fiery>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Sparkles size={20} className="text-orange-400" />
                  <p className="font-black text-white text-lg font-display">Automated Rubric Evaluation</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-charcoal-300 font-mono font-bold">Suggested Total: </span>
                  <span className="text-3xl font-black text-orange-400 orange-glow-text font-display">{analysis.suggested_marks} / {analysis.max_marks || 100}</span>
                </div>
              </div>

              <div className="p-4 bg-charcoal-850 rounded-xl border border-orange-500/30 mb-5">
                <p className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider mb-1.5">AI Evaluator Explanation</p>
                <p className="text-sm text-charcoal-200 leading-relaxed font-sans">{analysis.explanation}</p>
              </div>

              <div className="space-y-2.5">
                <p className="text-xs font-mono font-bold text-charcoal-400 uppercase tracking-wider">Evaluation Breakdown & Rubric Alignment (100 Marks Scale):</p>
                <div className="p-3.5 bg-charcoal-900 rounded-xl border border-charcoal-800 flex items-center justify-between">
                  <span className="text-xs text-charcoal-300 font-medium">Part A: Core Principles & Theoretical Rigor</span>
                  <span className="font-bold font-mono text-xs text-orange-400">✓ 31 / 35</span>
                </div>
                <div className="p-3.5 bg-charcoal-900 rounded-xl border border-charcoal-800 flex items-center justify-between">
                  <span className="text-xs text-charcoal-300 font-medium">Part B: Problem-solving, Formulas & Proof Derivations</span>
                  <span className="font-bold font-mono text-xs text-orange-400">✓ 22 / 25</span>
                </div>
                <div className="p-3.5 bg-charcoal-900 rounded-xl border border-charcoal-800 flex items-center justify-between">
                  <span className="text-xs text-charcoal-300 font-medium">Step-by-step Traces & Worked Numerical Examples</span>
                  <span className="font-bold font-mono text-xs text-orange-400">✓ 21 / 25</span>
                </div>
                <div className="p-3.5 bg-charcoal-900 rounded-xl border border-charcoal-800 flex items-center justify-between">
                  <span className="text-xs text-charcoal-300 font-medium">Boundary Conditions & Edge Case Explanations</span>
                  <span className="font-bold font-mono text-xs text-amber-400">~ 11 / 15</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
