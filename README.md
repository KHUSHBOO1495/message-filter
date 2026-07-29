# AI Support Ticket Classification System

Backend-only API that classifies customer support tickets with Groq, applies priority business rules, and stores results in MongoDB.

## Tech Stack

- Node.js
- Express.js
- JavaScript
- MongoDB Atlas (Mongoose)
- Groq API (`llama-3.1-8b-instant`)

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root:

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
CLIENT_ORIGIN=http://localhost:5173
```

| Variable | Description |
|----------|-------------|
| `PORT` | HTTP server port (default `5000`) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `GROQ_API_KEY` | Groq API key |
| `CLIENT_ORIGIN` | Allowed frontend origin(s), comma-separated. Omit to allow all origins. |

## How to Run

```bash
# Development (auto-reload with nodemon)
npm run dev

# Production
npm start
```

On startup you should see MongoDB connected and the server listening on the configured port.

Health check:

```http
GET /
```

```json
{
  "message": "AI Support Ticket API Running"
}
```

## API Endpoints

Base path: `/api/tickets`

### 1. Create ticket

`POST /api/tickets`

**Body**

```json
{
  "customerName": "Jane Doe",
  "customerEmail": "jane@example.com",
  "customerType": "regular",
  "message": "My package is delayed and tracking has not updated."
}
```

**Success — 201**

```json
{
  "success": true,
  "ticket": {
    "_id": "...",
    "customerName": "Jane Doe",
    "customerEmail": "jane@example.com",
    "customerType": "regular",
    "message": "My package is delayed and tracking has not updated.",
    "category": "Delivery",
    "sentiment": "Negative",
    "tags": ["package", "delivery", "tracking"],
    "suggestedReply": "...",
    "isAbusive": false,
    "priority": "Medium",
    "feedbackCorrect": null,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### 2. Get ticket by ID

`GET /api/tickets/:id`

**Success — 200**

```json
{
  "success": true,
  "ticket": { }
}
```

**Not found — 404**

```json
{
  "success": false,
  "message": "Ticket not found"
}
```

### 3. List tickets

`GET /api/tickets`

Optional query parameters:

- `category` — e.g. `Payment`
- `priority` — e.g. `High`
- `page` — page number
- `limit` — page size

Examples:

```http
GET /api/tickets
GET /api/tickets?category=Payment
GET /api/tickets?priority=High
GET /api/tickets?category=Payment&priority=Critical
GET /api/tickets?page=1&limit=10
```

**Success — 200**

```json
{
  "success": true,
  "count": 16,
  "page": 1,
  "limit": 10,
  "tickets": []
}
```

### 4. Submit feedback

`POST /api/tickets/:id/feedback`

**Body**

```json
{
  "correct": true
}
```

**Success — 200**

```json
{
  "success": true,
  "message": "Feedback recorded successfully.",
  "ticket": { }
}
```

## Business Rules

### Priority base mapping

| Category | Base priority |
|----------|---------------|
| Delivery | Medium |
| Payment | High |
| Refund | Medium |
| Login | Low |
| Account | Medium |
| Order | Medium |
| Other | Low |

### Adjustments

1. If sentiment is `Angry`, increase priority by one level:  
   `Low → Medium → High → Critical`
2. Enterprise customers with **3 or more** previous tickets (same email) must be at least `High`.
3. If `isAbusive` is `true`, `suggestedReply` is stored as an empty string.
4. Customer emails are normalized (trim + lowercase) before counting history and saving.

### AI classification

Only the ticket `message` is sent to Groq (no customer PII). Classification returns `category`, `sentiment`, `tags`, `isAbusive`, and `suggestedReply`. Invalid AI JSON is retried once; persistent failures return `502` or `503`.

## Folder Structure

```
message-filter/
├── config/
│   └── db.js
├── controllers/
│   └── ticketController.js
├── middleware/
├── models/
│   └── Ticket.js
├── routes/
│   └── ticketRoutes.js
├── services/
│   ├── aiService.js
│   └── ticketService.js
├── utils/
│   ├── AppError.js
│   └── calculatePriority.js
├── frontend/          # React demo UI (Vite)
├── app.js
├── server.js
├── package.json
├── .env
├── .gitignore
└── README.md
```

## Deploying on Render (recommended: one Web Service)

Do **not** point the frontend at `http://localhost:5000`. That only works on your laptop.

### Recommended: single Web Service (API + UI)

Create a **Web Service** (not a Static Site) from this repo:

- **Root Directory:** _(empty / repo root)_
- **Build Command:** `npm run render-build`
- **Start Command:** `npm start`
- **Environment:**

```
MONGODB_URI=...
GROQ_API_KEY=...
```

This builds the React app and Express serves it from the same domain. The UI calls `/api/tickets` on the same host — no localhost, no CORS issues.

Open the Web Service URL Render gives you (e.g. `https://message-filter-xxxx.onrender.com`).

You can delete or ignore the separate Static Site (`message-filter-1-bnhe`) if you use this approach.

### Alternative: separate Static Site + Web Service

Only if you keep two services:

1. Web Service for the API (`npm start`, env: `MONGODB_URI`, `GROQ_API_KEY`, `CLIENT_ORIGIN=https://your-frontend.onrender.com`)
2. Static Site for `frontend/` with:

```
VITE_API_URL=https://YOUR-BACKEND.onrender.com/api
```

Then **Clear build cache & deploy** the Static Site (Vite embeds this at build time).

### Local frontend

```bash
# terminal 1 — API
npm run dev

# terminal 2 — UI (proxies /api → localhost:5000)
cd frontend
npm run dev
```
