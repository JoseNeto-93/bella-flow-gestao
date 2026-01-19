import express from 'express';

const app = express();
const PORT = 3333;

app.get('/', (req, res) => {
  res.json({ status: 'ok', test: 'minimal server' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor teste na porta ${PORT}`);
});
