const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const ticketRoutes = require('./routes/ticketRoutes');

const app = express();

const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim())
  : true;

app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins,
  })
);
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({
    message: 'AI Support Ticket API Running',
  });
});

app.use('/api/tickets', ticketRoutes);

const clientDistPath = path.join(__dirname, 'frontend', 'dist');
const hasClientBuild = fs.existsSync(path.join(clientDistPath, 'index.html'));

if (hasClientBuild) {
  app.use(express.static(clientDistPath));

  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) {
      return next();
    }

    return res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      message: 'AI Support Ticket API Running',
    });
  });
}

module.exports = app;
