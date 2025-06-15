import React, { useState } from 'react';

export default function AboutPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const API_URL = process.env.REACT_APP_API_URL || '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('Sending...');
    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      if (res.ok) {
        setStatus('Thank you for reaching out!');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setStatus('Failed to send message');
      }
    } catch (err) {
      setStatus('Failed to send message');
    }
  }

  return (
    <div className="page-content">
      <h2>About this project</h2>
      <p>
        311 Insight Dashboard is an open source tool for exploring Toronto service
        requests. It combines statistics and geospatial data to highlight trends
        across the city.
      </p>
      <h3>Contact Us</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Name:<br />
            <input type="text" value={name} onChange={e => setName(e.target.value)} required />
          </label>
        </div>
        <div>
          <label>
            Email:<br />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>
        </div>
        <div>
          <label>
            Message:<br />
            <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={4} />
          </label>
        </div>
        <button type="submit">Send</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
}
