import os
import re
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Preformatted

def sanitize(text: str) -> str:
    """Sanitize unicode to WinAnsi/standard ASCII equivalents to prevent missing glyph boxes."""
    if not text:
        return ""
    text = text.replace("₹", "Rs. ")
    text = text.replace("–", "-")
    text = text.replace("—", "--")
    text = text.replace("✓", "[PASS]")
    text = text.replace("λ", "lambda")
    text = text.replace("•", "*")
    text = text.replace("→", "->")
    text = text.replace("▲", "^")
    text = text.replace("▼", "v")
    text = text.replace("▶", ">")
    return text

def create_pdf():
    pdf_path = "Technical-Design-Document.pdf"
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        rightMargin=45,
        leftMargin=45,
        topMargin=45,
        bottomMargin=45
    )

    styles = getSampleStyleSheet()

    # Custom styles
    terracotta = colors.HexColor("#D9531E")
    charcoal = colors.HexColor("#1C1917")
    cream_bg = colors.HexColor("#F9F7F2")
    border_color = colors.HexColor("#E2DDD5")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=terracotta,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=charcoal,
        spaceAfter=8
    )

    h2_style = ParagraphStyle(
        'DocH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=terracotta,
        spaceBefore=10,
        spaceAfter=4
    )

    h3_style = ParagraphStyle(
        'DocH3',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=charcoal,
        spaceBefore=7,
        spaceAfter=3
    )

    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=charcoal,
        spaceAfter=4
    )

    bullet_style = ParagraphStyle(
        'DocBullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=charcoal,
        leftIndent=14,
        spaceAfter=2
    )

    code_style = ParagraphStyle(
        'DocCode',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7,
        leading=9,
        textColor=colors.HexColor("#262626")
    )

    story = []

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
        
        cleaned_rows = []
        for r in table_rows:
            if re.match(r'^\s*\|?\s*[-:]+\s*\|', r):
                continue
            cells = [sanitize(c.strip()) for c in r.strip().strip('|').split('|')]
            if any(cells):
                cleaned_rows.append(cells)
        
        if cleaned_rows:
            col_count = max(len(r) for r in cleaned_rows)
            table_data = []
            for row_idx, r_data in enumerate(cleaned_rows):
                row_cells = []
                for col_idx in range(col_count):
                    raw_val = r_data[col_idx] if col_idx < len(r_data) else ""
                    # Markdown bold/code to ReportLab tags
                    val = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', raw_val)
                    val = re.sub(r'`(.*?)`', r'<font face="Courier">\1</font>', val)
                    style = ParagraphStyle('TCell', parent=body_style, fontSize=7.5, leading=9.5)
                    if row_idx == 0:
                        style.fontName = 'Helvetica-Bold'
                        style.textColor = terracotta
                    row_cells.append(Paragraph(val, style))
                table_data.append(row_cells)

            # Page width is 612 - 90 = 522 pt
            if col_count == 2:
                col_widths = [140.0, 382.0]
            elif col_count == 3:
                col_widths = [110.0, 206.0, 206.0]
            elif col_count == 4:
                col_widths = [85.0, 110.0, 145.0, 182.0]
            else:
                col_widths = [522.0 / col_count] * col_count

            t = Table(table_data, colWidths=col_widths)
            t_style = [
                ('BACKGROUND', (0, 0), (-1, 0), cream_bg),
                ('GRID', (0, 0), (-1, -1), 0.5, border_color),
                ('TOPPADDING', (0, 0), (-1, -1), 3),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
                ('LEFTPADDING', (0, 0), (-1, -1), 4),
                ('RIGHTPADDING', (0, 0), (-1, -1), 4),
            ]
            t.setStyle(TableStyle(t_style))
            story.append(t)
            story.append(Spacer(1, 4))

        table_rows = []
        in_table = False

    for line in lines:
        raw_stripped = line.strip()
        stripped = sanitize(raw_stripped)

        if stripped.startswith("```"):
            if in_code_block:
                in_code_block = False
                block_str = "\n".join(code_block_lines)
                code_p = Preformatted(block_str, code_style)
                code_table = Table([[code_p]], colWidths=[522.0])
                code_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, -1), cream_bg),
                    ('BOX', (0, 0), (-1, -1), 0.5, border_color),
                    ('TOPPADDING', (0, 0), (-1, -1), 4),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                    ('LEFTPADDING', (0, 0), (-1, -1), 6),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                ]))
                story.append(code_table)
                story.append(Spacer(1, 4))
                code_block_lines = []
            else:
                if in_table:
                    flush_table()
                in_code_block = True
                code_block_lines = []
            continue

        if in_code_block:
            code_block_lines.append(sanitize(line.rstrip())[:110])
            continue

        if "|" in raw_stripped and (raw_stripped.startswith("|") or raw_stripped.endswith("|")):
            in_table = True
            table_rows.append(raw_stripped)
            continue
        elif in_table:
            flush_table()

        if stripped.startswith("# "):
            story.append(Paragraph(stripped[2:], title_style))
            continue

        if stripped.startswith("## "):
            story.append(Paragraph(stripped[3:], h2_style))
            continue

        if stripped.startswith("### "):
            story.append(Paragraph(stripped[4:], h3_style))
            continue

        if stripped.startswith("---"):
            story.append(Spacer(1, 3))
            continue

        if stripped.startswith("- ") or stripped.startswith("* "):
            content = stripped[2:]
            content = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', content)
            content = re.sub(r'`(.*?)`', r'<font face="Courier">\1</font>', content)
            story.append(Paragraph(f"&bull; {content}", bullet_style))
            continue

        num_match = re.match(r'^(\d+\.)\s+(.*)', stripped)
        if num_match:
            prefix = num_match.group(1)
            content = num_match.group(2)
            content = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', content)
            content = re.sub(r'`(.*?)`', r'<font face="Courier">\1</font>', content)
            story.append(Paragraph(f"{prefix} {content}", bullet_style))
            continue

        if stripped:
            content = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', stripped)
            content = re.sub(r'`(.*?)`', r'<font face="Courier">\1</font>', content)
            story.append(Paragraph(content, body_style))

    if in_table:
        flush_table()

    doc.build(story)
    print(f"Generated {pdf_path} successfully ({os.path.getsize(pdf_path)} bytes).")

if __name__ == "__main__":
    create_pdf()
