export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { query, type, username } = req.query;

  try {
    // OpenAI call (POST)
    if (type === 'ai') {
      const body = await new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => data += chunk);
        req.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
      });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000)
      });

      const data = await response.json();
      return res.status(response.status).json(data);
    }

    // Twitter profile lookup
    if (type === 'profile') {
      const url = `https://api.twitterapi.io/twitter/user/info?userName=${encodeURIComponent(username)}`;
      const response = await fetch(url, {
        headers: { 'X-API-Key': process.env.TWITTER_API_KEY },
        signal: AbortSignal.timeout(10000)
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    }

    // Twitter tweet search
    const normalizedQuery = (query || '').toLowerCase();
    const url = `https://api.twitterapi.io/twitter/tweet/advanced_search?query=${encodeURIComponent(normalizedQuery)}&queryType=Latest`;
    const response = await fetch(url, {
      headers: { 'X-API-Key': process.env.TWITTER_API_KEY },
      signal: AbortSignal.timeout(10000)
    });
    const data = await response.json();
    return res.status(response.status).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message || 'Fetch failed' });
  }
}
