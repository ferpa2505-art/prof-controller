import { v4 as uuidv4 } from 'uuid';

/**
 * Gera um número serial único para o usuário
 * Formato: PC-{YYYY}-{MM}-{XXXXX}-{YYYYY}
 * Exemplo: PC-2026-09-AF3C2-K8M7Q
 */
export const generateSerial = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  // Gera 5 caracteres aleatórios (A-Z, 0-9)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let random1 = '';
  let random2 = '';

  for (let i = 0; i < 5; i++) {
    random1 += chars.charAt(Math.floor(Math.random() * chars.length));
    random2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `PC-${year}-${month}-${random1}-${random2}`;
};

/**
 * Valida se um serial é válido
 */
export const validateSerial = (serial) => {
  const regex = /^PC-\d{4}-\d{2}-[A-Z0-9]{5}-[A-Z0-9]{5}$/;
  return regex.test(serial);
};

/**
 * Extrai informações do serial
 */
export const parseSerial = (serial) => {
  const match = serial.match(/^PC-(\d{4})-(\d{2})-([A-Z0-9]{5})-([A-Z0-9]{5})$/);
  if (!match) return null;

  return {
    year: parseInt(match[1]),
    month: parseInt(match[2]),
    random1: match[3],
    random2: match[4]
  };
};
