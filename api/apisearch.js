// /api/search.js
import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { query } = req.body;

  try {
    const tavilyResp = await axios.post(
      "https://api.tavily.com/search",
      {
        api_key: process.env.TAVILY_API_KEY,
        query,
        max_results: 5
      }
    );

    const articles = tavilyResp.data.results.map(a => ({
      title: a.title,
      url: a.url,
      content: a.content
    }));

    res.status(200).json({ results: articles });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}