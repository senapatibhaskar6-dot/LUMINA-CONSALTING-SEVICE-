export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const orderId = req.query?.order_id || req.body?.order_id;
    if (!orderId) {
      return res.status(400).json({ error: 'Missing order_id' });
    }

    const appId = process.env.CASHFREE_APP_ID || '146007618f16ab0f5ddf5f8a84c6700641';
    const secretKey = process.env.CASHFREE_SECRET_KEY || (() => {
      try {
        return Buffer.from('Y2Zza19tYV9wcm9kXzBlNzQ0YjYwNmI5NDc2NDcwNTdkMThjZmNhODkxMjE2XzI1MzlkNjdl', 'base64').toString('utf-8');
      } catch {
        return '';
      }
    })();
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

    // Fetch payment attempts for this order
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

    return res.status(200).json({
      orderId: orderData.order_id,
      cfOrderId: orderData.cf_order_id,
      orderStatus: orderData.order_status,
      isPaid,
      amount: orderData.order_amount,
      payment: successfulPayment,
    });
  } catch (error: any) {
    console.error('Error verifying Cashfree order:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
