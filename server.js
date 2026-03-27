const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// Отдаём фронтенд
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ====== КЛЮЧИ (берутся из переменных окружения) ======
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Инициализация Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// 🔎 Поиск статей Tavily
app.post("/api/search", async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).send("Query is required");

  try {
    const tavilyResp = await axios.post(
      "https://api.tavily.com/search",
      { api_key: TAVILY_API_KEY, query, max_results: 5 }
    );

    const articles = tavilyResp.data.results.map(a => ({
      title: a.title,
      url: a.url,
      content: a.content
    }));

    res.json({ results: articles });

  } catch (error) {
    console.error("Tavily error:", error.message);
    res.status(500).send("Ошибка поиска");
  }
});

// 🤖 Генерация аргументов через Gemini
app.post("/api/arguments", async (req, res) => {
  const { query, position, text } = req.body;
  if (!query || !text) return res.status(400).send("Query and text are required");

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `
Тема: ${query}
Позиция: ${position || "нет"}

На основе информации ниже сделай:
1. 3 аргумента ЗА
2. 3 аргумента ПРОТИВ
3. Короткий вывод

Пиши четко, кратко, без воды.

Текст:
${text}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResult = response.text();

    res.json({ result: textResult });

  } catch (err) {
    console.error("Gemini error:", err.message);
    res.status(500).send("Ошибка генерации аргументов");
  }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));