export const errorHandler = (err, req, res, next) => {
  console.error('Erro:', err);

  // Erro de validação
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  // Erro de Stripe
  if (err.type === 'StripeInvalidRequestError') {
    return res.status(400).json({ error: 'Erro no pagamento Stripe' });
  }

  // Erro padrão
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor'
  });
};
