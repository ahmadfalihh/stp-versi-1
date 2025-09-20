// File: api/generate-audio.js

export default async function handler(req, res) {
    // 1. Hanya izinkan metode POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // 2. Ambil data dari frontend
        const { text, voice } = req.body;
        if (!text || !voice) {
            return res.status(400).json({ error: 'Missing text or voice in request body' });
        }
        
        // 3. Ambil API Key dari Environment Variable yang aman
        const apiKey = process.env.GOOGLE_API_KEY;

        if (!apiKey) {
             return res.status(500).json({ error: 'API Key not configured on the server.' });
        }

        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

        // 4. Buat payload dan panggil Google API dari server
        const payload = {
            contents: [{ parts: [{ text }] }],
            generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voice }
                    }
                }
            },
        };

        const googleResponse = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!googleResponse.ok) {
            const errorBody = await googleResponse.text();
            console.error("Google API Error:", errorBody);
            return res.status(googleResponse.status).json({ error: `Google API Error: ${errorBody}` });
        }

        // 5. Kirim hasilnya kembali ke frontend
        const data = await googleResponse.json();
        res.status(200).json(data);

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}