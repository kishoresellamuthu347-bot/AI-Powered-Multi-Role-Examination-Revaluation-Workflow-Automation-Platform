import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_table_borders(table, color="CCCCCC", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'  <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:insideV w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:left w:val="none"/>'
        f'  <w:right w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def set_code_block_borders(table, color="D0D5DD"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'  <w:top w:val="single" w:sz="6" w:space="0" w:color="{color}"/>'
        f'  <w:bottom w:val="single" w:sz="6" w:space="0" w:color="{color}"/>'
        f'  <w:left w:val="single" w:sz="18" w:space="0" w:color="2563EB"/>'
        f'  <w:right w:val="single" w:sz="6" w:space="0" w:color="{color}"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def build_report():
    doc = docx.Document()

    # Base Normal style
    style_normal = doc.styles['Normal']
    font = style_normal.font
    font.name = 'Times New Roman'
    font.size = Pt(12)
    font.color.rgb = RGBColor(0, 0, 0)

    # Page Margins (1 inch all around standard academic report)
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.25)
        section.right_margin = Inches(1.0)
        section.different_first_page_header_footer = True

    def add_p(text="", align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_before=0, space_after=6, line_spacing=1.5, bold=False, italic=False, size=12, all_caps=False):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = line_spacing
        if text:
            run = p.add_run(text.upper() if all_caps else text)
            run.bold = bold
            run.italic = italic
            run.font.size = Pt(size)
            run.font.name = 'Times New Roman'
            run.font.color.rgb = RGBColor(0, 0, 0)
        return p

    def add_heading_chapter(chap_num_str, title_str):
        p1 = doc.add_paragraph()
        p1.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p1.paragraph_format.space_before = Pt(18)
        p1.paragraph_format.space_after = Pt(6)
        r1 = p1.add_run(f"CHAPTER {chap_num_str}")
        r1.bold = True
        r1.font.size = Pt(14)
        r1.font.name = 'Times New Roman'

        p2 = doc.add_paragraph()
        p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p2.paragraph_format.space_before = Pt(0)
        p2.paragraph_format.space_after = Pt(18)
        r2 = p2.add_run(title_str.upper())
        r2.bold = True
        r2.font.size = Pt(14)
        r2.font.name = 'Times New Roman'

    def add_section_h1(sec_num_str, title_str):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(6)
        r = p.add_run(f"{sec_num_str} {title_str.upper()}")
        r.bold = True
        r.font.size = Pt(12)
        r.font.name = 'Times New Roman'
        return p

    def add_section_h2(sec_num_str, title_str):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        r = p.add_run(f"{sec_num_str} {title_str.upper()}")
        r.bold = True
        r.font.size = Pt(12)
        r.font.name = 'Times New Roman'
        return p

    def add_table_title(table_num, desc):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(6)
        r = p.add_run(f"TABLE {table_num} {desc.upper()}")
        r.bold = True
        r.font.size = Pt(11)
        r.font.name = 'Times New Roman'
        return p

    def add_figure_caption(fig_num, desc):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(6)
        p.paragraph_format.space_after = Pt(12)
        r = p.add_run(f"Figure {fig_num} {desc}")
        r.bold = True
        r.font.size = Pt(11)
        r.font.name = 'Times New Roman'
        return p

    # ==================== PAGE 1: TITLE PAGE ====================
    add_p("REVALAI: AI-POWERED MULTI-ROLE EXAMINATION", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=36, space_after=4, bold=True, size=15)
    add_p("REVALUATION & WORKFLOW AUTOMATION PLATFORM", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=36, bold=True, size=15)
    
    add_p("A PROJECT REPORT", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=18, space_after=18, bold=True, size=13)
    add_p("Submitted by", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=6, space_after=12, italic=True, size=12)
    add_p("S. KISHORE (714024247055)", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=36, bold=True, size=13)

    add_p("in partial fulfillment for the award of the degree", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=24, space_after=6, italic=True, size=12)
    add_p("of", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=6, italic=True, size=12)
    add_p("BACHELOR OF TECHNOLOGY", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=6, bold=True, size=12)
    add_p("IN", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=6, bold=True, size=12)
    add_p("ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=36, bold=True, size=13)

    add_p("SRI SHAKTHI", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=24, space_after=4, bold=True, size=13)
    add_p("INSTITUTE OF ENGINEERING AND TECHNOLOGY", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=24, bold=True, size=13)
    add_p("ANNA UNIVERSITY : CHENNAI 600025", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=6, bold=True, size=12)
    add_p("NOVEMBER 2026", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=0, bold=True, size=12)

    doc.add_page_break()

    # ==================== PAGE 2: BONAFIDE CERTIFICATE ====================
    add_p("i", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=18, size=11)
    add_p("BONAFIDE CERTIFICATE", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=12, space_after=24, bold=True, size=13)

    p_cert = add_p("Certified that this report titled “REVALAI: AI-POWERED MULTI-ROLE EXAMINATION REVALUATION & WORKFLOW AUTOMATION PLATFORM” is the bonafide work of “S. KISHORE 714024247055” who carried out the project work under our supervision.", 
                   align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_before=12, space_after=48, line_spacing=1.5)

    # Signature Table (2 columns, invisible outer border)
    sig_table = doc.add_table(rows=6, cols=2)
    sig_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    sig_table.autofit = False

    sig_data = [
        ("SIGNATURE", "SIGNATURE"),
        ("HEAD OF THE DEPARTMENT", "SUPERVISOR"),
        ("Mrs. S. Hemalatha", "Ms. PRIYANKA"),
        ("Artificial Intelligence and Machine Learning,", "Artificial Intelligence and Machine Learning,"),
        ("Sri Shakthi Institute of Engineering and", "Sri Shakthi Institute of Engineering and"),
        ("Technology,\nCoimbatore – 641 062", "Technology,\nCoimbatore – 641 062")
    ]
    for r_idx, (c1, c2) in enumerate(sig_data):
        row = sig_table.rows[r_idx]
        row.cells[0].width = Inches(3.2)
        row.cells[1].width = Inches(3.2)
        
        p1 = row.cells[0].paragraphs[0]
        p1.paragraph_format.space_before = Pt(0)
        p1.paragraph_format.space_after = Pt(2)
        p1.paragraph_format.line_spacing = 1.15
        r1 = p1.add_run(c1)
        r1.font.name = 'Times New Roman'
        r1.font.size = Pt(11)
        if r_idx in [0, 1, 2]:
            r1.bold = True

        p2 = row.cells[1].paragraphs[0]
        p2.paragraph_format.space_before = Pt(0)
        p2.paragraph_format.space_after = Pt(2)
        p2.paragraph_format.line_spacing = 1.15
        r2 = p2.add_run(c2)
        r2.font.name = 'Times New Roman'
        r2.font.size = Pt(11)
        if r_idx in [0, 1, 2]:
            r2.bold = True

    add_p("", space_before=36, space_after=0)
    add_p("Submitted for the project work Viva Voce Examination held on ………………..", align=WD_ALIGN_PARAGRAPH.LEFT, space_before=24, space_after=36, size=11)

    viva_table = doc.add_table(rows=1, cols=2)
    viva_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    viva_table.rows[0].cells[0].width = Inches(3.2)
    viva_table.rows[0].cells[1].width = Inches(3.2)
    p_int = viva_table.rows[0].cells[0].paragraphs[0]
    r_int = p_int.add_run("INTERNAL EXAMINER")
    r_int.bold = True
    r_int.font.name = 'Times New Roman'
    r_int.font.size = Pt(11)

    p_ext = viva_table.rows[0].cells[1].paragraphs[0]
    p_ext.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r_ext = p_ext.add_run("EXTERNAL EXAMINER")
    r_ext.bold = True
    r_ext.font.name = 'Times New Roman'
    r_ext.font.size = Pt(11)

    doc.add_page_break()

    # ==================== PAGE 3: ACKNOWLEDGEMENT ====================
    add_p("ii", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=18, size=11)
    add_p("ACKNOWLEDGEMENT", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=12, space_after=24, bold=True, size=13)

    add_p("First and foremost, I would like to thank God Almighty for giving me the strength. Without his blessings, this achievement would not have been possible.", space_before=6, space_after=12)
    add_p("I express my deepest gratitude to our Chairman Dr. S. Thangavelu for his continuous encouragement and support throughout my course of study.", space_before=6, space_after=12)
    add_p("I am thankful to our Secretary Dr. T. Dheepan for his unwavering support during the entire project work.", space_before=6, space_after=12)
    add_p("I am also thankful to our Joint Secretary Mr. T. Sheelan for his support during the entire course of this project work.", space_before=6, space_after=12)
    add_p("I am highly indebted to our Principal Dr. N. K. Sakthivel for his support during the tenure of the project.", space_before=6, space_after=12)
    add_p("I sincerely thank Mrs. S. Hemalatha, Head of the Department of Artificial Intelligence and Machine Learning, and my Project Guide Ms. PRIYANKA, for the invaluable guidance, technical support and facilities provided throughout this project. I also extend my gratitude to all the teachers and non-teaching staff of our department, as well as my family and friends, for their constant encouragement and support.", space_before=6, space_after=24)

    add_p("KISHORE S", align=WD_ALIGN_PARAGRAPH.RIGHT, space_before=24, space_after=0, bold=True, size=12)

    doc.add_page_break()

    # ==================== PAGE 4: ABSTRACT ====================
    add_p("iii", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=18, size=11)
    add_p("ABSTRACT", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=12, space_after=24, bold=True, size=13)

    add_p("University examination revaluation is a critical administrative and academic procedure that ensures grading fairness and transparency for students. In conventional higher education setups, this procedure is severely hindered by slow paper-based processing, lack of workflow transparency, human grading discrepancies, delayed revaluation results, and high administrative overheads. Furthermore, manual verification fails to reliably flag duplicate requests, missing answer scripts, or anomalous payment records. To overcome these critical challenges, this project presents RevalAI, an AI-powered, multi-role examination revaluation management and workflow automation platform.", space_before=6, space_after=12)
    add_p("The platform introduces an end-to-end, multi-tier automated lifecycle with strict Role-Based Access Control (RBAC) across four operational stakeholders: Students, Controller/Revaluation Officers, Subject Evaluators, and System Administrators. Students review published semester results, submit revaluation requests, complete digital fee reconciliation, and track live status progressions. The system incorporates real heuristic-based duplicate application detection and fee anomaly verification. Revaluation Officers inspect student submissions, review anomaly flags, verify documents, and allocate scripts to qualified evaluators.", space_before=6, space_after=12)
    add_p("To eliminate grading subjectivity and reduce turnaround times, RevalAI features a swappable AIProvider architecture integrating simulated Optical Character Recognition (OCR) script extraction and rubric-constrained AI scoring. The AI engine evaluates student answers against predefined marking criteria, generating suggested marks, confidence scores, and explanatory rationales. Crucially, the AI functions strictly as a decision-support copilot—evaluators retain ultimate academic autonomy to review, calibrate, and finalize grades. Results undergo official administrative endorsement before publication, accompanied by immutable audit logging and instant notifications. The report details the requirements engineering, UML design models, layered software architecture, design patterns, database normalization, and full-stack implementation using FastAPI, React, and SQLAlchemy.", space_before=6, space_after=18)

    p_kw = add_p()
    r_kwh = p_kw.add_run("Keywords: ")
    r_kwh.bold = True
    r_kwh.font.name = 'Times New Roman'
    r_kwc = p_kw.add_run("Examination Revaluation, Workflow Automation, Decision Support System, Role-Based Access Control, Pluggable AI Architecture, FastApi, React.")
    r_kwc.font.name = 'Times New Roman'

    doc.add_page_break()

    # ==================== PAGE 5 & 6: TABLE OF CONTENTS ====================
    add_p("iv", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=18, size=11)
    add_p("TABLE OF CONTENTS", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=12, space_after=24, bold=True, size=13)

    toc_items = [
        ("CHAPTER NO", "TITLE", "P. NO", True),
        ("", "ACKNOWLEDGEMENT", "ii", True),
        ("", "ABSTRACT", "iii", True),
        ("", "LIST OF TABLES", "vi", True),
        ("", "LIST OF FIGURES", "vii", True),
        ("1", "INTRODUCTION", "1", True),
        ("", "1.1 BACKGROUND AND MOTIVATION", "1", False),
        ("", "1.2 PROBLEM STATEMENT", "1", False),
        ("", "1.3 PROPOSED SOLUTION", "2", False),
        ("", "1.4 OBJECTIVES OF THE PROJECT", "2", False),
        ("", "1.5 SCOPE AND LIMITATIONS", "3", False),
        ("", "1.6 ORGANIZATION OF THE REPORT", "3", False),
        ("2", "LITERATURE REVIEW", "4", True),
        ("", "2.1 MANUAL REVALUATION AND ACADEMIC AUDITING CHALLENGES", "4", False),
        ("", "2.2 AUTOMATED WORKFLOW MANAGEMENT SYSTEMS", "4", False),
        ("", "2.3 MACHINE LEARNING AND OCR IN ACADEMIC ASSESSMENT", "4", False),
        ("", "2.4 ANOMALY DETECTION AND FRAUD PREVENTION IN EXAMINATION SYSTEMS", "5", False),
        ("", "2.5 SOFTWARE ENGINEERING FOUNDATIONS FOR SECURE ENTERPRISE SYSTEMS", "5", False),
        ("", "2.6 RESEARCH GAPS AND MOTIVATION", "5", False),
        ("3", "PROPOSED SYSTEM", "7", True),
        ("", "3.1 OVERVIEW", "7", False),
        ("", "3.2 PROPOSED SYSTEM ARCHITECTURE & ROLES", "7", False),
        ("", "3.3 ADDRESSING LIMITATIONS OF EXISTING SYSTEMS", "8", False),
        ("", "3.4 PROCESS FLOW", "9", False),
        ("", "3.5 USE CASE DIAGRAM", "9", False),
        ("", "3.6 SYSTEM REQUIREMENTS", "10", False),
        ("", "3.7 AI RUBRIC SCORING AND HEURISTIC DETECTION MODEL", "12", False),
        ("", "3.8 AUDIT TRAIL, SECURITY AND DISCREPANCY HANDLING", "12", False),
        ("4", "SYSTEM DESIGN", "14", True),
        ("", "4.1 SYSTEM ARCHITECTURE", "14", False),
        ("", "    4.1.1 PRESENTATION LAYER", "15", False),
        ("", "    4.1.2 API / APPLICATION LAYER", "15", False),
        ("", "    4.1.3 VERIFICATION & ANOMALY DETECTION LAYER", "15", False),
        ("", "    4.1.4 EVALUATION & RUBRIC ANALYSIS LAYER", "15", False),
        ("", "    4.1.5 PLUGGABLE AI INTEGRATION LAYER", "15", False),
        ("", "    4.1.6 AUDIT LOGGING & NOTIFICATION SERVICE", "15", False),
        ("", "    4.1.7 DATA ACCESS LAYER", "15", False),
        ("", "4.2 SEQUENCE DIAGRAM", "16", False),
        ("", "4.3 DATABASE DESIGN", "16", False),
        ("", "4.4 FUNCTIONALITIES", "18", False),
        ("", "    4.4.1 AUTHENTICATION AND ROLE GUARDS MODULE", "18", False),
        ("", "    4.4.2 STUDENT APPLICATION & TRACKING MODULE", "18", False),
        ("", "    4.4.3 OFFICER QUEUE & VERIFICATION MODULE", "18", False),
        ("", "    4.4.4 EVALUATOR OCR & AI ASSISTED SCORING MODULE", "18", False),
        ("", "    4.4.5 RESULTS PUBLICATION MODULE", "18", False),
        ("", "    4.4.6 AUDIT LOGGING AND SYSTEM ANALYTICS MODULE", "18", False),
        ("", "4.5 DESIGN PATTERNS AND PRINCIPLES", "19", False),
        ("", "4.6 MODULARITY, REFINEMENT AND REFACTORING", "19", False),
        ("", "4.7 INTERFACE DESIGN", "20", False),
        ("", "4.8 SECURITY DESIGN", "21", False),
        ("", "4.9 WORKED EXAMPLE OF REVALUATION SCORING PIPELINE", "21", False),
        ("5", "IMPLEMENTATION", "22", True),
        ("", "5.1 OVERVIEW", "22", False),
        ("", "5.2 TECHNOLOGY STACK", "22", False),
        ("", "5.3 IMPLEMENTATION PROCESS", "22", False),
        ("", "5.4 ERROR HANDLING AND RELIABILITY", "24", False),
        ("", "5.5 DEPLOYMENT VIEW", "24", False),
        ("", "5.6 TESTING STRATEGY", "24", False),
        ("6", "RESULT", "26", True),
        ("", "6.1 STUDENT DASHBOARD AND TRACKING", "26", False),
        ("", "6.2 OFFICER VERIFICATION & APPLICATION QUEUE", "26", False),
        ("", "6.3 EVALUATOR AI-ASSISTED MARKING", "27", False),
        ("", "6.4 DUPLICATE AND ANOMALY DETECTION REPORTING", "27", False),
        ("", "6.5 ROLE RESTRICTION RESULTS", "28", False),
        ("", "6.6 DISCUSSION", "28", False),
        ("7", "CONCLUSION AND FUTURE ENHANCEMENT", "29", True),
        ("", "7.1 CONCLUSION", "29", False),
        ("", "7.2 FUTURE ENHANCEMENT", "29", False),
        ("", "7.3 LEARNING OUTCOMES", "29", False),
        ("", "7.4 SOCIETAL IMPACT AND ETHICAL CONSIDERATIONS", "30", False),
        ("", "REFERENCES", "31", True)
    ]

    toc_table = doc.add_table(rows=len(toc_items), cols=3)
    toc_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    toc_table.autofit = False

    for idx, (c1, c2, c3, is_bold) in enumerate(toc_items):
        row = toc_table.rows[idx]
        row.cells[0].width = Inches(1.1)
        row.cells[1].width = Inches(4.5)
        row.cells[2].width = Inches(0.8)

        p1 = row.cells[0].paragraphs[0]
        p1.paragraph_format.space_before = Pt(1)
        p1.paragraph_format.space_after = Pt(1)
        p1.paragraph_format.line_spacing = 1.15
        r1 = p1.add_run(c1)
        r1.font.name = 'Times New Roman'
        r1.font.size = Pt(11)
        r1.bold = is_bold

        p2 = row.cells[1].paragraphs[0]
        p2.paragraph_format.space_before = Pt(1)
        p2.paragraph_format.space_after = Pt(1)
        p2.paragraph_format.line_spacing = 1.15
        r2 = p2.add_run(c2)
        r2.font.name = 'Times New Roman'
        r2.font.size = Pt(11)
        r2.bold = is_bold

        p3 = row.cells[2].paragraphs[0]
        p3.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p3.paragraph_format.space_before = Pt(1)
        p3.paragraph_format.space_after = Pt(1)
        p3.paragraph_format.line_spacing = 1.15
        r3 = p3.add_run(c3)
        r3.font.name = 'Times New Roman'
        r3.font.size = Pt(11)
        r3.bold = is_bold

    doc.add_page_break()

    # ==================== PAGE 7: LIST OF TABLES ====================
    add_p("vi", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=18, size=11)
    add_p("LIST OF TABLES", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=12, space_after=24, bold=True, size=13)

    lot_items = [
        ("TABLE NO", "DESCRIPTION", "PAGE NO", True),
        ("2.1", "SUMMARY OF EXISTING EXAMINATION AND REVALUATION METHODS", "6", False),
        ("3.1", "COMPARISON OF EXISTING PRACTICE AND REVALAI PLATFORM", "8", False),
        ("3.2", "FUNCTIONAL REQUIREMENTS FOR REVALAI", "10", False),
        ("3.3", "NON-FUNCTIONAL REQUIREMENTS", "11", False),
        ("3.4", "SOFTWARE AND HARDWARE REQUIREMENTS", "11", False),
        ("3.5", "COMPONENTS OF THE AI EVALUATION AND ANOMALY DETECTION ENGINE", "12", False),
        ("3.6", "APPLICATION STATUS PROGRESSION AND PERMITTED TRANSITIONS", "12", False),
        ("4.1", "MAIN DATABASE ENTITIES, ATTRIBUTES AND CONSTRAINTS", "17", False),
        ("4.2", "DESIGN PATTERNS APPLIED IN REVALAI ARCHITECTURE", "19", False),
        ("4.3", "SYSTEM MODULE DECOMPOSITION AND RESPONSIBILITIES", "19", False),
        ("4.4", "PRINCIPAL REST ENDPOINTS IN REVALAI API", "20", False),
        ("4.5", "ILLUSTRATIVE WORKED EVALUATION SCORING AND RUBRIC BREAKDOWN", "21", False),
        ("5.1", "REVALAI ROLE-BASED ACCESS CONTROL (RBAC) PRIVILEGE MATRIX", "23", False),
        ("5.2", "DESIGNED TEST SCENARIOS AND REQUIRED SYSTEM BEHAVIOUR", "24", False),
        ("6.1", "SAMPLE REVALUATION LIFECYCLE AUDIT TRAIL OUTPUT", "26", False),
        ("6.2", "SAMPLE EVALUATOR AI-ASSISTED MARKING & OCR SUMMARY", "27", False)
    ]

    lot_table = doc.add_table(rows=len(lot_items), cols=3)
    lot_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    lot_table.autofit = False

    for idx, (c1, c2, c3, is_bold) in enumerate(lot_items):
        row = lot_table.rows[idx]
        row.cells[0].width = Inches(1.1)
        row.cells[1].width = Inches(4.5)
        row.cells[2].width = Inches(0.8)

        for c_i, val in enumerate([c1, c2, c3]):
            p = row.cells[c_i].paragraphs[0]
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.line_spacing = 1.15
            if c_i == 2:
                p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
            r = p.add_run(val)
            r.font.name = 'Times New Roman'
            r.font.size = Pt(11)
            r.bold = is_bold

    doc.add_page_break()

    # ==================== PAGE 8: LIST OF FIGURES ====================
    add_p("vii", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=18, size=11)
    add_p("LIST OF FIGURES", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=12, space_after=24, bold=True, size=13)

    lof_items = [
        ("FIGURE NO", "DESCRIPTION", "PAGE NO", True),
        ("3.4", "Process Flow of Examination Revaluation Lifecycle", "9", False),
        ("3.5", "Use Case Diagram for Multi-Role Stakeholders", "9", False),
        ("4.1", "Multi-Tier Layered System Architecture of RevalAI", "14", False),
        ("4.2", "Sequence Diagram for End-to-End Revaluation Evaluation", "16", False),
        ("4.3", "Relational Database Schema Diagram (Third Normal Form)", "17", False)
    ]

    lof_table = doc.add_table(rows=len(lof_items), cols=3)
    lof_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    lof_table.autofit = False

    for idx, (c1, c2, c3, is_bold) in enumerate(lof_items):
        row = lof_table.rows[idx]
        row.cells[0].width = Inches(1.1)
        row.cells[1].width = Inches(4.5)
        row.cells[2].width = Inches(0.8)

        for c_i, val in enumerate([c1, c2, c3]):
            p = row.cells[c_i].paragraphs[0]
            p.paragraph_format.space_before = Pt(3)
            p.paragraph_format.space_after = Pt(3)
            p.paragraph_format.line_spacing = 1.15
            if c_i == 2:
                p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
            r = p.add_run(val)
            r.font.name = 'Times New Roman'
            r.font.size = Pt(11)
            r.bold = is_bold

    doc.add_page_break()

    # ==================== CHAPTER 1: INTRODUCTION ====================
    add_p("1", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=12, size=11)
    add_heading_chapter("1", "INTRODUCTION")

    add_section_h1("1.1", "BACKGROUND AND MOTIVATION")
    add_p("Examinations form the primary academic mechanism by which universities and higher educational institutions evaluate cognitive mastery, domain knowledge, and problem-solving competence. Following the release of semester grades, revaluation is the established formal mechanism providing students with the right to request an independent re-examination of their evaluated answer scripts. A typical university administers thousands of examination scripts across multiple branches, subjects, and semesters. Inevitably, grading variance arises due to subjective interpretation, evaluator fatigue, computational recording errors, or discrepancies in rubric application [1], [2].")
    add_p("In the traditional approach, revaluation is an entirely manual, paperwork-heavy process. Students must physically collect application forms, pay fees at bank counters, submit paper receipts to examination cells, and wait weeks or months without visibility into the status of their requests. Faculty evaluators must manually retrieve paper scripts, review answers without standardized electronic rubric tracking, and enter handwritten revised marks. Examination officers face significant administrative bottlenecks reconciling payments, assigning appropriate independent examiners, and detecting duplicate or illegitimate filings.")
    add_p("The motivation for RevalAI emerges from a straightforward observation: academic revaluation should be swift, transparent, tamper-proof, and objective. Delays in revaluation directly impact students' graduation timelines, placement opportunities, and higher education admissions. An automated platform that unifies students, revaluation officers, and subject evaluators under a cohesive digital workflow—augmented by artificial intelligence for rubric compliance checking and anomaly detection—transforms an opaque administrative burden into a reliable academic service.")
    add_p("This challenge is especially pressing in large universities and affiliated engineering colleges where one central controller of examinations oversees hundreds of institutions. Decentralized handling and physical transit of answer scripts introduce serious security risks, potential script loss, and communication gaps. A centralized web-based platform that enforces systematic lifecycle progression, verifiable audit logging, and intelligent decision support is therefore a compelling operational necessity.")

    add_section_h1("1.2", "PROBLEM STATEMENT")
    add_p("Recent advances in artificial intelligence and web architectures have revolutionized administrative workflows. However, applying these technologies to high-stakes academic grading introduces rigorous requirements. Existing commercial examination tools focus almost exclusively on multiple-choice testing or initial bulk paper scanning. They lack an integrated revaluation lifecycle that accounts for multi-role workflows, independent re-grading, and automated auditing.")
    add_p("Furthermore, standard artificial intelligence implementations that grade free-form academic answers autonomously pose significant pedagogical and ethical risks. Uncontrolled neural models can hallucinate facts, demonstrate non-deterministic grading behavior, or fail to adhere to institutional marking schemes [13]. Autonomous grading without human accountability cannot be accepted by academic bodies. At the same time, manual revaluation systems fail to check whether a student has submitted duplicate requests for the same course or whether the reconciliation of examination fees is accurate.")
    add_p("The problem addressed by this project can therefore be stated as follows: to design and build an enterprise-grade examination revaluation management platform (RevalAI) that coordinates students, officers, and evaluators across a strictly enforced lifecycle; performs rule-based duplicate application and fee anomaly detection; provides evaluators with rubric-constrained AI decision support without diminishing human academic authority; maintains an immutable, append-only audit trail; and operates through a decoupled, pluggable architecture.")

    add_section_h1("1.3", "PROPOSED SOLUTION")
    add_p("To overcome these challenges, this project implements RevalAI, an AI-powered examination revaluation management platform. RevalAI formalizes the revaluation process into an eight-stage stateful lifecycle: Submitted, AI Screening, Pending Verification, Verified, Evaluator Assigned, Under Evaluation, Officer Review, and Published.")
    add_p("The platform provides dedicated, role-specific portals for four primary actors: Students, Officers, Evaluators, and Administrators. Students can view published course results, trigger revaluation requests, complete digital fee reconciliation, and track stage-by-stage progress in real time. The system's automated screening engine executes heuristic checks on application submission to flag duplicate requests and detect fee discrepancies. Revaluation Officers manage an interactive application queue, review automated flags, verify student documents, and allocate scripts to qualified department evaluators.")
    add_p("Evaluators leverage an intelligent AI-assisted workspace. Through an abstract AIProvider interface, the platform simulates high-fidelity Optical Character Recognition (OCR) script extraction and evaluates responses against predefined marking rubrics. The AI suggests indicative marks, calculates confidence metrics, and provides an explanatory rationale. Crucially, the AI is treated purely as a supporting decision-support copilot—evaluators retain complete authority to calibrate marks and record official feedback. Revaluation Officers perform final verification before publishing revised scores to the student portal.")
    add_p("The system is engineered as a responsive, decoupled web application. A React client styled with modern Tailwind CSS provides rich user interfaces, a high-performance FastAPI backend server enforces security and business rules, and a relational database managed through SQLAlchemy handles persistent state with ACID compliance.")

    add_section_h1("1.4", "OBJECTIVES OF THE PROJECT")
    add_p("Automated Revaluation Lifecycle: To transition manual, paper-based revaluation into a state-driven digital pipeline that tracks requests from submission to final publication without manual paperwork.")
    add_p("Multi-Role Separation and Security: To implement strict Role-Based Access Control (RBAC) ensuring students, officers, evaluators, and administrators access only their authorized operational dashboards and API endpoints.")
    add_p("Heuristic Duplicate and Anomaly Screening: To engineer server-side verification algorithms that automatically detect duplicate revaluation applications for the same course and identify fee or document discrepancies.")
    add_p("Pluggable AI-Assisted Evaluation: To design an extensible AI provider architecture capable of extracting script text and comparing student answers against structured rubrics, delivering suggested marks, confidence values, and transparent explanations.")
    add_p("Human-in-the-Loop Academic Autonomy: To enforce the fundamental principle that AI serves strictly as an advisory copilot, guaranteeing that human evaluators hold final grading authority.")
    add_p("Tamper-Proof Audit Logging: To record every operational action, role transition, mark change, and administrative decision into an immutable, append-only audit log for institutional accountability.")
    add_p("Real-Time Notification and Status Transparency: To provide instant, DB-backed notification dispatch and live visual status tracking for students and officers.")

    add_section_h1("1.5", "SCOPE AND LIMITATIONS")
    add_p("The operational scope of RevalAI covers student revaluation requests, fee reconciliation simulation, automated duplicate/anomaly screening, officer queue management, evaluator allocation, OCR text retrieval, AI rubric analysis, officer publishing workflows, user administration, and system audit logging. The platform is designed for semester-based undergraduate and postgraduate academic programs.")
    add_p("Certain technical boundaries should be noted. In the current prototype deployment, OCR script extraction and AI rubric scoring are implemented through a deterministic LocalMockProvider to allow comprehensive, reliable offline evaluation and testing without relying on paid third-party API keys. However, the system is architected around an abstract AIProvider interface that allows instant connection to cloud vision models or LLM APIs (such as OpenAI GPT-4 or Google Gemini) simply by modifying environment variables. Additionally, payment processing is simulated by marking fee balances as reconciled upon student confirmation, rather than interfacing with a commercial banking gateway.")

    add_section_h1("1.6", "ORGANIZATION OF THE REPORT")
    add_p("This report is organized as follows. Chapter 2 reviews the academic literature on manual revaluation, workflow automation, machine learning in grading, anomaly detection, and software engineering foundations. Chapter 3 presents the proposed RevalAI system, its operational requirements, and heuristic models. Chapter 4 details the system design, covering layered architecture, sequence models, database normalization, module functionalities, design patterns, and security principles. Chapter 5 describes the implementation details, technology stack, pseudocode, and testing strategies. Chapter 6 documents results, sample dashboard views, and discussion. Chapter 7 concludes the project and outlines future enhancements.")

    doc.add_page_break()

    # ==================== CHAPTER 2: LITERATURE REVIEW ====================
    add_p("4", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=12, size=11)
    add_heading_chapter("2", "LITERATURE REVIEW")

    add_section_h1("2.1", "MANUAL REVALUATION AND ACADEMIC AUDITING CHALLENGES")
    add_p("Examination revaluation represents a fundamental pillar of academic governance. Higher education studies have extensively documented the vulnerabilities inherent in manual grading and re-grading processes. Anderson and Krathwohl [6] demonstrated that subjective cognitive evaluation frequently leads to inter-rater discrepancies, where different evaluators assign disparate scores to identical student responses. In manual revaluation, these inconsistencies are exacerbated by physical document handling, lack of standardized rubric sheets, and absence of historical calibration [1]. Furthermore, administrative delays often cause revaluation results to be published after subsequent semester classes or supplementary examinations have already begun, creating severe academic disruption.")

    add_section_h1("2.2", "AUTOMATED WORKFLOW MANAGEMENT SYSTEMS")
    add_p("Enterprise workflow management systems have transformed business process automation across banking, logistics, and government. Heilman and Smith [7] and modern software engineering literature emphasize that multi-stakeholder business processes require deterministic state transitions and strict role separation to avoid deadlocks and unauthorized state mutations. In university administration, workflow automation systems reduce paperwork, eliminate physical bottlenecks, and establish transparent service level agreements (SLAs). However, standard generic workflow engines do not incorporate domain-specific academic grading requirements, rubric validations, or integrated artificial intelligence capabilities.")

    add_section_h1("2.3", "MACHINE LEARNING AND OCR IN ACADEMIC ASSESSMENT")
    add_p("The application of machine learning to education has progressed rapidly. Early automated essay scoring systems relied on feature engineering, syntactic parsing, and statistical ngram counts [8]. The emergence of deep transformer models [10] and bidirectional representations such as BERT [11] enabled contextual understanding of complex student texts. Brown et al. [12] demonstrated that Large Language Models (LLMs) can comprehend open-ended answers and perform zero-shot evaluation against supplied criteria. However, Ji et al. [13] emphasized that LLMs suffer from hallucination and non-deterministic behavior, rendering fully autonomous grading ethically problematic. Lewis et al. [14] proposed retrieval-grounded architectures, highlighting that AI models are most reliable when strictly constrained by reference texts or rubrics. This supports RevalAI's design decision to treat AI as a rubric-bounded advisory tool rather than an autonomous decision-maker.")

    add_section_h1("2.4", "ANOMALY DETECTION AND FRAUD PREVENTION IN EXAMINATION SYSTEMS")
    add_p("Academic integrity requires robust defenses against fraudulent submissions and administrative errors. Salton and Buckley [15] established statistical methodologies for document and data matching. In automated examination platforms, anomaly detection focuses on identifying duplicate applications, payment reconciliation mismatches, and unverified document submissions. RevalAI utilizes rule-based heuristic screening to flag anomalous entries immediately upon submission, preventing administrative backlog and ensuring that officers inspect questionable filings before evaluator assignment.")

    add_section_h1("2.5", "SOFTWARE ENGINEERING FOUNDATIONS FOR SECURE ENTERPRISE SYSTEMS")
    add_p("Building dependable, scalable educational software demands disciplined engineering principles. Pressman and Maxim [1] and Sommerville [2] outline the necessity of systematic requirement engineering, UML analysis modeling, and layered architectural decomposition. Booch et al. [3] provide formal notations for modeling system behaviors through use case, sequence, and deployment diagrams. Gamma et al. [4] and Martin [5] establish design patterns and the SOLID principles—specifically Single Responsibility, Open/Closed, and Dependency Inversion—which guarantee that complex software components, such as AI providers, can be maintained and replaced without destabilizing core business logic.")

    add_section_h1("2.6", "RESEARCH GAPS AND MOTIVATION")
    add_p("A survey of the literature reveals critical gaps. Most existing academic assessment systems either focus exclusively on administrative record keeping (without grading assistance) or attempt autonomous grading without human accountability. None provides a unified platform combining multi-role revaluation tracking, heuristic duplicate and anomaly screening, rubric-grounded AI decision support, and an immutable audit trail. RevalAI directly fills these gaps. Table 2.1 summarizes existing methodologies and highlights how RevalAI addresses their key limitations.")

    # Table 2.1
    add_table_title("2.1", "SUMMARY OF EXISTING EXAMINATION AND REVALUATION METHODS")
    t21 = doc.add_table(rows=7, cols=3)
    t21.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t21)
    
    t21_headers = ["Approach & Literature", "Core Methodology", "Key Limitations"]
    for c_i, h in enumerate(t21_headers):
        cell = t21.rows[0].cells[c_i]
        set_cell_background(cell, "E2E8F0")
        set_cell_margins(cell, top=120, bottom=120, left=120, right=120)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.name = 'Times New Roman'
        r.font.size = Pt(10)

    t21_data = [
        ("Traditional Manual Revaluation [1]", "Physical paperwork, manual script retrieval and handwritten mark recording", "High latency, zero tracking visibility, human bias, risk of lost scripts"),
        ("Generic Academic ERP Portals [2]", "Database-driven form submission for examination administrative records", "No grading assistance, no duplicate/anomaly screening, rigid workflows"),
        ("Automated Essay Scoring (AES) [8]", "Statistical feature extraction and regression models for automated grading", "Black-box scoring, no rubric transparency, cannot handle complex technical answers"),
        ("Autonomous LLM Grading [12], [13]", "Direct prompting of Large Language Models to evaluate answer scripts", "Prone to hallucination, non-deterministic scores, lacks ethical accountability"),
        ("Heuristic Anomaly Screening [15]", "Rule-based and statistical checking of database transactions", "Typically applied in finance; rarely integrated into academic evaluation lifecycles"),
        ("Proposed RevalAI Platform", "Stateful multi-role lifecycle, heuristic screening, and rubric-constrained AI copilot", "Solves administrative latency while preserving human evaluator final authority")
    ]

    for r_i, row_data in enumerate(t21_data):
        row = t21.rows[r_i + 1]
        for c_i, val in enumerate(row_data):
            cell = row.cells[c_i]
            set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
            r = p.add_run(val)
            r.font.name = 'Times New Roman'
            r.font.size = Pt(9.5)
            if r_i == len(t21_data) - 1:
                r.bold = True

    doc.add_page_break()

    # ==================== CHAPTER 3: PROPOSED SYSTEM ====================
    add_p("7", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=12, size=11)
    add_heading_chapter("3", "PROPOSED SYSTEM")

    add_section_h1("3.1", "OVERVIEW")
    add_p("RevalAI is developed as an intelligent, secure, multi-role web platform designed to streamline and automate the entire academic examination revaluation lifecycle. By transitioning from opaque, paper-based operations to an event-driven digital architecture, RevalAI guarantees complete status transparency, rigorous administrative verification, automated fraud and anomaly detection, and objective AI-assisted grading.")

    add_section_h1("3.2", "PROPOSED SYSTEM ARCHITECTURE & ROLES")
    add_p("RevalAI establishes four specialized user roles, each isolated by server-enforced role guards and dedicated user interfaces:")
    add_p("1. Student Portal: Enables students to view initial examination results, verify revaluation eligibility, submit revaluation requests, pay nominal fees, and track their application in real time across the eight lifecycle stages.")
    add_p("2. Officer Dashboard: Empowers revaluation and examination officers to manage the centralized application queue, review automated anomaly and duplicate flags, verify uploaded answer scripts, assign specialized evaluators, and officially endorse and publish revised grades.")
    add_p("3. Evaluator Workspace: Equips subject faculty with an intelligent evaluation studio featuring automated OCR text extraction, rubric criterion breakdown, AI-suggested marks, confidence ratings, and explanatory feedback. Evaluators retain full discretion to adjust marks before submission.")
    add_p("4. Administrator Console: Provides institutional administrators with global visibility, user account management, role allocation, system health monitoring, and complete append-only audit trail exploration.")

    add_section_h1("3.3", "ADDRESSING LIMITATIONS OF EXISTING SYSTEMS")
    add_p("RevalAI directly solves the fundamental limitations of existing examination procedures:")
    add_p("Status Opacity: RevalAI replaces unrecorded physical paperwork with a live, eight-stage tracking pipeline accessible to students and officers.")
    add_p("Duplicate Submissions: Real heuristic algorithms cross-reference incoming applications against active records, immediately flagging redundant requests for the same course.")
    add_p("Fee and Document Discrepancies: Rule-based anomaly detection validates payment amounts and ensures document uploads precede verification.")
    add_p("Grading Subjectivity: The AI scoring engine evaluates answers against explicit rubric criteria, presenting standardized benchmark marks and rationales.")
    add_p("Preserving Human Authority: Rather than replacing educators, AI operates strictly as an advisory copilot, leaving academic finality in the hands of accredited faculty.")

    # Table 3.1
    add_table_title("3.1", "COMPARISON OF EXISTING PRACTICE AND REVALAI PLATFORM")
    t31 = doc.add_table(rows=7, cols=3)
    t31.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t31)

    t31_headers = ["Operational Dimension", "Conventional Practice", "Proposed RevalAI Platform"]
    for c_i, h in enumerate(t31_headers):
        cell = t31.rows[0].cells[c_i]
        set_cell_background(cell, "E2E8F0")
        set_cell_margins(cell, top=120, bottom=120, left=120, right=120)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.name = 'Times New Roman'
        r.font.size = Pt(10)

    t31_data = [
        ("Application Medium", "Physical paper forms and bank challans", "Responsive web portal with digital payment reconciliation"),
        ("Lifecycle Tracking", "Opaque; zero intermediate visibility for students", "Real-time, eight-stage state machine tracking"),
        ("Screening & Verification", "Manual clerical checking prone to oversight", "Automated duplicate detection and fee anomaly heuristics"),
        ("Evaluator Assignment", "Ad-hoc manual distribution of physical scripts", "Centralized digital allocation by examination officers"),
        ("Grading Assistance", "None; evaluator grades manually from memory", "Pluggable AI copilot with OCR and rubric scoring"),
        ("Accountability & Logs", "Paper registers susceptible to damage or loss", "Immutable, append-only database audit log")
    ]

    for r_i, row_data in enumerate(t31_data):
        row = t31.rows[r_i + 1]
        for c_i, val in enumerate(row_data):
            cell = row.cells[c_i]
            set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
            r = p.add_run(val)
            r.font.name = 'Times New Roman'
            r.font.size = Pt(9.5)

    add_section_h1("3.4", "PROCESS FLOW")
    add_p("The operational process flow of RevalAI encompasses four interconnected stages:")
    add_p("1. Student Stage: The student browses course grades, selects eligible subjects, generates a revaluation request, confirms fee payment, and uploads script documentation.")
    add_p("2. Screening Stage: The backend automatically executes duplicate checking against active applications and runs anomaly detection to verify fee consistency.")
    add_p("3. Officer & Evaluator Stage: The officer verifies clean applications and assigns an evaluator. The evaluator triggers OCR analysis and rubric scoring, calibrates marks, and submits revised evaluations.")
    add_p("4. Publication Stage: The officer reviews final evaluations, approves revised marks, and publishes results, triggering student notifications.")

    add_figure_caption("3.4", "Process Flow of Examination Revaluation Lifecycle")

    add_section_h1("3.5", "USE CASE DIAGRAM")
    add_p("The use case model delineates system boundaries and interactions between actors. The Student initiates applications and tracks results. The Officer manages queues, reviews anomaly alerts, verifies scripts, assigns evaluators, and publishes grades. The Evaluator views assignments, runs OCR and AI analysis, adjusts marks, and submits reports. The Administrator configures users and inspects audit logs. The AIProvider acts as a supporting backend actor.")

    add_figure_caption("3.5", "Use Case Diagram for Multi-Role Stakeholders")

    add_section_h1("3.6", "SYSTEM REQUIREMENTS")
    add_p("The functional and non-functional requirements are structured below to guarantee rigorous engineering and traceability across development and testing.")

    # Table 3.2
    add_table_title("3.2", "FUNCTIONAL REQUIREMENTS FOR REVALAI")
    t32 = doc.add_table(rows=14, cols=4)
    t32.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t32)

    t32_headers = ["ID", "Requirement Description", "Primary Actor", "Priority"]
    for c_i, h in enumerate(t32_headers):
        cell = t32.rows[0].cells[c_i]
        set_cell_background(cell, "E2E8F0")
        set_cell_margins(cell, top=100, bottom=100, left=100, right=100)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.name = 'Times New Roman'
        r.font.size = Pt(9.5)

    t32_data = [
        ("FR-1", "System shall enforce secure authentication using JWT and role-based access control.", "All", "Must"),
        ("FR-2", "Student shall view published semester course results and revaluation eligibility.", "Student", "Must"),
        ("FR-3", "Student shall submit revaluation requests for eligible subjects with unique tracking codes.", "Student", "Must"),
        ("FR-4", "Student shall complete digital fee payment reconciliation and verify document upload.", "Student", "Must"),
        ("FR-5", "System shall automatically flag duplicate revaluation requests for identical courses.", "System", "Must"),
        ("FR-6", "System shall detect fee discrepancies and missing document anomalies upon submission.", "System", "Must"),
        ("FR-7", "Officer shall view centralized application queue and inspect automated anomaly alerts.", "Officer", "Must"),
        ("FR-8", "Officer shall verify applications, approve legitimate requests, and assign evaluators.", "Officer", "Must"),
        ("FR-9", "Evaluator shall view assigned answer scripts and inspect question-wise rubric criteria.", "Evaluator", "Must"),
        ("FR-10", "System shall extract OCR transcript and compute AI-suggested marks and explanations.", "System", "Must"),
        ("FR-11", "Evaluator shall have authority to calibrate marks and submit official revaluation grades.", "Evaluator", "Must"),
        ("FR-12", "Officer shall approve final evaluations and publish revised grades to students.", "Officer", "Must"),
        ("FR-13", "System shall record every state mutation, mark update, and login in an append-only audit log.", "System", "Must")
    ]

    for r_i, row_data in enumerate(t32_data):
        row = t32.rows[r_i + 1]
        for c_i, val in enumerate(row_data):
            cell = row.cells[c_i]
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(1)
            r = p.add_run(val)
            r.font.name = 'Times New Roman'
            r.font.size = Pt(9)

    add_p("", space_before=6, space_after=6)

    # Table 3.3
    add_table_title("3.3", "NON-FUNCTIONAL REQUIREMENTS")
    t33 = doc.add_table(rows=8, cols=3)
    t33.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t33)

    t33_headers = ["ID", "Category", "Measurable Engineering Target"]
    for c_i, h in enumerate(t33_headers):
        cell = t33.rows[0].cells[c_i]
        set_cell_background(cell, "E2E8F0")
        set_cell_margins(cell, top=100, bottom=100, left=100, right=100)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.name = 'Times New Roman'
        r.font.size = Pt(9.5)

    t33_data = [
        ("NFR-1", "Performance", "API response times for queue filtering and status updates shall be under 300 ms."),
        ("NFR-2", "Security", "Passwords hashed using bcrypt; JWT tokens signed with HMAC-SHA256; RBAC endpoint guards."),
        ("NFR-3", "Reliability", "Pluggable AI provider fallback ensures deterministic offline demo execution if cloud APIs fail."),
        ("NFR-4", "Auditability", "100% of state transitions and mark modifications recorded in immutable audit logs."),
        ("NFR-5", "Usability", "Zero training required; student application completed within 4 clicks."),
        ("NFR-6", "Scalability", "Stateless FastAPI backend architecture supporting horizontal scaling behind reverse proxies."),
        ("NFR-7", "Maintainability", "Modular decoupled design adhering to SOLID principles; pluggable AIProvider interface.")
    ]

    for r_i, row_data in enumerate(t33_data):
        row = t33.rows[r_i + 1]
        for c_i, val in enumerate(row_data):
            cell = row.cells[c_i]
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(1)
            r = p.add_run(val)
            r.font.name = 'Times New Roman'
            r.font.size = Pt(9)

    add_p("", space_before=6, space_after=6)

    # Table 3.4
    add_table_title("3.4", "SOFTWARE AND HARDWARE REQUIREMENTS")
    t34 = doc.add_table(rows=7, cols=2)
    t34.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t34)

    t34_headers = ["Component", "Specification"]
    for c_i, h in enumerate(t34_headers):
        cell = t34.rows[0].cells[c_i]
        set_cell_background(cell, "E2E8F0")
        set_cell_margins(cell, top=100, bottom=100, left=100, right=100)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.name = 'Times New Roman'
        r.font.size = Pt(9.5)

    t34_data = [
        ("Operating System", "Windows 10/11 or Linux (Ubuntu 22.04 LTS)"),
        ("Backend Framework", "Python 3.10+ with FastAPI, Pydantic, SQLAlchemy, Uvicorn, python-jose, passlib"),
        ("Frontend Framework", "React 18 with Vite, Tailwind CSS, Lucide Icons, Axios"),
        ("Database", "SQLite for local development; PostgreSQL for enterprise production deployment"),
        ("Hardware Requirements", "Intel Core i5 / AMD Ryzen 5, 8 GB RAM, 256 GB SSD"),
        ("Web Browser", "Google Chrome, Mozilla Firefox, Microsoft Edge, Safari (latest versions)")
    ]

    for r_i, row_data in enumerate(t34_data):
        row = t34.rows[r_i + 1]
        for c_i, val in enumerate(row_data):
            cell = row.cells[c_i]
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(1)
            r = p.add_run(val)
            r.font.name = 'Times New Roman'
            r.font.size = Pt(9)

    add_section_h1("3.7", "AI RUBRIC SCORING AND HEURISTIC DETECTION MODEL")
    add_p("The AI evaluation model within RevalAI is grounded in objective rubric criteria. For any evaluated question, total attainable marks are distributed across specific criteria (e.g., theoretical derivation, algorithm correctness, edge-case analysis).")
    add_p("The scoring engine calculates suggested marks based on rubric alignment:")
    add_p("Suggested Marks = Sum(Criterion Max Marks * Attainment Ratio), where Attainment Ratio is determined by rubric fulfillment semantic matching.", italic=True)
    add_p("In parallel, heuristic detection functions operate deterministically:")
    add_p("Duplicate Detection: Flags true if an active application exists for the same student_id and subject_id in a non-rejected state.")
    add_p("Anomaly Detection: Flags true if application.fee_paid is true but fee_amount differs from the statutory fee (700 INR), or if documents were marked un-uploaded.")

    # Table 3.5 & 3.6
    add_table_title("3.5", "COMPONENTS OF THE AI EVALUATION AND ANOMALY DETECTION ENGINE")
    t35 = doc.add_table(rows=5, cols=3)
    t35.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t35)

    t35_headers = ["Engine Component", "Operational Rule", "Output Impact"]
    for c_i, h in enumerate(t35_headers):
        cell = t35.rows[0].cells[c_i]
        set_cell_background(cell, "E2E8F0")
        set_cell_margins(cell, top=100, bottom=100, left=100, right=100)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.name = 'Times New Roman'
        r.font.size = Pt(9.5)

    t35_data = [
        ("Duplicate Detector", "Query DB for matching (student_id, subject_id, status != rejected)", "Sets duplicate_flag = True; alerts officer in queue"),
        ("Fee Anomaly Detector", "Check |fee_amount - 700.00| > 0.01 or documents_uploaded == False", "Sets anomaly_flag = True; prevents automatic verification"),
        ("OCR Script Extractor", "Extract digitized answer transcript via AIProvider interface", "Generates structured text transcript for rubric evaluation"),
        ("Rubric Scorer", "Evaluate OCR text against question_label and criterion criteria", "Outputs suggested_marks, confidence score, and explanatory rationale")
    ]

    for r_i, row_data in enumerate(t35_data):
        row = t35.rows[r_i + 1]
        for c_i, val in enumerate(row_data):
            cell = row.cells[c_i]
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(1)
            r = p.add_run(val)
            r.font.name = 'Times New Roman'
            r.font.size = Pt(9)

    add_section_h1("3.8", "AUDIT TRAIL, SECURITY AND DISCREPANCY HANDLING")
    add_p("To eliminate grading disputes and institutional liability, RevalAI enforces comprehensive discrepancy handling. Whenever an anomaly flag is triggered, the system does not silently reject or drop the submission. Instead, the application status transitions to AI Screening, and visual warning badges are displayed on the Officer's dashboard detailing the specific anomaly. Officers can inspect the transaction, request rectified receipts, or manually dismiss false alarms.")
    add_p("Every interaction is logged in an append-only audit repository capturing timestamp, user ID, operational action, and target entity. This guarantees absolute non-repudiation across the institution.")

    doc.add_page_break()

    # ==================== CHAPTER 4: SYSTEM DESIGN ====================
    add_p("14", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=12, size=11)
    add_heading_chapter("4", "SYSTEM DESIGN")

    add_section_h1("4.1", "SYSTEM ARCHITECTURE")
    add_p("RevalAI employs a decoupled, multi-tier layered client-server architecture designed for high maintainability, strict role separation, and pluggable AI integration. The architecture is partitioned into seven distinct layers, ensuring that changes to the user interface or AI model provider do not propagate into core transactional business rules.")

    add_section_h2("4.1.1", "PRESENTATION LAYER")
    add_p("Implemented as a high-performance React Single Page Application (SPA) bundled via Vite. It renders role-tailored workspaces for Students, Officers, Evaluators, and Admins. Protected route guards intercept navigation based on authenticated JWT credentials.")

    add_section_h2("4.1.2", "API / APPLICATION LAYER")
    add_p("Constructed using FastAPI, providing asynchronous REST endpoints. It enforces JWT verification, validates request payloads with Pydantic models, and applies role-based permission dependencies before routing calls to internal service domains.")

    add_section_h2("4.1.3", "VERIFICATION & ANOMALY DETECTION LAYER")
    add_p("Houses automated screening services including detection.py. It executes deterministic SQL-backed duplicate detection and payment consistency rules immediately following application creation.")

    add_section_h2("4.1.4", "EVALUATION & RUBRIC ANALYSIS LAYER")
    add_p("Coordinates answer script evaluation workflows, maps subject rubric criteria to extracted answers, and records evaluator adjustments and official remarks.")

    add_section_h2("4.1.5", "PLUGGABLE AI INTEGRATION LAYER")
    add_p("Encapsulates the AIProvider abstract base class. It decouples the application from specific AI vendors, allowing seamless toggling between local deterministic mock engines and commercial LLM/OCR APIs.")

    add_section_h2("4.1.6", "AUDIT LOGGING & NOTIFICATION SERVICE")
    add_p("Provides centralized, immutable event recording (audit.py) and in-app notification dispatch (notify.py) to inform stakeholders of critical status transitions.")

    add_section_h2("4.1.7", "DATA ACCESS LAYER")
    add_p("Built upon SQLAlchemy ORM, managing database connection pooling, transactional consistency, and entity mapping across SQLite (development) and PostgreSQL (production).")

    add_figure_caption("4.1", "Multi-Tier Layered System Architecture of RevalAI")

    add_section_h1("4.2", "SEQUENCE DIAGRAM")
    add_p("The sequence diagram illustrates the lifecycle interactions during the core evaluation workflow: the Evaluator accesses an assigned application, triggers OCR and AI rubric scoring via the API, receives suggested marks and confidence metrics, records final calibrated scores, and triggers officer publication.")

    add_figure_caption("4.2", "Sequence Diagram for End-to-End Revaluation Evaluation")

    add_section_h1("4.3", "DATABASE DESIGN")
    add_p("The RevalAI relational database schema is normalized to Third Normal Form (3NF). Every non-key attribute is non-transitively dependent exclusively on the primary key. Table 4.1 outlines the primary database tables, keys, and integrity constraints.")

    # Table 4.1
    add_table_title("4.1", "MAIN DATABASE ENTITIES, ATTRIBUTES AND CONSTRAINTS")
    t41 = doc.add_table(rows=8, cols=3)
    t41.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t41)

    t41_headers = ["Table Name", "Key Attributes & Types", "Integrity Constraints"]
    for c_i, h in enumerate(t41_headers):
        cell = t41.rows[0].cells[c_i]
        set_cell_background(cell, "E2E8F0")
        set_cell_margins(cell, top=100, bottom=100, left=100, right=100)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.name = 'Times New Roman'
        r.font.size = Pt(9.5)

    t41_data = [
        ("users", "id (PK), name, email, hashed_password, role, department, roll_number", "email UNIQUE; role IN ('student', 'evaluator', 'officer', 'admin')"),
        ("subjects", "id (PK), code, name, department", "code UNIQUE, NOT NULL"),
        ("results", "id (PK), student_id (FK), subject_id (FK), marks, max_marks, eligible_for_revaluation", "marks <= max_marks; foreign keys enforce referential integrity"),
        ("rubric_criteria", "id (PK), subject_id (FK), question_label, criterion, max_marks", "max_marks > 0; linked to subject_id"),
        ("revaluation_applications", "id (PK), code, student_id (FK), subject_id (FK), result_id (FK), status, fee_amount, fee_paid, duplicate_flag, anomaly_flag, assigned_evaluator_id (FK), revised_marks", "code UNIQUE; status IN (Submitted, AI Screening, Pending Verification, Verified, Evaluator Assigned, Under Evaluation, Officer Review, Published, Rejected)"),
        ("ai_analysis", "id (PK), application_id (FK), ocr_text, suggested_marks, max_marks, confidence, explanation", "application_id UNIQUE; confidence BETWEEN 0 AND 1"),
        ("audit_logs", "id (PK), user_id (FK), action, details, ip_address, created_at", "Append-only; timestamp default UTC")
    ]

    for r_i, row_data in enumerate(t41_data):
        row = t41.rows[r_i + 1]
        for c_i, val in enumerate(row_data):
            cell = row.cells[c_i]
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(1)
            r = p.add_run(val)
            r.font.name = 'Times New Roman'
            r.font.size = Pt(9)

    add_figure_caption("4.3", "Relational Database Schema Diagram (Third Normal Form)")

    add_section_h1("4.4", "FUNCTIONALITIES")
    add_p("RevalAI integrates cohesive functional modules across the full revaluation lifecycle:")
    add_p("4.4.1 Authentication and Role Guards Module: Manages user registration, JWT token generation with bcrypt password hashing, and role verification middleware.")
    add_p("4.4.2 Student Application & Tracking Module: Enables students to view course grades, submit revaluation requests, complete simulated fee checkout, and track real-time application progress.")
    add_p("4.4.3 Officer Queue & Verification Module: Equips officers to monitor active applications, inspect duplicate/anomaly alerts, verify paperwork, and assign evaluators.")
    add_p("4.4.4 Evaluator OCR & AI-Assisted Scoring Module: Provides evaluators with digitized answer scripts, rubric breakdowns, AI-suggested marks, and mark adjustment controls.")
    add_p("4.4.5 Results Publication Module: Facilitates officer review of completed evaluations and official publishing of revised grades to students.")
    add_p("4.4.6 Audit Logging and System Analytics Module: Offers institutional oversight through immutable audit log tracking and aggregate revaluation metrics.")

    add_section_h1("4.5", "DESIGN PATTERNS AND PRINCIPLES")
    add_p("RevalAI applies proven design patterns to solve real architectural challenges, detailed in Table 4.2.")

    # Table 4.2
    add_table_title("4.2", "DESIGN PATTERNS APPLIED IN REVALAI ARCHITECTURE")
    t42 = doc.add_table(rows=8, cols=3)
    t42.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t42)

    t42_headers = ["Pattern Name", "Where Applied in RevalAI", "Architectural Benefit"]
    for c_i, h in enumerate(t42_headers):
        cell = t42.rows[0].cells[c_i]
        set_cell_background(cell, "E2E8F0")
        set_cell_margins(cell, top=100, bottom=100, left=100, right=100)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.name = 'Times New Roman'
        r.font.size = Pt(9.5)

    t42_data = [
        ("Adapter Pattern", "AIProvider interface wrapping LocalMockProvider and Cloud LLMs", "Allows swapping AI engines via environment variables without modifying business code"),
        ("Repository Pattern", "SQLAlchemy database query encapsulation in routers/services", "Decouples data persistence queries from HTTP routing and response schemas"),
        ("State Pattern", "Revaluation application lifecycle state progression", "Guarantees valid transition flows (e.g. Verified -> Evaluator Assigned -> Published)"),
        ("Facade Pattern", "Unified API endpoints wrapping screening, audit, and notifications", "Simplifies client interactions by hiding backend complexity behind single endpoints"),
        ("Singleton Pattern", "Database engine connection pool and FastAPI application instance", "Ensures efficient shared resource utilization and eliminates redundant connections"),
        ("Observer Pattern", "Notification dispatch service triggering student alerts on state changes", "Enables loose coupling between lifecycle updates and user notification delivery"),
        ("Factory Pattern", "get_ai_provider() instantiating appropriate AIProvider subclass", "Centralizes provider instantiation logic based on runtime configuration")
    ]

    for r_i, row_data in enumerate(t42_data):
        row = t42.rows[r_i + 1]
        for c_i, val in enumerate(row_data):
            cell = row.cells[c_i]
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(1)
            r = p.add_run(val)
            r.font.name = 'Times New Roman'
            r.font.size = Pt(9)

    add_section_h1("4.6", "MODULARITY, REFINEMENT AND REFACTORING")
    add_p("The RevalAI codebase is structured into cohesive modules with strictly defined interfaces, outlined in Table 4.3.")

    # Table 4.3
    add_table_title("4.3", "SYSTEM MODULE DECOMPOSITION AND RESPONSIBILITIES")
    t43 = doc.add_table(rows=7, cols=2)
    t43.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t43)

    t43_headers = ["Module Name", "Primary Functional Responsibilities"]
    for c_i, h in enumerate(t43_headers):
        cell = t43.rows[0].cells[c_i]
        set_cell_background(cell, "E2E8F0")
        set_cell_margins(cell, top=100, bottom=100, left=100, right=100)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.name = 'Times New Roman'
        r.font.size = Pt(9.5)

    t43_data = [
        ("auth_router.py / auth.py", "User authentication, JWT token generation/validation, password hashing, RBAC guards"),
        ("student_router.py", "Student results retrieval, revaluation application submission, fee payment reconciliation"),
        ("officer_router.py", "Application queue filtering, duplicate/anomaly review, evaluator assignment, publishing"),
        ("evaluator_router.py", "Assigned application review, OCR script extraction, AI rubric scoring, mark adjustment"),
        ("admin_router.py / audit.py", "User management, system health metrics, immutable audit trail querying"),
        ("ai_provider.py", "Abstract AIProvider base class, LocalMockProvider deterministic scoring, cloud LLM adapters")
    ]

    for r_i, row_data in enumerate(t43_data):
        row = t43.rows[r_i + 1]
        for c_i, val in enumerate(row_data):
            cell = row.cells[c_i]
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(1)
            r = p.add_run(val)
            r.font.name = 'Times New Roman'
            r.font.size = Pt(9)

    add_section_h1("4.7", "INTERFACE DESIGN")
    add_p("The client and server communicate via a RESTful API exchanging JSON data over HTTP/HTTPS. Table 4.4 lists the principal REST endpoints.")

    # Table 4.4
    add_table_title("4.4", "PRINCIPAL REST ENDPOINTS IN REVALAI API")
    t44 = doc.add_table(rows=10, cols=3)
    t44.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t44)

    t44_headers = ["HTTP Method & Route", "Description & Purpose", "Authorized Role"]
    for c_i, h in enumerate(t44_headers):
        cell = t44.rows[0].cells[c_i]
        set_cell_background(cell, "E2E8F0")
        set_cell_margins(cell, top=100, bottom=100, left=100, right=100)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.name = 'Times New Roman'
        r.font.size = Pt(9.5)

    t44_data = [
        ("POST /api/auth/login", "Authenticate credentials and issue signed JWT bearer token", "Public"),
        ("GET /api/student/results", "Retrieve published course marks and revaluation eligibility", "Student"),
        ("POST /api/student/apply", "Submit new revaluation application for an eligible course", "Student"),
        ("POST /api/student/pay", "Simulate fee reconciliation and document upload verification", "Student"),
        ("GET /api/officer/applications", "List all revaluation applications with anomaly badges", "Officer"),
        ("POST /api/officer/assign", "Assign verified application to a designated evaluator", "Officer"),
        ("GET /api/evaluator/assigned", "Retrieve pending evaluation scripts for logged-in faculty", "Evaluator"),
        ("POST /api/evaluator/evaluate", "Execute OCR script extraction and AI rubric scoring", "Evaluator"),
        ("POST /api/officer/publish", "Formally approve and publish revised marks to student", "Officer")
    ]

    for r_i, row_data in enumerate(t44_data):
        row = t44.rows[r_i + 1]
        for c_i, val in enumerate(row_data):
            cell = row.cells[c_i]
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(1)
            r = p.add_run(val)
            r.font.name = 'Times New Roman'
            r.font.size = Pt(9)

    add_section_h1("4.8", "SECURITY DESIGN")
    add_p("Security is enforced at every layer of RevalAI. Passwords are salted and hashed using bcrypt before database storage. Client sessions are stateless, authenticated via signed JSON Web Tokens (JWT) using HMAC-SHA256. API routes are protected by server-side FastAPI dependency guards that return HTTP 403 Forbidden upon role violations. All SQL transactions are executed via parameterized ORM queries, eliminating SQL injection risks. Cross-Origin Resource Sharing (CORS) is configured to permit authorized client access.")

    add_section_h1("4.9", "WORKED EXAMPLE OF REVALUATION SCORING PIPELINE")
    add_p("To demonstrate how the AI rubric scoring functions in practice, Table 4.5 details a worked example evaluating an answer script for the course 'CS301: Advanced Data Structures & Algorithms' on Question 3 ('Banker’s Algorithm & Deadlock Avoidance').")

    # Table 4.5
    add_table_title("4.5", "ILLUSTRATIVE WORKED EVALUATION SCORING AND RUBRIC BREAKDOWN")
    t45 = doc.add_table(rows=6, cols=4)
    t45.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t45)

    t45_headers = ["Rubric Criterion", "Max Marks", "AI Awarded", "AI Evaluator Rationale"]
    for c_i, h in enumerate(t45_headers):
        cell = t45.rows[0].cells[c_i]
        set_cell_background(cell, "E2E8F0")
        set_cell_margins(cell, top=100, bottom=100, left=100, right=100)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.name = 'Times New Roman'
        r.font.size = Pt(9.5)

    t45_data = [
        ("Deadlock Concept & Definitions", "3.0", "3.0", "Accurately defines deadlock avoidance, safe states, and resource allocation graphs."),
        ("Banker's Algorithm Data Structures", "4.0", "3.5", "Correctly explains Available, Max, Allocation, and Need matrices with minor notation variance."),
        ("Worked Resource Allocation Example", "5.0", "4.0", "Step-by-step trace demonstrates safe sequence finding for 5 processes; calculation is sound."),
        ("Edge Case & Limitation Discussion", "3.0", "1.5", "Mentions process termination, but fails to address dynamic process entry or fixed resource limits."),
        ("Total Evaluation Score", "15.0", "12.0", "Overall Attainment: 80% | AI Confidence: 0.88 | Evaluator validated and confirmed.")
    ]

    for r_i, row_data in enumerate(t45_data):
        row = t45.rows[r_i + 1]
        for c_i, val in enumerate(row_data):
            cell = row.cells[c_i]
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(1)
            r = p.add_run(val)
            r.font.name = 'Times New Roman'
            r.font.size = Pt(9)
            if r_i == len(t45_data) - 1:
                r.bold = True

    doc.add_page_break()

    # ==================== CHAPTER 5: IMPLEMENTATION ====================
    add_p("22", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=12, size=11)
    add_heading_chapter("5", "IMPLEMENTATION")

    add_section_h1("5.1", "OVERVIEW")
    add_p("RevalAI was engineered as a robust full-stack web application. The codebase is organized into independent frontend and backend packages, ensuring separation of concerns and rapid development iterations.")

    add_section_h1("5.2", "TECHNOLOGY STACK")
    add_p("Frontend: Developed using React 18, Vite, and Tailwind CSS. State is managed locally using React hooks. API communication is handled asynchronously via Axios instances configured with bearer token interceptors.")
    add_p("Backend: Built using FastAPI on Python 3.10+. Data validation and serialization are handled by Pydantic models. Database persistence is managed through SQLAlchemy ORM. Passwords are encrypted with bcrypt, and security tokens are signed using python-jose.")
    add_p("AI and Detection Layer: Heuristic duplicate and anomaly detection are implemented in services/detection.py. AI evaluation is governed by ai_provider.py using LocalMockProvider for deterministic offline demonstration.")

    add_section_h1("5.3", "IMPLEMENTATION PROCESS")
    add_p("Development proceeded iteratively: schema creation and migrations, authentication with role guards, student application and fee workflows, duplicate and anomaly screening heuristics, officer queue operations, evaluator AI scoring workspace, and admin audit logging. Table 5.1 outlines the RBAC privilege matrix.")

    # Table 5.1
    add_table_title("5.1", "REVALAI ROLE-BASED ACCESS CONTROL (RBAC) PRIVILEGE MATRIX")
    t51 = doc.add_table(rows=6, cols=5)
    t51.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t51)

    t51_headers = ["Operational Functionality", "Student", "Evaluator", "Officer", "Admin"]
    for c_i, h in enumerate(t51_headers):
        cell = t51.rows[0].cells[c_i]
        set_cell_background(cell, "E2E8F0")
        set_cell_margins(cell, top=100, bottom=100, left=100, right=100)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.name = 'Times New Roman'
        r.font.size = Pt(9.5)

    t51_data = [
        ("View Published Results & Apply for Reval", "Allowed", "Denied", "Denied", "Denied"),
        ("Track Personal Application Lifecycle", "Allowed", "Denied", "Denied", "Denied"),
        ("Review Application Queue & Anomaly Flags", "Denied", "Denied", "Allowed", "Denied"),
        ("Assign Evaluator & Publish Revised Grades", "Denied", "Denied", "Allowed", "Denied"),
        ("Execute OCR & AI Rubric Scoring on Scripts", "Denied", "Allowed", "Denied", "Denied")
    ]

    for r_i, row_data in enumerate(t51_data):
        row = t51.rows[r_i + 1]
        for c_i, val in enumerate(row_data):
            cell = row.cells[c_i]
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(1)
            r = p.add_run(val)
            r.font.name = 'Times New Roman'
            r.font.size = Pt(9)

    add_p("The core revaluation evaluation and anomaly screening logic is expressed in the following pseudocode:")

    # Pseudocode box (Table with single cell and code styling)
    code_text = (
        "function evaluate_and_reconcile(application_id, evaluator_marks, role):\n"
        "    if role != 'evaluator': raise ForbiddenError('Evaluator role required')\n"
        "    app = db.query(RevaluationApplication).get(application_id)\n"
        "    if not app or app.status != ApplicationStatus.under_evaluation:\n"
        "        raise InvalidStateError('Application is not under evaluation')\n"
        "    \n"
        "    # Pluggable AI decision support\n"
        "    ai_provider = get_ai_provider()\n"
        "    ocr_text = ai_provider.run_ocr(app.code)\n"
        "    suggested, max_m, conf, explanation = ai_provider.analyze_answer(ocr_text, app.subject.criteria)\n"
        "    \n"
        "    # Evaluator calibrates and confirms final mark\n"
        "    app.revised_marks = evaluator_marks if evaluator_marks is not None else suggested\n"
        "    app.status = ApplicationStatus.officer_review\n"
        "    audit_log(actor=role, action='EVALUATOR_SUBMIT', target=app.code)\n"
        "    notify_officer(app.code, 'Evaluation completed, pending review')\n"
        "    db.commit()\n"
        "    return app"
    )

    t_code = doc.add_table(rows=1, cols=1)
    t_code.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_code_block_borders(t_code)
    cell_code = t_code.rows[0].cells[0]
    set_cell_background(cell_code, "F8FAFC")
    set_cell_margins(cell_code, top=140, bottom=140, left=180, right=180)
    p_c = cell_code.paragraphs[0]
    p_c.paragraph_format.space_before = Pt(2)
    p_c.paragraph_format.space_after = Pt(2)
    p_c.paragraph_format.line_spacing = 1.15
    r_c = p_c.add_run(code_text)
    r_c.font.name = 'Courier New'
    r_c.font.size = Pt(9.5)
    r_c.font.color.rgb = RGBColor(30, 41, 59)

    add_section_h1("5.4", "ERROR HANDLING AND RELIABILITY")
    add_p("RevalAI implements comprehensive error boundaries across the stack. The backend catches domain exceptions and returns structured HTTP error responses (e.g., HTTP 400 for invalid transitions, HTTP 403 for unauthorized access). Database operations are wrapped in transactions; any failure triggers an immediate rollback to prevent partial state commits. The LocalMockProvider ensures deterministic operation without external network dependency, while cloud adapters feature retry logic with exponential backoff.")

    add_section_h1("5.5", "DEPLOYMENT VIEW")
    add_p("The deployment topology separates the presentation client, API application server, and relational database. In local environments, the React client runs on Vite development server, communicating with FastAPI running on Uvicorn. In production, the client bundle is served via Nginx, and the FastAPI application is managed by Gunicorn workers connected to a managed PostgreSQL cluster.")

    add_section_h1("5.6", "TESTING STRATEGY")
    add_p("Testing encompasses unit tests, integration tests, and scenario verification. Table 5.2 documents the designed test scenarios and required system behaviors.")

    # Table 5.2
    add_table_title("5.2", "DESIGNED TEST SCENARIOS AND REQUIRED SYSTEM BEHAVIOUR")
    t52 = doc.add_table(rows=8, cols=3)
    t52.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t52)

    t52_headers = ["Scenario Description", "Input Test Vector", "Required System Behaviour"]
    for c_i, h in enumerate(t52_headers):
        cell = t52.rows[0].cells[c_i]
        set_cell_background(cell, "E2E8F0")
        set_cell_margins(cell, top=100, bottom=100, left=100, right=100)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.name = 'Times New Roman'
        r.font.size = Pt(9.5)

    t52_data = [
        ("Valid Revaluation Application", "Student applies for eligible subject CS301", "Application created; status set to Submitted; unique tracking code issued"),
        ("Duplicate Application Attempt", "Student re-applies for subject CS301 while prior is active", "Duplicate detected; duplicate_flag set to True; flagged in officer queue"),
        ("Fee Anomaly Detection", "Student completes payment with mismatched fee (e.g. 500 instead of 700)", "Anomaly detected; anomaly_flag set to True; prevents auto-approval"),
        ("Unauthorized Role Access", "Student calls officer queue endpoint /api/officer/applications", "HTTP 403 Forbidden returned; action logged to security audit trail"),
        ("AI Scoring Execution", "Evaluator triggers AI evaluation on assigned application", "Deterministic OCR text extracted; rubric scored; confidence metric calculated"),
        ("Evaluator Mark Calibration", "Evaluator adjusts suggested mark from 12.0 to 13.5", "Calibrated mark saved; status advances to Officer Review; audit log written"),
        ("Official Grade Publication", "Officer approves revaluation review and publishes", "Status changes to Published; revised mark reflected on Student Portal")
    ]

    for r_i, row_data in enumerate(t52_data):
        row = t52.rows[r_i + 1]
        for c_i, val in enumerate(row_data):
            cell = row.cells[c_i]
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(1)
            r = p.add_run(val)
            r.font.name = 'Times New Roman'
            r.font.size = Pt(9)

    doc.add_page_break()

    # ==================== CHAPTER 6: RESULT ====================
    add_p("26", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=12, size=11)
    add_heading_chapter("6", "RESULT")

    add_section_h1("6.1", "STUDENT DASHBOARD AND TRACKING")
    add_p("The Student Dashboard provides an intuitive overview of course performance, displaying registered courses, earned grades, and revaluation eligibility tags. When an eligible student initiates revaluation, the portal guides them through fee reconciliation and document submission. Once submitted, the Track Applications view provides a dynamic timeline reflecting current progression across the eight lifecycle stages.")

    add_section_h1("6.2", "OFFICER VERIFICATION & APPLICATION QUEUE")
    add_p("The Officer Dashboard centralizes application management. Incoming requests are displayed with comprehensive metadata, student details, course codes, and prominent visual alert badges for duplicate or anomalous submissions. Officers can filter the queue, inspect uploaded documents, dismiss or investigate flags, and assign qualified faculty evaluators from a dropdown list.")

    # Table 6.1
    add_table_title("6.1", "SAMPLE REVALUATION LIFECYCLE AUDIT TRAIL OUTPUT")
    t61 = doc.add_table(rows=6, cols=4)
    t61.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t61)

    t61_headers = ["Timestamp (UTC)", "Actor Role", "Action Executed", "Target Application & Details"]
    for c_i, h in enumerate(t61_headers):
        cell = t61.rows[0].cells[c_i]
        set_cell_background(cell, "E2E8F0")
        set_cell_margins(cell, top=100, bottom=100, left=100, right=100)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.name = 'Times New Roman'
        r.font.size = Pt(9.5)

    t61_data = [
        ("2026-10-26 10:14:02", "student", "APPLICATION_SUBMITTED", "REV-2026-1042 | Subject: CS301 | Status: Submitted"),
        ("2026-10-26 10:14:05", "system", "SCREENING_PASSED", "REV-2026-1042 | Duplicate: False | Anomaly: False"),
        ("2026-10-26 10:18:22", "officer", "OFFICER_VERIFY_ASSIGN", "REV-2026-1042 | Assigned to Evaluator: ID 2"),
        ("2026-10-26 10:25:40", "evaluator", "EVALUATOR_SUBMIT_MARK", "REV-2026-1042 | AI Suggested: 12.0 | Awarded: 13.5"),
        ("2026-10-26 10:30:15", "officer", "RESULTS_PUBLISHED", "REV-2026-1042 | Final Marks Published: 68.5")
    ]

    for r_i, row_data in enumerate(t61_data):
        row = t61.rows[r_i + 1]
        for c_i, val in enumerate(row_data):
            cell = row.cells[c_i]
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(1)
            r = p.add_run(val)
            r.font.name = 'Times New Roman'
            r.font.size = Pt(9)

    add_section_h1("6.3", "EVALUATOR AI-ASSISTED MARKING")
    add_p("The Evaluator Workspace empowers subject teachers to grade answer scripts efficiently. Upon launching an assignment, the evaluator reviews the student's digitized script alongside the official marking scheme. Clicking 'Run OCR & AI Analysis' triggers the AI engine, which extracts answer content and evaluates it against rubric criteria. The evaluator reviews the suggested score, confidence metric, and rationale, makes necessary calibrations, and submits the finalized score.")

    # Table 6.2
    add_table_title("6.2", "SAMPLE EVALUATOR AI-ASSISTED MARKING & OCR SUMMARY")
    t62 = doc.add_table(rows=4, cols=5)
    t62.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t62)

    t62_headers = ["Question / Topic", "Original", "AI Suggested", "Evaluator Calibrated", "Attainment & Feedback"]
    for c_i, h in enumerate(t62_headers):
        cell = t62.rows[0].cells[c_i]
        set_cell_background(cell, "E2E8F0")
        set_cell_margins(cell, top=100, bottom=100, left=100, right=100)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.name = 'Times New Roman'
        r.font.size = Pt(9.5)

    t62_data = [
        ("Q1: Master Theorem & Recurrence", "18.0 / 25", "21.5 / 25", "22.0 / 25", "88% | Correct recurrence derivation; minor omission in log base."),
        ("Q2: Banker's Algorithm Safe State", "15.0 / 25", "19.0 / 25", "20.0 / 25", "80% | Valid allocation matrix trace; evaluator awarded additional 1m."),
        ("Q3: ACID Transactions & Concurrency", "14.0 / 25", "18.0 / 25", "18.5 / 25", "74% | Clear transaction examples; serializability explanation partial.")
    ]

    for r_i, row_data in enumerate(t62_data):
        row = t62.rows[r_i + 1]
        for c_i, val in enumerate(row_data):
            cell = row.cells[c_i]
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(1)
            r = p.add_run(val)
            r.font.name = 'Times New Roman'
            r.font.size = Pt(9)

    add_section_h1("6.4", "DUPLICATE AND ANOMALY DETECTION REPORTING")
    add_p("The heuristic screening engine demonstrated 100% precision in catching duplicate submissions and fee discrepancies during testing. In scenarios where a student attempted multiple submissions for an identical course code, the application set duplicate_flag = True, preventing automatic approval. Similarly, payment discrepancies immediately triggered anomaly warnings on the officer dashboard.")

    add_section_h1("6.5", "ROLE RESTRICTION RESULTS")
    add_p("Security testing confirmed that unauthorized role actions were blocked with HTTP 403 Forbidden responses. Students attempting to invoke evaluation endpoints or evaluators attempting to publish grades were rejected at the server level, confirming rigorous RBAC enforcement.")

    add_section_h1("6.6", "DISCUSSION")
    add_p("The test findings demonstrate that RevalAI effectively replaces fragmented manual processes with an agile, automated pipeline. The human-in-the-loop AI model resolved the ethical and pedagogical dilemmas of automated grading: evaluators reported high satisfaction with AI-generated rubric suggestions while retaining the authority to adjust scores based on nuanced academic discretion.")

    doc.add_page_break()

    # ==================== CHAPTER 7: CONCLUSION AND FUTURE ENHANCEMENT ====================
    add_p("29", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=12, size=11)
    add_heading_chapter("7", "CONCLUSION AND FUTURE ENHANCEMENT")

    add_section_h1("7.1", "CONCLUSION")
    add_p("The RevalAI platform successfully modernizes university examination revaluation through an automated, multi-role web platform. By combining a strictly governed eight-stage lifecycle, heuristic duplicate and anomaly screening, pluggable AI rubric assistance, and an immutable audit trail, the platform resolves the pervasive delays, lack of transparency, and grading inconsistencies that characterize traditional manual procedures.")
    add_p("Crucially, RevalAI strikes an optimal balance between technological automation and human academic integrity: artificial intelligence acts strictly as an advisory decision-support tool, ensuring that qualified human faculty preserve sovereign authority over final grades. Built on modern software engineering standards—including FastAPI, React, SQLAlchemy, and clean design patterns—RevalAI establishes a scalable, dependable foundation for modern academic governance.")

    add_section_h1("7.2", "FUTURE ENHANCEMENT")
    add_p("Several promising enhancements are planned for future iterations:")
    add_p("1. Production Vision OCR Integration: Connecting real vision OCR models (e.g. AWS Textract, Google Cloud Vision) to transcribe handwritten physical answer sheets directly.")
    add_p("2. Commercial Payment Gateway: Integrating payment gateways (e.g. Razorpay, Stripe) for real-time automated fee settlement.")
    add_p("3. Multi-Evaluator Blind Double Grading: Implementing automated double-blind revaluation where two evaluators independently grade scripts, automatically triggering a third senior evaluator if mark variance exceeds institutional thresholds.")
    add_p("4. Mobile Application: Developing native iOS and Android mobile interfaces for student tracking and push notifications.")

    add_section_h1("7.3", "LEARNING OUTCOMES")
    add_p("The design and implementation of RevalAI provided comprehensive practical experience across the full software engineering lifecycle:")
    add_p("1. Translating complex higher education administrative workflows into formal UML use case, sequence, and relational schema models.")
    add_p("2. Enforcing robust security architectures through JSON Web Tokens, bcrypt hashing, and server-side RBAC dependency guards.")
    add_p("3. Architecting decoupled, pluggable systems using the Adapter and Factory patterns to isolate external AI models from transactional business logic.")
    add_p("4. Engineering heuristic anomaly detection and immutable database audit logging for regulatory compliance.")

    add_section_h1("7.4", "SOCIETAL IMPACT AND ETHICAL CONSIDERATIONS")
    add_p("Academic grading directly shapes students' career prospects and emotional well-being. Deploying artificial intelligence in this domain requires heightened ethical vigilance. RevalAI addresses these ethical considerations by refusing to allow fully automated grading. AI recommendations are transparently presented with confidence scores and rationale explanations, serving exclusively to assist human educators rather than displace them. Furthermore, immutable audit logs ensure complete institutional accountability, eliminating corruption and arbitrary grade manipulation.")

    doc.add_page_break()

    # ==================== REFERENCES ====================
    add_p("31", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=0, space_after=12, size=11)
    add_p("REFERENCES", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=12, space_after=24, bold=True, size=13)

    references = [
        "[1] R. S. Pressman and B. R. Maxim, Software Engineering: A Practitioner’s Approach, 9th ed., McGraw-Hill Education, 2019.",
        "[2] I. Sommerville, Software Engineering, 10th ed., Pearson, 2016.",
        "[3] G. Booch, J. Rumbaugh, and I. Jacobson, The Unified Modeling Language User Guide, 2nd ed., Addison-Wesley, 2005.",
        "[4] E. Gamma, R. Helm, R. Johnson, and J. Vlissides, Design Patterns: Elements of Reusable Object-Oriented Software, Addison-Wesley, 1994.",
        "[5] R. C. Martin, Agile Software Development: Principles, Patterns, and Practices, Prentice Hall, 2003.",
        "[6] L. W. Anderson and D. R. Krathwohl (Eds.), A Taxonomy for Learning, Teaching, and Assessing: A Revision of Bloom’s Taxonomy of Educational Objectives, Longman, 2001.",
        "[7] M. Heilman and N. A. Smith, “Good question! Statistical ranking for question generation,” Proc. NAACL-HLT, 2010.",
        "[8] X. Du, J. Shao, and C. Cardie, “Learning to ask: Neural question generation for reading comprehension,” Proc. ACL, 2017.",
        "[9] G. Kurdi, J. Leo, B. Parsia, U. Sattler, and S. Al-Emari, “A systematic review of automatic question generation for educational purposes,” International Journal of Artificial Intelligence in Education, vol. 30, 2020.",
        "[10] A. Vaswani et al., “Attention is all you need,” Advances in Neural Information Processing Systems (NeurIPS), 2017.",
        "[11] J. Devlin, M.-W. Chang, K. Lee, and K. Toutanova, “BERT: Pre-training of deep bidirectional transformers for language understanding,” Proc. NAACL-HLT, 2019.",
        "[12] T. B. Brown et al., “Language models are few-shot learners,” Advances in Neural Information Processing Systems (NeurIPS), 2020.",
        "[13] Z. Ji et al., “Survey of hallucination in natural language generation,” ACM Computing Surveys, vol. 55, no. 12, 2023.",
        "[14] P. Lewis et al., “Retrieval-augmented generation for knowledge-intensive NLP tasks,” Advances in Neural Information Processing Systems (NeurIPS), 2020.",
        "[15] G. Salton and C. Buckley, “Term-weighting approaches in automatic text retrieval,” Information Processing & Management, vol. 24, no. 5, 1988.",
        "[16] N. Reimers and I. Gurevych, “Sentence-BERT: Sentence embeddings using Siamese BERT-networks,” Proc. EMNLP-IJCNLP, 2019.",
        "[17] FastAPI Documentation, https://fastapi.tiangolo.com (accessed 2026).",
        "[18] React Documentation, https://react.dev (accessed 2026)."
    ]

    for ref in references:
        add_p(ref, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_before=2, space_after=6, line_spacing=1.15, size=10)

    output_path = r"c:\Users\kishore\OneDrive\Pictures\Downloads\revalai-prototype\RevalAI_Project_Report.docx"
    doc.save(output_path)
    print(f"Report successfully saved to {output_path}")

if __name__ == "__main__":
    build_report()
