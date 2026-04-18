// renderPdf.js — render HTML template → PDF using Puppeteer
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const puppeteer = require('puppeteer');
const dayjs = require('dayjs');

/**
 * Render articles into a PDF file.
 * @param {Array} articles - enriched, translated, ranked articles
 * @returns {Promise<string>} path to generated PDF
 */
async function renderPdf(articles) {
  // Load template
  const templatePath = path.join(__dirname, '..', 'templates', 'digest.html');
  const templateSrc = fs.readFileSync(templatePath, 'utf-8');
  const template = Handlebars.compile(templateSrc);

  const now = dayjs();
  const weekStart = now.subtract(7, 'day').format('YYYY-MM-DD');
  const weekEnd = now.format('YYYY-MM-DD');

  // Prepare template data
  const papers = articles.map((a, i) => ({
    num: i + 1,
    title: a.title,
    journal: a.journal || a.journalAbbr || 'Unknown Journal',
    impactFactor: a.impactFactor ? a.impactFactor.toFixed(1) : null,
    studyType: a.studyType !== 'Other' ? a.studyType : null,
    isAsiaPriority: a.isAsiaPriority,
    countries: a.countries || [],
    pubDate: a.pubDate || 'N/A',
    authorList: formatAuthors(a),
    abstract: a.abstract,
    abstractZh: a.abstractZh || '（無中文摘要）',
    doi: a.doi,
  }));

  const html = template({
    weekRange: `${weekStart} — ${weekEnd}`,
    year: now.year(),
    papers,
  });

  // Generate PDF
  const outDir = path.join(__dirname, '..', 'output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const pdfPath = path.join(outDir, `colorectal-digest-${weekEnd}.pdf`);

  console.log('[PDF] Launching Puppeteer…');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
  });
  await browser.close();

  console.log(`[PDF] Saved: ${pdfPath}`);
  return pdfPath;
}

function formatAuthors(article) {
  if (!article.authors || article.authors.length === 0) return 'Unknown';
  const display = article.authors.slice(0, 3).join(', ');
  if (article.authorCount > 3) return `${display} et al.`;
  return display;
}

module.exports = { renderPdf };
