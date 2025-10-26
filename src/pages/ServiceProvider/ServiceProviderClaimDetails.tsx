import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ServiceProviderClaimDetails = () => {
  const { claimId } = useParams();

  // Placeholder data for a single claim
  const claimDetails = {
    id: claimId,
    farmerName: "Rajesh Kumar",
    location: "Punjab",
    cropType: "Wheat",
    submissionDate: "2023-01-15",
    status: "Pending",
    images: [
      "https://via.placeholder.com/150/0000FF/FFFFFF?text=Image+1",
      "https://via.placeholder.com/150/FF0000/FFFFFF?text=Image+2",
    ],
    damageDescription: "Heavy rainfall caused significant waterlogging and crop damage in the affected area. Approximately 30% of the wheat crop is submerged.",
    policyDetails: {
      policyId: "POL789",
      coverage: "Flood, Hail, Pest",
      claimLimit: "₹50,000",
    },
    aiInsights: {
      ndviBefore: "0.75",
      ndviAfter: "0.30",
      predictedDamage: "35%",
      fraudRiskScore: "Low (5%)",
    },
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
      <h1 className="text-3xl font-bold text-sp-primary-DEFAULT mb-6 border-b-2 border-sp-primary-DEFAULT pb-2 text-center">Claim Details: {claimId}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Claim Information */}
        <Card className="lg:col-span-2 bg-sp-off-white-DEFAULT shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-sp-primary-DEFAULT">Claim Information</CardTitle>
          </CardHeader>
          <CardContent className="text-sp-neutral-dark">
            <p><strong>Farmer Name:</strong> {claimDetails.farmerName}</p>
            <p><strong>Location:</strong> {claimDetails.location}</p>
            <p><strong>Crop Type:</strong> {claimDetails.cropType}</p>
            <p><strong>Submission Date:</strong> {claimDetails.submissionDate}</p>
            <p><strong>Status:</strong> {claimDetails.status}</p>
            <h3 className="text-lg font-semibold mt-4 mb-2 text-sp-primary-DEFAULT">Farmer's Uploaded Images/Videos</h3>
            <div className="grid grid-cols-2 gap-4">
              {claimDetails.images.map((image, index) => (
                <img key={index} src={image} alt={`Claim Image ${index + 1}`} className="w-full h-auto rounded-md shadow-md" />
              ))}
            </div>
            <h3 className="text-lg font-semibold mt-4 mb-2 text-sp-primary-DEFAULT">Damage Description</h3>
            <p>{claimDetails.damageDescription}</p>
          </CardContent>
        </Card>

        {/* Policy Details */}
        <Card className="bg-sp-off-white-DEFAULT shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-sp-primary-DEFAULT">Policy Details</CardTitle>
          </CardHeader>
          <CardContent className="text-sp-neutral-dark">
            <p><strong>Policy ID:</strong> {claimDetails.policyDetails.policyId}</p>
            <p><strong>Coverage:</strong> {claimDetails.policyDetails.coverage}</p>
            <p><strong>Claim Limit:</strong> {claimDetails.policyDetails.claimLimit}</p>
          </CardContent>
        </Card>
      </div>

     

      {/* Verification Form */}
      <Card className="mb-6 bg-sp-off-white-DEFAULT shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-sp-primary-DEFAULT">Verification Form</CardTitle>
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
    </div>
  );
};

export default ServiceProviderClaimDetails;