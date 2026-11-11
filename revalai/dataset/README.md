# RevalAI Benchmark Dataset Specification

## 1. Dataset Overview
This directory contains the standard academic benchmark evaluation datasets for **RevalAI** (AI-Powered Multi-Role Examination Revaluation Platform).

The dataset is organized across 5 core university semester courses from the Anna University B.E. Computer Science & Engineering (AI/ML) curriculum:
- **CS301:** Data Structures & Algorithms
- **CS304:** Database Management Systems
- **MA205:** Discrete Mathematics
- **CS310:** Operating Systems
- **CS305:** Computer Networks

---

## 2. Dataset Architecture
Each course benchmark contains three interconnected multimodal layers:

```
revalai/dataset/
├── CS301_Data_Structures/
│   ├── question_paper.json          # Official end-semester examination questions & allocated marks
│   ├── expected_rubric_key.json     # Standard solution evaluation key & step-by-step mark breakdown
│   └── student_scripts/             # Digitized handwritten examination papers (multi-page)
│       ├── student_21CS114_p1.txt   # Part A - Recurrence relation & Master Theorem
│       ├── student_21CS114_p2.txt   # Part B - AVL Tree rotations trace
│       └── student_21CS114_p3.txt   # Part B - Dijkstra priority queue formulation
├── CS304_Database_Systems/
│   ├── question_paper.json
│   └── student_scripts/
├── MA205_Discrete_Math/
│   ├── question_paper.json
│   └── student_scripts/
├── CS310_Operating_Systems/
│   ├── question_paper.json
│   └── student_scripts/
└── CS305_Computer_Networks/
    ├── question_paper.json
    └── student_scripts/
```

---

## 3. Ground Truth Evaluation Standards
- **Maximum Marks:** 100 Marks per course examination.
- **Question Structure:**
  - Part A (Core Principles & Definitions): 35 Marks
  - Part B (Mathematical Formulations & Derivations): 35 Marks
  - Part B (Algorithm Implementation / Traces / Subnets): 30 Marks
- **Handwriting Ground Truth Benchmark:**
  - Formatted based on the **IAM Handwriting Dataset** and **George Washington Academic Script** conventions, capturing irregular cursive strokes, mathematical sub/superscripts ($T(n) = 2T(n/2) + O(n)$), ASCII memory trees, and matrix tables.
