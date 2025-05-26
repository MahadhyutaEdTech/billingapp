import React, { useState } from 'react';
import { API_BASE } from '../config/config';
import axios from 'axios';
import ProfilePage from '../pages/UserProfilePage';

const ProfileIcon = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState('/default-avatar.png');

  const handleImageUpdate = (newImageUrl) => {
    setCurrentImage(newImageUrl);
  };

  return (
    <>
      <button 
        onClick={() => setIsProfileOpen(true)}
        className="profile-icon-button"
      >
        <img
          src={currentImage}
          alt="Profile"
          className="profile-icon-image"
        />
      </button>

      <ProfilePage
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profileImage={currentImage}
        onImageUpdate={handleImageUpdate}
      />
    </>
  );
};

export default ProfileIcon;
