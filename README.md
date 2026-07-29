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

## Deploying on Render

You need **two services**:

1. **Web Service** — Express backend (`server.js`)
2. **Static Site** — React frontend (`frontend/`)

A browser on `https://....onrender.com` cannot call `http://localhost:5000`. Vite bakes `VITE_API_URL` in at **build** time.

### 1) Backend (Web Service)

- **Root Directory:** leave empty (repo root)
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment:**

```
MONGODB_URI=...
GROQ_API_KEY=...
CLIENT_ORIGIN=https://message-filter-1-bnhe.onrender.com
```

Copy the backend URL after deploy, e.g. `https://message-filter-api.onrender.com`.

### 2) Frontend (Static Site)

- **Root Directory:** `frontend`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`
- **Environment:**

```
VITE_API_URL=https://YOUR-BACKEND-SERVICE.onrender.com/api
```

Then **Clear build cache & deploy** so Vite rebuilds with the new API URL.

### Local frontend

```bash
cd frontend
npm install
npm run dev
```

Uses `frontend/.env` → `VITE_API_URL=http://localhost:5000/api` by default.
