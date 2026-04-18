// generatePptx.js — server-side PPTX generation with professional design
// Theme: Ocean Depths (professional medical blue)
const PptxGenJS = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

const THEME = {
  navy: '1a2332',
  teal: '2d8b8b',
  seafoam: 'a8dadc',
  cream: 'f1faee',
  white: 'FFFFFF',
  darkText: '1a2332',
  lightText: 'e8f0f2',
  accentBar: '2d8b8b',
  mutedText: '6b8a8a',
  cardBg: 'f7fbfb',
  divider: 'c8e0e0',
};

const FONT = {
  header: 'Arial',
  body: 'Arial',
  cjk: 'Microsoft JhengHei',
};

function generatePptx(articles, overallInsights, weekRange) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5
  pptx.author = 'Colorectal Weekly Digest';
  pptx.subject = 'Weekly Literature Review';

  // ═══ COVER ═══
  const cover = pptx.addSlide();
  cover.background = { color: THEME.navy };
  // Decorative top bar
  cover.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.08, fill: { color: THEME.teal } });
  // Accent line
  cover.addShape(pptx.ShapeType.rect, { x: 4.5, y: 2.0, w: 4.33, h: 0.04, fill: { color: THEME.teal } });
  cover.addText('🔬', { x: 0, y: 1.2, w: '100%', fontSize: 48, align: 'center' });
  cover.addText('Colorectal Surgery', { x: 1.5, y: 2.3, w: 10.33, fontSize: 38, color: THEME.white, align: 'center', fontFace: FONT.header, bold: true });
  cover.addText('Weekly Digest', { x: 1.5, y: 3.2, w: 10.33, fontSize: 38, color: THEME.seafoam, align: 'center', fontFace: FONT.header, bold: true });
  cover.addText('大腸直腸外科文獻週報', { x: 1.5, y: 4.2, w: 10.33, fontSize: 20, color: THEME.mutedText, align: 'center', fontFace: FONT.cjk });
  cover.addShape(pptx.ShapeType.rect, { x: 4.5, y: 4.8, w: 4.33, h: 0.04, fill: { color: THEME.teal } });
  cover.addText(weekRange, { x: 1.5, y: 5.0, w: 10.33, fontSize: 16, color: THEME.mutedText, align: 'center' });
  cover.addText(`${articles.length} Selected Papers`, { x: 1.5, y: 5.6, w: 10.33, fontSize: 14, color: THEME.mutedText, align: 'center' });
  // Bottom bar
  cover.addShape(pptx.ShapeType.rect, { x: 0, y: 7.42, w: 13.33, h: 0.08, fill: { color: THEME.teal } });

  // ═══ TABLE OF CONTENTS ═══
  const toc = pptx.addSlide();
  toc.background = { color: THEME.cream };
  toc.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.25, h: 7.5, fill: { color: THEME.teal } });
  toc.addText('CONTENTS', { x: 0.6, y: 0.3, w: 4, fontSize: 12, color: THEME.teal, fontFace: FONT.header, bold: true, charSpacing: 4 });
  toc.addText('目錄', { x: 0.6, y: 0.6, w: 4, fontSize: 12, color: THEME.mutedText, fontFace: FONT.cjk });
  toc.addShape(pptx.ShapeType.rect, { x: 0.6, y: 1.0, w: 5, h: 0.02, fill: { color: THEME.divider } });

  articles.forEach((a, i) => {
    const y = 1.3 + i * 0.55;
    const num = String(i + 1).padStart(2, '0');
    toc.addText(num, { x: 0.6, y, w: 0.5, fontSize: 14, color: THEME.teal, fontFace: FONT.header, bold: true });
    toc.addText(a.title.substring(0, 85) + (a.title.length > 85 ? '…' : ''), { x: 1.2, y, w: 11.5, fontSize: 11, color: THEME.darkText, fontFace: FONT.body });
  });

  // ═══ PAPER SLIDES (2 per paper) ═══
  articles.forEach((a, i) => {
    const num = String(i + 1).padStart(2, '0');

    // --- Slide A: Title + Key Findings ---
    const sA = pptx.addSlide();
    sA.background = { color: THEME.white };
    // Left accent bar
    sA.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.25, h: 7.5, fill: { color: THEME.teal } });
    // Top right number badge
    sA.addShape(pptx.ShapeType.rect, { x: 12.0, y: 0, w: 1.33, h: 0.6, fill: { color: THEME.navy } });
    sA.addText(num, { x: 12.0, y: 0.05, w: 1.33, fontSize: 20, color: THEME.seafoam, align: 'center', fontFace: FONT.header, bold: true });

    // Title
    sA.addText(a.title, { x: 0.6, y: 0.3, w: 11, fontSize: 18, color: THEME.navy, fontFace: FONT.header, bold: true, lineSpacingMultiple: 1.2 });

    // Meta line
    let meta = [];
    if (a.journal) meta.push(`📰 ${a.journal}`);
    if (a.impactFactor) meta.push(`IF ${a.impactFactor.toFixed(1)}`);
    if (a.studyType && a.studyType !== 'Other') meta.push(a.studyType);
    if (a.isAsiaPriority) meta.push('🌏 Asia');
    if (a.pubDate) meta.push(`📅 ${a.pubDate}`);
    sA.addText(meta.join('  ·  '), { x: 0.6, y: 1.3, w: 11, fontSize: 10, color: THEME.mutedText });
    // Authors
    const authorStr = formatAuthors(a);
    sA.addText(`👥 ${authorStr}`, { x: 0.6, y: 1.6, w: 11, fontSize: 10, color: THEME.mutedText });

    sA.addShape(pptx.ShapeType.rect, { x: 0.6, y: 1.95, w: 11.5, h: 0.02, fill: { color: THEME.divider } });

    // Key Findings (EN) — left column
    sA.addText('KEY FINDINGS', { x: 0.6, y: 2.15, w: 5.5, fontSize: 10, color: THEME.teal, fontFace: FONT.header, bold: true, charSpacing: 2 });

    const bulletPointsEn = a.bulletPointsEn || ['(No key findings generated)'];
    const enBullets = bulletPointsEn.map(b => ({ text: b, options: { fontSize: 10, color: THEME.darkText, fontFace: FONT.body, lineSpacingMultiple: 1.4, bullet: { code: '25CF', color: THEME.teal }, indentLevel: 0 } }));
    sA.addText(enBullets, { x: 0.6, y: 2.5, w: 5.8, valign: 'top' });

    // Key Findings (ZH) — right column
    sA.addText('重點發現', { x: 6.8, y: 2.15, w: 5.5, fontSize: 10, color: THEME.teal, fontFace: FONT.cjk, bold: true, charSpacing: 2 });

    const bulletPointsZh = a.bulletPointsZh || ['（無重點摘要）'];
    const zhBullets = bulletPointsZh.map(b => ({ text: b, options: { fontSize: 10, color: THEME.darkText, fontFace: FONT.cjk, lineSpacingMultiple: 1.4, bullet: { code: '25CF', color: THEME.teal }, indentLevel: 0 } }));
    sA.addText(zhBullets, { x: 6.8, y: 2.5, w: 5.8, valign: 'top' });

    // DOI at bottom
    if (a.doi) {
      sA.addText(`DOI: ${a.doi}`, { x: 0.6, y: 6.9, w: 11, fontSize: 8, color: THEME.mutedText, hyperlink: { url: `https://doi.org/${a.doi}` } });
    }
    // Bottom bar
    sA.addShape(pptx.ShapeType.rect, { x: 0, y: 7.42, w: 13.33, h: 0.08, fill: { color: THEME.teal } });

    // --- Slide B: Insights ---
    const sB = pptx.addSlide();
    sB.background = { color: THEME.cream };
    sB.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.25, h: 7.5, fill: { color: THEME.teal } });
    sB.addShape(pptx.ShapeType.rect, { x: 12.0, y: 0, w: 1.33, h: 0.6, fill: { color: THEME.navy } });
    sB.addText(num, { x: 12.0, y: 0.05, w: 1.33, fontSize: 20, color: THEME.seafoam, align: 'center', fontFace: FONT.header, bold: true });

    sB.addText(a.title.substring(0, 100) + (a.title.length > 100 ? '…' : ''), {
      x: 0.6, y: 0.3, w: 11, fontSize: 14, color: THEME.navy, fontFace: FONT.header, bold: true,
    });
    sB.addShape(pptx.ShapeType.rect, { x: 0.6, y: 0.9, w: 11.5, h: 0.02, fill: { color: THEME.divider } });

    // Clinical Insight box
    sB.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.1, w: 5.9, h: 2.8, fill: { color: THEME.white }, rectRadius: 0.08, shadow: { type: 'outer', blur: 3, offset: 1, color: '00000015' } });
    sB.addText('💡 CLINICAL INSIGHT', { x: 0.7, y: 1.2, w: 5.5, fontSize: 10, color: THEME.teal, bold: true, charSpacing: 2 });
    sB.addText('臨床啟示', { x: 0.7, y: 1.45, w: 5.5, fontSize: 10, color: THEME.mutedText, fontFace: FONT.cjk });
    sB.addText(a.insightClinical || '(No insight)', { x: 0.7, y: 1.8, w: 5.5, fontSize: 10, color: THEME.darkText, lineSpacingMultiple: 1.4 });

    // Future Direction box
    sB.addShape(pptx.ShapeType.rect, { x: 6.8, y: 1.1, w: 5.9, h: 2.8, fill: { color: THEME.white }, rectRadius: 0.08, shadow: { type: 'outer', blur: 3, offset: 1, color: '00000015' } });
    sB.addText('🔮 FUTURE DIRECTION', { x: 7.0, y: 1.2, w: 5.5, fontSize: 10, color: THEME.teal, bold: true, charSpacing: 2 });
    sB.addText('未來方向', { x: 7.0, y: 1.45, w: 5.5, fontSize: 10, color: THEME.mutedText, fontFace: FONT.cjk });
    sB.addText(a.insightFuture || '(No direction)', { x: 7.0, y: 1.8, w: 5.5, fontSize: 10, color: THEME.darkText, lineSpacingMultiple: 1.4 });

    sB.addShape(pptx.ShapeType.rect, { x: 0, y: 7.42, w: 13.33, h: 0.08, fill: { color: THEME.teal } });
  });

  // ═══ OVERALL INSIGHTS ═══
  const oSlide = pptx.addSlide();
  oSlide.background = { color: THEME.navy };
  oSlide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.08, fill: { color: THEME.teal } });
  oSlide.addText('💡', { x: 0, y: 0.5, w: '100%', fontSize: 36, align: 'center' });
  oSlide.addText('OVERALL INSIGHTS & FUTURE DIRECTIONS', { x: 1, y: 1.2, w: 11.33, fontSize: 18, color: THEME.seafoam, align: 'center', fontFace: FONT.header, bold: true, charSpacing: 2 });
  oSlide.addText('綜合啟示與未來研究方向', { x: 1, y: 1.7, w: 11.33, fontSize: 14, color: THEME.mutedText, align: 'center', fontFace: FONT.cjk });
  oSlide.addShape(pptx.ShapeType.rect, { x: 4.5, y: 2.1, w: 4.33, h: 0.02, fill: { color: THEME.teal } });
  oSlide.addText(overallInsights || '(No insights)', { x: 1, y: 2.4, w: 11.33, fontSize: 10, color: THEME.lightText, lineSpacingMultiple: 1.5 });
  oSlide.addShape(pptx.ShapeType.rect, { x: 0, y: 7.42, w: 13.33, h: 0.08, fill: { color: THEME.teal } });

  // ═══ BACK COVER ═══
  const back = pptx.addSlide();
  back.background = { color: THEME.navy };
  back.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.08, fill: { color: THEME.teal } });
  back.addShape(pptx.ShapeType.rect, { x: 4.5, y: 2.5, w: 4.33, h: 0.04, fill: { color: THEME.teal } });
  back.addText('Thank You', { x: 1, y: 2.8, w: 11.33, fontSize: 40, color: THEME.white, align: 'center', fontFace: FONT.header, bold: true });
  back.addText('謝謝', { x: 1, y: 3.7, w: 11.33, fontSize: 28, color: THEME.seafoam, align: 'center', fontFace: FONT.cjk });
  back.addShape(pptx.ShapeType.rect, { x: 4.5, y: 4.4, w: 4.33, h: 0.04, fill: { color: THEME.teal } });
  back.addText('Colorectal Surgery Weekly Digest', { x: 1, y: 4.7, w: 11.33, fontSize: 14, color: THEME.mutedText, align: 'center' });
  back.addText('Sources: PubMed, Google Scholar · Translations: AI-assisted', { x: 1, y: 5.3, w: 11.33, fontSize: 10, color: THEME.mutedText, align: 'center' });
  back.addShape(pptx.ShapeType.rect, { x: 0, y: 7.42, w: 13.33, h: 0.08, fill: { color: THEME.teal } });

  // Save
  const outDir = path.join(__dirname, '..', 'docs');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const pptxPath = path.join(outDir, 'latest-digest.pptx');
  return pptx.writeFile({ fileName: pptxPath }).then(() => {
    console.log(`[PPTX] Saved: ${pptxPath}`);
    return pptxPath;
  });
}

function formatAuthors(a) {
  if (!a.authors || a.authors.length === 0) return 'Unknown';
  const display = a.authors.slice(0, 3).join(', ');
  if (a.authorCount > 3) return `${display} et al.`;
  return display;
}

module.exports = { generatePptx };
