import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface PolicyDetails {
  id: string;
  policyNumber: string;
  cropType: string;
  insuredAmount: string;
  status: string;
  startDate: string;
  endDate: string;
  premium: string;
  farmerName: string;
  farmLocation: string;
  coverageDetails: string;
  payoutHistory: { year: number; amount: string }[];
}

interface ClaimDetails {
  id: string;
  claimNumber: string;
  policyNumber: string;
  cropType: string;
  farmId: string;
  declaredCropType: string;
  damageType: string;
  damageDate: string;
  status: string;
  estimatedLoss: string;
  payoutAmount: string;
  inspectionDate: string;
  inspectorName: string;
  notes: string;
  verificationStatus: string;
  documents: { name: string; url: string }[];
}

type FarmerViewDetailsParams = {
  type: 'policy' | 'claim';
  id: string;
};

const FarmerViewDetails: React.FC = () => {
  const { type, id } = useParams<FarmerViewDetailsParams>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<PolicyDetails | ClaimDetails | null>(null); // Use a more specific type later

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (type === 'policy') {
          setDetails({
            id: id,
            policyNumber: 'POL' + id,
            cropType: 'Wheat',
            insuredAmount: '10,000 USD',
            status: 'Active',
            startDate: '2023-01-01',
            endDate: '2023-12-31',
            premium: '500 USD',
            farmerName: 'John Doe',
            farmLocation: 'Farmville, USA',
            coverageDetails: 'Covers drought and flood.',
            payoutHistory: [
              { year: 2022, amount: '1,200 USD' },
              { year: 2021, amount: '0 USD' },
            ],
          });
        } else if (type === 'claim') {
          setDetails({
            id: id,
            claimNumber: 'CLM' + id,
            policyNumber: 'POL123',
            cropType: 'Corn',
            farmId: 'F001',
            declaredCropType: 'Corn',
            damageType: 'Drought',
            damageDate: '2023-07-15',
            status: 'Pending',
            estimatedLoss: '5,000 USD',
            payoutAmount: '0 USD',
            inspectionDate: '2023-07-20',
            inspectorName: 'Jane Smith',
            notes: 'Initial assessment complete. Awaiting satellite imagery.',
            verificationStatus: 'Pending',
            documents: [
              { name: 'Damage Report.pdf', url: '#' },
              { name: 'Farm Photos.zip', url: '#' },
            ],
          });
        } else {
          setError('Invalid detail type specified.');
        }
      } catch (err) {
        setError('Failed to fetch details.');
      } finally {
        setLoading(false);
      }
    };

    if (type && id) {
      fetchDetails();
    }
  }, [type, id]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center text-primary-green">
        Loading details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!details) {
    return (
      <div className="container mx-auto p-4 text-center text-gray-500">
        No details found.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-3xl font-bold text-primary-green mb-6 border-b-2 border-primary-green pb-2 text-center">
        {type === 'policy' ? `Policy Details: ${(details as PolicyDetails).policyNumber}` : `Claim Details: ${(details as ClaimDetails).claimNumber}`}
      </h1>
      <div className="bg-card-background shadow-lg rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Policy Details */}
          {type === 'policy' && details && (
            <>
              <div>
                <p className="text-sm font-medium text-gray-500">Policy Number</p>
                <p className="text-lg font-semibold text-gray-900">{(details as PolicyDetails).policyNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Crop Type</p>
                <p className="text-lg font-semibold text-gray-900">{(details as PolicyDetails).cropType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Insured Amount</p>
                <p className="text-lg font-semibold text-gray-900">{(details as PolicyDetails).insuredAmount}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="text-lg font-semibold text-gray-900">{(details as PolicyDetails).status}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Start Date</p>
                <p className="text-lg font-semibold text-gray-900">{(details as PolicyDetails).startDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">End Date</p>
                <p className="text-lg font-semibold text-gray-900">{(details as PolicyDetails).endDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Premium</p>
                <p className="text-lg font-semibold text-gray-900">{(details as PolicyDetails).premium}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Farmer Name</p>
                <p className="text-lg font-semibold text-gray-900">{(details as PolicyDetails).farmerName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Farm Location</p>
                <p className="text-lg font-semibold text-gray-900">{(details as PolicyDetails).farmLocation}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-500">Coverage Details</p>
                <p className="text-lg text-gray-900">{(details as PolicyDetails).coverageDetails}</p>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-xl font-semibold text-primary-green mt-4 mb-2">Payout History</h3>
                {(details as PolicyDetails).payoutHistory.length > 0 ? (
                  <ul className="list-disc list-inside ml-4">
                    {(details as PolicyDetails).payoutHistory.map((payout: { year: number; amount: string }, index: number) => (
                      <li key={index} className="text-gray-900">{payout.year}: {payout.amount}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-700">No payout history available.</p>
                )}
              </div>
            </>
          )}

          {/* Claim Details */}
          {type === 'claim' && details && (
            <>
              <div>
                <p className="text-sm font-medium text-gray-500">Claim Number</p>
                <p className="text-lg font-semibold text-gray-900">{(details as ClaimDetails).claimNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Policy Number</p>
                <p className="text-lg font-semibold text-gray-900">{(details as ClaimDetails).policyNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Crop Type</p>
                <p className="text-lg font-semibold text-gray-900">{(details as ClaimDetails).cropType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Farm ID</p>
                <p className="text-lg font-semibold text-gray-900">{(details as ClaimDetails).farmId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Declared Crop Type</p>
                <p className="text-lg font-semibold text-gray-900">{(details as ClaimDetails).declaredCropType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Damage Type</p>
                <p className="text-lg font-semibold text-gray-900">{(details as ClaimDetails).damageType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Damage Date</p>
                <p className="text-lg font-semibold text-gray-900">{(details as ClaimDetails).damageDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="text-lg font-semibold text-gray-900">{(details as ClaimDetails).status}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Estimated Loss</p>
                <p className="text-lg font-semibold text-gray-900">{(details as ClaimDetails).estimatedLoss}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Payout Amount</p>
                <p className="text-lg font-semibold text-gray-900">{(details as ClaimDetails).payoutAmount}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Verification Status</p>
                <p className="text-lg font-semibold text-gray-900">{(details as ClaimDetails).verificationStatus}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Inspection Date</p>
                <p className="text-lg font-semibold text-gray-900">{(details as ClaimDetails).inspectionDate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Inspector Name</p>
                <p className="text-lg font-semibold text-gray-900">{(details as ClaimDetails).inspectorName}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-500">Notes</p>
                <p className="text-lg text-gray-900">{(details as ClaimDetails).notes}</p>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-xl font-semibold text-primary-green mt-4 mb-2">Supporting Documents</h3>
                {(details as ClaimDetails).documents.length > 0 ? (
                  <ul className="list-disc list-inside ml-4">
                    {(details as ClaimDetails).documents.map((doc: { name: string; url: string }, index: number) => (
                      <li key={index} className="text-gray-900">
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {doc.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-700">No supporting documents available.</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
        >
          Back
        </button>
        {type === 'policy' && (
          <>          
            <button
              onClick={() => alert('Renewal process initiated')}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
            >
              Renew Policy
            </button>
            <button
              onClick={() => alert('Modification request submitted')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
            >
              Request Modification
            </button>
            <button
              onClick={() => alert('Policy cancellation confirmed')}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
            >
              Cancel Policy
            </button>
          </>
        )}
        {type === 'claim' && details.status === 'Pending' && (
          <button
            onClick={() => navigate(`/farmer/claim-submission/${id}`)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
          >
            Update Claim
          </button>
        )}
      </div>
    </div>
  );
};

export default FarmerViewDetails;