function ResultCard({ ticket }) {
  const createdAt = ticket.createdAt
    ? new Date(ticket.createdAt).toLocaleString()
    : '—';

  return (
    <section className="result-card">
      <h2>Analysis Result</h2>

      <div className="result-grid">
        <div className="result-item">
          <span className="label">Category</span>
          <span className="value">{ticket.category}</span>
        </div>

        <div className="result-item">
          <span className="label">Priority</span>
          <span className={`value priority ${ticket.priority?.toLowerCase()}`}>
            {ticket.priority}
          </span>
        </div>

        <div className="result-item">
          <span className="label">Sentiment</span>
          <span className="value">{ticket.sentiment}</span>
        </div>

        <div className="result-item full">
          <span className="label">Tags</span>
          <div className="tags">
            {ticket.tags?.length
              ? ticket.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))
              : '—'}
          </div>
        </div>

        <div className="result-item full">
          <span className="label">Suggested Reply</span>
          <p className="value reply">
            {ticket.suggestedReply || 'No reply suggested.'}
          </p>
        </div>

        <div className="result-item">
          <span className="label">Ticket ID</span>
          <span className="value mono">{ticket._id}</span>
        </div>

        <div className="result-item">
          <span className="label">Created At</span>
          <span className="value">{createdAt}</span>
        </div>
      </div>
    </section>
  );
}

export default ResultCard;
