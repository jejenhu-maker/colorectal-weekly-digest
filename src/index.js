// index.js — main pipeline: fetch → enrich → rank → translate → insights → HTML page + email
const { fetchPubmed } = require('./fetchPubmed');
const { fetchScholar } = require('./fetchScholar');
const { enrichArticle } = require('./enrich');
const { rankArticles } = require('./rank');
const { translateAll } = require('./translate');
const { generateInsights } = require('./generateInsights');
const { renderHtml } = require('./renderHtml');
const { generatePage } = require('./generatePage');
const { generatePptx } = require('./generatePptx');
const { sendEmail } = require('./sendEmail');
const fs = require('fs');
const path = require('path');

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  console.log('=== Colorectal Weekly Digest ===');
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Time: ${new Date().toISOString()}\n`);

  // Step 1: Fetch from all sources
  console.log('── Step 1: Fetching papers ──');
  const [pubmedArticles, scholarArticles] = await Promise.all([
    fetchPubmed(),
    fetchScholar(),
  ]);
  console.log(`  PubMed: ${pubmedArticles.length}, Scholar: ${scholarArticles.length}`);

  const allArticles = [...pubmedArticles, ...scholarArticles];
  if (allArticles.length === 0) {
    console.log('No articles found this week. Exiting.');
    return;
  }

  // Step 2: Enrich
  console.log('\n── Step 2: Enriching ──');
  allArticles.forEach(enrichArticle);
  const withIF = allArticles.filter(a => a.impactFactor > 0).length;
  const withAsia = allArticles.filter(a => a.isAsiaPriority).length;
  console.log(`  IF matched: ${withIF}, Asia priority: ${withAsia}`);

  // Step 3: Rank & pick top 10
  console.log('\n── Step 3: Ranking ──');
  const top = rankArticles(allArticles);
  console.log(`  Selected top ${top.length} papers:`);
  top.forEach((a, i) => {
    console.log(`    ${i + 1}. [${a.score}pts] IF=${a.impactFactor || '?'} ${a.studyType} ${a.isAsiaPriority ? '🌏' : ''} — ${a.title.substring(0, 70)}…`);
  });

  // Step 4: Translate abstracts
  console.log('\n── Step 4: Translating ──');
  await translateAll(top);

  // Step 5: Generate insights
  console.log('\n── Step 5: Generating insights ──');
  const { overallInsights } = await generateInsights(top);

  // Step 6: Generate interactive page (for GitHub Pages)
  console.log('\n── Step 6: Generating interactive page ──');
  generatePage(top, overallInsights);

  console.log('\n── Step 6b: Generating PPTX ──');
  const weekRange = `${new Date(Date.now() - 7*86400000).toISOString().slice(0,10)} — ${new Date().toISOString().slice(0,10)}`;
  await generatePptx(top, overallInsights, weekRange);

  // Step 7: Render email HTML
  console.log('\n── Step 7: Rendering email HTML ──');
  const emailHtml = renderHtml(top);

  // Save local copy
  const outDir = path.join(__dirname, '..', 'output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const htmlPath = path.join(outDir, `digest-${new Date().toISOString().slice(0,10)}.html`);
  fs.writeFileSync(htmlPath, emailHtml, 'utf-8');

  // Step 8: Send email
  if (dryRun) {
    console.log('\n── Step 8: SKIPPED (dry run) ──');
    console.log(`  Email preview: ${htmlPath}`);
    console.log(`  Interactive page: docs/index.html`);
    console.log('  Would send to:', require('./config').email.to);
  } else {
    console.log('\n── Step 8: Sending email ──');
    await sendEmail(emailHtml);
  }

  console.log('\n=== Done ===');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
