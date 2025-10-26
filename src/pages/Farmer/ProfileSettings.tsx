import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const ProfileSettings: React.FC = () => {
  const [personalInfo, setPersonalInfo] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
  });

  const [farmInfo, setFarmInfo] = useState({
    farmName: 'Green Acres Farm',
    address: '123 Farm Road, Rural Town, USA',
    farmType: 'Mixed Farming',
  });

  const [password, setPassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [notificationPreferences, setNotificationPreferences] = useState({
    email: true,
    sms: false,
  });

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPersonalInfo({ ...personalInfo, [e.target.id]: e.target.value });
  };

  const handleFarmInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFarmInfo({ ...farmInfo, [e.target.id]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword({ ...password, [e.target.id]: e.target.value });
  };

  const handleNotificationChange = (type: 'email' | 'sms', checked: boolean) => {
    setNotificationPreferences({ ...notificationPreferences, [type]: checked });
  };

  const handleSaveChanges = () => {
    // Logic to save changes
    console.log('Saving personal info:', personalInfo);
    console.log('Saving farm info:', farmInfo);
    console.log('Saving password:', password);
    console.log('Saving notification preferences:', notificationPreferences);
    alert('Profile settings saved!');
  };

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-3xl font-bold text-primary-green mb-6 border-b-2 border-primary-green pb-2 text-center">Profile Settings</h1>

      <div className="bg-card-background shadow-lg rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" type="text" value={personalInfo.name} onChange={handlePersonalInfoChange} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={personalInfo.email} onChange={handlePersonalInfoChange} />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" type="text" value={personalInfo.phone} onChange={handlePersonalInfoChange} />
          </div>
        </div>
      </div>

      {/* Farm Information */}
      <div className="bg-card-background shadow-lg rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Farm Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="farmName">Farm Name</Label>
            <Input id="farmName" type="text" value={farmInfo.farmName} onChange={handleFarmInfoChange} />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" type="text" value={farmInfo.address} onChange={handleFarmInfoChange} />
          </div>
          <div>
            <Label htmlFor="farmType">Type of Farming</Label>
            <Input id="farmType" type="text" value={farmInfo.farmType} onChange={handleFarmInfoChange} />
          </div>
        </div>
      </div>

      {/* Password Management */}
      <div className="bg-card-background shadow-lg rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Password Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" type="password" value={password.currentPassword} onChange={handlePasswordChange} />
          </div>
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" value={password.newPassword} onChange={handlePasswordChange} />
          </div>
          <div>
            <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
            <Input id="confirmNewPassword" type="password" value={password.confirmNewPassword} onChange={handlePasswordChange} />
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-card-background shadow-lg rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Notification Preferences</h2>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="emailNotifications">Email Notifications</Label>
          <Switch
            id="emailNotifications"
            checked={notificationPreferences.email}
            onCheckedChange={(checked) => handleNotificationChange('email', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="smsNotifications">SMS Notifications</Label>
          <Switch
            id="smsNotifications"
            checked={notificationPreferences.sms}
            onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
          />
        </div>
       </div>
       <Button onClick={handleSaveChanges} className="bg-primary-green hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
         Save Changes
       </Button>
     </div>
  );
};

export default ProfileSettings;