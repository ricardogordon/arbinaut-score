export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { query } = req.query;

  if (!query) return res.status(400).json({ error: 'Missing query' });

  // TwitterAPI.io search is case-insensitive for keywords but
  // handles in from: operator work better lowercased
  const normalizedQuery = query.toLowerCase();

  try {
    const response = await fetch(
      `https://api.twitterapi.io/twitter/tweet/advanced_search?query=${encodeURIComponent(normalizedQuery)}&queryType=Latest`,
      {
        headers: { 'X-API-Key': process.env.TWITTER_API_KEY },
        // 10 second timeout
        signal: AbortSignal.timeout(10000)
      }
    );

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
