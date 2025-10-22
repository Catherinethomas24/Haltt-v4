// Serverless proxy for Solana JSON-RPC via Helius
// Uses server-side env var so the API key is never exposed to the browser

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;

module.exports = async (req, res) => {
  // CORS (same-origin by default on Vercel, but keep permissive for safety)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const network = (req.query.network || 'mainnet-beta').toString();
    if (!HELIUS_API_KEY) {
      return res.status(500).json({ error: 'Missing HELIUS_API_KEY environment variable' });
    }

    const baseUrl = network === 'devnet'
      ? `https://devnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
      : `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

    const heliusResp = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    const text = await heliusResp.text();
    res.status(heliusResp.status).send(text);
  } catch (err) {
    console.error('solana-rpc proxy error:', err);
    res.status(500).json({ error: 'RPC proxy error', details: err.message });
  }
};
