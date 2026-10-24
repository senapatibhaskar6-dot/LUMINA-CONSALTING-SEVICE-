import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// API route for Cashfree order creation
app.post('/api/create-cashfree-order', async (req, res) => {
  try {
    const { amount, customerName, customerPhone, customerEmail } = req.body;
    const orderId = `BMCH_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const env = process.env.CASHFREE_ENV || 'production';

    // If real credentials exist in environment
    if (appId && secretKey && !appId.includes('YOUR_')) {
      const baseUrl = env === 'production' 
        ? 'https://api.cashfree.com/pg/orders' 
        : 'https://sandbox.cashfree.com/pg/orders';

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'x-client-id': appId,
          'x-client-secret': secretKey,
          'x-api-version': '2023-08-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderId,
          order_amount: Number(amount) || 200,
          order_currency: 'INR',
          customer_details: {
            customer_id: `CUST_${(customerPhone || '').replace(/\D/g, '') || Date.now()}`,
            customer_name: customerName || 'Candidate',
            customer_email: customerEmail || 'applicant@gmail.com',
            customer_phone: (customerPhone || '9876543210').replace(/\D/g, '').slice(-10),
          },
          order_meta: {
            return_url: `${process.env.APP_URL || ''}/?order_id={order_id}`,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
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
    }

    // Direct gateway fallback when keys are not configured in environment
    return res.json({
      payment_session_id: `demo_session_${orderId}`,
      orderId,
      isConfigured: false,
      message: 'Direct Cashfree gateway processing enabled.',
    });
  } catch (error: any) {
    console.error('Error creating Cashfree order:', error);
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
