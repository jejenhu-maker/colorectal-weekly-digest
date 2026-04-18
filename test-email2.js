require('dotenv').config();
const nodemailer = require('nodemailer');
const t = nodemailer.createTransport({
  host: 'smtp.gmail.com', port: 465, secure: true,
  auth: { user: 'jejen.hu@gmail.com', pass: process.env.EMAIL_PASS }
});
t.sendMail({
  from: '"JJ Hu" <jejen.hu@gmail.com>',
  to: 'crschang001@gmail.com',
  subject: 'Test from JJ',
  text: 'Hi, this is a test email from JJ. Please reply if you see this.'
}).then(info => console.log('Sent:', info.messageId))
  .catch(err => console.error('Error:', err.message));
