import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const Support: React.FC = () => {
  // Pre-filled user info from context/auth
  const [supportForm, setSupportForm] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    subject: '',
    message: '',
  });

  const [faqItems] = useState([
    {
      question: 'How do I submit a new claim?',
      answer: 'Navigate to the "Submit New Claim" page from the sidebar, fill out the multi-step form, and submit. You can track progress in "My Claims".',
    },
    {
      question: 'How long does claim processing take?',
      answer: 'Claims are typically processed within 7-10 business days. You will receive email/SMS updates at each stage.',
    },
    {
      question: 'What documents do I need for a claim?',
      answer: 'You will need photos of the damage, supporting documents (weather reports, receipts), and a completed claim form.',
    },
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSupportForm(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add API submission logic here
    console.log('Support form submitted:', supportForm);
    alert('Your support request has been sent. We will respond within 24 hours.');
  };

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-3xl font-bold text-primary-green mb-6 border-b-2 border-primary-green pb-2 text-center">Support</h1>

      {/* Contact Form Section */}
      <div className="bg-card-background shadow-lg rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Support</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={supportForm.name}
              onChange={handleInputChange}
              disabled
              className="bg-gray-100"
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={supportForm.email}
              onChange={handleInputChange}
              disabled
              className="bg-gray-100"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={supportForm.phone}
              onChange={handleInputChange}
              disabled
              className="bg-gray-100"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              type="text"
              value={supportForm.subject}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={supportForm.message}
              onChange={handleInputChange}
              required
              className="h-32"
            />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" className="bg-primary-green hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
              Send Message
            </Button>
          </div>
        </form>
      </div>

      {/* FAQ Section */}
      <div className="bg-card-background shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div key={index} className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-medium text-gray-800">{item.question}</h3>
              <p className="text-gray-600 mt-2">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Support;