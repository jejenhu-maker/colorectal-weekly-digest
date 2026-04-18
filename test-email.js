require('dotenv').config();
const nodemailer = require('nodemailer');
const t = nodemailer.createTransport({
  host: 'smtp.gmail.com', port: 465, secure: true,
  auth: { user: 'jejen.hu@gmail.com', pass: process.env.EMAIL_PASS }
});
t.sendMail({
  from: '"Colorectal Weekly Digest" <jejen.hu@gmail.com>',
  to: 'jejen.hu@gmail.com',
  subject: 'Test - Colorectal Weekly Digest',
  html: '<h2>This is a test</h2><p>If you see this, email works.</p>'
}).then(info => console.log('Sent:', info.messageId))
  .catch(err => console.error('Error:', err.message));
