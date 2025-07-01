import React from 'react';

const PrivacyPolicy = () => (
  <div style={{ fontFamily: 'Segoe UI, Arial, sans-serif', background: '#f7fafd', minHeight: '100vh', color: '#1a2233', padding: '48px 0' }}>
    <div style={{ maxWidth: 800, margin: '0 auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 40 }}>
      <h1 style={{ fontSize: 36, fontWeight: 800, color: '#2563eb', marginBottom: 24 }}>Privacy Policy</h1>
      <p style={{ color: '#4b5563', fontSize: 17, marginBottom: 32 }}>
        Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information.
      </p>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a2233', marginTop: 32 }}>Information We Collect</h2>
      <ul style={{ color: '#4b5563', fontSize: 16, marginBottom: 24 }}>
        <li>Personal identification information (Name, email address, phone number, etc.)</li>
        <li>Usage data and cookies</li>
        <li>Payment and billing information</li>
      </ul>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a2233', marginTop: 32 }}>How We Use Information</h2>
      <ul style={{ color: '#4b5563', fontSize: 16, marginBottom: 24 }}>
        <li>To provide and maintain our service</li>
        <li>To notify you about changes to our service</li>
        <li>To provide customer support</li>
        <li>To monitor usage and improve our service</li>
      </ul>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a2233', marginTop: 32 }}>Your Rights</h2>
      <ul style={{ color: '#4b5563', fontSize: 16, marginBottom: 24 }}>
        <li>Access, update, or delete your personal information</li>
        <li>Opt out of marketing communications</li>
        <li>Request data portability</li>
      </ul>
      <p style={{ color: '#6b7280', fontSize: 15, marginTop: 40 }}>
        For more details or questions, please contact us at <a href="mailto:novamindinsights@gmail.com" style={{ color: '#2563eb' }}>mahadhyutaedtech@gmail.com</a>.
      </p>
    </div>
  </div>
);

export default PrivacyPolicy; 