import React from 'react';

const TermsOfService = () => (
  <div style={{ fontFamily: 'Segoe UI, Arial, sans-serif', background: '#f7fafd', minHeight: '100vh', color: '#1a2233', padding: '48px 0' }}>
    <div style={{ maxWidth: 800, margin: '0 auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 40 }}>
      <h1 style={{ fontSize: 36, fontWeight: 800, color: '#2563eb', marginBottom: 24 }}>Terms of Service</h1>
      <p style={{ color: '#4b5563', fontSize: 17, marginBottom: 32 }}>
        Please read these Terms of Service carefully before using our platform.
      </p>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a2233', marginTop: 32 }}>Acceptance of Terms</h2>
      <p style={{ color: '#4b5563', fontSize: 16, marginBottom: 24 }}>
        By accessing or using our service, you agree to be bound by these terms.
      </p>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a2233', marginTop: 32 }}>User Responsibilities</h2>
      <ul style={{ color: '#4b5563', fontSize: 16, marginBottom: 24 }}>
        <li>Provide accurate and complete information</li>
        <li>Maintain the confidentiality of your account</li>
        <li>Comply with all applicable laws and regulations</li>
      </ul>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a2233', marginTop: 32 }}>Limitation of Liability</h2>
      <p style={{ color: '#4b5563', fontSize: 16, marginBottom: 24 }}>
        We are not liable for any damages or losses resulting from your use of the service.
      </p>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a2233', marginTop: 32 }}>Changes to Terms</h2>
      <p style={{ color: '#4b5563', fontSize: 16, marginBottom: 24 }}>
        We reserve the right to update these terms at any time. Continued use of the service constitutes acceptance of the new terms.
      </p>
      <p style={{ color: '#6b7280', fontSize: 15, marginTop: 40 }}>
        For questions, please contact us at <a href="mailto:novamindinsights@gmail.com" style={{ color: '#2563eb' }}>mahadhyutaedtech@gmail.com</a>.
      </p>
    </div>
  </div>
);

export default TermsOfService; 