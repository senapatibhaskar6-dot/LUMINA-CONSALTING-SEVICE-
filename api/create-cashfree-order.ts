export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { amount, customerName, customerPhone, customerEmail, returnUrl } = body;

    const appId = process.env.CASHFREE_APP_ID || '146007618f16ab0f5ddf5f8a84c6700641';
    const secretKey = process.env.CASHFREE_SECRET_KEY || (() => {
      try {
        return Buffer.from('Y2Zza19tYV9wcm9kXzBlNzQ0YjYwNmI5NDc2NDcwNTdkMThjZmNhODkxMjE2XzI1MzlkNjdl', 'base64').toString('utf-8');
      } catch {
        return '';
      }
    })();
    const env = process.env.CASHFREE_ENV || 'production';

    const orderId = `LUMINA_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const cleanPhone = (customerPhone || '9876543210').replace(/\D/g, '').slice(-10) || '9876543210';
    const cleanName = (customerName || 'Candidate').trim();
    const cleanEmail = (customerEmail && customerEmail.includes('@')) ? customerEmail.trim() : 'applicant@gmail.com';

    const baseUrl = env === 'production' 
      ? 'https://api.cashfree.com/pg/orders' 
      : 'https://sandbox.cashfree.com/pg/orders';

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
      console.error('Cashfree order creation error:', data);
      return res.status(response.status).json({
        error: data.message || 'Cashfree payment gateway order creation failed',
        details: data,
      });
    }

    return res.status(200).json({
      payment_session_id: data.payment_session_id,
      orderId: data.order_id,
      cfOrderId: data.cf_order_id,
      mode: env,
      isConfigured: true,
    });
  } catch (error: any) {
    console.error('Error creating Cashfree order:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
