import { useState } from 'react';
import TicketForm from './components/TicketForm';
import ResultCard from './components/ResultCard';
import { createTicket } from './services/api';
import './App.css';

const initialForm = {
  customerName: '',
  customerEmail: '',
  customerType: 'regular',
  message: '',
};

function App() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setTicket(null);

    try {
      const data = await createTicket(form);
      setTicket(data.ticket);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <main className="container">
        <header className="hero">
          <h1>AI Support Ticket Classifier</h1>
          <p className="subtitle">
            Demo for AI-powered Support Ticket Analysis
          </p>
        </header>

        <section className="card">
          <TicketForm
            form={form}
            onChange={handleChange}
            onSubmit={handleSubmit}
            loading={loading}
          />

          {loading && (
            <div className="loading" role="status">
              <span className="spinner" aria-hidden="true" />
              Analysing ticket with AI...
            </div>
          )}

          {error && (
            <div className="alert" role="alert">
              {error}
            </div>
          )}
        </section>

        {ticket && <ResultCard ticket={ticket} />}
      </main>
    </div>
  );
}

export default App;
