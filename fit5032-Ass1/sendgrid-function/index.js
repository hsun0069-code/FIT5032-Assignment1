const functions = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const sgMail = require("@sendgrid/mail");
const { defineSecret } = require("firebase-functions/params");

const SENDGRID_API_KEY = defineSecret("SENDGRID_API_KEY");
const SENDER_EMAIL = defineSecret("SENDER_EMAIL");

// Cloud Function: Sending Emails with Attachments
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
