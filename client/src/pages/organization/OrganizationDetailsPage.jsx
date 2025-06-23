import React from "react";
import '../../css/modules/organization/OrganizationDetailsPage.css';
import { FaBuilding, FaEnvelope, FaPhone, FaGlobe, FaFileAlt, FaSignature, FaGavel } from "react-icons/fa";
import { MdBusinessCenter, MdLocationOn } from "react-icons/md";

const OrganizationDetailsPage = ({ organization, onClose }) => {
  if (!organization) return null;

  return (
    <div className="organization-details-dialog-overlay" onClick={onClose}>
      <div className="organization-details-dialog-container compact" onClick={e => e.stopPropagation()}>
        <div className="organization-details-dialog-header">
          <h3><FaBuilding className="organization-details-header-icon" /> Organization Details</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="organization-details-dialog-body">
          <div className="organization-details-grid-container compact">
            <div className="org-detail-box compact">
              <h4 className="organization-details-box-title"><MdBusinessCenter className="section-icon" /> Basic Info</h4>
              <hr />
              <div className="org-detail-info-row">
                <p className="org-detail-label">ID</p>
                <p className="org-detail-value">{organization.org_id || "N/A"}</p>
              </div>
              <div className="org-detail-info-row">
                <p className="org-detail-label">Name</p>
                <p className="org-detail-value">{organization.name || "N/A"}</p>
              </div>
              <div className="org-detail-info-row">
                <p className="org-detail-label">Type</p>
                <p className="org-detail-value">{organization.type || "N/A"}</p>
              </div>
            </div>

            <div className="org-detail-box compact">
              <h4 className="org-detail-section-title"><FaEnvelope className="section-icon" /> Contact</h4>
              <hr />
              <div className="org-detail-info-row">
                <p className="org-detail-label"><FaEnvelope className="field-icon" /> Email</p>
                <p className="org-detail-value">{organization.email || "N/A"}</p>
              </div>
              <div className="org-detail-info-row">
                <p className="org-detail-label"><FaPhone className="field-icon" /> Phone</p>
                <p className="org-detail-value">{organization.phone || "N/A"}</p>
              </div>
              <div className="org-detail-info-row">
                <p className="org-detail-label"><FaGlobe className="field-icon" /> Website</p>
                <p className="org-detail-value">{organization.website || "N/A"}</p>
              </div>
            </div>

            <div className="org-detail-box compact">
              <h4 className="org-detail-section-title"><FaFileAlt className="section-icon" /> Legal Info</h4>
              <hr />
              <div className="org-detail-info-row">
                <p className="org-detail-label">Registration No</p>
                <p className="org-detail-value">{organization.reg_number || "N/A"}</p>
              </div>
              <div className="org-detail-info-row">
                <p className="org-detail-label">PAN</p>
                <p className="org-detail-value">{organization.pan_number || "N/A"}</p>
              </div>
            </div>

            {organization.signature_image && (
              <div className="org-detail-box compact">
                <h4 className="org-detail-section-title"><FaSignature className="section-icon" /> Signature</h4>
                <hr />
                <img
                  src={organization.signature_image}
                  alt="Signature"
                  className="org-detail-signature-img"
                />
              </div>
            )}

            {organization.gst_details &&
              Object.entries(organization.gst_details).map(([state, gst]) => (
                <div className="org-detail-box compact" key={state}>
                  <h4 className="org-detail-section-title"><FaGavel className="section-icon" /> {state} GST</h4>
                  <hr />
                  <div className="org-detail-info-row">
                    <p className="org-detail-label">GST No</p>
                    <p className="org-detail-value">{gst.gst_number || "N/A"}</p>
                  </div>
                  <div className="org-detail-info-row">
                    <p className="org-detail-label"><MdLocationOn className="field-icon" /> Address</p>
                    <p className="org-detail-value">{gst.address || "N/A"}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationDetailsPage;