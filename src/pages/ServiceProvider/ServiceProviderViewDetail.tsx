import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const ServiceProviderViewDetail = () => {
  const { entityType, id } = useParams<{ entityType: string; id: string }>();
  const navigate = useNavigate();

  // Dummy data for demonstration
  const dummyData = {
    farmer: {
      "FARMER001": {
        id: "FARMER001",
        name: "Ravi Kumar",
        contact: "9876543210",
        email: "ravi.kumar@example.com",
        address: "123, Green Valley, Punjab",
        totalLand: "10 acres",
        cropsGrown: ["Wheat", "Rice"],
        activePolicies: 3,
        claimsHistory: 2,
        status: "Active",
      },
      "FARMER002": {
        id: "FARMER002",
        name: "Priya Sharma",
        contact: "9988776655",
        email: "priya.sharma@example.com",
        address: "456, Sunny Fields, Haryana",
        totalLand: "15 acres",
        cropsGrown: ["Corn", "Sugarcane"],
        activePolicies: 2,
        claimsHistory: 1,
        status: "Active",
      },
    },
    crop: {
      "CROP001": {
        id: "CROP001",
        name: "Wheat",
        season: "Rabi",
        variety: "HD 2967",
        activePolicies: 150,
        cropYield: "50 quintals/acre",
        previousClaims: 20,
        damageSusceptibility: "Medium (Rust)",
      },
      "CROP002": {
        id: "CROP002",
        name: "Rice",
        season: "Kharif",
        variety: "Pusa Basmati 1121",
        activePolicies: 200,
        cropYield: "60 quintals/acre",
        previousClaims: 35,
        damageSusceptibility: "High (Blast)",
      },
    },
    policy: {
      "P001": {
        id: 'P001',
        farmer: 'John Doe',
        crop: 'Wheat',
        coverage: '5 acres',
        status: 'Active',
        startDate: '2023-03-01',
        endDate: '2024-02-28',
        premium: '₹5000',
        sumInsured: '₹50000',
        policyType: 'Crop Insurance',
        notes: 'Policy covers drought and flood.',
      },
      "P002": {
        id: 'P002',
        farmer: 'Jane Smith',
        crop: 'Corn',
        coverage: '10 acres',
        status: 'Pending',
        startDate: '2023-04-10',
        endDate: '2024-03-31',
        premium: '₹8000',
        sumInsured: '₹80000',
        policyType: 'Crop Insurance',
        notes: 'Waiting for farmer verification.',
      },
    },
    report: {
      "R001": {
        id: 'R001',
        name: 'Monthly Claim Summary',
        type: 'Financial',
        date: '2024-06-01',
        status: 'Generated',
        content: 'Summary of all claims processed in June 2024. Total claims: 150, Total payout: ₹1,500,000.',
      },
      "R002": {
        id: 'R002',
        name: 'Quarterly Performance Review',
        type: 'Performance',
        date: '2024-05-15',
        status: 'Pending',
        content: 'Review of service provider performance for Q2 2024. Key metrics: claim processing time, farmer satisfaction.',
      },
    },
    claim: {
      "CLM001": {
        id: "CLM001",
        farmer: "Ravi Kumar",
        crop: "Wheat",
        dateOfLoss: "2023-07-15",
        status: "Pending",
        lossType: "Drought",
        estimatedLoss: "₹50,000",
        dateSubmitted: "2023-07-20",
        notes: "Farmer reported severe drought conditions affecting wheat crop.",
      },
      "CLM002": {
        id: "CLM002",
        farmer: "Priya Sharma",
        crop: "Corn",
        dateOfLoss: "2023-08-01",
        status: "Approved",
        lossType: "Pest Infestation",
        estimatedLoss: "₹30,000",
        dateSubmitted: "2023-08-05",
        notes: "Pest infestation confirmed by field agent. Payout processed.",
      },
    },
  };

  const data = dummyData[entityType as keyof typeof dummyData]?.[id as keyof typeof dummyData[keyof typeof dummyData]];

  if (!data) {
    return <div className="p-4 text-center text-red-500">No details found for {entityType} with ID: {id}</div>;
  }

  const getTitle = () => {
    switch (entityType) {
      case "farmer":
        return "Farmer Details";
      case "crop":
        return "Crop Details";
      case "policy":
        return "Policy Details";
      case "report":
        return "Report Details";
      case "claim":
        return "Claim Details";
      default:
        return "Details";
    }
  };

  const renderDetails = () => {
    switch (entityType) {
      case "farmer":
        const farmerData = data as typeof dummyData.farmer["FARMER001"];
        return (
          <Card className="bg-sp-off-white-DEFAULT shadow-lg rounded-lg">
            <CardHeader>
              <CardTitle className="text-sp-primary-DEFAULT">Farmer Information</CardTitle>
            </CardHeader>
            <CardContent className="text-sp-neutral-dark">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <DetailItem label="Farmer ID" value={farmerData.id} />
                <DetailItem label="Name" value={farmerData.name} />
                <DetailItem label="Contact" value={farmerData.contact} />
                <DetailItem label="Email" value={farmerData.email} />
                <DetailItem label="Address" value={farmerData.address} />
                <DetailItem label="Total Land" value={farmerData.totalLand} />
                <DetailItem label="Crops Grown" value={farmerData.cropsGrown.join(", ")} />
                <DetailItem label="Active Policies" value={farmerData.activePolicies.toString()} />
                <DetailItem label="Claims History" value={farmerData.claimsHistory.toString()} />
                <DetailItem label="Status" value={farmerData.status} />
              </div>
            </CardContent>
          </Card>
        );
      case "crop":
        const cropData = data as typeof dummyData.crop["CROP001"];
        return (
          <Card className="bg-sp-off-white-DEFAULT shadow-lg rounded-lg">
            <CardHeader>
              <CardTitle className="text-sp-primary-DEFAULT">Crop Information</CardTitle>
            </CardHeader>
            <CardContent className="text-sp-neutral-dark">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <DetailItem label="Crop ID" value={cropData.id} />
                <DetailItem label="Name" value={cropData.name} />
                <DetailItem label="Season" value={cropData.season} />
                <DetailItem label="Variety" value={cropData.variety} />
                <DetailItem label="Active Policies" value={cropData.activePolicies.toString()} />
                <DetailItem label="Crop Yield" value={cropData.cropYield} />
                <DetailItem label="Previous Claims" value={cropData.previousClaims.toString()} />
                <DetailItem label="Damage Susceptibility" value={cropData.damageSusceptibility} />
              </div>
            </CardContent>
          </Card>
        );
      case "policy":
        const policyData = data as typeof dummyData.policy["P001"];
        return (
          <Card className="bg-sp-off-white-DEFAULT shadow-lg rounded-lg">
            <CardHeader>
              <CardTitle className="text-sp-primary-DEFAULT">Policy Information</CardTitle>
            </CardHeader>
            <CardContent className="text-sp-neutral-dark">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <DetailItem label="Policy ID" value={policyData.id} />
                <DetailItem label="Farmer" value={policyData.farmer} />
                <DetailItem label="Crop" value={policyData.crop} />
                <DetailItem label="Coverage" value={policyData.coverage} />
                <DetailItem label="Status" value={policyData.status} />
                <DetailItem label="Start Date" value={policyData.startDate} />
                <DetailItem label="End Date" value={policyData.endDate} />
                <DetailItem label="Premium" value={policyData.premium} />
                <DetailItem label="Sum Insured" value={policyData.sumInsured} />
                <DetailItem label="Policy Type" value={policyData.policyType} />
                <DetailItem label="Notes" value={policyData.notes} />
              </div>
            </CardContent>
          </Card>
        );
      case "report":
        const reportData = data as typeof dummyData.report["R001"];
        return (
          <Card className="bg-sp-off-white-DEFAULT shadow-lg rounded-lg">
            <CardHeader>
              <CardTitle className="text-sp-primary-DEFAULT">Report Information</CardTitle>
            </CardHeader>
            <CardContent className="text-sp-neutral-dark">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <DetailItem label="Report ID" value={reportData.id} />
                <DetailItem label="Name" value={reportData.name} />
                <DetailItem label="Type" value={reportData.type} />
                <DetailItem label="Date" value={reportData.date} />
                <DetailItem label="Status" value={reportData.status} />
                <DetailItem label="Content" value={reportData.content} />
              </div>
            </CardContent>
          </Card>
        );
      case "claim":
        const claimData = data as typeof dummyData.claim["CLM001"];
        return (
          <Card className="bg-sp-off-white-DEFAULT shadow-lg rounded-lg">
            <CardHeader>
              <CardTitle className="text-sp-primary-DEFAULT">Claim Information</CardTitle>
            </CardHeader>
            <CardContent className="text-sp-neutral-dark">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <DetailItem label="Claim ID" value={claimData.id} />
                <DetailItem label="Farmer" value={claimData.farmer} />
                <DetailItem label="Crop" value={claimData.crop} />
                <DetailItem label="Date of Loss" value={claimData.dateOfLoss} />
                <DetailItem label="Status" value={claimData.status} />
                <DetailItem label="Loss Type" value={claimData.lossType} />
                <DetailItem label="Estimated Loss" value={claimData.estimatedLoss} />
                <DetailItem label="Date Submitted" value={claimData.dateSubmitted} />
                <DetailItem label="Notes" value={claimData.notes} />
              </div>
            </CardContent>
          </Card>
        );
      default:
        return <div className="p-4 text-center text-red-500">Unknown entity type: {entityType}</div>;
    }
  };

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <Button
        onClick={() => navigate(-1)}
        className="mb-4 bg-sp-primary-DEFAULT hover:bg-sp-primary-dark text-white font-bold py-2 px-4 rounded-full text-xs transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
      >
        ← Back
      </Button>
      <h1 className="text-3xl font-bold text-sp-primary-DEFAULT mb-6 border-b-2 border-sp-primary-DEFAULT pb-2 text-center">
        {getTitle()}
      </h1>

      <div className="mb-6">
        {renderDetails()}
      </div>
    </div>
  );
};

interface DetailItemProps {
  label: string;
  value: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-sm font-medium text-sp-neutral-darker">{label}:</span>
    <span className="text-base text-sp-neutral-dark">{value}</span>
  </div>
);

export default ServiceProviderViewDetail;