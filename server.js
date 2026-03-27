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

// ====== КЛЮЧИ ======
const TAVILY_API_KEY = "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";
const GEMINI_API_KEY = "AIzaSyBprCqQ3arDYD0sWtd4zeV0f26KVyS9yZM";

// Инициализация Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// 🔎 Поиск статей (НЕ ТРОГАЛ)
app.post("/search", async (req, res) => {
    const { query } = req.body;

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
        console.error(error.message);
        res.status(500).send("Ошибка поиска");
    }
});

// 🤖 Генерация аргументов через Gemini
app.post("/arguments", async (req, res) => {
    const { query, position, text } = req.body;

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite"
        });

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
        console.error(err.message);
        res.status(500).send("Ошибка генерации аргументов");
    }
});

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));