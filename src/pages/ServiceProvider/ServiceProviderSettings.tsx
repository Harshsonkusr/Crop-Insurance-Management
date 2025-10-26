import React from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const ServiceProviderSettings: React.FC = () => {
  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-3xl font-bold text-sp-primary-DEFAULT mb-6 border-b-2 border-sp-primary-DEFAULT pb-2 text-center">Settings</h1>

      <div className="bg-sp-off-white-DEFAULT shadow-lg rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold text-sp-primary-DEFAULT mb-4">Profile Settings</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <input id="name" defaultValue="Service Provider Name" className="flex-1 outline-none bg-sp-off-white-DEFAULT text-sp-neutral-dark border border-sp-neutral-light rounded-md p-2 w-full" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <input id="email" type="email" defaultValue="service.provider@example.com" className="flex-1 outline-none bg-sp-off-white-DEFAULT text-sp-neutral-dark border border-sp-neutral-light rounded-md p-2 w-full" />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <input id="address" defaultValue="123 Service Lane, City, Country" className="flex-1 outline-none bg-sp-off-white-DEFAULT text-sp-neutral-dark border border-sp-neutral-light rounded-md p-2 w-full" />
          </div>
          <button className="bg-sp-primary-DEFAULT hover:bg-sp-primary-dark text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">Save Profile</button>
        </div>
      </div>

      <div className="bg-sp-off-white-DEFAULT shadow-lg rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold text-sp-primary-DEFAULT mb-4">Notification Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <Switch id="email-notifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sms-notifications">SMS Notifications</Label>
            <Switch id="sms-notifications" />
          </div>
          <button className="bg-sp-primary-DEFAULT hover:bg-sp-primary-dark text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">Save Notifications</button>
        </div>
      </div>

      <div className="bg-sp-off-white-DEFAULT shadow-lg rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold text-sp-primary-DEFAULT mb-4">Security Settings</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="current-password">Current Password</Label>
            <input id="current-password" type="password" className="flex-1 outline-none bg-sp-off-white-DEFAULT text-sp-neutral-dark border border-sp-neutral-light rounded-md p-2 w-full" />
          </div>
          <div>
            <Label htmlFor="new-password">New Password</Label>
            <input id="new-password" type="password" className="flex-1 outline-none bg-sp-off-white-DEFAULT text-sp-neutral-dark border border-sp-neutral-light rounded-md p-2 w-full" />
          </div>
          <div>
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <input id="confirm-password" type="password" className="flex-1 outline-none bg-sp-off-white-DEFAULT text-sp-neutral-dark border border-sp-neutral-light rounded-md p-2 w-full" />
          </div>
          <button className="bg-sp-primary-DEFAULT hover:bg-sp-primary-dark text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">Change Password</button>
        </div>
      </div>
    </div>
  );
};

export default ServiceProviderSettings;