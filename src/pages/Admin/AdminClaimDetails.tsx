import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';

interface ClaimDetails {
  claimId: string;
  farmerDetails: string;
  claimType: string;
  dateOfIncident: string;
  location: string;
  description: string;
  currentStatus: string;
  assignedServiceProvider: string;
}

interface ValidationErrors {
  farmerDetails?: string;
  claimType?: string;
  dateOfIncident?: string;
  location?: string;
  description?: string;
  currentStatus?: string;
  assignedServiceProvider?: string;
}

const AdminClaimDetails = () => {
  const { claimId } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [claimData, setClaimData] = useState<ClaimDetails>({
    claimId: claimId || 'N/A',
    farmerDetails: "Rajesh Kumar",
    claimType: "Crop Damage",
    dateOfIncident: "2023-01-15",
    location: "Punjab",
    description: "Heavy rainfall caused significant waterlogging and crop damage in the affected area. Approximately 30% of the wheat crop is submerged.",
    currentStatus: "Pending",
    assignedServiceProvider: "Krishi Seva Pvt. Ltd.",
  });

  // Removed the duplicate claimDetails object
  // const claimDetails = { ... };

  const [originalClaimData, setOriginalClaimData] = useState<ClaimDetails | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);
  const [saveMessage, setSaveMessage] = useState<string>('');

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    if (!claimData.claimType.trim()) {
      errors.claimType = 'Claim Type is required';
    }
    if (!claimData.currentStatus.trim()) {
      errors.currentStatus = 'Current Status is required';
    }
    if (!claimData.assignedServiceProvider.trim()) {
      errors.assignedServiceProvider = 'Assigned Service Provider is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      setOriginalClaimData(claimData); // Save current data when entering edit mode
    } else {
      // If canceling, revert to original data
      if (originalClaimData) {
        setClaimData(originalClaimData);
      }
      setValidationErrors({}); // Clear validation errors on cancel
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setClaimData(prevData => ({
      ...prevData,
      [name]: value,
    }));
    // Clear validation error for the field being edited
    setValidationErrors(prevErrors => ({
      ...prevErrors,
      [name]: undefined,
    }));
  };

  const handleSave = async () => {
    if (validateForm()) {
      setIsSaving(true);
      setSaveSuccess(null);
      setSaveMessage('');

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
        console.log('Saving data:', claimData);
        setSaveSuccess(true);
        setSaveMessage('Claim details updated successfully!');
        setIsEditing(false);
        setValidationErrors({}); // Clear errors on successful save
      } catch (error) {
        console.error('Failed to save claim details:', error);
        setSaveSuccess(false);
        setSaveMessage('Failed to update claim details. Please try again.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSaveDraft = () => {
    console.log("Save Draft clicked");
    // Implement save draft logic here
  };

  const handleSubmitReport = () => {
    console.log("Submit Report clicked");
    // Implement submit report logic here
  };

  const handleMarkFraudSuspect = () => {
    console.log("Mark Fraud Suspect clicked");
    // Implement mark fraud suspect logic here
  };

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-3xl font-bold text-blue-600 mb-6 border-b-2 border-blue-600 pb-2 text-center">Claim Details: {claimData.claimId}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Claim Information */}
        <Card className="lg:col-span-2 bg-sp-off-white-DEFAULT shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-blue-600">Claim Information</CardTitle>
          </CardHeader>
          <CardContent className="text-sp-neutral-dark">
            <p><strong>Farmer Name:</strong> {claimData.farmerDetails}</p>
            <p><strong>Location:</strong> {claimData.location}</p>
            <p><strong>Crop Type:</strong> {claimData.claimType}</p>
            <p><strong>Submission Date:</strong> {claimData.dateOfIncident}</p>
            <p><strong>Status:</strong> {claimData.currentStatus}</p>
            <h3 className="text-lg font-semibold mt-4 mb-2 text-blue-600">Farmer's Uploaded Images/Videos</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Assuming claimData has an images array, if not, this will need adjustment */}
              {/* For now, using placeholder images */}
              {["https://via.placeholder.com/150/0000FF/FFFFFF?text=Image+1", "https://via.placeholder.com/150/FF0000/FFFFFF?text=Image+2"].map((image, index) => (
                <img key={index} src={image} alt={`Claim Image ${index + 1}`} className="w-full h-auto rounded-md shadow-md" />
              ))}
            </div>
            <h3 className="text-lg font-semibold mt-4 mb-2 text-blue-600">Damage Description</h3>
            <p>{claimData.description}</p>
          </CardContent>
        </Card>

        {/* Policy Details */}
        <Card className="bg-sp-off-white-DEFAULT shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-blue-600">Policy Details</CardTitle>
          </CardHeader>
          <CardContent className="text-sp-neutral-dark">
            {/* Assuming claimData has policyDetails, if not, this will need adjustment */}
            <p><strong>Policy ID:</strong> {"POL789"}</p>
            <p><strong>Coverage:</strong> {"Flood, Hail, Pest"}</p>
            <p><strong>Claim Limit:</strong> {"₹50,000"}</p>
          </CardContent>
        </Card>
      </div>


      {/* Verification Form */}
      <Card className="mb-6 bg-sp-off-white-DEFAULT shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-blue-600">Verification Form</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="verifiedArea" className="text-sp-neutral-dark">Verified Area</Label>
              <Input id="verifiedArea" placeholder="e.g., 100 acres" className="border-sp-neutral-light" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="damageConfirmation" className="text-sp-neutral-dark">Damage Confirmation</Label>
              <Select>
                <SelectTrigger id="damageConfirmation" className="border-sp-neutral-light">
                  <SelectValue placeholder="Select confirmation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <Label htmlFor="commentBox" className="text-sp-neutral-dark">Comment Box</Label>
            <Textarea id="commentBox" placeholder="Add your comments here..." className="border-sp-neutral-light" />
          </div>
          <div className="space-y-2 mt-4">
            <Label htmlFor="fieldPhotos" className="text-sp-neutral-dark">Upload Field Photos</Label>
            <Input id="fieldPhotos" type="file" multiple className="border-sp-neutral-light" />
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={handleSaveDraft} className="px-4 py-2 border border-sp-neutral-light rounded-lg shadow-sm text-sm font-medium text-sp-neutral-dark hover:bg-sp-off-white-light transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">Save Draft</Button>
            <Button onClick={handleSubmitReport} className="px-4 py-2 bg-sp-primary-DEFAULT text-sp-off-white-DEFAULT rounded-lg shadow-sm text-sm font-medium hover:bg-sp-primary-dark transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">Submit Report</Button>
            <Button variant="destructive" onClick={handleMarkFraudSuspect} className="px-4 py-2 bg-sp-warning-DEFAULT text-sp-off-white-DEFAULT rounded-lg shadow-sm text-sm font-medium hover:bg-sp-warning-dark transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">Mark Fraud Suspect</Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit/View Mode Toggle */}
      <div className="bg-card-background shadow-lg rounded-lg p-6 mb-6">
        <div className="flex justify-end mb-4">
          {!isEditing ? (
            <Button
              onClick={handleEditToggle}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
            >
              Edit Claim
            </Button>
          ) : (
            <div className="space-x-2">
              <Button
                onClick={handleSave}
                className={`bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                onClick={handleEditToggle}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {isEditing ? (
          // Edit Mode
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Farmer Details:
              </Label>
              <p className="text-lg font-semibold text-gray-900 mt-1 block w-full">{claimData.farmerDetails}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Claim Type:
              </Label>
              <Select
                value={claimData.claimType}
                onValueChange={(value) => handleChange({ target: { name: 'claimType', value } } as React.ChangeEvent<HTMLSelectElement>)}
              >
                <SelectTrigger className="text-lg font-semibold text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-primary-green focus:ring-primary-green sm:text-sm">
                  <SelectValue placeholder="Select Claim Type" />
                </SelectTrigger>
                <SelectContent>
                  {['Crop Damage', 'Livestock Loss', 'Property Damage'].map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.claimType && (
                <p className="text-red-500 text-xs italic">{validationErrors.claimType}</p>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Date of Incident:
              </Label>
              <p className="text-lg font-semibold text-gray-900 mt-1 block w-full">{claimData.dateOfIncident}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Location:
              </Label>
              <p className="text-lg font-semibold text-gray-900 mt-1 block w-full">{claimData.location}</p>
            </div>
            <div className="md:col-span-2">
              <Label className="text-sm font-medium text-gray-500">
                Description:
              </Label>
              <p className="text-lg font-semibold text-gray-900 mt-1 block w-full">{claimData.description}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Current Status:
              </Label>
              <Select
                value={claimData.currentStatus}
                onValueChange={(value) => handleChange({ target: { name: 'currentStatus', value } } as React.ChangeEvent<HTMLSelectElement>)}
              >
                <SelectTrigger className="text-lg font-semibold text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-primary-green focus:ring-primary-green sm:text-sm">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  {['Pending', 'In Review', 'Approved', 'Rejected'].map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.currentStatus && (
                <p className="text-red-500 text-xs italic">{validationErrors.currentStatus}</p>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Assigned Service Provider:
              </Label>
              <Input
                id="assignedServiceProvider"
                name="assignedServiceProvider"
                value={claimData.assignedServiceProvider}
                onChange={handleChange}
                className="text-lg font-semibold text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-primary-green focus:ring-primary-green sm:text-sm"
              />
              {validationErrors.assignedServiceProvider && (
                <p className="text-red-500 text-xs italic">{validationErrors.assignedServiceProvider}</p>
              )}
            </div>
          </div>
        ) : (
          // View Mode
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <p><strong className="text-sm font-medium text-gray-500">Farmer Details:</strong> <span className="text-lg font-semibold text-gray-900">{claimData.farmerDetails}</span></p>
            <p><strong className="text-sm font-medium text-gray-500">Claim Type:</strong> <span className="text-lg font-semibold text-gray-900">{claimData.claimType}</span></p>
            <p><strong className="text-sm font-medium text-gray-500">Date of Incident:</strong> <span className="text-lg font-semibold text-gray-900">{claimData.dateOfIncident}</span></p>
            <p><strong className="text-sm font-medium text-gray-500">Location:</strong> <span className="text-lg font-semibold text-gray-900">{claimData.location}</span></p>
            <p className="md:col-span-2"><strong className="text-sm font-medium text-gray-500">Description:</strong> <span className="text-lg font-semibold text-gray-900">{claimData.description}</span></p>
            <p><strong className="text-sm font-medium text-gray-500">Current Status:</strong> <span className="text-lg font-semibold text-gray-900">{claimData.currentStatus}</span></p>
            <p><strong className="text-sm font-medium text-gray-500">Assigned Service Provider:</strong> <span className="text-lg font-semibold text-gray-900">{claimData.assignedServiceProvider}</span></p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!isEditing && (
        <div className="flex justify-end space-x-2">
          <Button
            onClick={() => alert('View Documents clicked')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
          >
            View Documents
          </Button>
          <Button
            onClick={() => alert('Process Claim clicked')}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
          >
            Process Claim
          </Button>
          <Button
            onClick={() => alert('Reject Claim clicked')}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
          >
            Reject Claim
          </Button>
        </div>
      )}

      {saveMessage && (
        <div className={`mt-4 p-3 rounded-md text-sm ${saveSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {saveMessage}
        </div>
      )}
    </div>
  );
};

export default AdminClaimDetails;