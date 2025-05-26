import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import axiosInstance from '../utils/axiosConfig';
import { API_BASE } from "../config/config";
import '../css/UserProfilePage.css';

const ProfilePage = ({ isOpen, onClose, profileImage, onImageUpdate }) => {
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
      console.log('Image clicked, opening file dialog');
    }
  };

  // Update local image when profileImage prop changes
  useEffect(() => {
    if (profileImage) {
      setImageSrc(profileImage);
    }
  }, [profileImage]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    try {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');
  
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('profile_image', file);
  
      // Show temporary preview
      const previewUrl = URL.createObjectURL(file);
      setImageSrc(previewUrl);
  
      const response = await axiosInstance.post(`${API_BASE}/auth/upload-image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true"
        }
      });
  
      console.log('Upload response:', response.data);
  
      if (response.status === 200 && response.data.success) {
        console.log('Image uploaded successfully! Waiting to fetch updated profile...');
  
        // Wait for 1 second before fetching
        await new Promise(resolve => setTimeout(resolve, 1000));
  
        const userResponse = await axiosInstance.get(`${API_BASE}/auth/userDetails`, {
          params: { user_id: userId },
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true"
          }
        });
  
        if (userResponse.data?.userExist?.[0]) {
          const userData = userResponse.data.userExist[0];
         
          if (userData.profile_image) {
            
            const byteArray = new Uint8Array(userData.profile_image.data);
            const blob = new Blob([byteArray], { type: 'image/jpeg' });
  
            // Important: Revoke old image
            if (imageSrc) {
              URL.revokeObjectURL(imageSrc);
            }
  
            let serverImageUrl = URL.createObjectURL(blob);
  
            // Force no cache
            serverImageUrl += `?t=${Date.now()}`;
  
            setImageSrc(serverImageUrl);
            onImageUpdate?.(serverImageUrl);
          }
        }
        setUploadError(null);
      } else {
        console.error('Upload failed:', response.data);
        setUploadError('Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload image');
    }
  };
  

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem('authToken');
      const storedUserId = localStorage.getItem('userId');
      const storedEmail = localStorage.getItem('userEmail');
      const storedUsername = localStorage.getItem('username');
      const storedCreatedAt = localStorage.getItem('createdAt');
      const storedUpdatedAt = localStorage.getItem('updatedAt');

      if (!token || !storedUserId) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      // First set data from localStorage
      const localUserData = {
        user_id: storedUserId,
        email: storedEmail,
        username: storedUsername,
        created_at: storedCreatedAt,
        updated_at: storedUpdatedAt
      };
      setUser(localUserData);

      // Then fetch fresh data from API
      try {
        console.log('Fetching fresh user data...');
        const response = await axiosInstance.get(`${API_BASE}/auth/userDetails`, {
          params: { user_id: storedUserId },
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true"
          }
        });

        if (response.data?.message === "User Details" && response.data?.userExist?.[0]) {
          const userData = response.data.userExist[0];
          console.log('Fresh user data received:', userData);
          setUser(userData);
          // Only try to set image if profile_image exists and is not null
          if (userData.profile_image) {
            try {
              setImageSrc(userData.profile_image);
            } catch (imageError) {
              console.error('Error processing image:', imageError);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching fresh data:', error);
        // Don't set error if we have local data
        if (!localUserData.email) {
          setError(error.response?.data?.message || 'Error fetching user data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
    
    // Cleanup function
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, []);  // Removed API_BASE and user_id from dependencies

  // Check if modal root exists, if not create it
  useEffect(() => {
    let modalRoot = document.getElementById('modal-root');
    if (!modalRoot) {
      modalRoot = document.createElement('div');
      modalRoot.id = 'modal-root';
      document.body.appendChild(modalRoot);
    }
    return () => {
      if (modalRoot && !modalRoot.childNodes.length) {
        document.body.removeChild(modalRoot);
      }
    };
  }, []);

  if (!isOpen) return null;

  const processImageUrl = (imageData) => {
    if (!imageData) return null;
    
    try {
      if (typeof imageData === 'string') {
        if (imageData.startsWith('http') || imageData.startsWith('data:image')) {
          return imageData;
        }
        return `${API_BASE}${imageData}`;
      }
      
      if (imageData.data) {
        const byteArray = new Uint8Array(imageData.data);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        return URL.createObjectURL(blob);
      }
    } catch (error) {
      console.error('Error processing image URL:', error);
      return null;
    }
    
    return null;
  };

  return ReactDOM.createPortal(
    <div className="profile-overlay">
      <div className="profile-dialog">
        <button onClick={onClose} className="close-button" aria-label="Close">✕</button>

        {loading ? (
          <div className="loading">Loading profile...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : !user ? (
          <div className="not-found">User not found.</div>
        ) : (
          <>
            <div className="profile-gradient">
              <div className="profile-image-container">
                <button onClick={handleImageClick} type="button">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <img
                    src={processImageUrl(imageSrc)}
                    alt="Profile"
                    className="profile-image"
                    onError={(e) => {
                      console.error('Image failed to load:', e.target.src);
                      e.target.src = null;
                      e.target.onerror = null;
                    }}
                  />
                </button>
                {uploadError && <div className="error-message">{uploadError}</div>}
              </div>
              <h2 className="profile-name">{user.username}</h2>
              <p className="profile-role">User</p>
            </div>

            <div className="profile-content">
              <div className="profile-section">
                <h3>Account Information</h3>
                <p>Email: {user.email}</p>
                <p>User ID: {user.user_id}</p>
                <p>Member since: {new Date(user.created_at).toLocaleDateString()}</p>
              </div>

              <div className="profile-section">
                <h3>Account Details</h3>
                <p>Created: {new Date(user.created_at).toLocaleString()}</p>
                <p>Last Updated: {new Date(user.updated_at).toLocaleString()}</p>
                <p>Status: <span className="status-badge active">Active</span></p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

export default ProfilePage;
