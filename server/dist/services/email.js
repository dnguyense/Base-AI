"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSubscriptionExpiryEmail = exports.sendPaymentReceiptEmail = exports.sendDownloadReadyEmail = exports.sendSubscriptionEmail = exports.testEmailConnection = exports.sendWelcomeEmail = exports.sendPasswordResetEmail = exports.sendVerificationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587');
const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASS = process.env.EMAIL_PASS || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@pdfcompressor.pro';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const createTransporter = () => {
    console.log('🔧 Email Config Debug:');
    console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
    console.log('🔧 EMAIL_HOST:', EMAIL_HOST);
    console.log('🔧 EMAIL_PORT:', EMAIL_PORT);
    console.log('🔧 EMAIL_USER:', EMAIL_USER);
    console.log('🔧 EMAIL_PASS:', EMAIL_PASS ? 'Set' : 'Not Set');
    console.log('🔧 EMAIL_FROM:', EMAIL_FROM);
    if (process.env.NODE_ENV === 'test') {
        console.log('🧪 Using test email transporter (mock)');
        return nodemailer_1.default.createTransport({
            streamTransport: true,
            newline: 'unix',
            buffer: true
        });
    }
    return nodemailer_1.default.createTransport({
        host: EMAIL_HOST,
        port: EMAIL_PORT,
        secure: EMAIL_PORT === 465,
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS,
        },
    });
};
const getEmailTemplate = (type, data) => {
    const baseStyles = `
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
      .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
      .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
    </style>
  `;
    if (type === 'verification') {
        return `
      <!DOCTYPE html>
      <html>
      <head>${baseStyles}</head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📄 PDF Compressor Pro</h1>
            <h2>Welcome aboard!</h2>
          </div>
          <div class="content">
            <h3>Please verify your email address</h3>
            <p>Hi there!</p>
            <p>Thanks for signing up for PDF Compressor Pro. To get started, please verify your email address by clicking the button below:</p>
            <p style="text-align: center;">
              <a href="${CLIENT_URL}/verify-email/${data.token}" class="button">Verify Email Address</a>
            </p>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px;">
              ${CLIENT_URL}/verify-email/${data.token}
            </p>
            <p>This link will expire in 24 hours for security reasons.</p>
            <p>If you didn't create an account with us, please ignore this email.</p>
            <div class="footer">
              <p>Best regards,<br>The PDF Compressor Pro Team</p>
              <p>This is an automated email. Please don't reply to this message.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    }
    if (type === 'password-reset') {
        return `
      <!DOCTYPE html>
      <html>
      <head>${baseStyles}</head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📄 PDF Compressor Pro</h1>
            <h2>Password Reset Request</h2>
          </div>
          <div class="content">
            <h3>Reset your password</h3>
            <p>Hi there!</p>
            <p>We received a request to reset your password for your PDF Compressor Pro account. Click the button below to reset it:</p>
            <p style="text-align: center;">
              <a href="${CLIENT_URL}/reset-password/${data.token}" class="button">Reset Password</a>
            </p>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px;">
              ${CLIENT_URL}/reset-password/${data.token}
            </p>
            <p><strong>This link will expire in 10 minutes</strong> for security reasons.</p>
            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
            <div class="footer">
              <p>Best regards,<br>The PDF Compressor Pro Team</p>
              <p>This is an automated email. Please don't reply to this message.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    }
    if (type === 'download-ready') {
        return `
      <!DOCTYPE html>
      <html>
      <head>${baseStyles}</head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📄 PDF Compressor Pro</h1>
            <h2>Your PDF is Ready! 🎉</h2>
          </div>
          <div class="content">
            <h3>Download your compressed PDF</h3>
            <p>Hi${data.firstName ? ` ${data.firstName}` : ''}!</p>
            <p>Great news! Your PDF compression is complete and ready for download.</p>
            
            <div style="background: #e8f5e8; border: 1px solid #4caf50; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #2e7d32;">📊 Compression Results</h4>
              <p style="margin: 5px 0;"><strong>File:</strong> ${data.fileName}</p>
              <p style="margin: 5px 0;"><strong>Original Size:</strong> ${data.originalSize}</p>
              <p style="margin: 5px 0;"><strong>Compressed Size:</strong> ${data.compressedSize}</p>
              <p style="margin: 5px 0;"><strong>Size Reduction:</strong> <span style="color: #4caf50; font-weight: bold;">${data.compressionRate}</span></p>
            </div>

            <p style="text-align: center;">
              <a href="${data.downloadLink}" class="button" style="background: #4caf50;">Download Compressed PDF</a>
            </p>

            <p><strong>Important:</strong> This download link will expire in <strong>24 hours</strong> for security reasons.</p>
            
            <p>If you have any questions or need assistance, don't hesitate to contact our support team.</p>
            
            <div class="footer">
              <p>Best regards,<br>The PDF Compressor Pro Team</p>
              <p>This is an automated email. Please don't reply to this message.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    }
    if (type === 'payment-receipt') {
        return `
      <!DOCTYPE html>
      <html>
      <head>${baseStyles}</head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📄 PDF Compressor Pro</h1>
            <h2>Payment Receipt 💳</h2>
          </div>
          <div class="content">
            <h3>Thank you for your payment!</h3>
            <p>Hi${data.firstName ? ` ${data.firstName}` : ''},</p>
            <p>We've successfully processed your payment. Here are the details:</p>
            
            <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h4 style="margin: 0 0 15px 0; color: #495057;">📄 Payment Details</h4>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;"><strong>Invoice ID:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; text-align: right;">${data.invoiceId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;"><strong>Subscription:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; text-align: right;">${data.planName} Plan (${data.interval}ly)</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;"><strong>Amount:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; text-align: right;">$${(data.amount / 100).toFixed(2)} ${data.currency.toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;"><strong>Payment Method:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; text-align: right;">**** **** **** ${data.last4}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;"><strong>Date:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; text-align: right;">${new Date(data.paymentDate).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Next Billing:</strong></td>
                  <td style="padding: 8px 0; text-align: right;">${new Date(data.nextBilling).toLocaleDateString()}</td>
                </tr>
              </table>
            </div>

            <p style="text-align: center;">
              <a href="${CLIENT_URL}/dashboard" class="button">View Dashboard</a>
            </p>

            <p style="font-size: 14px; color: #666;">
              You can download this receipt or view your billing history anytime from your account dashboard.
            </p>
            
            <div class="footer">
              <p>Best regards,<br>The PDF Compressor Pro Team</p>
              <p>This is an automated email. Please don't reply to this message.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    }
    if (type === 'subscription-expiry') {
        return `
      <!DOCTYPE html>
      <html>
      <head>${baseStyles}</head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📄 PDF Compressor Pro</h1>
            <h2>Subscription Expiring Soon ⏰</h2>
          </div>
          <div class="content">
            <h3>Don't lose access to your premium features</h3>
            <p>Hi${data.firstName ? ` ${data.firstName}` : ''},</p>
            <p>Your ${data.planName} subscription is set to expire soon, and we don't want you to lose access to your premium features!</p>
            
            <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #856404;">⚠️ Subscription Details</h4>
              <p style="margin: 5px 0;"><strong>Plan:</strong> ${data.planName} Plan</p>
              <p style="margin: 5px 0;"><strong>Expires on:</strong> ${new Date(data.expiryDate).toLocaleDateString()}</p>
              <p style="margin: 5px 0;"><strong>Days remaining:</strong> ${data.daysRemaining} days</p>
            </div>

            <h4>What you'll lose after expiration:</h4>
            <ul style="color: #dc3545;">
              ${data.planName === 'basic' ? `
                <li>20 compressions per day → Limited to 2 per day</li>
                <li>100 compressions per month → Limited to 5 per month</li>
                <li>Priority processing → Standard processing only</li>
                <li>Advanced compression settings → Basic settings only</li>
              ` : data.planName === 'pro' ? `
                <li>100 compressions per day → Limited to 2 per day</li>
                <li>1,000 compressions per month → Limited to 5 per month</li>
                <li>Batch processing → Single file only</li>
                <li>API access → No API access</li>
                <li>Priority support → Standard support only</li>
              ` : `
                <li>1,000 compressions per day → Limited to 2 per day</li>
                <li>10,000 compressions per month → Limited to 5 per month</li>
                <li>White-label solutions → Not available</li>
                <li>Custom integrations → Not available</li>
                <li>Dedicated support → Standard support only</li>
              `}
            </ul>

            <p style="text-align: center;">
              <a href="${CLIENT_URL}/billing" class="button" style="background: #ffc107; color: #212529;">Renew Subscription</a>
            </p>

            <p>Renewing now ensures uninterrupted access to all your premium features. If you have any questions about your subscription, our support team is here to help!</p>
            
            <div class="footer">
              <p>Best regards,<br>The PDF Compressor Pro Team</p>
              <p>This is an automated email. Please don't reply to this message.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    }
    return '';
};
const sendVerificationEmail = async (email, token) => {
    try {
        const transporter = createTransporter();
        const mailOptions = {
            from: EMAIL_FROM,
            to: email,
            subject: 'Verify your email address - PDF Compressor Pro',
            html: getEmailTemplate('verification', { token }),
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent:', info.messageId);
    }
    catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
};
exports.sendVerificationEmail = sendVerificationEmail;
const sendPasswordResetEmail = async (email, token) => {
    try {
        const transporter = createTransporter();
        const mailOptions = {
            from: EMAIL_FROM,
            to: email,
            subject: 'Reset your password - PDF Compressor Pro',
            html: getEmailTemplate('password-reset', { token }),
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent:', info.messageId);
    }
    catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendWelcomeEmail = async (email, firstName) => {
    try {
        const transporter = createTransporter();
        const mailOptions = {
            from: EMAIL_FROM,
            to: email,
            subject: 'Welcome to PDF Compressor Pro!',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .feature { display: flex; margin: 20px 0; }
            .feature-icon { margin-right: 15px; font-size: 24px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📄 PDF Compressor Pro</h1>
              <h2>Welcome${firstName ? `, ${firstName}` : ''}! 🎉</h2>
            </div>
            <div class="content">
              <p>Your email has been verified successfully! You're now ready to start compressing your PDF files.</p>
              
              <h3>What you can do now:</h3>
              <div class="feature">
                <div class="feature-icon">🗜️</div>
                <div>
                  <strong>Compress PDFs:</strong> Reduce file sizes by up to 90% while maintaining quality
                </div>
              </div>
              <div class="feature">
                <div class="feature-icon">⚡</div>
                <div>
                  <strong>Fast Processing:</strong> Most files are compressed within seconds
                </div>
              </div>
              <div class="feature">
                <div class="feature-icon">🔒</div>
                <div>
                  <strong>Secure & Private:</strong> Your files are automatically deleted after processing
                </div>
              </div>
              
              <p style="text-align: center; margin-top: 30px;">
                <a href="${CLIENT_URL}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
                  Start Compressing PDFs
                </a>
              </p>
              
              <p style="margin-top: 30px; color: #666;">
                Need help? Feel free to reach out to our support team anytime.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent:', info.messageId);
    }
    catch (error) {
        console.error('Error sending welcome email:', error);
        throw new Error('Failed to send welcome email');
    }
};
exports.sendWelcomeEmail = sendWelcomeEmail;
const testEmailConnection = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('Email service is ready');
        return true;
    }
    catch (error) {
        console.error('Email service error:', error);
        return false;
    }
};
exports.testEmailConnection = testEmailConnection;
const sendSubscriptionEmail = async (email, plan, amount, firstName) => {
    try {
        const transporter = createTransporter();
        const mailOptions = {
            from: EMAIL_FROM,
            to: email,
            subject: `Subscription Confirmed - ${plan.toUpperCase()} Plan`,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .success { background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📄 PDF Compressor Pro</h1>
              <h2>Subscription Confirmed! ✨</h2>
            </div>
            <div class="content">
              <div class="success">
                <h3>Welcome to ${plan.toUpperCase()} Plan!</h3>
                <p>Your subscription has been successfully activated.</p>
              </div>
              
              <p>Hi${firstName ? ` ${firstName}` : ''},</p>
              <p>Thank you for upgrading to our ${plan.toUpperCase()} plan! Your payment of $${(amount / 100).toFixed(2)} has been processed successfully.</p>
              
              <h3>Your new benefits include:</h3>
              ${plan === 'basic' ? `
                <ul>
                  <li>20 compressions per day</li>
                  <li>100 compressions per month</li>
                  <li>Priority processing</li>
                  <li>Advanced compression settings</li>
                </ul>
              ` : plan === 'pro' ? `
                <ul>
                  <li>100 compressions per day</li>
                  <li>1,000 compressions per month</li>
                  <li>Batch processing</li>
                  <li>API access</li>
                  <li>Priority support</li>
                </ul>
              ` : `
                <ul>
                  <li>1,000 compressions per day</li>
                  <li>10,000 compressions per month</li>
                  <li>White-label solutions</li>
                  <li>Custom integrations</li>
                  <li>Dedicated support</li>
                </ul>
              `}
              
              <p style="text-align: center; margin-top: 30px;">
                <a href="${CLIENT_URL}/dashboard" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
                  Go to Dashboard
                </a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('Subscription email sent:', info.messageId);
    }
    catch (error) {
        console.error('Error sending subscription email:', error);
        throw new Error('Failed to send subscription email');
    }
};
exports.sendSubscriptionEmail = sendSubscriptionEmail;
const sendDownloadReadyEmail = async (email, downloadData) => {
    try {
        const transporter = createTransporter();
        const mailOptions = {
            from: EMAIL_FROM,
            to: email,
            subject: '📄 Your compressed PDF is ready for download!',
            html: getEmailTemplate('download-ready', downloadData),
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('Download ready email sent:', info.messageId);
    }
    catch (error) {
        console.error('Error sending download ready email:', error);
        throw new Error('Failed to send download ready email');
    }
};
exports.sendDownloadReadyEmail = sendDownloadReadyEmail;
const sendPaymentReceiptEmail = async (email, receiptData) => {
    try {
        const transporter = createTransporter();
        const mailOptions = {
            from: EMAIL_FROM,
            to: email,
            subject: `Payment Receipt - ${receiptData.planName} Plan - PDF Compressor Pro`,
            html: getEmailTemplate('payment-receipt', receiptData),
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('Payment receipt email sent:', info.messageId);
    }
    catch (error) {
        console.error('Error sending payment receipt email:', error);
        throw new Error('Failed to send payment receipt email');
    }
};
exports.sendPaymentReceiptEmail = sendPaymentReceiptEmail;
const sendSubscriptionExpiryEmail = async (email, expiryData) => {
    try {
        const transporter = createTransporter();
        const mailOptions = {
            from: EMAIL_FROM,
            to: email,
            subject: `⏰ Your ${expiryData.planName} subscription expires in ${expiryData.daysRemaining} days`,
            html: getEmailTemplate('subscription-expiry', expiryData),
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('Subscription expiry email sent:', info.messageId);
    }
    catch (error) {
        console.error('Error sending subscription expiry email:', error);
        throw new Error('Failed to send subscription expiry email');
    }
};
exports.sendSubscriptionExpiryEmail = sendSubscriptionExpiryEmail;
exports.default = {
    sendVerificationEmail: exports.sendVerificationEmail,
    sendPasswordResetEmail: exports.sendPasswordResetEmail,
    sendWelcomeEmail: exports.sendWelcomeEmail,
    sendSubscriptionEmail: exports.sendSubscriptionEmail,
    sendDownloadReadyEmail: exports.sendDownloadReadyEmail,
    sendPaymentReceiptEmail: exports.sendPaymentReceiptEmail,
    sendSubscriptionExpiryEmail: exports.sendSubscriptionExpiryEmail,
    testEmailConnection: exports.testEmailConnection,
};
//# sourceMappingURL=email.js.map