// Vercel Serverless Function for ChainAbuse API
// Node 18+ has native fetch, no need to import

const CHAINABUSE_API_KEY = process.env.CHAINABUSE_API_KEY;

module.exports = async (req, res) => {
  console.log("[START] check-address function invoked");

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    console.log("Preflight OPTIONS request received. Responding with 200 OK.");
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.warn(`Method not allowed: ${req.method}`);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    const { address, chain = 'solana' } = req.body;

    if (!address) {
      console.error("Address is required, but was not provided in the request body.");
      return res.status(400).json({ error: 'Address is required' });
    }
    
    if (!CHAINABUSE_API_KEY) {
        console.error("CHAINABUSE_API_KEY environment variable is not set.");
        return res.status(500).json({ error: 'Server configuration error: API key is missing.' });
    }

    console.log(`🔍 Checking address: ${address} on chain: ${chain}`);

    const chainUpper = chain.toUpperCase() === 'SOLANA' ? 'SOL' : chain.toUpperCase();
    
    const queryParams = new URLSearchParams({
      address: address,
      chain: chainUpper,
      includePrivate: 'false',
      page: '1',
      perPage: '50'
    });
    
    const apiUrl = `https://api.chainabuse.com/v0/reports?${queryParams}`;
    const headers = {
        'X-API-Key': CHAINABUSE_API_KEY,
        'Accept': 'application/json'
    };

    console.log(`Sending GET request to ChainAbuse: ${apiUrl}`);
    console.log("Request headers (excluding API key for security):", { 'Accept': headers.Accept });

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: headers
    });
    
    console.log(`ChainAbuse API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ChainAbuse API Error: ${response.status} - ${errorText}`);
      return res.status(response.status).json({ 
        error: `ChainAbuse API returned ${response.status}`,
        details: errorText 
      });
    }

    const data = await response.json();
    console.log("Successfully received data from ChainAbuse API.");

    let reports = [];
    if (Array.isArray(data)) {
        reports = data;
    } else if (data && Array.isArray(data.reports)) {
        reports = data.reports;
    } else if (data && data.data && Array.isArray(data.data)) {
        reports = data.data;
    }

    const hasReports = reports.length > 0;
    const totalReports = reports.length;

    console.log(`Check complete. Found ${totalReports} report(s).`);

    res.status(200).json({
      safe: !hasReports,
      reports: reports,
      totalReports: totalReports,
      checked: true,
      message: hasReports ? `Found ${totalReports} fraud report(s)` : 'No fraud reports found'
    });

  } catch (error) {
    console.error('Serverless function has thrown an unexpected error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message,
      stack: error.stack // Include stack for better debugging
    });
  } finally {
    console.log("[END] check-address function execution finished.");
  }
};
