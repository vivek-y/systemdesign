# System Design PDF Generator

## Trigger
Use this skill when the user asks to:
- Convert a system design `.txt` file into a PDF
- "Do the same for this" when a `.txt` file is open or attached
- Generate a formatted system design document from a text file
- Process a system design note/document into a readable PDF

## What This Skill Does
1. Reads the `.txt` file fully (handles truncation by reading in chunks)
2. Analyses the design as a **system design expert** — rates it, identifies gaps, and adds expert commentary
3. Generates a clean, well-formatted PDF using Python + ReportLab (no temp script files left behind)
4. Saves the PDF in the **same folder** as the source `.txt` file
5. Deletes the original `.txt` file after successful PDF generation

---

## Step-by-Step Instructions

### Step 1 — Identify the target file
- Use the active editor file or the file mentioned by the user
- If ambiguous, ask the user which `.txt` file to process

### Step 2 — Read the full file
- Use `readFile` with `skipPruning: true`
- If truncated, read remaining lines with `start_line` until the full content is captured
- Do NOT proceed until you have 100% of the content

### Step 3 — Expert analysis (do this mentally before writing the PDF)
As a **senior distributed systems expert**, evaluate the document on:
- **Completeness** — Are all functional requirements addressed? Any obvious gaps?
- **Correctness** — Are the trade-off analyses accurate? Any misleading claims?
- **Depth** — What important topics are missing or underexplored?
- **Additions** — What should a candidate know that isn't in the document?

Produce a short expert rating (e.g. "Strong foundation, missing X and Y") and a list of "Expert Additions" to include in the PDF.

### Step 4 — Generate the PDF inline (no temp script files)
Use `executeBash` to run a Python one-liner that writes and immediately executes the PDF generation code using `exec()`. This avoids creating any `.py` files on disk.

Use the template below, filling in the actual content.

### Step 5 — Verify and clean up
- Confirm the PDF exists with `ls -lh`
- Delete the original `.txt` file using `deleteFile`
- Report done to the user

---

## PDF Format Guidelines

The PDF should be **easy to read at a glance**. Follow these rules:

### Visual Design
- **Brand colour**: derive from the topic (e.g. Dropbox blue `#0061FF`, Google blue `#1A73E8`, Netflix red `#E50914`)
- **No emoji on the cover** — ReportLab's default fonts render emoji as black boxes. Use plain text only on the cover.
- Clean two-column requirement tables with colour headers
- Green callout boxes for ✅ Approach (best solution)
- Amber callout boxes for ⚠️ Challenge
- Blue callout boxes for 💡 Expert Notes / additions
- Monospace code blocks for schemas and API endpoints
- Horizontal rules between major sections

### Sections to Include (in order)
1. **Cover** — Project name only (large, brand-coloured). No subtitle, no author line, no description text. Just the name and a single HR divider below it.
2. **Problem Overview** — What the system is, 1–2 sentences
3. **Requirements** — Functional + Non-Functional in side-by-side tables (In Scope vs Out of Scope)
4. **Core Entities** — Brief list with key attributes
5. **API Design** — Endpoints with request/response schemas in code blocks
6. **High-Level Design** — Each functional requirement with card layout (see Card Layout section)
7. **System Architecture** — Component table (Component | Responsibility)
8. **Deep Dives** — Each deep dive with the same card pattern where options exist
9. **Expert Rating & Additions** — Your analysis as a system design expert (what's good, what's missing, what to study)

### Sections to EXCLUDE
- Interview Expectations / level breakdown (E4/E5/Staff+) — always omit this
- Subtitle line (e.g. "System Design — Expert Reference Guide")
- Author / date / difficulty / asked-at metadata
- Footer copyright line

### Cover Pattern
```python
story += [
    SP(80),
    Paragraph("ProjectName", cover_title),  # large, brand-coloured, centered
    SP(50),
    HR(),
]
```
No subtitle, no author line, no description paragraph, no footer.

### Card Layout for Options
Use coloured left-border cards for any section presenting multiple options (upload, download, sharing, sync, chunk orchestration, etc.):
- **Grey card** (`GREY_STRIP` / `GREY_CARD`) — naive/first option
- **Orange card** (`ORG_STRIP` / `ORG_BG`) — better but still has issues
- **Green card** (`GRN_STRIP` / `GRN_BG`) — best option, add `recommended=True` for the `[RECOMMENDED]` badge

Trade-off text goes in italic at the bottom of each card. Never use separate Challenge boxes when cards are used.

---

## Python PDF Generation Pattern

Write the generation code to a `.py` file, run it, then delete it. Use `fsWrite` + `executeBash` + `deleteFile`.

### Colour palette (copy exactly)
```python
BRAND      = colors.HexColor("#0061FF")   # adjust per topic
BRAND_DARK = colors.HexColor("#003D99")
GREY_CARD  = colors.HexColor("#F5F5F5")
GREY_STRIP = colors.HexColor("#9E9E9E")
ORG_STRIP  = colors.HexColor("#FB8C00")
ORG_BG     = colors.HexColor("#FFF8F0")
GRN_STRIP  = colors.HexColor("#2E7D32")
GRN_BG     = colors.HexColor("#F1F8E9")
BLUE_BG    = colors.HexColor("#E3F2FD")
BLUE_FG    = colors.HexColor("#0D47A1")
PRP_BG     = colors.HexColor("#F3E5F5")
PRP_FG     = colors.HexColor("#4A148C")
CODE_BG    = colors.HexColor("#F5F5F5")
GREY_TXT   = colors.HexColor("#555555")
DARK_TXT   = colors.HexColor("#212121")
LIGHT_GREY = colors.HexColor("#EEEEEE")
WHITE      = colors.white
```

### Document setup
```python
doc = SimpleDocTemplate(
    OUTPUT, pagesize=letter,
    rightMargin=0.75*inch, leftMargin=0.75*inch,
    topMargin=0.75*inch,   bottomMargin=0.75*inch,
)
```

### Typography styles (copy exactly)
```python
cover_title = ParagraphStyle("ct", fontSize=48, textColor=BRAND,
    fontName="Helvetica-Bold", spaceAfter=12, alignment=TA_CENTER, leading=56)

h1 = ParagraphStyle("h1", fontSize=18, textColor=BRAND_DARK,
    fontName="Helvetica-Bold", spaceBefore=20, spaceAfter=6, leading=22)
h2 = ParagraphStyle("h2", fontSize=13, textColor=BRAND,
    fontName="Helvetica-Bold", spaceBefore=14, spaceAfter=4, leading=17)
h3 = ParagraphStyle("h3", fontSize=11, textColor=DARK_TXT,
    fontName="Helvetica-Bold", spaceBefore=10, spaceAfter=3, leading=14)

body = ParagraphStyle("body", fontSize=10, textColor=DARK_TXT,
    fontName="Helvetica", spaceAfter=5, leading=15, alignment=TA_JUSTIFY)
bullet = ParagraphStyle("bul", fontSize=10, textColor=DARK_TXT,
    fontName="Helvetica", spaceAfter=3, leading=14, leftIndent=14, bulletIndent=4)
num = ParagraphStyle("num", fontSize=10, textColor=DARK_TXT,
    fontName="Helvetica", spaceAfter=4, leading=14, leftIndent=18)
code_s = ParagraphStyle("code", fontSize=8.5, fontName="Courier",
    backColor=CODE_BG, textColor=colors.HexColor("#111111"),
    spaceAfter=6, spaceBefore=4, leading=13, leftIndent=8, rightIndent=8, borderPad=6)
note_s = ParagraphStyle("note", fontSize=10, fontName="Helvetica-Oblique",
    backColor=BLUE_BG, textColor=BLUE_FG, spaceAfter=5, spaceBefore=4,
    leading=14, leftIndent=8, rightIndent=8, borderPad=6)
expert_s = ParagraphStyle("exp", fontSize=10, fontName="Helvetica",
    backColor=PRP_BG, textColor=PRP_FG, spaceAfter=5, spaceBefore=4,
    leading=14, leftIndent=8, rightIndent=8, borderPad=6,
    borderColor=PRP_FG, borderWidth=0.5)
```

### Helper functions (copy exactly)
```python
def H1(t): return Paragraph(t, h1)
def H2(t): return Paragraph(t, h2)
def H3(t): return Paragraph(t, h3)
def P(t):  return Paragraph(t, body)
def B(t):  return Paragraph(f"• {t}", bullet)
def N(i,t):return Paragraph(f"{i}. {t}", num)
def Note(t):       return Paragraph(f"<i>Note: {t}</i>", note_s)
def ExpertNote(t): return Paragraph(f"<b>Expert Note:</b> {t}", expert_s)
def HR():  return HRFlowable(width="100%", thickness=0.5,
                              color=colors.HexColor("#CCCCCC"), spaceAfter=6, spaceBefore=6)
def SP(h=8): return Spacer(1, h)
def Code(t):
    e = (t.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")
          .replace("\n","<br/>").replace("  ","&nbsp;&nbsp;"))
    return Paragraph(e, code_s)
```

### Card builder (copy exactly)
```python
def card(strip_color, bg_color, title, body_paragraphs, tradeoff_text, recommended=False):
    FULL_W  = 6.75 * inch
    STRIP_W = 0.18 * inch
    BODY_W  = FULL_W - STRIP_W - 0.2*inch

    cb_s = ParagraphStyle("cb", fontSize=10, textColor=DARK_TXT,
        fontName="Helvetica", spaceAfter=4, leading=14)
    ct_s = ParagraphStyle("ctitle", fontSize=11, textColor=DARK_TXT,
        fontName="Helvetica-Bold", spaceAfter=4, leading=14)
    tr_s = ParagraphStyle("ctrade", fontSize=9.5, textColor=GREY_TXT,
        fontName="Helvetica-Oblique", spaceAfter=0, leading=13)

    title_text = title
    if recommended:
        title_text = title + '  <font color="#2E7D32"><b>[RECOMMENDED]</b></font>'

    inner = [Paragraph(title_text, ct_s), SP(4)]
    for para in body_paragraphs:
        inner.append(para if isinstance(para, Paragraph) else Paragraph(para, cb_s))
    inner += [SP(6), Paragraph(f"<i>Trade-off: {tradeoff_text}</i>", tr_s)]

    inner_tbl = Table([[inner]], colWidths=[BODY_W])
    inner_tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), bg_color),
        ("TOPPADDING",    (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
        ("LEFTPADDING",   (0,0), (-1,-1), 10),
        ("RIGHTPADDING",  (0,0), (-1,-1), 8),
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
    ]))

    strip_cell = Paragraph("", ParagraphStyle("empty"))
    outer = Table([[strip_cell, inner_tbl]], colWidths=[STRIP_W, BODY_W + 0.2*inch])
    outer.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (0,-1), strip_color),
        ("BACKGROUND",    (1,0), (1,-1), bg_color),
        ("LEFTPADDING",   (0,0), (-1,-1), 0),
        ("RIGHTPADDING",  (0,0), (-1,-1), 0),
        ("TOPPADDING",    (0,0), (-1,-1), 0),
        ("BOTTOMPADDING", (0,0), (-1,-1), 0),
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
        ("BOX",           (0,0), (-1,-1), 0.5, colors.HexColor("#CCCCCC")),
    ]))
    return [outer, SP(8)]
```

### Requirement table (copy exactly)
```python
def req_table(in_scope, out_scope, title_left="In Scope", title_right="Out of Scope"):
    col_w = (3.3*inch, 3.3*inch)
    data = [[title_left, title_right]]
    for i in range(max(len(in_scope), len(out_scope))):
        l = in_scope[i]  if i < len(in_scope)  else ""
        r = out_scope[i] if i < len(out_scope) else ""
        data.append([
            Paragraph(f"• {l}", bullet) if l else Paragraph("", body),
            Paragraph(f"• {r}", bullet) if r else Paragraph("", body),
        ])
    t = Table(data, colWidths=col_w, hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0), BRAND),
        ("TEXTCOLOR",     (0,0), (-1,0), WHITE),
        ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,0), 10),
        ("ALIGN",         (0,0), (-1,0), "CENTER"),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, LIGHT_GREY]),
        ("GRID",          (0,0), (-1,-1), 0.4, colors.HexColor("#CCCCCC")),
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING",   (0,0), (-1,-1), 6),
    ]))
    return t
```

### Component table (copy exactly)
```python
def component_table(rows):
    data = [["Component", "Responsibility"]]
    for comp, resp in rows:
        data.append([Paragraph(f"<b>{comp}</b>", body), Paragraph(resp, body)])
    t = Table(data, colWidths=[1.9*inch, 4.7*inch], hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0), BRAND),
        ("TEXTCOLOR",     (0,0), (-1,0), WHITE),
        ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,0), 10),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, LIGHT_GREY]),
        ("GRID",          (0,0), (-1,-1), 0.4, colors.HexColor("#CCCCCC")),
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING",   (0,0), (-1,-1), 6),
    ]))
    return t
```

### Expert Rating section pattern
```python
story += [
    H1("8. Expert Rating & What to Study Further"),
    Paragraph("<b>Rating: X / 10</b>",
              ParagraphStyle("rating", fontSize=15, textColor=PRP_FG,
                             fontName="Helvetica-Bold", spaceAfter=6)),
    P("One-line summary of the design quality."),
    H3("Strengths"),
    B("strength 1"),
    B("strength 2"),
    H3("Gaps"),
    B("<b>Gap title:</b> explanation."),
    H3("Topics to Study Further"),
    ExpertNote("<b>Topic:</b> 3-4 sentence explanation."),
]
```

---

## Important Rules
- NEVER leave `.py` script files on disk — use heredoc `python3 << 'PYEOF' ... PYEOF` pattern
- ALWAYS delete the source `.txt` file after successful PDF generation
- ALWAYS read the FULL file before generating — never work from partial content
- The PDF output name should be derived from the topic (e.g. `Dropbox_System_Design.pdf`)
- Save PDF in the SAME directory as the source `.txt` file
- If ReportLab is not installed, run `pip3 install reportlab --quiet` first
- **Cover**: project name only — no subtitle, no author/date, no description, no footer copyright
