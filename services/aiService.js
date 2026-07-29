const Groq = require('groq-sdk');
const { APIConnectionError, APIConnectionTimeoutError } = Groq;
const AppError = require('../utils/AppError');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const VALID_CATEGORIES = [
  'Delivery',
  'Payment',
  'Refund',
  'Login',
  'Account',
  'Order',
  'Other',
];

const VALID_SENTIMENTS = ['Positive', 'Neutral', 'Negative', 'Angry'];

const CLASSIFICATION_SYSTEM_PROMPT = `You are an AI support ticket classifier.

Analyze the customer's message.

Return ONLY valid JSON.

Do NOT include markdown.

Do NOT include explanations.

The JSON format must be:

{
  "category":"",
  "sentiment":"",
  "tags":[],
  "isAbusive":false,
  "suggestedReply":""
}

Rules:

Category must be exactly one of:

Delivery
Payment
Refund
Login
Account
Order
Other

Sentiment must be exactly one of:

Positive
Neutral
Negative
Angry

tags must contain 2-5 short keywords.

If the message contains abusive, insulting, threatening or offensive language:

"isAbusive": true

AND

"suggestedReply":""

Otherwise generate a short professional customer support reply.

Never generate priority.

Never include any additional fields.`;

const isRetryableError = (error) => {
  if (error.code === 'INVALID_JSON') {
    return true;
  }

  if (
    error instanceof APIConnectionError ||
    error instanceof APIConnectionTimeoutError
  ) {
    return true;
  }

  return false;
};

const validateClassification = (data) => {
  if (!data || typeof data !== 'object') {
    throw new AppError('AI service returned an invalid response.', 502);
  }

  if (!VALID_CATEGORIES.includes(data.category)) {
    throw new AppError('AI service returned an invalid response.', 502);
  }

  if (!VALID_SENTIMENTS.includes(data.sentiment)) {
    throw new AppError('AI service returned an invalid response.', 502);
  }

  if (!Array.isArray(data.tags) || data.tags.length < 1) {
    throw new AppError('AI service returned an invalid response.', 502);
  }

  if (typeof data.isAbusive !== 'boolean') {
    throw new AppError('AI service returned an invalid response.', 502);
  }

  if (typeof data.suggestedReply !== 'string') {
    throw new AppError('AI service returned an invalid response.', 502);
  }
};

const requestClassification = async (message) => {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: CLASSIFICATION_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: JSON.stringify({ message }),
      },
    ],
  });

  const content = completion.choices?.[0]?.message?.content;

  if (!content) {
    const error = new Error('Empty AI response');
    error.code = 'INVALID_JSON';
    throw error;
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    const parseError = new Error('Invalid JSON');
    parseError.code = 'INVALID_JSON';
    throw parseError;
  }
};

const classifyTicket = async (message) => {
  let lastError;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const parsed = await requestClassification(message);
      validateClassification(parsed);
      return parsed;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      lastError = error;

      if (isRetryableError(error) && attempt === 0) {
        continue;
      }

      if (error.code === 'INVALID_JSON') {
        throw new AppError('AI service returned an invalid response.', 502);
      }

      throw new AppError('Unable to classify ticket at this time.', 503);
    }
  }

  if (lastError?.code === 'INVALID_JSON') {
    throw new AppError('AI service returned an invalid response.', 502);
  }

  throw new AppError('Unable to classify ticket at this time.', 503);
};

module.exports = {
  classifyTicket,
};
