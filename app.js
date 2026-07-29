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
app.use(helmet());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({
    message: 'AI Support Ticket API Running',
  });
});

app.use('/api/tickets', ticketRoutes);

module.exports = app;
