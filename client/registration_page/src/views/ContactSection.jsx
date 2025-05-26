import React from "react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

const ContactSection = () => {
  return (
    <section className="contact">
      <h2 className="section-title">Contact Us</h2>
      <div className="contact-content">
        <p className="section-text">
          <FaEnvelope className="contact-icon" />
          <span>Email: </span>
          <a href="mailto:support@myapp.com">support@myapp.com</a>
        </p>
        <p className="section-text">
          <FaPhone className="contact-icon" />
          <span>Phone: </span>
          <a href="tel:+15551234567">+1 (555) 123-4567</a>
        </p>
        <p className="section-text">
          <FaMapMarkerAlt className="contact-icon" />
          <span>Address: </span>
          123 Business Street, City, State 12345
        </p>
      </div>
    </section>
  );
};

export default ContactSection;