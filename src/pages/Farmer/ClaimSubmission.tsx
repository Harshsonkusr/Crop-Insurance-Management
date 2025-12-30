import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  UploadCloud, 
  Image as ImageIcon, 
  MapPin, 
  Calendar,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  AlertCircle,
  Loader2,
  Camera,
  FileCheck
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from '../../lib/api';

interface ClaimFormData {
  policyId: string;
  dateOfIncident: string;
  location: string;
  description: string;
  amountClaimed: string;
}

interface Policy {
  id?: string;
  _id?: string;
  policyNumber: string;
  cropType: string;
  sumInsured: number;
  status: string;
}

const ClaimSubmission = () => {
  const { claimId } = useParams<{ claimId?: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [formData, setFormData] = useState<ClaimFormData>({
    policyId: '',
    dateOfIncident: '',
    location: '',
    description: '',
    amountClaimed: '',
  });
  const [documents, setDocuments] = useState<File[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [geolocationLoading, setGeolocationLoading] = useState(false);

  const totalSteps = 4;

  useEffect(() => {
    fetchPolicies();
    if (claimId) {
      fetchExistingClaim();
    }
  }, [claimId]);

  const fetchPolicies = async () => {
    try {
      const response = await api.get('/farmer/policies');
      const activePolicies = response.data.filter((p: Policy) => p.status === 'Active');
      
      // POLICY CONFLICT RESOLUTION: Check for multiple active policies
      // If multiple policies exist, show selection UI
      if (activePolicies.length > 1 && formData.dateOfIncident) {
        // Multiple policies found - user should select one
        // The UI will show all policies in the dropdown
      }
      
      setPolicies(activePolicies);
    } catch (err) {
      console.error('Error fetching policies:', err);
    }
  };

  const fetchExistingClaim = async () => {
    try {
      const response = await api.get(`/claims/farmer/${claimId}`);
      const claim = response.data;
      setFormData({
        policyId: claim.policyId?.id || claim.policyId?._id || claim.policyId || '',
        dateOfIncident: claim.dateOfIncident ? new Date(claim.dateOfIncident).toISOString().split('T')[0] : '',
        location: claim.locationOfIncident || '',
        description: claim.description || '',
        amountClaimed: claim.amountClaimed?.toString() || '',
      });
    } catch (err) {
      console.error('Error fetching claim:', err);
    }
  };

  const normalizeDate = (value: string) => {
    // Accept native yyyy-mm-dd, or attempt to normalize common slash formats.
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const slashMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slashMatch) {
      const [, p1, p2, year] = slashMatch;
      // Interpret as mm/dd/yyyy if first part > 12, otherwise assume dd/mm/yyyy when the second part > 12.
      const monthFirst = parseInt(p1, 10) <= 12 && parseInt(p2, 10) > 12 ? p1 : p2;
      const dayFirst = monthFirst === p1 ? p2 : p1;
      const mm = monthFirst.padStart(2, '0');
      const dd = dayFirst.padStart(2, '0');
      return `${year}-${mm}-${dd}`;
    }
    return value;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const normalizedValue = name === 'dateOfIncident' ? normalizeDate(value) : value;
    setFormData(prev => ({ ...prev, [name]: normalizedValue }));
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'documents' | 'images') => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (type === 'documents') {
        setDocuments(prev => [...prev, ...newFiles]);
      } else {
        setImages(prev => [...prev, ...newFiles]);
      }
    }
  };

  const removeFile = (index: number, type: 'documents' | 'images') => {
    if (type === 'documents') {
      setDocuments(prev => prev.filter((_, i) => i !== index));
    } else {
      setImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setGeolocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          location: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
        }));
        setGeolocationLoading(false);
      },
      (error) => {
        setGeolocationLoading(false);
        setError(`Geolocation error: ${error.message}`);
      }
    );
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.policyId || !formData.dateOfIncident) {
          setError('Please select a policy and enter the incident date.');
          return false;
        }
        return true;
      case 2:
        if (!formData.location || !formData.description) {
          setError('Please provide location and description of the incident.');
          return false;
        }
        return true;
      case 3:
        if (images.length === 0) {
          setError('Please upload at least one image of the damage.');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      setError(null);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    if (!formData.amountClaimed) {
      setError('Please enter the estimated loss amount.');
      return;
    }

    setIsConfirmDialogOpen(true);
  };

  const confirmSubmission = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Generate idempotency key to prevent duplicate submissions
      const idempotencyKey = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

      const formDataToSend = new FormData();
      formDataToSend.append('policyId', formData.policyId);
      formDataToSend.append('dateOfIncident', formData.dateOfIncident);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('amountClaimed', formData.amountClaimed);

      documents.forEach((doc) => {
        formDataToSend.append('documents', doc);
      });

      images.forEach((img) => {
        formDataToSend.append('images', img);
      });

      const response = await api.post('/claims', formDataToSend, {
        headers: {
          'Idempotency-Key': idempotencyKey
        }
      });
      
      // Close dialog and show success message
      setIsConfirmDialogOpen(false);
      setSuccess(`Claim submitted successfully! Your claim (ID: ${response.data.claim?.claimId || 'N/A'}) has been sent to the insurance company and is being processed. You will be redirected to your claims page shortly.`);
      setIsSubmitting(false);
      
      // Show success message for longer before redirecting
      setTimeout(() => {
        navigate('/farmer-dashboard/my-claims');
      }, 3000);
    } catch (err: any) {
      console.error('Submission error:', err);
      setIsConfirmDialogOpen(false);
      setError(err?.response?.data?.message || 'Failed to submit claim. Please try again.');
      setIsSubmitting(false);
    }
  };

  const selectedPolicy = policies.find(p => (p.id || p._id) === formData.policyId);

  const steps = [
    { number: 1, title: 'Policy Selection', icon: FileText },
    { number: 2, title: 'Incident Details', icon: Calendar },
    { number: 3, title: 'Evidence Upload', icon: Camera },
    { number: 4, title: 'Review & Submit', icon: CheckCircle2 },
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {claimId ? 'Update Claim' : 'Submit New Claim'}
        </h1>
        <p className="text-gray-600">
          Follow the steps below to submit your crop insurance claim. All fields marked with * are required.
        </p>
      </div>

      {/* Progress Indicator */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        isActive
                          ? 'bg-green-600 border-green-600 text-white'
                          : isCompleted
                          ? 'bg-green-100 border-green-600 text-green-600'
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <StepIcon className="h-6 w-6" />
                      )}
                    </div>
                    <p className={`mt-2 text-xs font-medium text-center ${
                      isActive ? 'text-green-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Form Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {(() => {
              const StepIcon = steps[currentStep - 1].icon;
              return StepIcon ? <StepIcon className="h-5 w-5" /> : null;
            })()}
            Step {currentStep} of {totalSteps}: {steps[currentStep - 1].title}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && 'Select the policy associated with this claim.'}
            {currentStep === 2 && 'Provide details about the incident and damage.'}
            {currentStep === 3 && 'Upload photos and documents as evidence.'}
            {currentStep === 4 && 'Review all information before submitting.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Policy Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="policyId" className="text-base font-semibold">
                  Select Policy <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.policyId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, policyId: value }))}
                >
                  <SelectTrigger className="mt-2 h-12">
                    <SelectValue placeholder="Choose a policy" />
                  </SelectTrigger>
                  <SelectContent>
                    {policies.length === 0 ? (
                      <SelectItem value="no-policies" disabled>
                        No active policies found
                      </SelectItem>
                    ) : (
                      policies.map((policy) => {
                        const policyId = policy.id || policy._id || policy.policyNumber;
                        return (
                          <SelectItem key={policyId} value={policyId}>
                            {policy.policyNumber} - {policy.cropType} (Coverage: ₹{policy.sumInsured?.toLocaleString('en-IN')})
                          </SelectItem>
                        );
                      })
                    )}
                  </SelectContent>
                </Select>
                {policies.length === 0 && (
                  <p className="mt-2 text-sm text-amber-600">
                    You need an active policy to submit a claim. Please contact your service provider.
                  </p>
                )}
              </div>

              {selectedPolicy && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Selected Policy Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Policy Number:</span>
                      <span className="ml-2 font-medium">{selectedPolicy.policyNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Crop Type:</span>
                      <span className="ml-2 font-medium">{selectedPolicy.cropType}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Coverage:</span>
                      <span className="ml-2 font-medium">₹{selectedPolicy.sumInsured?.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <Badge variant="default" className="ml-2">{selectedPolicy.status}</Badge>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="dateOfIncident" className="text-base font-semibold">
                  Date of Incident <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dateOfIncident"
                  name="dateOfIncident"
                  type="date"
                  value={formData.dateOfIncident}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="mt-2 h-12"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 2: Incident Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="location" className="text-base font-semibold">
                  Location of Incident <span className="text-red-500">*</span>
                </Label>
                <div className="mt-2 flex gap-2">
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Latitude, Longitude (e.g., 12.345678, 78.901234)"
                    className="h-12"
                    required
                  />
                  <Button
                    type="button"
                    onClick={handleGeolocation}
                    disabled={geolocationLoading}
                    variant="outline"
                    className="h-12"
                  >
                    {geolocationLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <MapPin className="h-4 w-4 mr-2" />
                        Get Location
                      </>
                    )}
                  </Button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Click "Get Location" to automatically capture your current location, or enter coordinates manually.
                </p>
              </div>

              <div>
                <Label htmlFor="description" className="text-base font-semibold">
                  Description of Incident <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the incident in detail. Include information about the type of damage, extent of loss, weather conditions, and any other relevant details..."
                  rows={6}
                  className="mt-2"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Provide as much detail as possible to help with claim processing.
                </p>
              </div>

              <div>
                <Label htmlFor="amountClaimed" className="text-base font-semibold">
                  Estimated Loss Amount (₹) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amountClaimed"
                  name="amountClaimed"
                  type="number"
                  value={formData.amountClaimed}
                  onChange={handleInputChange}
                  placeholder="Enter estimated loss amount"
                  className="mt-2 h-12"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 3: Evidence Upload */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Damage Images <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-gray-600 mt-1 mb-3">
                  Upload clear photos showing the crop damage. Minimum 1 image required.
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                  <Input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'images')}
                    className="hidden"
                  />
                  <Label htmlFor="images" className="cursor-pointer">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm font-medium text-gray-700">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, JPEG up to 10MB each
                    </p>
                  </Label>
                </div>
                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(img)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index, 'images')}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-base font-semibold flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Supporting Documents (Optional)
                </Label>
                <p className="text-sm text-gray-600 mt-1 mb-3">
                  Upload any supporting documents like weather reports, receipts, or other relevant files.
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                  <Input
                    id="documents"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange(e, 'documents')}
                    className="hidden"
                  />
                  <Label htmlFor="documents" className="cursor-pointer">
                    <UploadCloud className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm font-medium text-gray-700">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOC, DOCX up to 10MB each
                    </p>
                  </Label>
                </div>
                {documents.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <span className="text-sm text-gray-700">{doc.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index, 'documents')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Review Your Claim</h3>
                <p className="text-sm text-blue-700">
                  Please review all information carefully before submitting. You can go back to make changes if needed.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Policy</Label>
                    <p className="text-base font-semibold">{selectedPolicy?.policyNumber || 'N/A'}</p>
                    <p className="text-sm text-gray-600">{selectedPolicy?.cropType}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Date of Incident</Label>
                    <p className="text-base font-semibold">
                      {formData.dateOfIncident ? new Date(formData.dateOfIncident).toLocaleDateString('en-IN') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Location</Label>
                    <p className="text-base font-semibold break-all">{formData.location || 'N/A'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Estimated Loss</Label>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{parseFloat(formData.amountClaimed || '0').toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Images Uploaded</Label>
                    <p className="text-base font-semibold">{images.length} image(s)</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Documents Uploaded</Label>
                    <p className="text-base font-semibold">{documents.length} document(s)</p>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Description</Label>
                <p className="text-base text-gray-700 bg-gray-50 p-4 rounded-lg mt-2">
                  {formData.description || 'N/A'}
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Submit Claim
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={(open) => {
        if (!isSubmitting) {
          setIsConfirmDialogOpen(open);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Claim Submission</AlertDialogTitle>
            <AlertDialogDescription>
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting your claim...</span>
                </div>
              ) : (
                <>
                  Are you sure you want to submit this claim? Once submitted, you can track its status in "My Claims".
                  The claim will be reviewed by the insurance company and processed accordingly.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmSubmission} 
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                'Confirm & Submit'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClaimSubmission;
