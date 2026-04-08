export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { query, type, username } = req.query;

  try {
    let url;

    if (type === 'profile') {
      // Fetch user bio/profile
      url = `https://api.twitterapi.io/twitter/user/info?userName=${encodeURIComponent(username)}`;
    } else {
      // Tweet search
      const normalizedQuery = (query || '').toLowerCase();
      url = `https://api.twitterapi.io/twitter/tweet/advanced_search?query=${encodeURIComponent(normalizedQuery)}&queryType=Latest`;
    }

    const response = await fetch(url, {
      headers: { 'X-API-Key': process.env.TWITTER_API_KEY },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message || 'Fetch failed' });
  }
}
