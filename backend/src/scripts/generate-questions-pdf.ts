import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { ROLE_QUESTIONS } from '../config/constants';

const ROLE_LABELS: Record<string, string> = {
  developer: 'Developer',
  tester: 'Tester',
  tech_lead: 'Tech Lead',
  manager: 'Manager',
  devops: 'DevOps',
};

const ROLE_ORDER = ['developer', 'tester', 'tech_lead', 'manager', 'devops'];

const ACCENT_COLORS: Record<string, string> = {
  developer: '#4F46E5',  // indigo
  tester:    '#0891B2',  // cyan
  tech_lead: '#7C3AED',  // violet
  manager:   '#059669',  // emerald
  devops:    '#D97706',  // amber
};

const outputPath = path.resolve(__dirname, '../../appraisal-questions.pdf');
const doc = new PDFDocument({ margin: 50, size: 'A4' });
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// ── Cover page ──────────────────────────────────────────────────────────────
doc.rect(0, 0, doc.page.width, doc.page.height).fill('#1E1B4B');

doc.fill('#FFFFFF')
   .font('Helvetica-Bold')
   .fontSize(32)
   .text('Talent Metric', 50, 220, { align: 'center' });

doc.fontSize(18)
   .font('Helvetica')
   .text('Appraisal Question Bank', 50, 270, { align: 'center' });

doc.fontSize(12)
   .fillColor('#A5B4FC')
   .text('All roles — grouped by section', 50, 310, { align: 'center' });

const roles = ROLE_ORDER.filter((r) => ROLE_QUESTIONS[r]);
const roleList = roles.map((r) => ROLE_LABELS[r]).join('  ·  ');
doc.fontSize(10)
   .fillColor('#818CF8')
   .text(roleList, 50, 350, { align: 'center' });

doc.addPage();

// ── Table of contents ────────────────────────────────────────────────────────
doc.fill('#1E1B4B').font('Helvetica-Bold').fontSize(20).text('Table of Contents', 50, 50);
doc.moveTo(50, 76).lineTo(doc.page.width - 50, 76).strokeColor('#E2E8F0').lineWidth(1).stroke();

let tocY = 90;
roles.forEach((role, i) => {
  const sections = ROLE_QUESTIONS[role];
  const totalQ = sections.reduce((sum, s) => sum + s.questions.length, 0);
  doc.fill(ACCENT_COLORS[role]).font('Helvetica-Bold').fontSize(12)
     .text(`${i + 1}.  ${ROLE_LABELS[role]}`, 50, tocY);
  doc.fill('#64748B').font('Helvetica').fontSize(10)
     .text(`${sections.length} sections · ${totalQ} questions`, 250, tocY + 1);
  tocY += 22;
});

doc.addPage();

// ── Role sections ────────────────────────────────────────────────────────────
roles.forEach((role, roleIndex) => {
  const sections = ROLE_QUESTIONS[role];
  const accent = ACCENT_COLORS[role];
  const totalQ = sections.reduce((sum, s) => sum + s.questions.length, 0);

  // Role header banner
  doc.rect(0, 0, doc.page.width, 110).fill(accent);
  doc.fill('#FFFFFF')
     .font('Helvetica-Bold')
     .fontSize(26)
     .text(ROLE_LABELS[role], 50, 28);
  doc.font('Helvetica').fontSize(12).fillColor('rgba(255,255,255,0.8)')
     .text(`${sections.length} sections  ·  ${totalQ} questions`, 50, 62);

  let y = 130;

  sections.forEach((sec) => {
    // Section heading
    const headingH = 28;
    if (y + headingH > doc.page.height - 60) { doc.addPage(); y = 50; }

    doc.rect(50, y, doc.page.width - 100, headingH).fill('#F1F5F9');
    doc.fill(accent).font('Helvetica-Bold').fontSize(11)
       .text(`${sec.emoji}  ${sec.sectionTitle}`, 60, y + 8, { width: doc.page.width - 120 });
    y += headingH + 8;

    // Questions
    sec.questions.forEach((q, qi) => {
      const lineHeight = 16;
      // Estimate wrapped height (approx 90 chars per line at font size 10)
      const lines = Math.ceil(q.length / 85) + 1;
      const blockH = lines * lineHeight + 6;

      if (y + blockH > doc.page.height - 60) { doc.addPage(); y = 50; }

      // Number badge
      doc.circle(66, y + 8, 8).fill(accent);
      doc.fill('#FFFFFF').font('Helvetica-Bold').fontSize(7)
         .text(String(qi + 1), 62, y + 5, { width: 10, align: 'center' });

      // Question text
      doc.fill('#1E293B').font('Helvetica').fontSize(10)
         .text(q, 82, y + 2, { width: doc.page.width - 140, lineGap: 3 });

      y += blockH + 2;
    });

    y += 12; // gap after section
  });

  if (roleIndex < roles.length - 1) doc.addPage();
});

// ── Footer on every page ─────────────────────────────────────────────────────
const range = doc.bufferedPageRange();
for (let i = range.start; i < range.start + range.count; i++) {
  doc.switchToPage(i);
  doc.fill('#94A3B8').font('Helvetica').fontSize(8)
     .text(
       `Talent Metric  ·  Appraisal Question Bank  ·  Page ${i + 1}`,
       50, doc.page.height - 30,
       { align: 'center', width: doc.page.width - 100 }
     );
}

doc.end();

stream.on('finish', () => {
  console.log(`✅ PDF generated: ${outputPath}`);
});
