import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, Image as ImageIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ClaimSubmission = () => {
  const { claimId } = useParams<{ claimId?: string }>();
  const [currentStep, setCurrentStep] = useState(1);
  const [claimDetails, setClaimDetails] = useState({
    claimType: '',
    dateOfIncident: '',
    locationOfIncident: '',
    descriptionOfIncident: '',
    policyNumber: '',
    estimatedLoss: '',
    farmId: '',
    cropTypeDeclared: '',
  });
  const [documents, setDocuments] = useState<File[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (claimId) {
      // In a real application, you would fetch existing claim details here
      // For now, we'll just simulate loading some data
      setClaimDetails({
        claimType: 'Crop Damage',
        dateOfIncident: '2023-07-15',
        locationOfIncident: 'Field B, South Farm',
        descriptionOfIncident: 'Simulated damage for claim ' + claimId,
        policyNumber: 'POL123',
        estimatedLoss: '7500',
        farmId: 'FARM001-PLOT001',
        cropTypeDeclared: 'Wheat, Rice',
      });
    }
  }, [claimId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setClaimDetails(prevDetails => ({ ...prevDetails, [id]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'documents' | 'images') => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (type === 'documents') {
        setDocuments(prevDocs => [...prevDocs, ...newFiles]);
      } else {
        setImages(prevImages => [...prevImages, ...newFiles]);
      }
    }
  };

  const handleNext = () => {
    setCurrentStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  const validateForm = () => {
    // Basic validation for demonstration purposes
    const { claimType, dateOfIncident, locationOfIncident, descriptionOfIncident, policyNumber, estimatedLoss, farmId, cropTypeDeclared } = claimDetails;
    if (!claimType || !dateOfIncident || !locationOfIncident || !descriptionOfIncident || !policyNumber || !estimatedLoss || !farmId || !cropTypeDeclared) {
      setSubmissionMessage({ type: 'error', message: 'Please fill in all required fields.' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 3) {
      if (!validateForm()) {
        return;
      }
      setIsConfirmDialogOpen(true);
    }
  };

  const confirmSubmission = async () => {
    setIsConfirmDialogOpen(false);
    setIsSubmitting(true);
    setSubmissionMessage(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Claim Details:', claimDetails);
      console.log('Documents:', documents);
      console.log('Images:', images);
      // Here you would typically send this data to a backend API
      setSubmissionMessage({ type: 'success', message: claimId ? 'Claim updated successfully!' : 'Claim submitted successfully!' });

      // Reset form
      setClaimDetails({
        claimType: '',
        dateOfIncident: '',
        locationOfIncident: '',
        descriptionOfIncident: '',
        policyNumber: '',
        estimatedLoss: '',
        farmId: '',
        cropTypeDeclared: '',
      });
      setDocuments([]);
      setImages([]);
      setCurrentStep(1); // Reset to first step after submission
    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionMessage({ type: 'error', message: 'Failed to submit claim. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <CardHeader>
              <CardTitle>Step 1 of 3: Claim Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="claimType">Claim Type</Label>
                  <select
                    id="claimType"
                    value={claimDetails.claimType}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green sm:text-sm"
                    required
                  >
                    <option value="">Select Claim Type</option>
                    <option value="Crop Damage">Crop Damage</option>
                    <option value="Livestock Loss">Livestock Loss</option>
                    <option value="Equipment Failure">Equipment Failure</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="dateOfIncident">Date of Incident</Label>
                  <Input id="dateOfIncident" type="date" value={claimDetails.dateOfIncident} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="farmId">Farm ID / Plot ID</Label>
                  <Input id="farmId" value={claimDetails.farmId} onChange={handleInputChange} placeholder="e.g., FARM001-PLOT001" required />
                </div>
                <div>
                  <Label htmlFor="cropTypeDeclared">Declared Crop Type(s)</Label>
                  <Input id="cropTypeDeclared" value={claimDetails.cropTypeDeclared} onChange={handleInputChange} placeholder="e.g., Wheat, Rice (comma-separated)" required />
                </div>
                <div>
                  <Label htmlFor="locationOfIncident">Location of Incident (Latitude, Longitude)</Label>
                  <Input id="locationOfIncident" value={claimDetails.locationOfIncident} onChange={handleInputChange} placeholder="e.g., 12.345, 78.901 (auto-filled by GPS/map)" required />
                </div>
                <div>
                  <Label htmlFor="descriptionOfIncident">Description of Incident</Label>
                  <Textarea id="descriptionOfIncident" value={claimDetails.descriptionOfIncident} onChange={handleInputChange} placeholder="Describe the incident" rows={5} required />
                </div>
                <div>
                  <Label htmlFor="policyNumber">Policy Number</Label>
                  <Input id="policyNumber" value={claimDetails.policyNumber} onChange={handleInputChange} placeholder="e.g., POL001" required />
                </div>
                <Button type="button" onClick={handleNext} className="bg-primary-green hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
                  Next
                </Button>
              </div>
            </CardContent>
          </>
        );
      case 2:
        return (
          <>
            <CardHeader>
              <CardTitle>Step 2 of 3: Damage Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="documents" className="flex items-center gap-2 mb-2">
                    <UploadCloud className="h-5 w-5" /> Upload Supporting Documents (PDF, DOCX)
                  </Label>
                  <Input id="documents" type="file" multiple onChange={(e) => handleFileChange(e, 'documents')} accept=".pdf,.doc,.docx" />
                  <div className="mt-2 text-sm text-gray-600">
                    {documents.length > 0 ? (
                      <p>{documents.length} document(s) selected.</p>
                    ) : (
                      <p>No documents selected.</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="images" className="flex items-center gap-2 mb-2">
                    <ImageIcon className="h-5 w-5" /> Upload Images of Damage (JPG, PNG)
                  </Label>
                  <Input id="images" type="file" multiple onChange={(e) => handleFileChange(e, 'images')} accept=".jpg,.jpeg,.png" />
                  <div className="mt-2 text-sm text-gray-600">
                    {images.length > 0 ? (
                      <p>{images.length} image(s) selected.</p>
                    ) : (
                      <p>No images selected.</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="estimatedLoss">Estimated Loss</Label>
                  <Input id="estimatedLoss" type="number" value={claimDetails.estimatedLoss} onChange={handleInputChange} placeholder="e.g., 10000" required />
                </div>
                <div className="flex justify-between">
                  <Button type="button" onClick={handleBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
                    Back
                  </Button>
                  <Button type="button" onClick={handleNext} className="bg-primary-green hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        );
      case 3:
        return (
          <>
            <CardHeader>
              <CardTitle>Step 3 of 3: Review & Submit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Claim Summary</h3>
                <p><strong>Claim Type:</strong> {claimDetails.claimType}</p>
                <p><strong>Date of Incident:</strong> {claimDetails.dateOfIncident}</p>
                <p><strong>Location of Incident:</strong> {claimDetails.locationOfIncident}</p>
                <p><strong>Description:</strong> {claimDetails.descriptionOfIncident}</p>
                <p><strong>Policy Number:</strong> {claimDetails.policyNumber}</p>
                <p><strong>Farm ID / Plot ID:</strong> {claimDetails.farmId}</p>
                <p><strong>Declared Crop Type(s):</strong> {claimDetails.cropTypeDeclared}</p>
                <p><strong>Estimated Loss:</strong> {claimDetails.estimatedLoss}</p>
                <p><strong>Documents Uploaded:</strong> {documents.length}</p>
                <p><strong>Images Uploaded:</strong> {images.length}</p>
                <div className="flex justify-between">
                  <Button type="button" onClick={handleBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
                    Back
                  </Button>
                  <Button type="submit" className="bg-primary-green hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-primary-green mb-6 border-b-2 border-primary-green pb-2 text-center">
        {claimId ? 'Update Claim' : 'Submit New Claim'}
      </h1>

      {submissionMessage && (
        <div className={`p-3 mb-4 rounded-md text-white ${submissionMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {submissionMessage.message}
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit}>
          {renderStepContent()}
        </form>
      </Card>

      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your claim?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmission} className="bg-primary-green hover:bg-green-700">Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClaimSubmission;