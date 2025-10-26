import React, { useState } from 'react';

const AdminSystemSettings = () => {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Harvest Guardian Hub',
    dateFormat: 'YYYY-MM-DD',
    itemsPerPage: 10,
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.example.com',
    smtpPort: 587,
    smtpUser: 'admin@example.com',
    sendNotifications: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    passwordPolicy: 'Strong',
    sessionTimeout: 30,
  });

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setGeneralSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setEmailSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setSecuritySettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Settings Saved:', { generalSettings, emailSettings, securitySettings });
    // In a real application, you would send this data to your backend
    alert('Settings saved successfully!');
  };

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-3xl font-bold text-blue-600 mb-6 border-b-2 border-blue-600 pb-2 text-center">System Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Settings */}
        <div className="bg-card-background shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">General Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">Site Name</label>
              <input
                type="text"
                id="siteName"
                name="siteName"
                value={generalSettings.siteName}
                onChange={handleGeneralChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              />
            </div>
            <div>
              <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700">Date Format</label>
              <select
                id="dateFormat"
                name="dateFormat"
                value={generalSettings.dateFormat}
                onChange={handleGeneralChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              </select>
            </div>
            <div>
              <label htmlFor="itemsPerPage" className="block text-sm font-medium text-gray-700">Items Per Page</label>
              <input
                type="number"
                id="itemsPerPage"
                name="itemsPerPage"
                value={generalSettings.itemsPerPage}
                onChange={handleGeneralChange}
                min="5"
                max="50"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              />
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="bg-card-background shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Email Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-700">SMTP Host</label>
              <input
                type="text"
                id="smtpHost"
                name="smtpHost"
                value={emailSettings.smtpHost}
                onChange={handleEmailChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              />
            </div>
            <div>
              <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700">SMTP Port</label>
              <input
                type="number"
                id="smtpPort"
                name="smtpPort"
                value={emailSettings.smtpPort}
                onChange={handleEmailChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              />
            </div>
            <div>
              <label htmlFor="smtpUser" className="block text-sm font-medium text-gray-700">SMTP Username</label>
              <input
                type="text"
                id="smtpUser"
                name="smtpUser"
                value={emailSettings.smtpUser}
                onChange={handleEmailChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sendNotifications"
                name="sendNotifications"
                checked={emailSettings.sendNotifications}
                onChange={handleEmailChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition duration-150 ease-in-out"
              />
              <label htmlFor="sendNotifications" className="ml-2 block text-sm font-medium text-gray-700">Send Notifications</label>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-card-background shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="twoFactorAuth"
                name="twoFactorAuth"
                checked={securitySettings.twoFactorAuth}
                onChange={handleSecurityChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition duration-150 ease-in-out"
              />
              <label htmlFor="twoFactorAuth" className="ml-2 block text-sm font-medium text-gray-700">Two-Factor Authentication</label>
            </div>
            <div>
              <label htmlFor="passwordPolicy" className="block text-sm font-medium text-gray-700">Password Policy</label>
              <select
                id="passwordPolicy"
                name="passwordPolicy"
                value={securitySettings.passwordPolicy}
                onChange={handleSecurityChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              >
                <option value="Strong">Strong</option>
                <option value="Medium">Medium</option>
                <option value="Weak">Weak</option>
              </select>
            </div>
            <div>
              <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700">Session Timeout (minutes)</label>
              <input
                type="number"
                id="sessionTimeout"
                name="sessionTimeout"
                value={securitySettings.sessionTimeout}
                onChange={handleSecurityChange}
                min="5"
                max="120"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
        >
          Save Settings
        </button>
      </form>
    </div>
  );
};

export default AdminSystemSettings;