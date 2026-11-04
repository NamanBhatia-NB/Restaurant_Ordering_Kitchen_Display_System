import os
import re
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def create_document():
    doc = Document()

    # Set page margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Styles
    terracotta_rgb = RGBColor(217, 83, 30)
    charcoal_rgb = RGBColor(28, 25, 23)
    muted_rgb = RGBColor(120, 113, 108)

    with open("Technical-Design-Document.md", "r", encoding="utf-8") as f:
        lines = f.readlines()

    in_code_block = False
    code_block_lines = []
    in_table = False
    table_rows = []

    def flush_table():
        nonlocal in_table, table_rows
        if not table_rows:
            in_table = False
            return
        
        # Clean rows
        cleaned_rows = []
        for r in table_rows:
            # Check if separator row like |---|---|
            if re.match(r'^\s*\|?\s*[-:]+\s*\|', r):
                continue
            cells = [c.strip() for c in r.strip().strip('|').split('|')]
            if any(cells):
                cleaned_rows.append(cells)
        
        if cleaned_rows:
            col_count = max(len(r) for r in cleaned_rows)
            t = doc.add_table(rows=len(cleaned_rows), cols=col_count)
            t.alignment = WD_TABLE_ALIGNMENT.CENTER
            
            for row_idx, r_data in enumerate(cleaned_rows):
                row = t.rows[row_idx]
                is_header = (row_idx == 0)
                for col_idx in range(col_count):
                    cell = row.cells[col_idx]
                    val = r_data[col_idx] if col_idx < len(r_data) else ""
                    # Clean markdown bold/code from cell text
                    clean_val = re.sub(r'\*\*(.*?)\*\*', r'\1', val)
                    clean_val = re.sub(r'`(.*?)`', r'\1', clean_val)
                    
                    cell.text = clean_val
                    set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
                    
                    p = cell.paragraphs[0]
                    p.paragraph_format.space_before = Pt(2)
                    p.paragraph_format.space_after = Pt(2)
                    run = p.runs[0] if p.runs else p.add_run()
                    run.font.size = Pt(9)
                    run.font.name = "Arial"
                    
                    if is_header:
                        set_cell_background(cell, "F5F2EB")
                        run.font.bold = True
                        run.font.color.rgb = terracotta_rgb
                    else:
                        if row_idx % 2 == 1:
                            set_cell_background(cell, "FFFFFF")
                        else:
                            set_cell_background(cell, "FAF8F5")
            doc.add_paragraph().paragraph_format.space_after = Pt(4)

        table_rows = []
        in_table = False

    for line in lines:
        stripped = line.strip()

        # Handle code blocks
        if stripped.startswith("```"):
            if in_code_block:
                # Flush code block
                in_code_block = False
                p = doc.add_paragraph()
                p.paragraph_format.space_before = Pt(4)
                p.paragraph_format.space_after = Pt(6)
                p.paragraph_format.left_indent = Inches(0.2)
                code_text = "\n".join(code_block_lines)
                run = p.add_run(code_text)
                run.font.name = "Courier New"
                run.font.size = Pt(8.5)
                run.font.color.rgb = RGBColor(40, 40, 40)
                code_block_lines = []
            else:
                if in_table:
                    flush_table()
                in_code_block = True
                code_block_lines = []
            continue

        if in_code_block:
            code_block_lines.append(line.rstrip())
            continue

        # Handle tables
        if "|" in stripped and (stripped.startswith("|") or stripped.endswith("|")):
            in_table = True
            table_rows.append(stripped)
            continue
        elif in_table:
            flush_table()

        # Title
        if stripped.startswith("# "):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(14)
            p.paragraph_format.space_after = Pt(4)
            run = p.add_run(stripped[2:])
            run.font.name = "Georgia"
            run.font.size = Pt(22)
            run.font.bold = True
            run.font.color.rgb = terracotta_rgb
            continue

        # Heading 2
        if stripped.startswith("## "):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(12)
            p.paragraph_format.space_after = Pt(3)
            run = p.add_run(stripped[3:])
            run.font.name = "Georgia"
            run.font.size = Pt(15)
            run.font.bold = True
            run.font.color.rgb = charcoal_rgb
            continue

        # Heading 3
        if stripped.startswith("### "):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(9)
            p.paragraph_format.space_after = Pt(2)
            run = p.add_run(stripped[4:])
            run.font.name = "Arial"
            run.font.size = Pt(12)
            run.font.bold = True
            run.font.color.rgb = terracotta_rgb
            continue

        # Horizontal rule
        if stripped.startswith("---"):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(4)
            p.paragraph_format.space_after = Pt(4)
            run = p.add_run("____________________________________________________________________")
            run.font.color.rgb = RGBColor(220, 215, 210)
            run.font.size = Pt(8)
            continue

        # Bullet lists
        if stripped.startswith("- ") or stripped.startswith("* "):
            p = doc.add_paragraph(style='List Bullet')
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(1)
            content = stripped[2:]
            parts = re.split(r'(\*\*.*?\*\*|`.*?`)', content)
            for part in parts:
                if part.startswith("**") and part.endswith("**"):
                    r = p.add_run(part[2:-2])
                    r.font.bold = True
                elif part.startswith("`") and part.endswith("`"):
                    r = p.add_run(part[1:-1])
                    r.font.name = "Courier New"
                    r.font.size = Pt(9)
                else:
                    p.add_run(part)
            continue

        # Numbered lists
        num_match = re.match(r'^\d+\.\s+(.*)', stripped)
        if num_match:
            p = doc.add_paragraph(style='List Number')
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(1)
            content = num_match.group(1)
            parts = re.split(r'(\*\*.*?\*\*|`.*?`)', content)
            for part in parts:
                if part.startswith("**") and part.endswith("**"):
                    r = p.add_run(part[2:-2])
                    r.font.bold = True
                elif part.startswith("`") and part.endswith("`"):
                    r = p.add_run(part[1:-1])
                    r.font.name = "Courier New"
                    r.font.size = Pt(9)
                else:
                    p.add_run(part)
            continue

        # Normal text paragraph
        if stripped:
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(3)
            parts = re.split(r'(\*\*.*?\*\*|`.*?`|\*.*?\*)', stripped)
            for part in parts:
                if part.startswith("**") and part.endswith("**"):
                    r = p.add_run(part[2:-2])
                    r.font.bold = True
                elif part.startswith("*") and part.endswith("*") and not part.startswith("**"):
                    r = p.add_run(part[1:-1])
                    r.font.italic = True
                elif part.startswith("`") and part.endswith("`"):
                    r = p.add_run(part[1:-1])
                    r.font.name = "Courier New"
                    r.font.size = Pt(9)
                    r.font.color.rgb = RGBColor(160, 50, 20)
                else:
                    r = p.add_run(part)
                    r.font.name = "Arial"
                    r.font.size = Pt(10)
                    r.font.color.rgb = charcoal_rgb

    if in_table:
        flush_table()

    output_path = "Technical-Design-Document.docx"
    doc.save(output_path)
    print(f"Generated {output_path} successfully ({os.path.getsize(output_path)} bytes).")

if __name__ == "__main__":
    create_document()
