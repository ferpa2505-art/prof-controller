import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default sgMail;

export const EMAIL_TEMPLATES = {
  WELCOME: 'd-welcome-template-id',
  PAYMENT_RECEIPT: 'd-receipt-template-id',
  RENEWAL_MONTHLY: 'd-renewal-monthly-template-id',
  RENEWAL_ANNUAL: 'd-renewal-annual-template-id',
  CANCELLATION: 'd-cancellation-template-id'
};

// Configurações de email
export const EMAIL_CONFIG = {
  from: process.env.SENDGRID_FROM_EMAIL || 'noreply@profcontroller.app',
  replyTo: 'suporte@profcontroller.app'
};
