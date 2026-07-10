"""
PDF Generator – compiles stress-test run outcomes into formatted PDF reports (with modern HTML printing fallbacks).
"""

import os
import logging
from pathlib import Path
from typing import Any, Dict, List

logger = logging.getLogger("integrations.pdf_export")

# Attempt importing reportlab libraries, handle fallbacks cleanly
try:
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False
    logger.warning("ReportLab library not installed. PDF Exporter will generate a styled HTML/CSS report fallback.")


class PDFReportGenerator:
    """
    Report compiler for Mirror AI. Creates PDF or styled HTML documents.
    """

    def generate_report(self, report_data: Dict[str, Any], output_path: str) -> str:
        """
        Compiles the report payload into a file and returns the file path.
        """
        if HAS_REPORTLAB:
            try:
                return self._generate_reportlab_pdf(report_data, output_path)
            except Exception as e:
                logger.error(f"Failed to generate PDF using ReportLab: {e}. Falling back to HTML.")

        return self._generate_html_report(report_data, output_path)

    def _generate_reportlab_pdf(self, data: Dict[str, Any], output_path: str) -> str:
        """Compiles ReportLab PDF."""
        # Ensure path ends with .pdf
        if not output_path.lower().endswith(".pdf"):
            output_path += ".pdf"

        # Setup document template
        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            rightMargin=54, leftMargin=54, topMargin=54, bottomMargin=54
        )

        styles = getSampleStyleSheet()
        story = []

        # Custom Palette
        primary_color = colors.HexColor("#1A365D")  # Deep blue
        accent_color = colors.HexColor("#D69E2E")   # Amber gold
        bg_dark = colors.HexColor("#2D3748")         # Slate
        text_light = colors.HexColor("#FFFFFF")
        border_color = colors.HexColor("#E2E8F0")

        # Custom Paragraph styles
        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Heading1"],
            fontSize=26,
            textColor=primary_color,
            spaceAfter=15
        )
        h2_style = ParagraphStyle(
            "SectionHeader",
            parent=styles["Heading2"],
            fontSize=16,
            textColor=primary_color,
            spaceBefore=15,
            spaceAfter=8,
            borderPadding=4
        )
        body_style = ParagraphStyle(
            "Body",
            parent=styles["Normal"],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#2D3748"),
            spaceAfter=10
        )
        meta_style = ParagraphStyle(
            "Meta",
            parent=styles["Normal"],
            fontSize=9,
            textColor=colors.HexColor("#718096")
        )

        # Title
        story.append(Paragraph("AgentOps Mirror AI - Stress Test Report", title_style))
        story.append(Paragraph(f"Generated on: {datetime_placeholder()} | Session ID: {data.get('session_id', 'Batch Run')}", meta_style))
        story.append(Spacer(1, 15))

        # Health & Risk KPI Blocks Table
        health_score = data.get("health_score", 1.0)
        risk_score = data.get("risk_score", 0.0)
        
        kpi_data = [
            [
                Paragraph("<b>HEALTH SCORE</b>", ParagraphStyle("H", parent=meta_style, textColor=text_light, alignment=1)),
                Paragraph("<b>RISK LEVEL</b>", ParagraphStyle("R", parent=meta_style, textColor=text_light, alignment=1))
            ],
            [
                Paragraph(f"<font size=28><b>{round(health_score * 100)}%</b></font>", ParagraphStyle("HC", parent=title_style, textColor=text_light, alignment=1)),
                Paragraph(f"<font size=28><b>{data.get('risk_level', 'LOW').upper()}</b></font>", ParagraphStyle("RC", parent=title_style, textColor=accent_color, alignment=1))
            ]
        ]
        
        kpi_table = Table(kpi_data, colWidths=[250, 250])
        kpi_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), bg_dark),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 12),
            ('TOPPADDING', (0,0), (-1,-1), 12),
            ('INNERGRID', (0,0), (-1,-1), 1, colors.HexColor("#4A5568")),
            ('BOX', (0,0), (-1,-1), 1, primary_color)
        ]))
        story.append(kpi_table)
        story.append(Spacer(1, 20))

        # Executive Summary
        story.append(Paragraph("Executive Summary", h2_style))
        story.append(Paragraph(data.get("summary", "No summary text provided."), body_style))
        story.append(Spacer(1, 10))

        # Critical Failures
        story.append(Paragraph("Critical Safety Failures", h2_style))
        failures = data.get("failures", [])
        if not failures:
            story.append(Paragraph("No critical safety failures were detected during this run.", body_style))
        else:
            fail_data = [["Vulnerability", "Severity", "Reason"]]
            for fail in failures:
                fail_data.append([
                    Paragraph(f"<b>{fail.get('dimension', fail.get('issue', 'Security Bypass'))}</b>", body_style),
                    Paragraph(fail.get("severity", "high").upper(), ParagraphStyle("S", parent=body_style, textColor=colors.HexColor("#E53E3E"))),
                    Paragraph(fail.get("reason", "N/A"), body_style)
                ])
            
            fail_table = Table(fail_data, colWidths=[120, 70, 310])
            fail_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), border_color),
                ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('GRID', (0,0), (-1,-1), 0.5, border_color),
                ('TOPPADDING', (0,0), (-1,-1), 6),
                ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ]))
            story.append(fail_table)
        story.append(Spacer(1, 15))

        # Recommendations
        story.append(Paragraph("Actionable Recommendations", h2_style))
        recs = data.get("recommendations", [])
        if not recs:
            story.append(Paragraph("No recommendations needed. Maintain current parameters.", body_style))
        else:
            for i, rec in enumerate(recs):
                area = rec.get("area", "general").upper()
                priority = rec.get("priority", "medium").upper()
                suggestion = rec.get("suggestion", rec.get("recommendation", ""))
                
                story.append(Paragraph(f"<b>{i+1}. [{area} - Priority {priority}]</b> {suggestion}", body_style))

        # Build document
        doc.build(story)
        logger.info(f"ReportLab PDF report generated: {output_path}")
        return output_path

    def _generate_html_report(self, data: Dict[str, Any], output_path: str) -> str:
        """Generates print-ready HTML/CSS report fallback."""
        if not output_path.lower().endswith(".html"):
            # Strip PDF extension if present
            if output_path.lower().endswith(".pdf"):
                output_path = output_path[:-4]
            output_path += ".html"

        health_score = data.get("health_score", 1.0)
        risk_score = data.get("risk_score", 0.0)
        failures = data.get("failures", [])
        recs = data.get("recommendations", [])

        # Format HTML template
        html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>AgentOps Mirror AI Stress Test Report</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #2D3748;
            line-height: 1.6;
            margin: 0;
            padding: 40px;
            background-color: #F7FAFC;
        }}
        .container {{
            max-width: 800px;
            margin: 0 auto;
            background: #FFFFFF;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border-top: 8px solid #1A365D;
        }}
        h1 {{
            color: #1A365D;
            font-size: 28px;
            margin-top: 0;
            margin-bottom: 5px;
        }}
        .metadata {{
            color: #718096;
            font-size: 13px;
            margin-bottom: 30px;
        }}
        .kpi-container {{
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
        }}
        .kpi-card {{
            flex: 1;
            background: #2D3748;
            color: #FFFFFF;
            padding: 20px;
            border-radius: 6px;
            text-align: center;
        }}
        .kpi-card h3 {{
            margin: 0 0 10px 0;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #A0AEC0;
        }}
        .kpi-card .value {{
            font-size: 36px;
            font-weight: bold;
        }}
        .kpi-card .value.accent {{
            color: #D69E2E;
        }}
        h2 {{
            color: #1A365D;
            font-size: 18px;
            border-bottom: 2px solid #E2E8F0;
            padding-bottom: 8px;
            margin-top: 30px;
            margin-bottom: 15px;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }}
        th, td {{
            text-align: left;
            padding: 12px;
            border-bottom: 1px solid #E2E8F0;
        }}
        th {{
            background-color: #EDF2F7;
            font-weight: bold;
        }}
        .severity-badge {{
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
        }}
        .severity-badge.critical {{ background: #FED7D7; color: #9B2C2C; }}
        .severity-badge.high {{ background: #FEEBC8; color: #9C4221; }}
        .severity-badge.medium {{ background: #EBF8FF; color: #2B6CB0; }}
        .rec-item {{
            margin-bottom: 15px;
            padding-left: 10px;
            border-left: 4px solid #D69E2E;
        }}
        .rec-title {{
            font-weight: bold;
            font-size: 14px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>AgentOps Mirror AI</h1>
        <div class="metadata">
            Stress Test Safety Report &bull; Generated on: {datetime_placeholder()} &bull; Session: {data.get("session_id", "Batch Session")}
        </div>

        <div class="kpi-container">
            <div class="kpi-card">
                <h3>Health Score</h3>
                <div class="value">{round(health_score * 100)}%</div>
            </div>
            <div class="kpi-card">
                <h3>Risk Level</h3>
                <div class="value accent">{data.get("risk_level", "LOW").upper()}</div>
            </div>
        </div>

        <h2>Executive Summary</h2>
        <p>{data.get("summary", "No summary provided.")}</p>

        <h2>Critical Safety Failures</h2>
        """
        
        if not failures:
            html += "<p>No critical safety failures were detected during this run.</p>"
        else:
            html += """<table>
                <thead>
                    <tr>
                        <th>Vulnerability Dimension</th>
                        <th>Severity</th>
                        <th>Failure Analysis / Reason</th>
                    </tr>
                </thead>
                <tbody>"""
            for fail in failures:
                sev = fail.get("severity", "high").lower()
                html += f"""<tr>
                    <td><strong>{fail.get('dimension', fail.get('issue', 'Security Bypass'))}</strong></td>
                    <td><span class="severity-badge {sev}">{sev}</span></td>
                    <td>{fail.get('reason', 'N/A')}</td>
                </tr>"""
            html += "</tbody></table>"

        html += "<h2>Actionable Recommendations</h2>"
        if not recs:
            html += "<p>No immediate remediation recommendations needed.</p>"
        else:
            for i, rec in enumerate(recs):
                area = rec.get("area", "General").upper()
                priority = rec.get("priority", "Medium").upper()
                suggestion = rec.get("suggestion", rec.get("recommendation", ""))
                html += f"""<div class="rec-item">
                    <div class="rec-title">{i+1}. [{area} - Priority {priority}]</div>
                    <div>{suggestion}</div>
                </div>"""

        html += """</div>
</body>
</html>"""

        with open(output_path, "w", encoding="utf-8") as f:
            f.write(html)
        
        logger.info(f"HTML report generated: {output_path}")
        return output_path


def datetime_placeholder() -> str:
    """Helper for formatted timestamps."""
    from datetime import datetime
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
