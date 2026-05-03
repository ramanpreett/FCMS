import nodemailer from 'nodemailer';

// Create transporter (configure with your email service)
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Email templates
const emailTemplates = {
  welcome: (data) => ({
    subject: 'Welcome to ClientPulse! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to ClientPulse!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your freelance management solution</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${data.clientName},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thank you for choosing ClientPulse! We're excited to help you streamline your freelance business and manage your clients more effectively.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>Complete your onboarding process</li>
              <li>Set up your first client profile</li>
              <li>Create your first invoice</li>
              <li>Schedule client meetings</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.onboardingLink}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Complete Onboarding
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If you have any questions or need assistance, don't hesitate to reach out to our support team.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The ClientPulse Team
          </p>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center; color: white;">
          <p style="margin: 0; font-size: 14px; opacity: 0.8;">
            © 2024 ClientPulse. All rights reserved.
          </p>
        </div>
      </div>
    `
  }),
  
  contract: (data) => ({
    subject: 'Your Contract is Ready 📄',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Contract Ready</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your project contract is ready for review</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${data.clientName},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Great news! Your contract for the project "${data.projectName}" is ready for your review and signature.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #333; margin-top: 0;">Contract Details</h3>
            <p style="color: #666; margin: 5px 0;"><strong>Project:</strong> ${data.projectName}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Value:</strong> $${data.projectValue}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Timeline:</strong> ${data.timeline}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.contractLink}" 
               style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Review Contract
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Please review the contract carefully and let us know if you have any questions or need any modifications.
          </p>
        </div>
      </div>
    `
  }),
  
  invoice: (data) => ({
    subject: `Invoice #${data.invoiceNumber} - ${data.projectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Invoice Ready</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your invoice is ready for payment</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${data.clientName},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Your invoice for the project "${data.projectName}" is ready. Please find the details below.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #333; margin-top: 0;">Invoice Details</h3>
            <p style="color: #666; margin: 5px 0;"><strong>Invoice #:</strong> ${data.invoiceNumber}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Amount:</strong> $${data.amount}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Due Date:</strong> ${data.dueDate}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.invoiceLink}" 
               style="background: #ffc107; color: #333; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              View Invoice
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Thank you for your business! If you have any questions about this invoice, please don't hesitate to contact us.
          </p>
        </div>
      </div>
    `
  })
};

// Send email function
export const sendEmail = async (to, template, data) => {
  try {
    const transporter = createTransporter();
    const emailContent = emailTemplates[template](data);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};

// Specific email functions
export const sendWelcomeEmail = async (emailData) => {
  return await sendEmail(emailData.to, 'welcome', emailData.data);
};

export const sendContractEmail = async (emailData) => {
  return await sendEmail(emailData.to, 'contract', emailData.data);
};

export const sendInvoiceEmail = async (emailData) => {
  return await sendEmail(emailData.to, 'invoice', emailData.data);
};


