import { Router } from "express";
import { requireAuth } from "../auth.js";

const router = Router();

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your-gemini-api-key-here") {
    const err = new Error(
      "GEMINI_API_KEY is not configured on the server. Add your Google Gemini API key to server/.env."
    );
    err.status = 500;
    throw err;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data?.error?.message || "Gemini API request failed";
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }

  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";
  if (!text) {
    const err = new Error("Gemini returned an empty response");
    err.status = 502;
    throw err;
  }

  return text;
}

// All AI routes require a logged-in user, same as the app only calling these
// from the authenticated /generator page.
router.use(requireAuth);

router.post("/generate-document", async (req, res) => {
  try {
    const { documentType, parties, purpose, additionalDetails } = req.body || {};

    if (!documentType || !parties || !purpose) {
      return res.status(400).json({ error: "documentType, parties, and purpose are required" });
    }

    const prompt = `You are an expert Indian legal document drafter. Generate a professional, legally sound ${documentType} based on the following information:

Parties Involved: ${parties}
Purpose: ${purpose}
Additional Details: ${additionalDetails || "None provided"}

Requirements:
1. Follow Indian legal standards and formatting
2. Include all necessary clauses and provisions
3. Use proper legal terminology
4. Include standard boilerplate clauses (governing law, dispute resolution, etc.)
5. Make it comprehensive yet clear
6. Add placeholders for signatures and dates

Generate the complete legal document now.`;

    const document = await callGemini(prompt);
    res.json({ document });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

router.post("/compliance-check", async (req, res) => {
  try {
    const { document, documentType } = req.body || {};

    if (!document) {
      return res.status(400).json({ error: "document is required" });
    }

    const prompt = `You are an expert Indian legal compliance analyst. Analyze the following ${documentType || "legal document"} for compliance with Indian legal standards and identify any issues or missing elements.

Document:
${document}

Provide a detailed compliance analysis with:
1. Overall Compliance Score (0-100)
2. Critical Issues (if any)
3. Warnings (areas that need attention)
4. Missing Elements (standard clauses or sections that should be included)
5. Recommendations (specific improvements)

Format your response as a structured analysis that is clear and actionable.`;

    const analysis = await callGemini(prompt);
    res.json({ analysis });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

router.post("/suggest-clauses", async (req, res) => {
  try {
    const { documentType, context } = req.body || {};

    if (!documentType) {
      return res.status(400).json({ error: "documentType is required" });
    }

    const prompt = `You are an expert Indian legal document drafter. Suggest 5-7 essential clauses for a ${documentType} based on Indian legal standards.

Context: ${context || "None provided"}

For each clause, provide:
1. Clause Title
2. Brief Description (why it's important)
3. Sample Wording (professional legal language)

Focus on clauses that are:
- Legally sound under Indian law
- Commonly used in ${documentType}
- Protective of all parties' interests
- Clear and enforceable

Format each clause clearly with proper headings.`;

    const suggestions = await callGemini(prompt);
    res.json({ suggestions });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

export default router;
