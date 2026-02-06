import { GoogleGenerativeAI } from "@google/generative-ai";

// Google Gemini API Key
const GEMINI_API_KEY = "AIzaSyBqPJDzTHoxWrZD53TykKIR7vsofs9btGQ";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const analyzeReceipt = async (file) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Convert file to base64
        const fileData = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(file);
        });

        const prompt = `Analyze this receipt image and return a JSON object with:
        1. "amount": total amount as a number (don't include symbols)
        2. "isExpense": true or false
        3. "category": a one-word category (e.g., Food, Shopping, Transport, Salary)
        4. "description": merchant name or a brief description
        
        Only return the JSON object, nothing else.`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: fileData,
                    mimeType: file.type
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();

        // Use regex to find the JSON block in case Gemini adds markdown or conversational text
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON found in AI response");

        const data = JSON.parse(jsonMatch[0]);

        return {
            amount: data.amount,
            amountIn: data.isExpense ? 0 : data.amount,
            amountOut: data.isExpense ? data.amount : 0,
            category: data.category,
            description: data.description,
            isExpense: data.isExpense
        };
    } catch (error) {
        console.error("Gemini Scan Error:", error);
        throw error;
    }
};
