import sgMail from '../config/sendgrid.js';
import { EMAIL_CONFIG } from '../config/sendgrid.js';

/**
 * Envia email de boas-vindas
 */
export const sendWelcomeEmail = async (email, name, serial, plan) => {
  const msg = {
    to: email,
    from: EMAIL_CONFIG.from,
    subject: 'Bem-vindo ao ProF Controller! 🎉',
    html: `
      <h2>Bem-vindo, ${name}!</h2>
      <p>Sua assinatura foi ativada com sucesso!</p>
      <p><strong>Seu número serial:</strong> ${serial}</p>
      <p><strong>Plano:</strong> ${plan === 'monthly' ? 'Mensal' : 'Anual'}</p>
      <p>Você agora tem acesso a todos os recursos premium do ProF Controller.</p>
      <a href="${process.env.FRONTEND_URL}" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;">
        Acessar ProF Controller
      </a>
    `
  };

  try {
    await sgMail.send(msg);
    console.log(`Email de boas-vindas enviado para ${email}`);
  } catch (error) {
    console.error('Erro ao enviar email de boas-vindas:', error);
    throw error;
  }
};

/**
 * Envia comprovante de pagamento
 */
export const sendPaymentReceipt = async (email, name, amount, currency, plan) => {
  const msg = {
    to: email,
    from: EMAIL_CONFIG.from,
    subject: 'Comprovante de Pagamento - ProF Controller',
    html: `
      <h2>Comprovante de Pagamento</h2>
      <p>Olá ${name},</p>
      <p>Seu pagamento foi processado com sucesso!</p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td><strong>Plano:</strong></td>
          <td>${plan === 'monthly' ? 'Mensal' : 'Anual (com 20% desconto)'}</td>
        </tr>
        <tr>
          <td><strong>Valor:</strong></td>
          <td>${(amount / 100).toFixed(2)} ${currency}</td>
        </tr>
        <tr>
          <td><strong>Data:</strong></td>
          <td>${new Date().toLocaleDateString('pt-BR')}</td>
        </tr>
      </table>
    `
  };

  try {
    await sgMail.send(msg);
    console.log(`Comprovante enviado para ${email}`);
  } catch (error) {
    console.error('Erro ao enviar comprovante:', error);
    throw error;
  }
};

/**
 * Envia lembrete de renovação
 */
export const sendRenewalReminder = async (email, name, nextBillingDate) => {
  const msg = {
    to: email,
    from: EMAIL_CONFIG.from,
    subject: 'Lembrete: Sua assinatura ProF Controller será renovada',
    html: `
      <h2>Lembrete de Renovação</h2>
      <p>Olá ${name},</p>
      <p>Sua assinatura ProF Controller será renovada em ${new Date(nextBillingDate).toLocaleDateString('pt-BR')}.</p>
      <p>Se deseja cancelar, você pode fazê-lo a qualquer momento a partir do seu painel.</p>
    `
  };

  try {
    await sgMail.send(msg);
    console.log(`Lembrete de renovação enviado para ${email}`);
  } catch (error) {
    console.error('Erro ao enviar lembrete:', error);
    throw error;
  }
};

/**
 * Envia email de cancelamento
 */
export const sendCancellationEmail = async (email, name) => {
  const msg = {
    to: email,
    from: EMAIL_CONFIG.from,
    subject: 'Sua assinatura ProF Controller foi cancelada',
    html: `
      <h2>Assinatura Cancelada</h2>
      <p>Olá ${name},</p>
      <p>Sua assinatura do ProF Controller foi cancelada com sucesso.</p>
      <p>Você ainda pode usar a versão gratuita do aplicativo.</p>
      <p>Se mudou de ideia, pode reativar sua assinatura a qualquer momento!</p>
    `
  };

  try {
    await sgMail.send(msg);
    console.log(`Email de cancelamento enviado para ${email}`);
  } catch (error) {
    console.error('Erro ao enviar email de cancelamento:', error);
    throw error;
  }
};

export default {
  sendWelcomeEmail,
  sendPaymentReceipt,
  sendRenewalReminder,
  sendCancellationEmail
};
