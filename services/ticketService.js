const Ticket = require('../models/Ticket');
const { classifyTicket } = require('./aiService');
const calculatePriority = require('../utils/calculatePriority');

const createTicket = async ({ customerName, customerEmail, customerType, message }) => {
  const normalizedEmail = customerEmail.trim().toLowerCase();

  const previousTicketCount = await Ticket.countDocuments({
    customerEmail: normalizedEmail,
  });

  const classification = await classifyTicket(message);

  const suggestedReply = classification.isAbusive
    ? ''
    : classification.suggestedReply;

  const priority = calculatePriority(
    classification.category,
    classification.sentiment,
    customerType,
    previousTicketCount
  );

  const ticket = await Ticket.create({
    customerName,
    customerEmail: normalizedEmail,
    customerType,
    message,
    category: classification.category,
    sentiment: classification.sentiment,
    tags: classification.tags,
    suggestedReply,
    isAbusive: classification.isAbusive,
    priority,
  });

  return ticket;
};

const getTicketById = (id) => {
  return Ticket.findById(id);
};

const getAllTickets = async ({ category, priority, page, limit } = {}) => {
  const query = {};

  if (category) {
    query.category = category;
  }

  if (priority) {
    query.priority = priority;
  }

  const count = await Ticket.countDocuments(query);

  const currentPage = page ? Math.max(parseInt(page, 10), 1) : 1;
  const hasLimit = limit !== undefined && limit !== null && limit !== '';
  const pageLimit = hasLimit ? Math.max(parseInt(limit, 10), 1) : count;

  let ticketsQuery = Ticket.find(query).sort({ createdAt: -1 });

  if (hasLimit) {
    const skip = (currentPage - 1) * pageLimit;
    ticketsQuery = ticketsQuery.skip(skip).limit(pageLimit);
  }

  const tickets = await ticketsQuery;

  return {
    tickets,
    count,
    page: currentPage,
    limit: hasLimit ? pageLimit : count,
  };
};

const submitFeedback = async (id, correct) => {
  const ticket = await Ticket.findById(id);

  if (!ticket) {
    return null;
  }

  ticket.feedbackCorrect = correct;
  await ticket.save();

  return ticket;
};

module.exports = {
  createTicket,
  getTicketById,
  getAllTickets,
  submitFeedback,
};
