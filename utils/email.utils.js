const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1 Create a transporter
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2 Define email options
  const mailOptions = {
    from: 'Ewerton Franco <hello@jonas.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3 Send the email
  await transport.sendMail(mailOptions);
};

module.exports = sendEmail;
