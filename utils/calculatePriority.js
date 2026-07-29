const PRIORITY_LEVELS = ['Low', 'Medium', 'High', 'Critical'];

const BASE_PRIORITY = {
  Delivery: 'Medium',
  Payment: 'High',
  Refund: 'Medium',
  Login: 'Low',
  Account: 'Medium',
  Order: 'Medium',
  Other: 'Low',
};

const increasePriority = (priority) => {
  const index = PRIORITY_LEVELS.indexOf(priority);
  if (index === -1 || index === PRIORITY_LEVELS.length - 1) {
    return priority;
  }
  return PRIORITY_LEVELS[index + 1];
};

const calculatePriority = (category, sentiment, customerType, previousTicketCount) => {
  let priority = BASE_PRIORITY[category] || 'Low';

  if (sentiment === 'Angry') {
    priority = increasePriority(priority);
  }

  if (customerType === 'enterprise' && previousTicketCount >= 3) {
    const currentIndex = PRIORITY_LEVELS.indexOf(priority);
    const highIndex = PRIORITY_LEVELS.indexOf('High');
    if (currentIndex < highIndex) {
      priority = 'High';
    }
  }

  return priority;
};

module.exports = calculatePriority;
