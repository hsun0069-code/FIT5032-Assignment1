const cors = require('cors');
const corsHandler = cors({ origin: true });

const functions = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const sgMail = require("@sendgrid/mail");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ===== Secrets =====
const SENDGRID_API_KEY = defineSecret("SENDGRID_API_KEY");
const SENDER_EMAIL = defineSecret("SENDER_EMAIL");
const OWM_API_KEY = defineSecret("OWM_API_KEY");
const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

function handleOptions(req, res) {
    if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(204).send('');
    }
    return false;
}

// == F.1: Single email (including attachments) ==
exports.sendEmailWithAttachment = functions.onRequest(
    { secrets: [SENDGRID_API_KEY, SENDER_EMAIL] },
    (req, res) => {
        corsHandler(req, res, async () => {
            if (handleOptions(req, res)) return;

            try {
                const { to, subject, text, filename, base64, mime } = req.body || {};
                if (!to || !subject || !text) {
                    return res.status(400).json({ error: 'Missing fields' });
                }

                sgMail.setApiKey(SENDGRID_API_KEY.value());
                const msg = {
                    to,
                    from: SENDER_EMAIL.value(),
                    subject,
                    text,
                };

                if (filename && base64 && mime) {
                    msg.attachments = [{
                        content: base64,
                        filename,
                        type: mime,
                        disposition: 'attachment',
                    }];
                }

                await sgMail.send(msg);
                res.set('Access-Control-Allow-Origin', '*');
                return res.json({ ok: true });
            } catch (err) {
                logger.error(err);
                res.set('Access-Control-Allow-Origin', '*');
                return res.status(500).json({ error: err.message });
            }
        });
    }
);

// == F.1: Mass email ==
exports.sendBulkEmail = functions.onRequest(
    { secrets: [SENDGRID_API_KEY, SENDER_EMAIL] },
    (req, res) => {
        corsHandler(req, res, async () => {
            if (handleOptions(req, res)) return;

            try {
                if (req.method !== "POST")
                    return res.status(405).json({ error: "Use POST" });

                const { toList = [], subject, text, html } = req.body || {};
                if (!Array.isArray(toList) || toList.length === 0 || !subject || !(text || html)) {
                    return res.status(400).json({ error: "Missing fields: toList[], subject, text/html" });
                }

                sgMail.setApiKey(SENDGRID_API_KEY.value());
                const sender = SENDER_EMAIL.value();

                const msgs = toList.map((to) => ({
                    to,
                    from: sender,
                    subject,
                    text: text || "",
                    html: html || `<p>${text || ""}</p>`,
                }));

                const chunk = (arr, size) =>
                    arr.reduce((acc, _, i) => (i % size ? acc : [...acc, arr.slice(i, i + size)]), []);
                const batches = chunk(msgs, 500);

                for (const batch of batches) {
                    await sgMail.send(batch);
                }

                res.set('Access-Control-Allow-Origin', '*');
                return res.json({ ok: true, sent: msgs.length });
            } catch (e) {
                logger.error(e);
                res.set('Access-Control-Allow-Origin', '*');
                return res.status(500).json({ error: e.message });
            }
        });
    }
);

// == F.2: OpenWeather Current Weather ==
exports.owmWeather = functions.onRequest(
    { secrets: [OWM_API_KEY] },
    (req, res) => {
        corsHandler(req, res, async () => {
            if (handleOptions(req, res)) return;

            try {
                const { city = "Melbourne" } = req.query;
                const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OWM_API_KEY.value()}&units=metric`;

                const r = await fetch(url);
                const data = await r.json();

                res.set('Access-Control-Allow-Origin', '*');
                return res.json(data);
            } catch (e) {
                res.set('Access-Control-Allow-Origin', '*');
                return res.status(500).json({ error: e.message });
            }
        });
    }
);

// == F.2: OpenWeather 5-day forecast ==
exports.owmForecast = functions.onRequest(
    { secrets: [OWM_API_KEY] },
    (req, res) => {
        corsHandler(req, res, async () => {
            if (handleOptions(req, res)) return;

            try {
                const { city = "Melbourne" } = req.query;
                const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${OWM_API_KEY.value()}&units=metric`;

                const r = await fetch(url);
                const data = await r.json();

                res.set('Access-Control-Allow-Origin', '*');
                return res.json(data);
            } catch (e) {
                res.set('Access-Control-Allow-Origin', '*');
                return res.status(500).json({ error: e.message });
            }
        });
    }
);

// == F.3: Gemini AI generated content ==
exports.aiSuggest = functions.onRequest(
    { secrets: [GEMINI_API_KEY] },
    (req, res) => {
        corsHandler(req, res, async () => {
            if (handleOptions(req, res)) return;

            try {
                const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                // Support GET / POST: GET is convenient for direct access verification in the browser; POST is used for front-end button calls
                if (req.method === 'GET') {
                    const prompt = String(req.query.prompt || '').trim();
                    if (!prompt) {
                        res.set('Access-Control-Allow-Origin', '*');
                        return res.status(400).send('prompt is required');
                    }

                    const result = await model.generateContent(prompt);
                    const text = (result.response?.text?.() || 'No content').toString();

                    res.set('Access-Control-Allow-Origin', '*');
                    res.set('Content-Type', 'text/plain; charset=utf-8');
                    return res.status(200).send(text);
                }

                if (req.method === 'POST') {
                    const { prompt = "" } = req.body || {};
                    if (!prompt) {
                        res.set('Access-Control-Allow-Origin', '*');
                        return res.status(400).json({ error: 'prompt is required' });
                    }

                    const result = await model.generateContent(prompt);
                    const text = (result.response?.text?.() || 'No content').toString();

                    res.set('Access-Control-Allow-Origin', '*');
                    return res.status(200).json({ ok: true, text });
                }

                // Other methods are not allowed
                res.set('Access-Control-Allow-Origin', '*');
                return res.status(405).json({ error: 'Use GET or POST' });
            } catch (e) {
                logger.error(e);
                res.set('Access-Control-Allow-Origin', '*');
                return res.status(500).json({ error: e.message });
            }
        });
    }
);
