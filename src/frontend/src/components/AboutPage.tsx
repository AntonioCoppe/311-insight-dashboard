import React from 'react';

export default function AboutPage() {
  return (
    <div className="page-content">
      <h2>About this project</h2>
      <p>
        311 Insight Dashboard is an open source tool for exploring Toronto service
        requests. It combines statistics and geospatial data to highlight trends
        across the city.
      </p>
      <h3>Contact Us</h3>
      <form onSubmit={e => { e.preventDefault(); alert('Thanks for your message!'); }}>
        <div>
          <label>
            Name:<br />
            <input type="text" required />
          </label>
        </div>
        <div>
          <label>
            Email:<br />
            <input type="email" required />
          </label>
        </div>
        <div>
          <label>
            Message:<br />
            <textarea required rows={4} />
          </label>
        </div>
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
