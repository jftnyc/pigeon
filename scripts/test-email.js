// Test script for email functionality
import { sendPasswordResetEmail } from '../lib/email.js';

async function testEmail() {
  console.log('Testing email functionality...');
  
  try {
    const result = await sendPasswordResetEmail(
      'test@example.com',
      'http://localhost:3000/reset-password?token=test-token'
    );
    
    if (result) {
      console.log('✅ Email sent successfully!');
    } else {
      console.error('❌ Failed to send email.');
    }
  } catch (error) {
    console.error('❌ Error testing email:', error);
  }
  
  process.exit(0);
}

testEmail(); 