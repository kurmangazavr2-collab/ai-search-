const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Отдаём фронтенд
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ====== СЕКРЕТНЫЙ КЛЮЧ TAVILY ======
const TAVILY_API_KEY = "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"; // вставь сюда

// Эндпоинт поиска
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

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));