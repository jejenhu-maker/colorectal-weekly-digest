// generatePage.js — generate the interactive GitHub Pages site with checkboxes + PPT generation
const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');

/**
 * Generate a self-contained interactive HTML page.
 * - Embeds article data as JSON
 * - Checkboxes for selection
 * - "Generate PPT" button using client-side pptxgenjs
 */
function generatePage(articles, overallInsights) {
  const now = dayjs();
  const weekStart = now.subtract(7, 'day').format('YYYY-MM-DD');
  const weekEnd = now.format('YYYY-MM-DD');

  // Prepare serializable data
  const data = articles.map((a, i) => ({
    id: i,
    title: a.title,
    journal: a.journal || a.journalAbbr || 'Unknown',
    impactFactor: a.impactFactor || 0,
    studyType: a.studyType || 'Other',
    isAsiaPriority: a.isAsiaPriority || false,
    countries: a.countries || [],
    pubDate: a.pubDate || 'N/A',
    authors: (a.authors || []).slice(0, 5).join(', ') + (a.authorCount > 5 ? ' et al.' : ''),
    abstract: a.abstract || '',
    abstractZh: a.abstractZh || '',
    doi: a.doi || '',
    pmid: a.pmid || '',
    link: a.doi ? `https://doi.org/${a.doi}` : a.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${a.pmid}/` : a.link || '#',
    insight: a.insight || '',
    score: a.score || 0,
  }));

  const html = buildPageHtml(data, overallInsights, weekStart, weekEnd, now.year());

  // Write to docs/ for GitHub Pages
  const docsDir = path.join(__dirname, '..', 'docs');
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

  const pagePath = path.join(docsDir, 'index.html');
  fs.writeFileSync(pagePath, html, 'utf-8');
  console.log(`[Page] Saved interactive page: ${pagePath}`);

  // Also save archive copy
  const archivePath = path.join(docsDir, `digest-${weekEnd}.html`);
  fs.writeFileSync(archivePath, html, 'utf-8');

  return pagePath;
}

function buildPageHtml(data, overallInsights, weekStart, weekEnd, year) {
  return `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>🔬 Colorectal Weekly Digest — ${weekEnd}</title>
<script src="https://cdn.jsdelivr.net/gh/nicholasgasior/PptxGenJS@3.12.0/dist/pptxgen.bundle.js"><\/script>
<style>
  :root {
    --blue: #2563eb;
    --blue-light: #dbeafe;
    --slate-50: #f8fafc;
    --slate-100: #f1f5f9;
    --slate-200: #e2e8f0;
    --slate-400: #94a3b8;
    --slate-500: #64748b;
    --slate-600: #475569;
    --slate-700: #334155;
    --slate-900: #0f172a;
    --green: #065f46;
    --green-light: #d1fae5;
    --amber: #92400e;
    --amber-light: #fef3c7;
    --purple: #6b21a8;
    --purple-light: #f3e8ff;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans TC', sans-serif;
    background: var(--slate-50);
    color: var(--slate-900);
    line-height: 1.6;
  }
  .container { max-width: 780px; margin: 0 auto; padding: 20px; }
  .header {
    text-align: center;
    padding: 40px 20px 30px;
    border-bottom: 3px solid var(--blue);
    margin-bottom: 24px;
  }
  .header h1 { font-size: 26px; color: #1e3a5f; }
  .header .subtitle { font-size: 16px; color: var(--slate-500); margin-top: 4px; }
  .header .date { font-size: 14px; color: var(--slate-400); margin-top: 10px; }

  .toolbar {
    background: white;
    border: 1px solid var(--slate-200);
    border-radius: 10px;
    padding: 16px 20px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    position: sticky;
    top: 0;
    z-index: 10;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  .toolbar .count { font-size: 14px; color: var(--slate-600); }
  .toolbar button {
    background: var(--blue);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .toolbar button:disabled { opacity: 0.4; cursor: not-allowed; }
  .toolbar button:hover:not(:disabled) { opacity: 0.85; }
  .toolbar .select-all {
    background: transparent;
    color: var(--blue);
    border: 1px solid var(--blue);
    padding: 8px 14px;
    font-size: 13px;
  }

  .paper {
    background: white;
    border: 1px solid var(--slate-200);
    border-radius: 10px;
    padding: 18px 20px;
    margin-bottom: 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
    cursor: pointer;
  }
  .paper:hover { border-color: var(--blue); }
  .paper.selected { border-color: var(--blue); box-shadow: 0 0 0 2px var(--blue-light); }

  .paper-top {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  .paper-top input[type=checkbox] {
    width: 20px;
    height: 20px;
    margin-top: 3px;
    accent-color: var(--blue);
    flex-shrink: 0;
    cursor: pointer;
  }
  .paper-num {
    background: var(--blue);
    color: white;
    font-weight: bold;
    font-size: 13px;
    min-width: 26px;
    height: 26px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .paper-title {
    font-size: 15px;
    font-weight: 600;
    color: #1e3a5f;
    flex: 1;
  }
  .paper-title a { color: inherit; text-decoration: none; }
  .paper-title a:hover { text-decoration: underline; }

  .badges { display: flex; gap: 5px; margin: 8px 0; flex-wrap: wrap; padding-left: 58px; }
  .badge {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 600;
  }
  .badge-if { background: var(--blue-light); color: #1d4ed8; }
  .badge-type { background: var(--amber-light); color: var(--amber); }
  .badge-asia { background: var(--green-light); color: var(--green); }
  .badge-country { background: var(--purple-light); color: var(--purple); }

  .meta {
    font-size: 12px;
    color: var(--slate-500);
    padding-left: 58px;
    margin-bottom: 8px;
  }

  .section-label {
    font-size: 11px;
    font-weight: 700;
    color: var(--slate-600);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 10px 0 4px;
    padding-left: 58px;
  }
  .abstract-text {
    font-size: 13px;
    color: var(--slate-700);
    text-align: justify;
    padding-left: 58px;
    line-height: 1.7;
  }
  .abstract-zh {
    font-size: 13px;
    color: var(--slate-600);
    text-align: justify;
    background: var(--slate-50);
    padding: 8px 12px 8px 14px;
    margin-left: 58px;
    border-radius: 4px;
    border-left: 3px solid var(--blue);
    line-height: 1.7;
  }
  .links {
    font-size: 12px;
    padding-left: 58px;
    margin-top: 8px;
  }
  .links a { color: var(--blue); margin-right: 14px; }

  .footer {
    text-align: center;
    font-size: 12px;
    color: var(--slate-400);
    margin-top: 40px;
    padding: 16px 0;
    border-top: 1px solid var(--slate-200);
  }

  .generating-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 100;
    justify-content: center;
    align-items: center;
  }
  .generating-overlay.active { display: flex; }
  .generating-box {
    background: white;
    padding: 30px 40px;
    border-radius: 12px;
    text-align: center;
    font-size: 16px;
  }
  .spinner {
    width: 40px; height: 40px;
    border: 4px solid var(--slate-200);
    border-top-color: var(--blue);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 16px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 600px) {
    .badges, .meta, .section-label, .abstract-text, .links { padding-left: 32px; }
    .abstract-zh { margin-left: 32px; }
    .paper-num { display: none; }
  }
</style>
</head>
<body>

<div class="container">
  <div class="header">
    <h1>🔬 Colorectal Surgery Weekly Digest</h1>
    <div class="subtitle">大腸直腸外科文獻週報</div>
    <div class="date">${weekStart} — ${weekEnd}</div>
  </div>

  <div class="toolbar">
    <button class="select-all" onclick="toggleAll()">全選 / 取消</button>
    <span class="count" id="countLabel">已選 0 篇</span>
    <button id="genBtn" disabled onclick="generatePPT()">📊 產生簡報 (.pptx)</button>
  </div>

  <div id="papers">
${data.map((p, i) => `
    <div class="paper" id="paper-${p.id}" onclick="togglePaper(event, ${p.id})">
      <div class="paper-top">
        <input type="checkbox" id="cb-${p.id}" onclick="event.stopPropagation(); updateCount();">
        <div class="paper-num">${i + 1}</div>
        <div class="paper-title"><a href="${p.link}" target="_blank" onclick="event.stopPropagation();">${p.title}</a></div>
      </div>
      <div class="badges">
        ${p.impactFactor ? `<span class="badge badge-if">IF ${p.impactFactor.toFixed ? p.impactFactor.toFixed(1) : p.impactFactor}</span>` : ''}
        ${p.studyType !== 'Other' ? `<span class="badge badge-type">${p.studyType}</span>` : ''}
        ${p.isAsiaPriority ? '<span class="badge badge-asia">🌏 Asia</span>' : ''}
        ${(p.countries || []).map(c => `<span class="badge badge-country">${c}</span>`).join('')}
      </div>
      <div class="meta">
        📰 ${p.journal} &nbsp; 📅 ${p.pubDate} &nbsp; 👥 ${p.authors}
      </div>
      <div class="section-label">Abstract</div>
      <div class="abstract-text">${p.abstract}</div>
      <div class="section-label">中文摘要</div>
      <div class="abstract-zh">${p.abstractZh}</div>
      <div class="links">
        ${p.doi ? `<a href="https://doi.org/${p.doi}" target="_blank">DOI ↗</a>` : ''}
        ${p.pmid ? `<a href="https://pubmed.ncbi.nlm.nih.gov/${p.pmid}/" target="_blank">PubMed ↗</a>` : ''}
      </div>
    </div>
`).join('')}
  </div>

  <div class="footer">
    Generated automatically · Sources: PubMed, Google Scholar · Translations: AI-assisted<br>
    © ${year} Colorectal Weekly Digest
  </div>
</div>

<div class="generating-overlay" id="overlay">
  <div class="generating-box">
    <div class="spinner"></div>
    正在產生簡報…<br>Generating presentation…
  </div>
</div>

<script>
// Embedded article data
const ARTICLES = ${JSON.stringify(data, null, 2)};
const OVERALL_INSIGHTS = ${JSON.stringify(overallInsights)};
const WEEK_RANGE = "${weekStart} — ${weekEnd}";

function togglePaper(e, id) {
  if (e.target.tagName === 'A' || e.target.tagName === 'INPUT') return;
  const cb = document.getElementById('cb-' + id);
  cb.checked = !cb.checked;
  updateCount();
}

function updateCount() {
  const checked = getSelected();
  document.getElementById('countLabel').textContent = '已選 ' + checked.length + ' 篇';
  document.getElementById('genBtn').disabled = checked.length === 0;
  // Visual feedback
  ARTICLES.forEach(a => {
    const el = document.getElementById('paper-' + a.id);
    const cb = document.getElementById('cb-' + a.id);
    el.classList.toggle('selected', cb.checked);
  });
}

function toggleAll() {
  const checked = getSelected();
  const shouldCheck = checked.length < ARTICLES.length;
  ARTICLES.forEach(a => {
    document.getElementById('cb-' + a.id).checked = shouldCheck;
  });
  updateCount();
}

function getSelected() {
  return ARTICLES.filter(a => document.getElementById('cb-' + a.id).checked);
}

async function generatePPT() {
  const selected = getSelected();
  if (selected.length === 0) return;

  document.getElementById('overlay').classList.add('active');

  try {
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5 inches
    pptx.author = 'Colorectal Weekly Digest';
    pptx.subject = 'Weekly Literature Review';

    const COLORS = {
      blue: '2563EB',
      darkBlue: '1E3A5F',
      white: 'FFFFFF',
      slate50: 'F8FAFC',
      slate200: 'E2E8F0',
      slate500: '64748B',
      slate700: '334155',
      slate900: '0F172A',
      accent: '3B82F6',
    };

    // ─── COVER SLIDE ───
    const cover = pptx.addSlide();
    cover.background = { color: COLORS.darkBlue };
    cover.addText('🔬', { x: 0, y: 1.5, w: '100%', fontSize: 60, align: 'center' });
    cover.addText('Colorectal Surgery\\nWeekly Digest', {
      x: 1, y: 2.5, w: 11.33, fontSize: 36, color: COLORS.white,
      align: 'center', fontFace: 'Arial', bold: true,
    });
    cover.addText('大腸直腸外科文獻週報', {
      x: 1, y: 4.2, w: 11.33, fontSize: 20, color: COLORS.accent,
      align: 'center', fontFace: 'Microsoft JhengHei',
    });
    cover.addText(WEEK_RANGE, {
      x: 1, y: 5.2, w: 11.33, fontSize: 16, color: COLORS.slate500,
      align: 'center',
    });
    cover.addText('Selected ' + selected.length + ' papers for review', {
      x: 1, y: 5.8, w: 11.33, fontSize: 14, color: COLORS.slate500,
      align: 'center',
    });

    // ─── TABLE OF CONTENTS ───
    const toc = pptx.addSlide();
    toc.addText('📋 Contents / 目錄', {
      x: 0.8, y: 0.4, w: 11, fontSize: 24, color: COLORS.darkBlue, bold: true,
    });
    selected.forEach((a, i) => {
      const y = 1.3 + i * 0.5;
      toc.addText((i + 1) + '. ' + a.title.substring(0, 80) + (a.title.length > 80 ? '…' : ''), {
        x: 1, y, w: 11, fontSize: 12, color: COLORS.slate700,
        hyperlink: { slide: 3 + i * 2 },
      });
    });

    // ─── PAPER SLIDES (2 slides per paper: overview + abstract) ───
    selected.forEach((a, i) => {
      // Slide A: Overview
      const sA = pptx.addSlide();
      sA.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: 0.4, h: 7.5, fill: { color: COLORS.blue },
      });
      sA.addText('Paper ' + (i + 1), {
        x: 0.6, y: 0.3, w: 2, fontSize: 12, color: COLORS.blue, bold: true,
      });
      sA.addText(a.title, {
        x: 0.6, y: 0.7, w: 12, fontSize: 18, color: COLORS.darkBlue, bold: true,
        fontFace: 'Arial',
      });
      // Meta badges line
      let meta = a.journal;
      if (a.impactFactor) meta += ' · IF ' + (typeof a.impactFactor === 'number' ? a.impactFactor.toFixed(1) : a.impactFactor);
      if (a.studyType !== 'Other') meta += ' · ' + a.studyType;
      if (a.isAsiaPriority) meta += ' · 🌏 Asia';
      sA.addText(meta, {
        x: 0.6, y: 1.6, w: 12, fontSize: 11, color: COLORS.slate500,
      });
      sA.addText(a.pubDate + ' · ' + a.authors, {
        x: 0.6, y: 1.95, w: 12, fontSize: 10, color: COLORS.slate500,
      });

      // Abstract (EN)
      sA.addText('Abstract', {
        x: 0.6, y: 2.5, w: 5.5, fontSize: 12, color: COLORS.blue, bold: true,
      });
      sA.addText(a.abstract.substring(0, 800) + (a.abstract.length > 800 ? '…' : ''), {
        x: 0.6, y: 2.9, w: 5.8, fontSize: 9, color: COLORS.slate700,
        lineSpacingMultiple: 1.3, valign: 'top',
      });

      // Abstract (ZH)
      sA.addText('中文摘要', {
        x: 6.8, y: 2.5, w: 5.5, fontSize: 12, color: COLORS.blue, bold: true,
      });
      sA.addText(a.abstractZh.substring(0, 800) + (a.abstractZh.length > 800 ? '…' : ''), {
        x: 6.8, y: 2.9, w: 5.8, fontSize: 9, color: COLORS.slate700,
        fontFace: 'Microsoft JhengHei',
        lineSpacingMultiple: 1.3, valign: 'top',
      });

      // Slide B: Insight + Future
      const sB = pptx.addSlide();
      sB.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: 0.4, h: 7.5, fill: { color: COLORS.blue },
      });
      sB.addText('Paper ' + (i + 1) + ' — Insights', {
        x: 0.6, y: 0.3, w: 6, fontSize: 12, color: COLORS.blue, bold: true,
      });
      sB.addText(a.title.substring(0, 90) + (a.title.length > 90 ? '…' : ''), {
        x: 0.6, y: 0.7, w: 12, fontSize: 14, color: COLORS.darkBlue, bold: true,
      });

      // Insight text
      const insight = a.insight || '(No insight generated)';
      sB.addText(insight, {
        x: 0.6, y: 1.4, w: 12, fontSize: 10, color: COLORS.slate700,
        lineSpacingMultiple: 1.4, valign: 'top',
      });
    });

    // ─── OVERALL INSIGHTS SLIDE ───
    const insightSlide = pptx.addSlide();
    insightSlide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: 13.33, h: 1.2, fill: { color: COLORS.darkBlue },
    });
    insightSlide.addText('💡 Overall Insights & Future Directions\\n綜合啟示與未來研究方向', {
      x: 0.6, y: 0.15, w: 12, fontSize: 20, color: COLORS.white, bold: true,
    });
    insightSlide.addText(OVERALL_INSIGHTS || '(No overall insights generated)', {
      x: 0.6, y: 1.5, w: 12, fontSize: 10, color: COLORS.slate700,
      lineSpacingMultiple: 1.4, valign: 'top',
    });

    // ─── BACK COVER ───
    const back = pptx.addSlide();
    back.background = { color: COLORS.darkBlue };
    back.addText('Thank You\\n謝謝', {
      x: 1, y: 2, w: 11.33, fontSize: 40, color: COLORS.white,
      align: 'center', bold: true,
    });
    back.addText('Colorectal Surgery Weekly Digest\\n大腸直腸外科文獻週報', {
      x: 1, y: 4, w: 11.33, fontSize: 18, color: COLORS.accent,
      align: 'center',
    });
    back.addText('Sources: PubMed, Google Scholar · Translations: AI-assisted', {
      x: 1, y: 5.5, w: 11.33, fontSize: 12, color: COLORS.slate500,
      align: 'center',
    });

    // Generate & download
    const fileName = 'Colorectal-Digest-' + WEEK_RANGE.replace(/ — /g, '-to-') + '.pptx';
    await pptx.writeFile({ fileName });

  } catch (err) {
    alert('Error generating PPT: ' + err.message);
    console.error(err);
  } finally {
    document.getElementById('overlay').classList.remove('active');
  }
}
<\/script>
</body>
</html>`;
}

module.exports = { generatePage };
