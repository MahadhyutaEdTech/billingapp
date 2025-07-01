import React, { useState } from 'react';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Here you would handle sending the form data to your backend or email service
  };

  return (
    <div style={{ fontFamily: 'Segoe UI, Arial, sans-serif', background: '#f7fafd', minHeight: '100vh', color: '#1a2233', padding: '48px 0' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 40 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: '#2563eb', marginBottom: 24 }}>Contact Us</h1>
        <p style={{ color: '#4b5563', fontSize: 17, marginBottom: 32 }}>
          We'd love to hear from you! Fill out the form below or email us at <a href="mailto:novamindinsights@gmail.com" style={{ color: '#2563eb' }}>novamindinsights@gmail.com</a>.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40 }}>
          <form onSubmit={handleSubmit} style={{ flex: 1, minWidth: 260 }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: 12, border: '1px solid #e5eaf1', borderRadius: 6, fontSize: 16 }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: 12, border: '1px solid #e5eaf1', borderRadius: 6, fontSize: 16 }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                style={{ width: '100%', padding: 12, border: '1px solid #e5eaf1', borderRadius: 6, fontSize: 16 }}
              />
            </div>
            <button
              type="submit"
              style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, padding: '12px 32px', fontWeight: 700, fontSize: 17, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.08)' }}
              disabled={submitted}
            >
              {submitted ? 'Message Sent!' : 'Send Message'}
            </button>
          </form>
          <div style={{ flex: 1, minWidth: 260, color: '#4b5563', fontSize: 16 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a2233', marginBottom: 16 }}>Company Info</h2>
            <p style={{ marginBottom: 12 }}><strong>Email:</strong> <a href="mailto:novamindinsights@gmail.com" style={{ color: '#2563eb' }}>novamindinsights@gmail.com</a></p>
            <p style={{ marginBottom: 12 }}><strong>Location:</strong> Bhubaneswar, Odisha, India - 751015</p>
            <p style={{ marginBottom: 12 }}><strong>Phone:</strong> +91 9452801761</p>
            <p style={{ marginBottom: 12 }}><strong>Company:</strong> NOVAMIND INSIGHTS PRIVATE LIMITED</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 