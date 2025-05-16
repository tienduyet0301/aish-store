import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
  debug: true,
  logger: true
});

transporter.verify(function (error, success) {
  if (error) {
    console.error('SMTP configuration error:', error);
  } else {
    console.log('SMTP server is ready to take our messages');
  }
});

export async function sendMail(to: string, subject: string, text: string, html?: string) {
  try {
    console.log('Attempting to send email to:', to);
    console.log('Using email account:', process.env.EMAIL_USER);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    };

    console.log('Mail options:', {
      ...mailOptions,
      auth: { user: process.env.EMAIL_USER, pass: '***' }
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Detailed error sending email:', error);
    return false;
  }
} 