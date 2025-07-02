import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import axiosInstance from '../../utils/axiosConfig';
import { API_BASE } from "../../config/config";
import '../../css/modules/common/UserProfilePage.css';
import { FaKey, FaEye, FaEyeSlash, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const modalRoot = document.createElement('div');
modalRoot.id = 'modal-root';
document.body.appendChild(modalRoot);

// Base64 encoded default avatar - replace with your minimal default avatar
const DEFAULT_AVATAR_BASE64 = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48Y2lyY2xlIGN4PSIxMiIgY3k9IjgiIHI9IjQiIGZpbGw9IiNjY2MiLz48cGF0aCBkPSJNNCAxOWMwLTMuMzE0IDMuNTgyLTYgOC02czggMi42ODYgOCA2SDR6IiBmaWxsPSIjY2NjIi8+PC9zdmc+';

const ProfilePage = ({ isOpen, onClose, profileImage, onImageUpdate }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark-mode');
  });
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Listen for theme changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark-mode'));
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
      //console.log('Image clicked, opening file dialog');
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

    let previewUrl = null;

    try {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');

      // Show temporary preview
      previewUrl = URL.createObjectURL(file);
      setImageSrc(previewUrl);

      const formData = new FormData();
      formData.append('profile_image', file);
      formData.append('user_id', userId);

      const response = await axiosInstance.post(`${API_BASE}/auth/upload-image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true"
        }
      });

      // Check for different possible response formats
      const imageUrl = response.data?.imageUrl || response.data?.url || response.data?.profile_image;
      
      if (imageUrl) {
        const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${API_BASE}${imageUrl}`;
        setImageSrc(fullImageUrl);
        onImageUpdate?.(fullImageUrl);
        // Store the image URL in localStorage
        localStorage.setItem('userProfileImage', fullImageUrl);
        setUploadError(null);
      } else {
        throw new Error('Invalid response format from server');
      }

    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.response?.data?.message || error.message || 'Failed to upload image');
      setImageSrc(null);
    } finally {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
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

  // Add debug logging for state changes
  useEffect(() => {
    console.log('Auth State:', {
      token: !!localStorage.getItem('authToken'),
      userId: localStorage.getItem('userId'),
      user: user,
      error: error
    });
  }, [user, error]);

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return null;
    }
  };

  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;
      
      const decoded = parseJwt(token);
      if (!decoded) return null;

      // Try different possible user ID fields
      return decoded.user_id || decoded.userId || decoded.id || decoded.sub;
    } catch (error) {
      console.error('Error getting user ID from token:', error);
      return null;
    }
  };

  const validateSession = () => {
    try {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        throw new Error('Missing credentials');
      }

      const decoded = parseJwt(token);
      if (!decoded) {
        throw new Error('Invalid token');
      }

      return { isValid: true, userId, token };
    } catch (error) {
      console.error('Session validation failed:', error);
      return { isValid: false, error: error.message };
    }
  };

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    //console.log('Checking auth:', { hasToken: !!token, userId });
    return { token, userId };
  };

  // Modified fetch user details logic
  useEffect(() => {
    const fetchUserDetails = async (attempt = 0) => {
      try {
        setLoading(true);
        setError(null);
        
        const { token, userId } = checkAuth();
        if (!token || !userId) {
          throw new Error('Please log in to view profile');
        }

        // Check localStorage first for cached image
        const cachedImageUrl = localStorage.getItem('userProfileImage');
        if (cachedImageUrl) {
          setImageSrc(cachedImageUrl);
        }

        const response = await axiosInstance.get(`${API_BASE}/auth/userDetails`, {
          params: { user_id: userId },
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true"
          }
        });

        if (!response.data?.userExist?.[0]) {
          throw new Error('User data not found');
        }

        const userData = response.data.userExist[0];
        setUser(userData);
        //console.log('Profile loaded:', userData);

        // Only update image if no cached image exists
        if (!cachedImageUrl && userData.profile_image) {
          const imageUrl = processImageUrl(userData.profile_image);
          if (imageUrl) {
            setImageSrc(imageUrl);
            localStorage.setItem('userProfileImage', imageUrl);
          }
        }

      } catch (error) {
        console.error('Profile load error:', error);
        setError(error.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      //console.log('Initializing profile load...');
      fetchUserDetails();
    }
  }, [isOpen]); // Only re-fetch when modal opens

  // Update processImageUrl function
  const processImageUrl = (imageData) => {
    if (!imageData) {
      return DEFAULT_AVATAR_BASE64;
    }
    
    try {
      if (typeof imageData === 'string') {
        if (imageData.startsWith('blob:') || 
            imageData.startsWith('data:') ||
            imageData.startsWith('http')) {
          return imageData;
        }
        return `${API_BASE}${imageData}`;
      }
      
      if (imageData.data) {
        const byteArray = new Uint8Array(imageData.data);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        return URL.createObjectURL(blob);
      }

      return DEFAULT_AVATAR_BASE64;
    } catch (error) {
      console.error('Error processing image:', error);
      return DEFAULT_AVATAR_BASE64;
    }
  };

  const handleChangePassword = () => {
    setShowPasswordDialog(true);
  };

  const handleClosePasswordDialog = () => {
    setShowPasswordDialog(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    try {
      setIsChangingPassword(true);
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        toast.error('User session expired. Please log in again.');
        return;
      }

      console.log('Sending password change request...', {
        userId,
        currentPassword: currentPassword ? '***' : null,
        newPassword: newPassword ? '***' : null
      });

      const response = await axiosInstance.post(`${API_BASE}/auth/change-password`, {
        currentPassword,
        newPassword,
        userId
      });

      //console.log('Password change response:', response.data);

      if (response.data.success) {
        // Update the auth token if new ones are provided
        if (response.data.accessToken) {
          localStorage.setItem('authToken', response.data.accessToken);
        }
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        
        // Show success message
        toast.success('Password changed successfully', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Clear form and close dialog
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        handleClosePasswordDialog();
      } else {
        toast.error(response.data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error.response?.data?.message || 'Failed to change password', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="profile-overlay">
      <div className={`profile-dialog ${isDarkMode ? 'dark-mode' : ''}`}>
        <button onClick={onClose} className="close-button" aria-label="Close">✕</button>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading profile...</p>
          </div>
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
                    alt={user?.username || "Profile"}
                    className="profile-image"
                    onError={(e) => {
                      console.warn('Image load failed:', e.target.src);
                      e.target.src = DEFAULT_AVATAR_BASE64;
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
              {/* Account Information Section */}
              <h2 className="section-title">Account Information</h2>
              <div className="section-divider"></div>
              <div className="details-group">
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{user.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">User ID:</span>
                  <span className="detail-value">{user.user_id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Member since:</span>
                  <span className="detail-value">{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Account Details Section */}
              <h2 className="section-title">Account Details</h2>
              <div className="section-divider"></div>
              <div className="details-group">
                <div className="detail-row">
                  <span className="detail-label">Created:</span>
                  <span className="detail-value">{new Date(user.created_at).toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Last Updated:</span>
                  <span className="detail-value">{new Date(user.updated_at).toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value"><span className="status-dot"></span></span>
                </div>
              </div>

              <div className="profile-actions">
                <button 
                  className="action-button change-password-button"
                  onClick={handleChangePassword}
                >
                  <FaKey className="action-icon" />
                  <span>Change Password</span>
                </button>
              </div>
            </div>

            {showPasswordDialog && (
              <div className="password-dialog-overlay">
                <div className="password-dialog">
                  <button className="dialog-close-button" onClick={handleClosePasswordDialog}>
                    <FaTimes />
                  </button>
                  <h3>Change Password</h3>
                  <form onSubmit={handlePasswordSubmit}>
                    <div className="form-group">
                      <label>Current Password</label>
                      <div className="password-input-container">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          required
                        />
                        <button
                          type="button"
                          className="toggle-password"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>New Password</label>
                      <div className="password-input-container">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          required
                        />
                        <button
                          type="button"
                          className="toggle-password"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <div className="password-input-container">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          required
                        />
                        <button
                          type="button"
                          className="toggle-password"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div className="dialog-actions">
                      <button
                        type="button"
                        className="cancel-button"
                        onClick={handleClosePasswordDialog}
                        disabled={isChangingPassword}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="submit-button"
                        disabled={isChangingPassword}
                      >
                        {isChangingPassword ? 'Changing...' : 'Change Password'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>,
    modalRoot
  );
};

// Enhanced error boundary
class ProfileErrorBoundary extends React.Component {
  state = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Profile Error:', { error, errorInfo });
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h3>Profile Load Error</h3>
          <p>{this.state.error?.message || 'Unknown error occurred'}</p>
          <details>
            <summary>Error Details</summary>
            <pre>{this.state.errorInfo?.componentStack}</pre>
          </details>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function WrappedProfilePage(props) {
  return (
    <ProfileErrorBoundary>
      <ProfilePage {...props} />
    </ProfileErrorBoundary>
  );
}
