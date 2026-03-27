import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).end();
    }

    const { query, position, text } = req.body;

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash"
        });

        const prompt = `
Тема: ${query}
Позиция: ${position || "нет"}

Сделай:
- 3 аргумента ЗА
- 3 аргумента ПРОТИВ
- короткий вывод

Текст:
${text}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;

        res.status(200).json({
            result: response.text()
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
}