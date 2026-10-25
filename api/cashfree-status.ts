export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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

  const isConfigured = Boolean(appId && secretKey && !appId.includes('YOUR_'));

  return res.status(200).json({
    isConfigured,
    appIdMasked: isConfigured && appId ? `${appId.slice(0, 4)}...${appId.slice(-4)}` : null,
    env,
  });
}
