const express = require('express');
const {
  createTicket,
  getTicketById,
  getAllTickets,
  submitFeedback,
} = require('../controllers/ticketController');

const router = express.Router();

router.get('/', getAllTickets);
router.post('/', createTicket);
router.post('/:id/feedback', submitFeedback);
router.get('/:id', getTicketById);

module.exports = router;
