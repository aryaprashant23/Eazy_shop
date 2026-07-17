/**
 * AI Routes — /api/ai
 * Phase 7: Groq-powered Smart Shopping Assistant
 */
const express = require('express');
const router = express.Router();
const { dbAll } = require('../database');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// POST /api/ai/recommend — Get product recommendations based on natural language query
router.post('/recommend', async (req, res, next) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ success: false, error: { message: 'Query is required.' } });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey || apiKey === 'your_groq_api_key_here') {
            return res.status(500).json({ 
                success: false, 
                error: { message: 'Groq API Key is not configured in backend/.env' } 
            });
        }

        // 1. Fetch current product catalog
        const products = await dbAll('SELECT id, name, category, price FROM products');
        
        // 2. Construct system prompt for Groq
        const systemPrompt = `
You are an expert supermarket shopping assistant for "Eazy Shop".
The user will ask for products, ingredients, or recipes (e.g. "Maggi", "I want to bake a cake").
Your strict task is to find the MOST relevant products from the provided Store Catalog.
Do NOT recommend random items. Do NOT hallucinate. Only select items that directly match the user's intent.

Store Catalog:
${JSON.stringify(products, null, 2)}

Rules:
1. ONLY return barcodes (id) that actually exist in the Store Catalog.
2. If no relevant products exist for the query, return an empty array for recommendedBarcodes.
3. Respond in strict JSON format.

Format:
{
  "message": "A short, friendly message explaining what you found.",
  "recommendedBarcodes": ["barcode1", "barcode2"]
}`;

        // 3. Call Groq API via standard Fetch
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: query }
                ],
                temperature: 0.1,
                response_format: { type: "json_object" }
            })
        });

        if (!groqResponse.ok) {
            const errBody = await groqResponse.text();
            console.error('Groq API Error:', errBody);
            return res.status(500).json({ success: false, error: { message: 'Failed to get recommendations from AI.' } });
        }

        const groqData = await groqResponse.json();
        const content = JSON.parse(groqData.choices[0].message.content);

        // 4. Map barcodes back to full product objects
        const recommendedProducts = products.filter(p => content.recommendedBarcodes.includes(p.id));

        res.json({
            success: true,
            data: {
                message: content.message,
                products: recommendedProducts
            }
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
