import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../css/modules/invoice/InvoiceTemplateChooser.css";

const templates = [
  {
    key: "modern-professional",
    name: "Modern Professional",
    image: "/assets/templates/modern.png",
  },
  {
    key: "modern",
    name: "Modern",
    image: "/assets/classic.png",
  },
  {
    key: "classic",
    name: "Classic",
    image: "/assets/classic.png",
  },
  {
    key: "original-classic",
    name: "Original Classic",
    image: "/assets/classic.png",
  }
];

const InvoiceTemplateChooser = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState("modern-professional");

  // On mount, check localStorage for saved template
  useEffect(() => {
    if (invoiceId) {
      const saved = localStorage.getItem(`invoice_template_${invoiceId}`);
      if (saved && templates.some(t => t.key === saved)) {
        setSelectedTemplate(saved);
      }
    }
  }, [invoiceId]);

  const handleSelect = (templateKey) => {
    setSelectedTemplate(templateKey);
    if (invoiceId) {
      localStorage.setItem(`invoice_template_${invoiceId}`, templateKey);
    }
  };

  const handleNext = () => {
    const templatePaths = {
      "modern-professional": "modern-professional-invoice-pdf",
      modern: "modern-invoice-pdf",
      classic: "classic-invoice-pdf",
      "original-classic": "original-classic-invoice-pdf",
    };
    navigate(`/dashboard/${templatePaths[selectedTemplate]}/${invoiceId}`);
  };

  return (
    <div className="chooser-container">
      <h2>Select your Invoice format to start billing</h2>
      <p>DEBUG: Invoice Template Chooser is rendering!</p>

      <div className="carousel-wrapper">
        <button
          className="scroll-btn left"
          onClick={() =>
            document.querySelector(".carousel")?.scrollBy({ left: -300, behavior: "smooth" })
          }
        >
          ←
        </button>

        <div className="carousel">
          {templates.map((tpl) => (
            <div
              key={tpl.key}
              className={`template-card ${selectedTemplate === tpl.key ? "selected" : ""}`}
              onClick={() => handleSelect(tpl.key)}
            >
              <img src={tpl.image} alt={tpl.name} />
              <div className="template-footer">
                <span>{tpl.name}</span>
                {tpl.premium && <span className="crown">👑</span>}
                {selectedTemplate === tpl.key && <span className="tick">✔</span>}
              </div>
            </div>
          ))}
        </div>

        <button
          className="scroll-btn right"
          onClick={() =>
            document.querySelector(".carousel")?.scrollBy({ left: 300, behavior: "smooth" })
          }
        >
          →
        </button>
      </div>

      <button className="cta-btn" onClick={handleNext}>
        Make your invoice in 30 seconds
      </button>
    </div>
  );
};

export default InvoiceTemplateChooser;
