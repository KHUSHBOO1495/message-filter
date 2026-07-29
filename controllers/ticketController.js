const mongoose = require('mongoose');
const ticketService = require('../services/ticketService');
const AppError = require('../utils/AppError');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_CUSTOMER_TYPES = ['regular', 'enterprise'];

const validateCreateTicketInput = (body = {}) => {
  if (typeof body.customerName !== 'string' || !body.customerName.trim()) {
    throw new AppError('Customer name cannot be empty.', 400);
  }

  if (typeof body.customerEmail !== 'string' || !body.customerEmail.trim()) {
    throw new AppError('Invalid email format.', 400);
  }

  const customerEmail = body.customerEmail.trim().toLowerCase();

  if (!EMAIL_REGEX.test(customerEmail)) {
    throw new AppError('Invalid email format.', 400);
  }

  if (typeof body.customerType !== 'string' || !body.customerType.trim()) {
    throw new AppError('Invalid customer type.', 400);
  }

  const customerType = body.customerType.trim();

  if (!VALID_CUSTOMER_TYPES.includes(customerType)) {
    throw new AppError('Invalid customer type.', 400);
  }

  if (typeof body.message !== 'string' || !body.message.trim()) {
    throw new AppError('Message cannot be empty.', 400);
  }

  return {
    customerName: body.customerName.trim(),
    customerEmail,
    customerType,
    message: body.message.trim(),
  };
};

const createTicket = async (req, res) => {
  try {
    const payload = validateCreateTicketInput(req.body);

    const ticket = await ticketService.createTicket(payload);

    return res.status(201).json({
      success: true,
      ticket,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const message =
      statusCode === 500 ? 'Failed to create ticket.' : error.message;

    if (statusCode >= 500) {
      console.error('Create ticket error:', error.message);
    }

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket ID',
      });
    }

    const ticket = await ticketService.getTicketById(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    return res.status(200).json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error('Get ticket error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket.',
    });
  }
};

const getAllTickets = async (req, res) => {
  try {
    const { category, priority, page, limit } = req.query;

    const result = await ticketService.getAllTickets({
      category,
      priority,
      page,
      limit,
    });

    if (result.count === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        tickets: [],
      });
    }

    return res.status(200).json({
      success: true,
      count: result.count,
      page: result.page,
      limit: result.limit,
      tickets: result.tickets,
    });
  } catch (error) {
    console.error('Get all tickets error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets.',
    });
  }
};

const submitFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { correct } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket ID',
      });
    }

    if (typeof correct !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'correct is required and must be a boolean.',
      });
    }

    const ticket = await ticketService.submitFeedback(id, correct);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Feedback recorded successfully.',
      ticket,
    });
  } catch (error) {
    console.error('Submit feedback error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to submit feedback.',
    });
  }
};

module.exports = {
  createTicket,
  getTicketById,
  getAllTickets,
  submitFeedback,
};
