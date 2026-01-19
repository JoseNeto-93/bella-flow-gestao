import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import Stripe from 'stripe';

import { resolveSalonByPhone, resolveSalonByApiKey } from './salonResolver.js';
import { processMessage } from './messageProcessor.js';
import { createSalonAccount, setSalonPlan, getSalon, getSalonByApiKey, getSalonConfig, saveSalonConfig } from './dataService.js';
import { PLANS } from './plans.js';
import { loginSalon, loginWithApiKey, authMiddleware } from './auth.js';
import { generateResetToken, resetPassword } from './passwordReset.js';
import { processMessageWithLimit, getUsageStats } from './messageLimitService.js';
import { handleStripeWebhook, verifyStripeSignature } from './stripeWebhookHandler.js';

const app = express();

// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
app.use(limiter);

// CORS: permitir origem configurável em produção
const corsOrigin = process.env.CORS_ORIGIN || process.env.VITE_API_URL || '*';
const corsOptions = {
  origin: corsOrigin === '*' ? true : (origin, cb) => {
    const allowed = corsOrigin.split(',').map(s => s.trim());
    if (!origin) return cb(null, true);
    cb(null, allowed.includes(origin));
  }
};

// Apply CORS with options before routes
app.use(cors(corsOptions));

// Stripe client (optional)
const stripe = process.env.STRIPE_SECRET ? new Stripe(process.env.STRIPE_SECRET) : null;

app.get('/', (_, res) => {
  res.json({ status: 'ok', service: 'FrontZap SaaS' });
});

// Stripe webhook route (raw body) - register before JSON parser
if (stripe) {
  app.post('/api/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    try {
      // Verificar assinatura do webhook (segurança)
      const event = endpointSecret 
        ? verifyStripeSignature(req.body, sig, endpointSecret)
        : JSON.parse(req.body.toString());

      // Processar evento com handler centralizado
      const result = await handleStripeWebhook(event);
      
      res.json(result);
    } catch (err) {
      console.error('Stripe webhook error', err);
      return res.status(400).json({ error: err.message });
    }
  });
}

// After webhook raw route, parse JSON for normal routes
app.use(express.json());

// Health
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// Register a new salon (returns apiKey)
app.post('/api/register', async (req, res) => {
  try {
    const { name, phone, password, plan } = req.body || {};
    if (!phone || !name || !password) {
      return res.status(400).json({ error: 'phone, name and password required' });
    }

    const account = await createSalonAccount({ name, phone, password, plan });
    return res.json({ success: true, ...account });
  } catch (err) {
    console.error('Error /api/register', err);
    // Retornar mensagem de erro específica se for validação
    if (err.message.includes('Telefone')) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'internal_error' });
  }
});

// Login endpoint (phone + password)
app.post('/api/login', async (req, res) => {
  try {
    const { phone, password, apiKey } = req.body || {};
    
    // Suportar login com senha OU apiKey (retrocompatibilidade)
    if (password) {
      if (!phone) return res.status(400).json({ error: 'phone and password required' });
      const result = await loginSalon(phone, password);
      return res.json(result);
    } else if (apiKey) {
      if (!phone) return res.status(400).json({ error: 'phone and apiKey required' });
      const result = loginWithApiKey(phone, apiKey);
      return res.json(result);
    } else {
      return res.status(400).json({ error: 'password or apiKey required' });
    }
  } catch (err) {
    console.error('Error /api/login', err);
    return res.status(500).json({ error: 'internal_error' });
  }
});

// Solicitar reset de senha (retorna token que seria enviado por SMS/Email)
app.post('/api/password/request-reset', (req, res) => {
  try {
    const { phone } = req.body || {};
    if (!phone) return res.status(400).json({ error: 'phone required' });

    const result = generateResetToken(phone);
    
    // EM PRODUÇÃO: Enviar token por SMS/Email ao invés de retornar
    // TODO: Integrar com Twilio/SendGrid
    
    if (result.error) {
      return res.status(404).json(result);
    }

    return res.json({ 
      success: true, 
      message: 'Token enviado (em produção, seria por SMS/Email)',
      // REMOVER em produção:
      token: result.token 
    });
  } catch (err) {
    console.error('Error /api/password/request-reset', err);
    return res.status(500).json({ error: 'internal_error' });
  }
});

// Resetar senha com token
app.post('/api/password/reset', async (req, res) => {
  try {
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'token and newPassword required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const result = await resetPassword(token, newPassword);
    return res.json(result);
  } catch (err) {
    console.error('Error /api/password/reset', err);
    return res.status(500).json({ error: 'internal_error' });
  }
});

// Dashboard endpoint (protected)
app.get('/api/dashboard', authMiddleware, async (req, res) => {
  try {
    const salon = getSalon(req.salonId);
    if (!salon) return res.status(404).json({ error: 'salon_not_found' });

    // Obter estatísticas completas de uso
    const stats = getUsageStats(req.salonId);

    // Prepare dashboard data
    const config = getSalonConfig(req.salonId);
    const dashboard = {
      salon: {
        id: req.salonId,
        name: salon.name,
        phone: salon.phone,
        plan: salon.plan,
      },
      config: {
        ...config,
        appointments: salon.appointments || [],
      },
      stats, // Incluir estatísticas completas
      usage: {
        messagesUsed: salon.messagesUsed,
        messagesLimit: PLANS[salon.plan]?.messageLimit || Infinity,
      },
      planDetails: PLANS[salon.plan] || {},
    };

    // If Stripe, try to fetch subscription from Stripe
    if (stripe && process.env.STRIPE_SECRET) {
      try {
        const subscriptions = await stripe.subscriptions.list({
          metadata: { apiKey: req.apiKey },
          limit: 1,
        });
        if (subscriptions.data.length > 0) {
          dashboard.subscription = subscriptions.data[0];
        }
      } catch (err) {
        console.error('Error fetching Stripe subscription', err);
      }
    }

    return res.json(dashboard);
  } catch (err) {
    console.error('Error /api/dashboard', err);
    return res.status(500).json({ error: 'internal_error' });
  }
});

// Update salon services (protected)
app.post('/api/update-services', authMiddleware, async (req, res) => {
  try {
    const { services } = req.body;
    if (!Array.isArray(services)) {
      return res.status(400).json({ error: 'services must be an array' });
    }

    const salon = getSalon(req.salonId);
    if (!salon) return res.status(404).json({ error: 'salon_not_found' });

    // Update services in config
    const config = getSalonConfig(req.salonId) || {};
    config.services = services;

    // Save to database
    saveSalonConfig(req.salonId, config);

    return res.json({ success: true, services });
  } catch (err) {
    console.error('Error /api/update-services', err);
    return res.status(500).json({ error: 'internal_error' });
  }
});

// Create Stripe checkout session for plan purchase
app.post('/api/create-checkout-session', async (req, res) => {
  if (!stripe) return res.status(400).json({ error: 'stripe_not_configured' });
  try {
    const { apiKey, plan, success_url, cancel_url } = req.body || {};
    if (!apiKey || !plan || !PLANS[plan]) return res.status(400).json({ error: 'invalid_request' });
    // If price IDs are configured, create a subscription session
    const priceEnvMap = {
      starter: process.env.STRIPE_PRICE_STARTER,
      pro: process.env.STRIPE_PRICE_PRO,
      agency: process.env.STRIPE_PRICE_AGENCY,
    };

    const priceId = priceEnvMap[plan];

    if (priceId) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: success_url || `${process.env.VITE_APP_URL || 'http://localhost:3000'}/?success=true`,
        cancel_url: cancel_url || `${process.env.VITE_APP_URL || 'http://localhost:3000'}/?canceled=true`,
        metadata: { apiKey, plan },
      });

      return res.json({ url: session.url });
    }

    // fallback to one-time payment if no price ID provided
    const price = Math.round((PLANS[plan].price || 0) * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: { name: `Plano ${PLANS[plan].name}` },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      success_url: success_url || `${process.env.VITE_APP_URL || 'http://localhost:3000'}/?success=true`,
      cancel_url: cancel_url || `${process.env.VITE_APP_URL || 'http://localhost:3000'}/?canceled=true`,
      metadata: { apiKey, plan },
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error('create-checkout-session error', err);
    return res.status(500).json({ error: 'stripe_error' });
  }
});

// Create subscription session explicitly (alias)
app.post('/api/create-subscription-session', async (req, res) => {
  if (!stripe) return res.status(400).json({ error: 'stripe_not_configured' });
  try {
    const { apiKey, plan, success_url, cancel_url } = req.body || {};
    if (!apiKey || !plan || !PLANS[plan]) return res.status(400).json({ error: 'invalid_request' });

    const priceEnvMap = {
      starter: process.env.STRIPE_PRICE_STARTER,
      pro: process.env.STRIPE_PRICE_PRO,
      agency: process.env.STRIPE_PRICE_AGENCY,
    };

    const priceId = priceEnvMap[plan];
    if (!priceId) return res.status(400).json({ error: 'no_price_id' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: success_url || `${process.env.VITE_APP_URL || 'http://localhost:3000'}/?success=true`,
      cancel_url: cancel_url || `${process.env.VITE_APP_URL || 'http://localhost:3000'}/?canceled=true`,
      metadata: { apiKey, plan },
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error('create-subscription-session error', err);
    return res.status(500).json({ error: 'stripe_error' });
  }
});

app.post('/webhook/frontzap', async (req, res) => {
  try {
    const { phone, message } = req.body || {};
    // allow apiKey via Authorization header
    const auth = (req.headers.authorization || '').split(' ');
    const apiKey = auth[0] && auth[0].toLowerCase() === 'bearer' ? auth[1] : null;

    if (!apiKey && typeof phone !== 'string') {
      return res.status(400).json({ reply: '❌ Payload inválido' });
    }

    // Validação de tipo clara
    if (typeof message !== 'string') {
      return res.status(400).json({ reply: '❌ Payload inválido' });
    }

    const salon = apiKey ? resolveSalonByApiKey(apiKey) : await resolveSalonByPhone(phone);

    if (!salon) {
      return res.json({ reply: '❌ Salão não cadastrado ou plano inativo.' });
    }

    const sessionId = `${salon.id || salon.apiKey || phone}:${phone || 'web-client'}`;

    // Verificar limite de mensagens antes de processar
    const reply = await processMessageWithLimit(salon.id, sessionId, message, processMessage);

    return res.json({ reply: String(reply || '') });
  } catch (err) {
    console.error('Error in /webhook/frontzap', err);
    return res.status(500).json({ reply: '❌ Erro interno' });
  }
});

const PORT = process.env.PORT || 3333;
// Serve frontend build (se existir) para facilitar deploy único
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';


// Resolve dist relativo a este arquivo (funciona independentemente do cwd)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '..', 'dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/webhook') || req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SaaS rodando na porta ${PORT}`);
});
