import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendPasswordResetEmail(email, resetLink) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Reset Your Password',
      text: `Click the following link to reset your password: ${resetLink}\n\nThis link will expire in 1 hour.`,
      html: `
        <h1>Reset Your Password</h1>
        <p>Click the following link to reset your password:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}

// Test the email configuration on startup
if (process.env.NODE_ENV === 'development') {
  transporter.verify((error) => {
    if (error) {
      console.error('Email configuration error:', error);
    } else {
      console.log('Email server is ready to send messages');
    }
  });
} 