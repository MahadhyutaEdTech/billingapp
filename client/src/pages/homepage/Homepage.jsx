import React from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    title: 'Automated Invoicing',
    description: 'Generate, send, and track invoices with ease. Reduce manual work and errors.',
    img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80',
    alt: 'Automated Invoicing'
  },
  {
    title: 'Real-Time Analytics',
    description: 'Get actionable insights into your billing, revenue, and outstanding payments.',
    img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    alt: 'Real-Time Analytics'
  },
  {
    title: 'Secure Data',
    description: 'Enterprise-grade security and compliance for all your financial data.',
    img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    alt: 'Secure Data'
  },
  {
    title: 'Multi-User Access',
    description: 'Collaborate with your team and manage permissions with ease.',
    img: 'https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?auto=format&fit=crop&w=400&q=80',
    alt: 'Multi-User Access'
  },
  {
    title: 'Customizable Templates',
    description: 'Professional invoice templates tailored to your brand.',
    img: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80',
    alt: 'Customizable Templates'
  },
  {
    title: 'Priority Support',
    description: 'Dedicated support team for fast, reliable assistance.',
    img: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
    alt: 'Priority Support'
  }
];

const Homepage = () => {
  const navigate = useNavigate();
  return (
    <div style={{ fontFamily: 'Segoe UI, Arial, sans-serif', background: '#f7fafd', minHeight: '100vh', color: '#1a2233' }}>
      {/* Navigation */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e5eaf1', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, padding: '0 32px' }}>
          <div style={{ fontWeight: 700, fontSize: 24, color: '#2563eb', letterSpacing: 1 }}>BillFlow</div>
          <div style={{ display: 'flex', gap: 32 }}>
            <button style={{ background: 'none', border: 'none', color: '#1a2233', fontSize: 16, cursor: 'pointer' }} onClick={() => navigate('/auth')}>Login</button>
            <button style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 24px', fontWeight: 600, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.08)' }} onClick={() => navigate('/auth')}>Sign Up</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ background: '#f7fafd', padding: '64px 0 48px 0', borderBottom: '1px solid #e5eaf1' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', padding: '0 32px' }}>
          <div style={{ flex: 1, minWidth: 320, marginRight: 32 }}>
            <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 16, color: '#1a2233', letterSpacing: -1 }}>Corporate Invoice Management</h1>
            <p style={{ fontSize: 20, color: '#4b5563', marginBottom: 32, maxWidth: 600 }}>
              Streamline your company's billing and revenue operations with a secure, scalable, and intuitive platform trusted by leading enterprises.
            </p>
            <button style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, padding: '16px 48px', fontWeight: 700, fontSize: 20, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.12)' }} onClick={() => navigate('/auth')}>Get Started</button>
          </div>
          <div style={{ flex: 1, minWidth: 320, textAlign: 'center' }}>
            <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80" alt="Corporate dashboard" style={{ maxWidth: '100%', borderRadius: 16, boxShadow: '0 4px 24px rgba(37,99,235,0.08)' }} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ background: '#f7fafd', padding: '64px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: '#1a2233', marginBottom: 32, textAlign: 'center' }}>Key Features</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
            {features.map((feature, idx) => (
              <div key={idx} style={{ background: '#fff', border: '1px solid #e5eaf1', borderRadius: 8, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img src={feature.img} alt={feature.alt} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 12, marginBottom: 20, boxShadow: '0 2px 8px rgba(37,99,235,0.08)' }} />
                <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 12, color: '#2563eb', textAlign: 'center' }}>{feature.title}</div>
                <div style={{ color: '#4b5563', fontSize: 16, textAlign: 'center' }}>{feature.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section style={{ background: '#fff', padding: '64px 0', borderBottom: '1px solid #e5eaf1' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 48, padding: '0 32px' }}>
          <div style={{ flex: 1, minWidth: 320 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#1a2233', marginBottom: 24 }}>About NOVAMIND INSIGHTS PRIVATE LIMITED</h2>
            <p style={{ color: '#4b5563', fontSize: 18, lineHeight: 1.7 }}>
              NOVAMIND INSIGHTS PRIVATE LIMITED is a pioneering force in educational technology, specializing in AI and ML solutions that transform learning experiences. Our innovative billing platform represents our commitment to simplifying complex processes through intelligent automation and cutting-edge technology.
            </p>
          </div>
          <div style={{ flex: 1, minWidth: 320, textAlign: 'center' }}>
            <img src="https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=600&q=80" alt="About our company" style={{ maxWidth: '100%', borderRadius: 16, boxShadow: '0 4px 24px rgba(37,99,235,0.08)' }} />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section style={{ background: '#f7fafd', padding: '64px 0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', padding: '0 32px' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: '#1a2233', marginBottom: 24 }}>Get In Touch</h2>
          <p style={{ color: '#4b5563', fontSize: 18, marginBottom: 32 }}>We'd love to hear from you</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 48 }}>
            <div style={{ minWidth: 220 }}>
              <div style={{ fontWeight: 600, color: '#2563eb', fontSize: 18, marginBottom: 8 }}>Email</div>
              <div style={{ color: '#4b5563', fontSize: 16 }}>mahadhyutaedtech@gmail.com</div>
            </div>
            <div style={{ minWidth: 220 }}>
              <div style={{ fontWeight: 600, color: '#2563eb', fontSize: 18, marginBottom: 8 }}>Phone</div>
              <div style={{ color: '#4b5563', fontSize: 16 }}>+91 9452801761</div>
            </div>
            <div style={{ minWidth: 220 }}>
              <div style={{ fontWeight: 600, color: '#2563eb', fontSize: 18, marginBottom: 8 }}>Location</div>
              <div style={{ color: '#4b5563', fontSize: 16 }}>Bhubaneswar, Odisha<br />India - 751015</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#fff', borderTop: '1px solid #e5eaf1', padding: '32px 0', marginTop: 32 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 20, color: '#2563eb' }}>BillFlow</div>
          <div style={{ color: '#6b7280', fontSize: 15 }}>© {new Date().getFullYear()} NOVAMIND INSIGHTS PRIVATE LIMITED. All rights reserved.</div>
          <div style={{ color: '#6b7280', fontSize: 15 }}>
            <a href="#" style={{ color: '#2563eb', textDecoration: 'none', marginRight: 16 }}>Privacy Policy</a>
            <a href="#" style={{ color: '#2563eb', textDecoration: 'none', marginRight: 16 }}>Terms of Service</a>
            <a href="#" style={{ color: '#2563eb', textDecoration: 'none' }}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;