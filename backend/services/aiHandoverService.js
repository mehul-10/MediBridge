
const OpenAI = require("openai");

const generateHandoverSummary = async (clinicalNotes) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    response_format: {
      type: "json_object",
    },
    messages: [
      {
        role: "system",
        content: `
You are a clinical documentation assistant.

Organize only facts explicitly provided in the clinical notes.
Do not diagnose, prescribe, recommend treatment, or invent facts.
Do not infer missing information.
For missing information, write "Not specified".
Preserve medication names, doses, dates, and clinical details exactly.
Clearly identify uncertainty or conflicting information.
Prepare a concise clinical handover draft for clinician review.

Return valid JSON with exactly these fields:
{
  "patientCondition": "string",
  "relevantHistory": "string",
  "currentTreatments": "string",
  "currentMedications": "string",
  "pendingTests": "string",
  "risksAndObservations": "string",
  "followUpTasks": "string",
  "missingInformation": ["string"]
}
        `,
      },
      {
        role: "user",
        content: clinicalNotes,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI returned an empty response.");
  }

  return JSON.parse(content);
};

module.exports = { generateHandoverSummary };
