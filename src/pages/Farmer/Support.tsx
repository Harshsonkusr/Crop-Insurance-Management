import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  Mail, 
  Phone, 
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from '@/components/Auth/AuthContext';
import api from '../../lib/api';

const Support: React.FC = () => {
  const { user } = useAuth();
  const [supportForm, setSupportForm] = useState({
    name: user?.name || '',
    email: '',
    phone: user?.mobileNumber || '',
    subject: '',
    message: '',
    category: 'general',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const faqItems = [
    {
      question: 'How do I submit a new claim?',
      answer: 'Navigate to "Submit Claim" from the dashboard sidebar. Fill out the step-by-step form with incident details, upload photos and documents, review your information, and submit. You can track the status in "My Claims".',
      category: 'Claims'
    },
    {
      question: 'How long does claim processing take?',
      answer: 'Claims are typically processed within 7-10 business days. With AI-powered verification, processing time has been reduced from 5-6 months to under 1 month. You will receive updates via SMS and email at each stage.',
      category: 'Claims'
    },
    {
      question: 'What documents do I need for a claim?',
      answer: 'You need: 1) Clear photos of crop damage (minimum 1 required), 2) Supporting documents like weather reports or receipts (optional), 3) Accurate location coordinates, and 4) Detailed description of the incident. All documents can be uploaded directly in the claim submission form.',
      category: 'Claims'
    },
    {
      question: 'How do I check my claim status?',
      answer: 'Go to "My Claims" in the dashboard. You can see all your claims with their current status, filter by status, and click on any claim to view detailed information including AI verification status.',
      category: 'Claims'
    },
    {
      question: 'What is AI-powered damage assessment?',
      answer: 'Our system uses AI and satellite imagery (Sentinel-2) to automatically verify crop damage. This speeds up processing and ensures fair assessment. You can see the AI verification status in your claim details.',
      category: 'Technology'
    },
    {
      question: 'How do I view my insurance policies?',
      answer: 'Go to "My Policies" in the dashboard. You can see all your active policies with coverage amounts, premium information, and validity dates. Click on any policy to view complete details.',
      category: 'Policies'
    },
    {
      question: 'What should I do if my claim is rejected?',
      answer: 'If your claim is rejected, you will receive a notification with the reason. You can contact support for clarification or submit a new claim with additional evidence if applicable.',
      category: 'Claims'
    },
    {
      question: 'How do I update my farm details?',
      answer: 'Go to "Farm Details" in the dashboard. You can update your farm information including location, crop type, and farm size. Changes may require re-verification.',
      category: 'Profile'
    },
    {
      question: 'Can I submit multiple claims for the same policy?',
      answer: 'Yes, you can submit multiple claims for different incidents. Each claim is processed independently. Make sure each claim has unique incident details and evidence.',
      category: 'Claims'
    },
    {
      question: 'How do I contact support?',
      answer: 'You can contact support through this page by filling out the contact form, or call our helpline. Support is available Monday to Saturday, 9 AM to 6 PM.',
      category: 'Support'
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSupportForm(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!supportForm.subject.trim() || !supportForm.message.trim()) {
      setError('Please fill in subject and message fields.');
      setLoading(false);
      return;
    }

    try {
      await api.post('/farmer/support', supportForm);
      setSuccess('Your support request has been sent successfully! We will respond within 24 hours.');
      setSupportForm(prev => ({
        ...prev,
        subject: '',
        message: '',
      }));
    } catch (err: any) {
      console.error('Error submitting support form:', err);
      setError(err?.response?.data?.message || 'Failed to submit support request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const supportCategories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'claim', label: 'Claim Related' },
    { value: 'policy', label: 'Policy Related' },
    { value: 'technical', label: 'Technical Issue' },
    { value: 'payment', label: 'Payment Related' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Support & Help Center</h1>
        <p className="text-gray-600">
          Get help with your questions or contact our support team
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Form - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Contact Support
              </CardTitle>
              <CardDescription>
                Fill out the form below and our team will get back to you within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-base font-semibold">Full Name</Label>
                    <div className="relative mt-2">
                      <Input
                        id="name"
                        type="text"
                        value={supportForm.name}
                        onChange={handleInputChange}
                        className="pl-10 h-12"
                        disabled
                      />
                      <HelpCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-base font-semibold">Phone Number</Label>
                    <div className="relative mt-2">
                      <Input
                        id="phone"
                        type="tel"
                        value={supportForm.phone}
                        onChange={handleInputChange}
                        className="pl-10 h-12"
                        disabled
                      />
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="text-base font-semibold">Email Address</Label>
                  <div className="relative mt-2">
                    <Input
                      id="email"
                      type="email"
                      value={supportForm.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email (optional)"
                      className="pl-10 h-12"
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="category" className="text-base font-semibold">Category</Label>
                  <select
                    id="category"
                    name="category"
                    value={supportForm.category}
                    onChange={handleInputChange}
                    className="mt-2 block w-full px-3 py-2 h-12 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    {supportCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="subject" className="text-base font-semibold">
                    Subject <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="subject"
                    type="text"
                    value={supportForm.subject}
                    onChange={handleInputChange}
                    placeholder="Brief description of your issue"
                    className="mt-2 h-12"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="message" className="text-base font-semibold">
                    Message <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    value={supportForm.message}
                    onChange={handleInputChange}
                    placeholder="Describe your issue or question in detail..."
                    className="mt-2 min-h-[150px]"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Other Ways to Reach Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">Phone Support</p>
                  <p className="text-sm text-gray-600">1800-XXX-XXXX (Toll-free)</p>
                  <p className="text-xs text-gray-500">Mon-Sat, 9 AM - 6 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Mail className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">Email Support</p>
                  <p className="text-sm text-gray-600">support@claimeasy.in</p>
                  <p className="text-xs text-gray-500">Response within 24 hours</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section - 1 column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Quick answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 mt-1 text-gray-400 flex-shrink-0" />
                        <span className="font-medium">{item.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-6 space-y-2">
                        <Badge variant="outline" className="text-xs">{item.category}</Badge>
                        <p className="text-sm text-gray-600">{item.answer}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Support;
