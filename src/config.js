// config.js — centralised settings + env vars
require('dotenv').config();

module.exports = {
  // ── PubMed ──
  pubmed: {
    baseUrl: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils',
    // Optional NCBI API key (raises rate limit from 3→10 req/s)
    apiKey: process.env.NCBI_API_KEY || '',
    // Search queries (OR-combined)
    queries: [
      // Core: CRC peritoneal metastasis
      '(colorectal cancer[MeSH] OR colorectal neoplasms[MeSH]) AND (peritoneal metastasis OR peritoneal carcinomatosis OR HIPEC OR CRS)',
      // Basic study + inflammation
      '(colorectal[tiab]) AND (inflammation[MeSH] OR inflammatory[tiab]) AND (basic research OR in vitro OR in vivo OR mouse model OR cell line)',
    ],
    maxResults: 60, // fetch more, then rank down to 10
    dayRange: 7,    // last 7 days
  },

  // ── Google Scholar (via SerpAPI) ──
  serpapi: {
    apiKey: process.env.SERPAPI_KEY || '',
    queries: [
      'colorectal cancer peritoneal metastasis',
      'colorectal inflammation basic study',
    ],
    maxResults: 20,
  },

  // ── Impact Factor ──
  ifThreshold: 10, // prefer IF >= 10

  // ── Asia priority countries ──
  asiaCountries: ['japan', 'taiwan', 'korea', 'south korea', 'republic of korea'],

  // ── Study type keywords (for boosting) ──
  rctKeywords: [
    'randomized controlled trial', 'randomised controlled trial',
    'phase 2', 'phase ii', 'phase 3', 'phase iii', 'rct',
  ],

  // ── Output ──
  maxPapers: 10,

  // ── OpenAI (translation) ──
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-4o-mini', // cheaper, good enough for translation
  },

  // ── Email ──
  email: {
    from: process.env.EMAIL_FROM || 'jejen.hu@gmail.com',
    to: process.env.EMAIL_TO || 'Crschang001@gmail.com',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 465,
    smtpUser: process.env.EMAIL_FROM || 'jejen.hu@gmail.com',
    smtpPass: process.env.EMAIL_PASS || '',
  },
};
