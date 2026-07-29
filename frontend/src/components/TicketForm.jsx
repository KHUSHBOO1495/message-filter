function TicketForm({ form, onChange, onSubmit, loading }) {
  return (
    <form className="ticket-form" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="customerName">Customer Name</label>
        <input
          id="customerName"
          name="customerName"
          type="text"
          value={form.customerName}
          onChange={onChange}
          placeholder="Jane Doe"
          required
        />
      </div>

      <div className="field">
        <label htmlFor="customerEmail">Customer Email</label>
        <input
          id="customerEmail"
          name="customerEmail"
          type="email"
          value={form.customerEmail}
          onChange={onChange}
          placeholder="jane@example.com"
          required
        />
      </div>

      <div className="field">
        <label htmlFor="customerType">Customer Type</label>
        <select
          id="customerType"
          name="customerType"
          value={form.customerType}
          onChange={onChange}
          required
        >
          <option value="regular">Regular</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="message">Support Message</label>
        <textarea
          id="message"
          name="message"
          rows="5"
          value={form.message}
          onChange={onChange}
          placeholder="Describe the customer issue..."
          required
        />
      </div>

      <button type="submit" className="analyse-btn" disabled={loading}>
        {loading ? 'Analysing...' : 'Analyse Ticket'}
      </button>
    </form>
  );
}

export default TicketForm;
