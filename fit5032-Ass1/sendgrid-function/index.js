const functions = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const sgMail = require("@sendgrid/mail");
//const fetch = require("node-fetch");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const SENDGRID_API_KEY = defineSecret("SENDGRID_API_KEY");
const SENDER_EMAIL = defineSecret("SENDER_EMAIL");
const OWM_API_KEY = defineSecret("OWM_API_KEY");
const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

// -- Original function: Send a single email (with attachments) --
exports.sendEmailWithAttachment = functions.onRequest(
    { secrets: [SENDGRID_API_KEY, SENDER_EMAIL] },
    async (req, res) => {
        try {
            const { to, subject, text, filename, base64, mime } = req.body;

            if (!to || !subject || !text) {
                res.status(400).json({ error: "Missing fields" });
                return;
            }

            sgMail.setApiKey(SENDGRID_API_KEY.value());
            const msg = {
                to,
                from: SENDER_EMAIL.value(),
                subject,
                text,
            };

            if (filename && base64 && mime) {
                msg.attachments = [
                    {
                        content: base64,
                        filename,
                        type: mime,
                        disposition: "attachment",
                    },
                ];
            }

            await sgMail.send(msg);
            res.json({ ok: true });
        } catch (err) {
            logger.error(err);
            res.status(500).json({ error: err.message });
        }
    }
);

// -- F.1: Bulk Email --
exports.sendBulkEmail = functions.onRequest(
    { secrets: [SENDGRID_API_KEY, SENDER_EMAIL] },
    async (req, res) => {
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

            // Send in batches to avoid rate limiting
            const chunk = (arr, size) =>
                arr.reduce(
                    (acc, _, i) => (i % size ? acc : [...acc, arr.slice(i, i + size)]),
                    []
                );
            const batches = chunk(msgs, 500);

            for (const batch of batches) {
                await sgMail.send(batch);
            }

            res.json({ ok: true, sent: msgs.length });
        } catch (e) {
            logger.error(e);
            res.status(500).json({ error: e.message });
        }
    }
);

// -------------------- F.2: OpenWeather Current Weather --------------------
exports.owmWeather = functions.onRequest(
    { secrets: [OWM_API_KEY] },
    async (req, res) => {
        try {
            const { city = "Melbourne" } = req.query;
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
                city
            )}&appid=${OWM_API_KEY.value()}&units=metric`;

            const r = await fetch(url);
            const data = await r.json();
            res.json(data);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
);

// -------------------- F.2: OpenWeather Weather Forecast --------------------
exports.owmForecast = functions.onRequest(
    { secrets: [OWM_API_KEY] },
    async (req, res) => {
        try {
            const { city = "Melbourne" } = req.query;
            const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
                city
            )}&appid=${OWM_API_KEY.value()}&units=metric`;

            const r = await fetch(url);
            const data = await r.json();
            res.json(data);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
);

// -- F.3: Gemini AI Content Generation --
exports.aiSuggest = functions.onRequest(
    { secrets: [GEMINI_API_KEY] },
    async (req, res) => {
        try {
            if (req.method !== "POST")
                return res.status(405).json({ error: "Use POST" });

            const { prompt = "Give me 3 healthy dinner ideas under 600 kcal." } =
                req.body || {};

            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const result = await model.generateContent(prompt);
            const text = result.response?.text?.() || "No content";
            res.json({ ok: true, text });
        } catch (e) {
            logger.error(e);
            res.status(500).json({ error: e.message });
        }
    }
);
