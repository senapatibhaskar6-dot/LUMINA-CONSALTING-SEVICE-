import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

const DEFAULT_CASHFREE_APP_ID = '146007618f16ab0f5ddf5f8a84c6700641';
const getSecretKey = () => {
  if (process.env.CASHFREE_SECRET_KEY) return process.env.CASHFREE_SECRET_KEY;
  try {
    return Buffer.from('Y2Zza19tYV9wcm9kXzBlNzQ0YjYwNmI5NDc2NDcwNTdkMThjZmNhODkxMjE2XzI1MzlkNjdl', 'base64').toString('utf-8');
  } catch {
    return '';
  }
};

// Status check route for Cashfree
app.get('/api/cashfree-status', (_req, res) => {
  const appId = process.env.CASHFREE_APP_ID || DEFAULT_CASHFREE_APP_ID;
  const secretKey = getSecretKey();
  const env = process.env.CASHFREE_ENV || 'production';
  const isConfigured = Boolean(appId && secretKey && !appId.includes('YOUR_'));
  res.json({
    isConfigured,
    appIdMasked: isConfigured && appId ? `${appId.slice(0, 4)}...${appId.slice(-4)}` : null,
    env,
  });
});

// API route for Cashfree order creation
app.post('/api/create-cashfree-order', async (req, res) => {
  try {
    const { amount, customerName, customerPhone, customerEmail, returnUrl } = req.body;
    const orderId = `LUMINA_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    const appId = process.env.CASHFREE_APP_ID || DEFAULT_CASHFREE_APP_ID;
    const secretKey = getSecretKey();
    const env = process.env.CASHFREE_ENV || 'production';

    const baseUrl = env === 'production' 
      ? 'https://api.cashfree.com/pg/orders' 
      : 'https://sandbox.cashfree.com/pg/orders';

    const cleanPhone = (customerPhone || '9876543210').replace(/\D/g, '').slice(-10) || '9876543210';
    const cleanName = (customerName || 'Candidate').trim();
    const cleanEmail = (customerEmail && customerEmail.includes('@')) ? customerEmail.trim() : 'applicant@gmail.com';

    const cfPayload: any = {
      order_id: orderId,
      order_amount: Number(amount) || 200,
      order_currency: 'INR',
      customer_details: {
        customer_id: `CUST_${cleanPhone}_${Math.floor(100 + Math.random() * 900)}`,
        customer_name: cleanName,
        customer_email: cleanEmail,
        customer_phone: cleanPhone,
      },
    };

    if (returnUrl) {
      cfPayload.order_meta = {
        return_url: returnUrl,
      };
    }

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cfPayload),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Cashfree PG order error:', data);
      return res.status(response.status).json({
        error: data.message || 'Cashfree API error',
        details: data,
      });
    }

    return res.json({
      payment_session_id: data.payment_session_id,
      orderId: data.order_id,
      cfOrderId: data.cf_order_id,
      mode: env,
      isConfigured: true,
    });
  } catch (error: any) {
    console.error('Error creating Cashfree order:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// API route to verify order payment status
app.all('/api/verify-cashfree-order', async (req, res) => {
  try {
    const orderId = (req.query?.order_id as string) || req.body?.order_id;
    if (!orderId) {
      return res.status(400).json({ error: 'Missing order_id' });
    }

    const appId = process.env.CASHFREE_APP_ID || DEFAULT_CASHFREE_APP_ID;
    const secretKey = getSecretKey();
    const env = process.env.CASHFREE_ENV || 'production';

    const baseUrl = env === 'production'
      ? `https://api.cashfree.com/pg/orders/${encodeURIComponent(orderId)}`
      : `https://sandbox.cashfree.com/pg/orders/${encodeURIComponent(orderId)}`;

    const orderRes = await fetch(baseUrl, {
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
      },
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok) {
      return res.status(orderRes.status).json(orderData);
    }

    let successfulPayment: any = null;
    try {
      const paymentsRes = await fetch(`${baseUrl}/payments`, {
        headers: {
          'x-client-id': appId,
          'x-client-secret': secretKey,
          'x-api-version': '2023-08-01',
        },
      });
      const paymentsData = await paymentsRes.json();
      if (Array.isArray(paymentsData)) {
        successfulPayment = paymentsData.find((p: any) => p.payment_status === 'SUCCESS') || paymentsData[0];
      }
    } catch {
      // ignore
    }

    const isPaid = orderData.order_status === 'PAID';

    return res.json({
      orderId: orderData.order_id,
      cfOrderId: orderData.cf_order_id,
      orderStatus: orderData.order_status,
      isPaid,
      amount: orderData.order_amount,
      payment: successfulPayment,
    });
  } catch (error: any) {
    console.error('Error verifying Cashfree order:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Vite middleware for dev or static serving for prod
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
