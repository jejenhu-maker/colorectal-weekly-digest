require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const t = nodemailer.createTransport({
  host: 'smtp.gmail.com', port: 465, secure: true,
  auth: { user: 'jejen.hu@gmail.com', pass: process.env.EMAIL_PASS }
});

const html = fs.readFileSync(path.join(__dirname, 'output', 'digest-2026-04-18.html'), 'utf-8');

t.sendMail({
  from: '"Colorectal Weekly Digest" <jejen.hu@gmail.com>',
  to: 'jejen.hu@gmail.com',
  subject: '🔬 大腸直腸外科文獻週報 — 2026-04-18',
  html: html
}).then(info => console.log('Sent:', info.messageId))
  .catch(err => console.error('Error:', err.message));
