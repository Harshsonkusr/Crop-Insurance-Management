import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from '../../lib/api';
import logger from '../../utils/logger';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, AlertCircle, Phone, User, Shield, Search, MapPin, Loader2, ChevronRight, ChevronLeft, Building2, Camera, Upload, X, Map } from "lucide-react";
import { fetchStatesAndDistricts, fetchLocationByPincode, fetchTehsilsAndVillages, State as StateType } from '../../services/locationService';
import { INDIAN_BANKS } from '../../services/bankService';
import FarmBoundaryMap from '@/components/FarmBoundaryMap';

const CROP_TYPES = [
  "Cereals",
  "Pulses",
  "Oilseeds",
  "Commercial Crops",
  "Fruits",
  "Vegetables",
  "Spices",
  "Others"
];

const CROPS_BY_TYPE: Record<string, string[]> = {
  "Cereals": ["Wheat", "Rice", "Maize", "Bajra", "Jowar", "Barley", "Ragi"],
  "Pulses": ["Gram", "Tur (Arhar)", "Moong", "Urad", "Masur", "Peas"],
  "Oilseeds": ["Groundnut", "Mustard", "Soyabean", "Sunflower", "Sesame", "Castor"],
  "Commercial Crops": ["Cotton", "Sugarcane", "Jute", "Tobacco"],
  "Fruits": ["Mango", "Banana", "Citrus", "Apple", "Guava", "Grapes"],
  "Vegetables": ["Potato", "Onion", "Tomato", "Brinjal", "Cabbage", "Cauliflower"],
  "Spices": ["Chilli", "Turmeric", "Garlic", "Ginger", "Coriander"],
  "Others": ["Rubber", "Coffee", "Tea", "Other"]
};

const FarmerSignup = () => {
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    dob: "",
    casteCategory: "",
    farmerType: "",
    farmerCategory: "",
    loaneeStatus: "",
    mobileNumber: "",
    aadhaarNumber: "",
    address: "",
    village: "",
    tehsil: "",
    district: "",
    state: "",
    pincode: "",
    farmName: "",
    cropType: "",
    cropName: "",
    cropSeason: "",
    landRecordKhasra: "",
    landRecordKhatauni: "",
    surveyNumber: "",
    insuranceUnit: "",
    cropVariety: "",
    bankName: "",
    bankAccountNo: "",
    bankIfsc: "",
    insuranceLinked: "No",
    landAreaSize: "",
    latitude: "",
    longitude: "",
    sowingCertificate: "",
    wildAnimalAttackCoverage: false,
    landImage1Gps: "",
    landImage2Gps: "",
    landImage3Gps: "",
    landImage4Gps: "",
    landImage5Gps: "",
    landImage6Gps: "",
    landImage7Gps: "",
    landImage8Gps: "",
  });

  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});

  const [states, setStates] = useState<StateType[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [tehsils, setTehsils] = useState<string[]>([]);
  const [villages, setVillages] = useState<string[]>([]);
  const [tehsilVillageMap, setTehsilVillageMap] = useState<Record<string, string[]>>({});

  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [statesLoading, setStatesLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [geolocationLoading, setGeolocationLoading] = useState(false);
  const [manualLocation, setManualLocation] = useState({ tehsil: false, village: false });

  useEffect(() => {
    const loadStates = async () => {
      setStatesLoading(true);
      const data = await fetchStatesAndDistricts();
      setStates(data);
      setStatesLoading(false);
    };
    loadStates();
  }, []);

  useEffect(() => {
    if (formData.state) {
      const stateObj = states.find(s => s.state === formData.state);
      setDistricts(stateObj ? stateObj.districts : []);
    } else {
      setDistricts([]);
    }
  }, [formData.state, states]);

  useEffect(() => {
    const loadTehsilsAndVillages = async () => {
      if (formData.district) {
        setLocationLoading(true);
        const data = await fetchTehsilsAndVillages(formData.district);
        setTehsils(data.tehsils);
        setTehsilVillageMap(data.tehsilVillageMap);

        // If current tehsil is not in the list, and it's not empty, it might be from pincode or manual
        if (formData.tehsil && !data.tehsils.includes(formData.tehsil)) {
          setManualLocation(prev => ({ ...prev, tehsil: true }));
        } else {
          setManualLocation(prev => ({ ...prev, tehsil: false }));
        }

        setLocationLoading(false);
      } else {
        setTehsils([]);
        setVillages([]);
        setTehsilVillageMap({});
      }
    };
    loadTehsilsAndVillages();
  }, [formData.district]);

  useEffect(() => {
    if (formData.tehsil && tehsilVillageMap[formData.tehsil]) {
      const availableVillages = tehsilVillageMap[formData.tehsil];
      setVillages(availableVillages);

      if (formData.village && !availableVillages.includes(formData.village)) {
        setManualLocation(prev => ({ ...prev, village: true }));
      } else {
        setManualLocation(prev => ({ ...prev, village: false }));
      }
    } else {
      setVillages([]);
      // If we have a tehsil but no mapping, it's manual
      if (formData.tehsil) {
        setManualLocation(prev => ({ ...prev, village: true }));
      }
    }
  }, [formData.tehsil, tehsilVillageMap]);

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setFormData(prev => ({ ...prev, pincode: value }));

    if (value.length === 6) {
      setPincodeLoading(true);
      const location = await fetchLocationByPincode(value);
      if (location) {
        setFormData(prev => ({
          ...prev,
          state: location.state,
          district: location.district,
          tehsil: location.tehsil,
          village: location.village
        }));
        setError(null);
      } else {
        setError("Location not found for this PIN code. Please enter details manually.");
      }
      setPincodeLoading(false);
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
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        setGeolocationLoading(false);
      },
      (error) => {
        setGeolocationLoading(false);
        setError(`Geolocation error: ${error.message}`);
      }
    );
  };

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [consentGranted, setConsentGranted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const validateStep = (step: number) => {
    setError(null);
    if (step === 1) {
      if (!formData.name.trim()) {
        setError("Name is required");
        return false;
      }
      if (formData.name.trim().length < 2) {
        setError("Name must be at least 2 characters long");
        return false;
      }
      if (!formData.gender) {
        setError("Please select your gender");
        return false;
      }
      if (!formData.dob) {
        setError("Please enter your date of birth");
        return false;
      }
      if (!formData.casteCategory) {
        setError("Please select your caste category");
        return false;
      }
      if (!formData.farmerType) {
        setError("Please select farmer type");
        return false;
      }
      if (!formData.farmerCategory) {
        setError("Please select farmer category");
        return false;
      }
      if (!formData.loaneeStatus) {
        setError("Please select loanee status");
        return false;
      }
      if (!formData.mobileNumber.trim()) {
        setError("Mobile number is required");
        return false;
      }
      if (formData.mobileNumber.length < 10) {
        setError("Please enter a valid mobile number (at least 10 digits)");
        return false;
      }
      if (!formData.aadhaarNumber.trim()) {
        setError("Aadhaar number is required");
        return false;
      }
      if (formData.aadhaarNumber.length !== 12) {
        setError("Aadhaar number must be exactly 12 digits");
        return false;
      }
    } else if (step === 2) {
      if (!formData.state) {
        setError("Please select your state");
        return false;
      }
      if (!formData.district) {
        setError("Please select your district");
        return false;
      }
      if (!formData.tehsil || !formData.tehsil.trim()) {
        setError("Tehsil/Block is required");
        return false;
      }
      if (!formData.village || !formData.village.trim()) {
        setError("Village/Area is required");
        return false;
      }
      if (!formData.pincode || formData.pincode.length !== 6 || !/^\d{6}$/.test(formData.pincode)) {
        setError("Please enter a valid 6-digit PIN code");
        return false;
      }
      if (!formData.farmName.trim()) {
        setError("Farm name is required");
        return false;
      }
      if (!formData.cropType.trim()) {
        setError("Crop type is required");
        return false;
      }
      if (!formData.latitude || !formData.longitude) {
        setError("Farm coordinates (latitude and longitude) are required. Use the capture button or enter manually.");
        return false;
      }
      if (!formData.cropSeason) {
        setError("Please select the crop season");
        return false;
      }
      if (!formData.insuranceUnit.trim()) {
        setError("Insurance Unit (Village/GP) is required for PMFBY compliance");
        return false;
      }
      if (!formData.landAreaSize || parseFloat(formData.landAreaSize) <= 0) {
        setError("Please enter a valid land area size");
        return false;
      }
      if (!formData.landRecordKhasra && !formData.surveyNumber) {
        setError("Survey Number or Khasra Number is mandatory for PMFBY");
        return false;
      }
      if (!files.satbaraImage) {
        setError("7/12 Extract (Satbara) document is mandatory");
        return false;
      }
      if (!files.patwariMapImage) {
        setError("Patwari Map (Land Map) document is mandatory");
        return false;
      }
      if (!files.sowingCertificate) {
        setError("Sowing Certificate is mandatory for PMFBY 2026 compliance");
        return false;
      }
      // Check if at least 4 corner photos and GPS coordinates are provided
      let cornerCount = 0;
      for (let i = 1; i <= 8; i++) {
        if (files[`landImage${i}`] && formData[`landImage${i}Gps` as keyof typeof formData]) {
          cornerCount++;
        }
      }
      if (cornerCount < 4) {
        setError("At least 4 corner photos with GPS coordinates are required for farm boundary verification");
        return false;
      }
    } else if (step === 3) {
      if (!formData.bankName) {
        setError("Please select your bank");
        return false;
      }
      if (!formData.bankAccountNo) {
        setError("Please enter your bank account number");
        return false;
      }
      if (formData.bankAccountNo.length < 9 || formData.bankAccountNo.length > 18) {
        setError("Please enter a valid bank account number (9-18 digits)");
        return false;
      }
      if (!formData.bankIfsc) {
        setError("Please enter your bank IFSC code");
        return false;
      }
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(formData.bankIfsc)) {
        setError("Please enter a valid IFSC code (e.g. SBIN0001234)");
        return false;
      }
      if (!files.bankPassbookImage) {
        setError("Bank Passbook copy is mandatory for PMFBY verification");
        return false;
      }
      if (!files.aadhaarCardImage) {
        setError("Aadhaar Card copy is mandatory for identity verification");
        return false;
      }
      if (!consentGranted) {
        setError("Aadhaar linking consent is required for PMFBY verification");
        return false;
      }
      if (!acceptTerms) {
        setError("Please accept the terms and conditions to continue");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Only allow numbers for mobile number, Aadhaar, and Bank Account
    if (name === "mobileNumber" || name === "aadhaarNumber" || name === "bankAccountNo") {
      const numericValue = value.replace(/\D/g, "");
      setFormData({ ...formData, [name]: numericValue });
    } else if (name === "bankIfsc") {
      setFormData({ ...formData, [name]: value.toUpperCase() });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      const file = selectedFiles[0];
      setFiles(prev => ({ ...prev, [name]: file }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [name]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (fieldName: string) => {
    setFiles(prev => ({ ...prev, [fieldName]: null }));
    setPreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[fieldName];
      return newPreviews;
    });
  };

  const boundaryCoordinates = useMemo(() => {
    const coords: { lat: number, lng: number }[] = [];
    for (let i = 1; i <= 8; i++) {
      const gpsKey = `landImage${i}Gps` as keyof typeof formData;
      const gpsValue = formData[gpsKey] as string;
      if (gpsValue && gpsValue.includes(',')) {
        const [lat, lng] = gpsValue.split(',').map(v => parseFloat(v.trim()));
        if (!isNaN(lat) && !isNaN(lng)) {
          coords.push({ lat, lng });
        }
      }
    }
    return coords;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all steps before submission
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();

      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          const processedValue = typeof value === 'string' ? value.trim() : String(value);
          formDataToSend.append(key, processedValue);
        }
      });

      // Add other required fields
      formDataToSend.append('consentGranted', String(consentGranted));

      // Note: We don't need to append name, mobileNumber, and aadhaarNumber again 
      // as they are already included in formData and appended above.

      // Add files: only fields allowed by backend multer on /auth/signup/farmer
      const allowedFileKeys = new Set([
        'satbaraImage',
        'patwariMapImage',
        'sowingCertificate',
        'bankPassbookImage',
        'aadhaarCardImage',
        'landImage1',
        'landImage2',
        'landImage3',
        'landImage4',
        'landImage5',
        'landImage6',
        'landImage7',
        'landImage8',
      ]);
      Object.entries(files).forEach(([key, file]) => {
        if (file && allowedFileKeys.has(key)) {
          formDataToSend.append(key, file);
        }
      });

      const response = await api.post('/auth/signup/farmer', formDataToSend);

      setSuccess(response.data.message || "Account created successfully! Please click 'Send OTP' to receive your verification code.");
      logger.farmer.register('Farmer registered successfully', {
        mobileNumber: formData.mobileNumber.trim(),
        hasAadhaar: !!formData.aadhaarNumber
      });

      // Show success message and redirect to login immediately (don't wait)
      navigate('/login', {
        state: {
          message: "Account created successfully! Please click 'Send OTP' to receive your verification code.",
          mobileNumber: formData.mobileNumber.trim(),
          showSendOtpButton: true
        }
      });
    } catch (err: any) {
      logger.farmer.error("Farmer signup error", { error: err, mobileNumber: formData.mobileNumber.trim() });

      // Handle existing user - redirect to login
      if (err?.response?.status === 409 && err?.response?.data?.redirectToLogin) {
        navigate('/login', {
          state: {
            message: err.response.data.message || "A farmer with this information already exists. Please login.",
            mobileNumber: formData.mobileNumber.trim()
          }
        });
        return;
      }

      if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err?.response?.status === 409) {
        setError("A farmer with this mobile number or Aadhaar already exists. Please login instead.");
      } else {
        setError("Failed to register. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50 p-4">
      <div className="w-full max-w-4xl">
        <div className="grid md:grid-cols-2 gap-0 rounded-2xl bg-white shadow-2xl overflow-hidden">
          {/* Left Side - Signup Form */}
          <div className="flex flex-col justify-center p-8 md:p-12">
            <div className="mb-6">
              <Link to="/" className="inline-flex items-center text-[#1A5319] hover:text-[#1A5319]/80 mb-4">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold text-[#1A5319] mb-2">
                Farmer Registration
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                Create your account to access crop insurance services
              </p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{success}</p>
                  <p className="text-xs mt-1">Redirecting to login page...</p>
                </div>
              </div>
            )}

            {/* Step Indicator */}
            <div className="flex justify-between items-center mb-8 px-2">
              {[
                { step: 1, label: 'Basic Info', icon: User },
                { step: 2, label: 'Farm Details', icon: MapPin },
                { step: 3, label: 'Bank & Terms', icon: Shield },
              ].map((s, i) => (
                <div key={s.step} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-2 relative z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep >= s.step
                        ? 'bg-[#1A5319] border-[#1A5319] text-white shadow-md'
                        : 'bg-white border-gray-300 text-gray-400'
                        }`}
                    >
                      <s.icon className="h-5 w-5" />
                    </div>
                    <span className={`text-[10px] md:text-xs font-medium whitespace-nowrap ${currentStep >= s.step ? 'text-[#1A5319]' : 'text-gray-500'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < 2 && (
                    <div className={`flex-1 h-0.5 -mt-6 transition-all duration-500 ${currentStep > s.step ? 'bg-[#1A5319]' : 'bg-gray-200'
                      }`} />
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {currentStep === 1 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                      Full Name *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                        className="pl-10 h-12 rounded-lg border-gray-300 focus:border-[#1A5319] focus:ring-[#1A5319]"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gender" className="text-sm font-medium text-gray-700 mb-2 block">
                        Gender *
                      </Label>
                      <Select
                        onValueChange={(value) => setFormData({ ...formData, gender: value })}
                        value={formData.gender}
                      >
                        <SelectTrigger className="h-12 border-gray-300 focus:ring-[#1A5319]">
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="dob" className="text-sm font-medium text-gray-700 mb-2 block">
                        Date of Birth *
                      </Label>
                      <Input
                        id="dob"
                        name="dob"
                        type="date"
                        value={formData.dob}
                        onChange={handleChange}
                        required
                        className="h-12 rounded-lg border-gray-300 focus:border-[#1A5319] focus:ring-[#1A5319]"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="casteCategory" className="text-sm font-medium text-gray-700 mb-2 block">
                        Caste Category *
                      </Label>
                      <Select
                        onValueChange={(value) => setFormData({ ...formData, casteCategory: value })}
                        value={formData.casteCategory}
                      >
                        <SelectTrigger className="h-12 border-gray-300 focus:ring-[#1A5319]">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="General">General</SelectItem>
                          <SelectItem value="SC">SC</SelectItem>
                          <SelectItem value="ST">ST</SelectItem>
                          <SelectItem value="OBC">OBC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="farmerType" className="text-sm font-medium text-gray-700 mb-2 block">
                        Farmer Type *
                      </Label>
                      <Select
                        onValueChange={(value) => setFormData({ ...formData, farmerType: value })}
                        value={formData.farmerType}
                      >
                        <SelectTrigger className="h-12 border-gray-300 focus:ring-[#1A5319]">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Owner">Owner</SelectItem>
                          <SelectItem value="Tenant">Tenant</SelectItem>
                          <SelectItem value="Sharecropper">Sharecropper</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="farmerCategory" className="text-sm font-medium text-gray-700 mb-2 block">
                        Farmer Category *
                      </Label>
                      <Select
                        onValueChange={(value) => setFormData({ ...formData, farmerCategory: value })}
                        value={formData.farmerCategory}
                      >
                        <SelectTrigger className="h-12 border-gray-300 focus:ring-[#1A5319]">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Small">Small (&lt; 2 Ha)</SelectItem>
                          <SelectItem value="Marginal">Marginal (&lt; 1 Ha)</SelectItem>
                          <SelectItem value="Others">Others (&gt; 2 Ha)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="loaneeStatus" className="text-sm font-medium text-gray-700 mb-2 block">
                        Loanee Status *
                      </Label>
                      <Select
                        onValueChange={(value) => setFormData({ ...formData, loaneeStatus: value })}
                        value={formData.loaneeStatus}
                      >
                        <SelectTrigger className="h-12 border-gray-300 focus:ring-[#1A5319]">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Loanee">Loanee</SelectItem>
                          <SelectItem value="Non-Loanee">Non-Loanee</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="mobileNumber" className="text-sm font-medium text-gray-700 mb-2 block">
                      Mobile Number *
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="mobileNumber"
                        name="mobileNumber"
                        type="tel"
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        placeholder="Enter your 10-digit mobile number"
                        required
                        maxLength={10}
                        className="pl-10 h-12 rounded-lg border-gray-300 focus:border-[#1A5319] focus:ring-[#1A5319]"
                        disabled={loading}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      You'll receive an OTP on this number for verification
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="aadhaarNumber" className="text-sm font-medium text-gray-700 mb-2 block">
                      Aadhaar Number *
                    </Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="aadhaarNumber"
                        name="aadhaarNumber"
                        type="tel"
                        value={formData.aadhaarNumber}
                        onChange={handleChange}
                        placeholder="Enter your 12-digit Aadhaar number"
                        required
                        maxLength={12}
                        className="pl-10 h-12 rounded-lg border-gray-300 focus:border-[#1A5319] focus:ring-[#1A5319]"
                        disabled={loading}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Required for policy verification and linking
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="pt-4">
                    <h3 className="text-lg font-semibold text-[#1A5319] mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5" /> Location Details
                    </h3>

                    {/* Reordered Location Fields: Address -> Pincode trigger -> Auto-filled details */}
                    <div className="mb-4">
                      <Label htmlFor="address" className="text-sm font-medium text-gray-700 mb-2 block">
                        Full Address
                      </Label>
                      <Input
                        id="address"
                        name="address"
                        type="text"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="House no, Street area, Landmark"
                        className="h-12 rounded-lg border-gray-300 focus:border-[#1A5319] focus:ring-[#1A5319]"
                        disabled={loading}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor="pincode" className="text-sm font-medium text-gray-700 mb-2 block">
                          PIN Code (Auto-fill)
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="pincode"
                            name="pincode"
                            type="text"
                            value={formData.pincode}
                            onChange={handlePincodeChange}
                            placeholder="6-digit PIN"
                            maxLength={6}
                            className="pl-9 h-12 rounded-lg border-gray-300 focus:border-[#1A5319] focus:ring-[#1A5319] bg-green-50/20"
                            disabled={loading || pincodeLoading}
                          />
                          {pincodeLoading && (
                            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#1A5319] animate-spin" />
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1 ml-1">
                          Enter PIN to auto-fill State & District
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="state" className="text-sm font-medium text-gray-700 mb-2 block">
                          State
                        </Label>
                        <Select
                          value={formData.state}
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            state: value,
                            district: "",
                            tehsil: "",
                            village: "",
                            pincode: "" // Reset pincode if state is manually changed
                          }))}
                          disabled={loading || statesLoading}
                        >
                          <SelectTrigger className={`h-12 rounded-lg border-gray-300 ${formData.state ? 'bg-green-50/20' : ''}`}>
                            <SelectValue placeholder={statesLoading ? "Loading..." : "Select State"} />
                          </SelectTrigger>
                          <SelectContent>
                            {states.map((s) => (
                              <SelectItem key={s.state} value={s.state}>
                                {s.state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor="district" className="text-sm font-medium text-gray-700 mb-2 block">
                          District
                        </Label>
                        <Select
                          value={formData.district}
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            district: value,
                            tehsil: "",
                            village: "",
                            pincode: "" // Reset pincode if district is manually changed
                          }))}
                          disabled={loading || !formData.state}
                        >
                          <SelectTrigger className={`h-12 rounded-lg border-gray-300 ${formData.district ? 'bg-green-50/20' : ''}`}>
                            <SelectValue placeholder="Select District" />
                          </SelectTrigger>
                          <SelectContent>
                            {districts.map((d) => (
                              <SelectItem key={d} value={d}>
                                {d}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label htmlFor="tehsil" className="text-sm font-medium text-gray-700 block">
                            Sub-District (Tehsil/Block) *
                          </Label>
                          <button
                            type="button"
                            onClick={() => setManualLocation(prev => ({ ...prev, tehsil: !prev.tehsil }))}
                            className="text-xs text-[#1A5319] hover:underline font-medium"
                          >
                            {manualLocation.tehsil ? "Select from list" : "Enter manually"}
                          </button>
                        </div>
                        {manualLocation.tehsil ? (
                          <Input
                            id="tehsil"
                            name="tehsil"
                            type="text"
                            value={formData.tehsil}
                            onChange={handleChange}
                            placeholder="Enter Sub-District"
                            className="h-12 rounded-lg border-gray-300 focus:border-[#1A5319] focus:ring-[#1A5319]"
                            disabled={loading}
                          />
                        ) : (
                          <Select
                            value={formData.tehsil}
                            onValueChange={(value) => setFormData(prev => ({
                              ...prev,
                              tehsil: value,
                              village: "" // Reset village when tehsil changes
                            }))}
                            disabled={loading || !formData.district || locationLoading}
                          >
                            <SelectTrigger className="h-12 rounded-lg border-gray-300">
                              <SelectValue placeholder={locationLoading ? "Loading..." : "Select Sub-District"} />
                            </SelectTrigger>
                            <SelectContent>
                              {tehsils.map((t) => (
                                <SelectItem key={t} value={t}>
                                  {t}
                                </SelectItem>
                              ))}
                              {tehsils.length === 0 && !locationLoading && (
                                <SelectItem value="none" disabled>No Sub-Districts found</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label htmlFor="village" className="text-sm font-medium text-gray-700 block">
                            Revenue Village / Gram Panchayat *
                          </Label>
                          <button
                            type="button"
                            onClick={() => setManualLocation(prev => ({ ...prev, village: !prev.village }))}
                            className="text-xs text-[#1A5319] hover:underline font-medium"
                          >
                            {manualLocation.village ? "Select from list" : "Enter manually"}
                          </button>
                        </div>
                        {manualLocation.village ? (
                          <Input
                            id="village"
                            name="village"
                            type="text"
                            value={formData.village}
                            onChange={handleChange}
                            placeholder="Enter Village Name"
                            className="h-12 rounded-lg border-gray-300 focus:border-[#1A5319] focus:ring-[#1A5319]"
                            disabled={loading}
                          />
                        ) : (
                          <Select
                            value={formData.village}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, village: value }))}
                            disabled={loading || !formData.tehsil || locationLoading}
                          >
                            <SelectTrigger className="h-12 rounded-lg border-gray-300">
                              <SelectValue placeholder={locationLoading ? "Loading..." : "Select Village"} />
                            </SelectTrigger>
                            <SelectContent>
                              {villages.map((v) => (
                                <SelectItem key={v} value={v}>
                                  {v}
                                </SelectItem>
                              ))}
                              {villages.length === 0 && !locationLoading && (
                                <SelectItem value="none" disabled>No Villages found</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <h3 className="text-lg font-semibold text-[#1A5319] mb-4 flex items-center gap-2">
                      <Building2 className="w-5 h-5" /> Farm Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor="farmName" className="text-sm font-medium text-gray-700 mb-2 block">
                          Farm Name *
                        </Label>
                        <Input
                          id="farmName"
                          name="farmName"
                          type="text"
                          value={formData.farmName}
                          onChange={handleChange}
                          placeholder="e.g. Green Valley Farm"
                          className="h-12 rounded-lg border-gray-300 focus:border-[#1A5319] focus:ring-[#1A5319]"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cropType" className="text-sm font-medium text-gray-700 mb-2 block">
                          Main Crop Type *
                        </Label>
                        <Select
                          value={formData.cropType}
                          onValueChange={(value) => {
                            setFormData(prev => ({
                              ...prev,
                              cropType: value,
                              cropName: "" // Reset crop name when type changes
                            }));
                          }}
                          disabled={loading}
                        >
                          <SelectTrigger className="h-12 rounded-lg border-gray-300">
                            <SelectValue placeholder="Select Crop Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {CROP_TYPES.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cropName" className="text-sm font-medium text-gray-700 mb-2 block">
                          Crop Name
                        </Label>
                        <Select
                          value={formData.cropName}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, cropName: value }))}
                          disabled={loading || !formData.cropType}
                        >
                          <SelectTrigger className="h-12 rounded-lg border-gray-300">
                            <SelectValue placeholder={formData.cropType ? "Select Crop" : "Select Type first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {formData.cropType && CROPS_BY_TYPE[formData.cropType] ? (
                              CROPS_BY_TYPE[formData.cropType].map(crop => (
                                <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none" disabled>Select a crop type first</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="cropVariety" className="text-sm font-medium text-gray-700 mb-2 block">
                          Crop Variety
                        </Label>
                        <Input
                          id="cropVariety"
                          name="cropVariety"
                          type="text"
                          value={formData.cropVariety}
                          onChange={handleChange}
                          placeholder="e.g. Sona Masuri, PB-1121"
                          className="h-12 rounded-lg border-gray-300 focus:border-[#1A5319] focus:ring-[#1A5319]"
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label htmlFor="cropSeason" className="text-sm font-medium text-gray-700 mb-2 block">
                          Crop Season *
                        </Label>
                        <Select
                          value={formData.cropSeason}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, cropSeason: value }))}
                          disabled={loading}
                        >
                          <SelectTrigger className="h-12 rounded-lg border-gray-300">
                            <SelectValue placeholder="Select Season" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Kharif">Kharif</SelectItem>
                            <SelectItem value="Rabi">Rabi</SelectItem>
                            <SelectItem value="Zaid">Zaid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="insuranceUnit" className="text-sm font-medium text-gray-700 mb-2 block">
                          Insurance Unit (Village/GP) *
                        </Label>
                        <Input
                          id="insuranceUnit"
                          name="insuranceUnit"
                          type="text"
                          value={formData.insuranceUnit}
                          onChange={handleChange}
                          placeholder="Village or Gram Panchayat"
                          className="h-12 rounded-lg border-gray-300 focus:border-[#1A5319] focus:ring-[#1A5319]"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label htmlFor="latitude" className="text-sm font-medium text-gray-700 mb-2 block">
                          Latitude *
                        </Label>
                        <Input
                          id="latitude"
                          name="latitude"
                          type="text"
                          value={formData.latitude}
                          onChange={handleChange}
                          placeholder="e.g. 12.345678"
                          className="h-12 rounded-lg border-gray-300 focus:border-[#1A5319] focus:ring-[#1A5319]"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <Label htmlFor="longitude" className="text-sm font-medium text-gray-700 mb-2 block">
                          Longitude *
                        </Label>
                        <Input
                          id="longitude"
                          name="longitude"
                          type="text"
                          value={formData.longitude}
                          onChange={handleChange}
                          placeholder="e.g. 78.901234"
                          className="h-12 rounded-lg border-gray-300 focus:border-[#1A5319] focus:ring-[#1A5319]"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGeolocation}
                      disabled={geolocationLoading || loading}
                      className="w-full mt-4 border-green-200 hover:bg-green-50 text-[#1A5319]"
                    >
                      {geolocationLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Capturing GPS Location...
                        </>
                      ) : (
                        <>
                          <MapPin className="h-4 w-4 mr-2" />
                          Capture Current Farm Location Automatically
                        </>
                      )}
                    </Button>
                    <p className="text-[10px] text-gray-500 mt-2 italic text-center">
                      Click to automatically capture your current location for the farm center.
                    </p>

                    {/* Document Uploads */}
                    <div className="pt-6 border-t border-gray-100">
                      <h3 className="text-lg font-semibold text-[#1A5319] mb-4 flex items-center gap-2">
                        <Upload className="w-5 h-5" /> Document Uploads
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-gray-700">7/12 Extract (Satbara) *</Label>
                          <div className="relative group">
                            {previews.satbaraImage ? (
                              <div className="relative rounded-xl overflow-hidden border-2 border-[#1A5319]/20 aspect-video bg-gray-50">
                                <img src={previews.satbaraImage} alt="Satbara" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => removeFile('satbaraImage')}
                                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#1A5319] hover:bg-green-50/30 transition-all group">
                                <div className="flex flex-col items-center justify-center py-4">
                                  <div className="p-3 bg-gray-100 rounded-full group-hover:bg-green-100 transition-colors mb-2">
                                    <Upload className="w-6 h-6 text-gray-400 group-hover:text-[#1A5319]" />
                                  </div>
                                  <p className="text-sm font-medium text-gray-600">Upload Satbara</p>
                                  <p className="text-xs text-gray-400 mt-1">PDF, JPG up to 10MB</p>
                                </div>
                                <input type="file" name="satbaraImage" className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />
                              </label>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-gray-700">Patwari Map (Land Map) *</Label>
                          <div className="relative group">
                            {previews.patwariMapImage ? (
                              <div className="relative rounded-xl overflow-hidden border-2 border-[#1A5319]/20 aspect-video bg-gray-50">
                                <img src={previews.patwariMapImage} alt="Patwari Map" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => removeFile('patwariMapImage')}
                                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#1A5319] hover:bg-green-50/30 transition-all group">
                                <div className="flex flex-col items-center justify-center py-4">
                                  <div className="p-3 bg-gray-100 rounded-full group-hover:bg-green-100 transition-colors mb-2">
                                    <Upload className="w-6 h-6 text-gray-400 group-hover:text-[#1A5319]" />
                                  </div>
                                  <p className="text-sm font-medium text-gray-600">Upload Land Map</p>
                                  <p className="text-xs text-gray-400 mt-1">PDF, JPG up to 10MB</p>
                                </div>
                                <input type="file" name="patwariMapImage" className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />
                              </label>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-gray-700">Sowing Certificate *</Label>
                          <div className="relative group">
                            {previews.sowingCertificate ? (
                              <div className="relative rounded-xl overflow-hidden border-2 border-[#1A5319]/20 aspect-video bg-gray-50">
                                <img src={previews.sowingCertificate} alt="Sowing Certificate" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => removeFile('sowingCertificate')}
                                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#1A5319] hover:bg-green-50/30 transition-all group">
                                <div className="flex flex-col items-center justify-center py-4">
                                  <div className="p-3 bg-gray-100 rounded-full group-hover:bg-green-100 transition-colors mb-2">
                                    <Upload className="w-6 h-6 text-gray-400 group-hover:text-[#1A5319]" />
                                  </div>
                                  <p className="text-sm font-medium text-gray-600">Upload Sowing Cert</p>
                                  <p className="text-xs text-gray-400 mt-1">PDF, JPG up to 10MB</p>
                                </div>
                                <input type="file" name="sowingCertificate" className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Field Photos & GPS Coordinates */}
                    <div className="pt-6 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-[#1A5319] flex items-center gap-2">
                          <Camera className="w-5 h-5" /> Field Photos (8 Corners)
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Coordinates Required for each corner</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
                          const fieldName = `landImage${i}`;
                          const gpsName = `landImage${i}Gps` as keyof typeof formData;
                          return (
                            <div key={i} className="space-y-2 group">
                              <p className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-widest group-hover:text-[#1A5319] transition-colors">Corner {i}</p>
                              <div className="relative">
                                {previews[fieldName] ? (
                                  <div className="relative rounded-lg overflow-hidden border-2 border-[#1A5319]/20 aspect-square bg-gray-50">
                                    <img src={previews[fieldName]} alt={`Corner ${i}`} className="w-full h-full object-cover" />
                                    <button
                                      type="button"
                                      onClick={() => removeFile(fieldName)}
                                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-[#1A5319] hover:bg-green-50 transition-all">
                                    <Camera className="w-6 h-6 text-gray-300" />
                                    <input type="file" name={fieldName} className="hidden" onChange={handleFileChange} accept="image/*" />
                                  </label>
                                )}
                              </div>
                              <Input
                                type="text"
                                name={gpsName}
                                value={formData[gpsName] as string || ''}
                                onChange={handleChange}
                                placeholder="Lat, Lng"
                                className="h-8 text-[10px] text-center focus:ring-[#1A5319] border-gray-200 rounded-md"
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* Boundary Map Preview */}
                      {boundaryCoordinates.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Map className="w-4 h-4 text-[#1A5319]" /> Farm Boundary Visualization
                          </Label>
                          <div className="h-[250px] rounded-xl overflow-hidden border-2 border-gray-100 shadow-inner bg-gray-50">
                            <FarmBoundaryMap
                              coordinates={boundaryCoordinates}
                              center={formData.latitude && formData.longitude ? { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) } : undefined}
                            />
                          </div>
                          <p className="text-[10px] text-gray-500 text-center italic">
                            Boundary is automatically drawn based on corner coordinates provided above.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label htmlFor="landRecordKhasra" className="text-sm font-medium text-gray-700 mb-2 block">
                          Land Record (Khasra)
                        </Label>
                        <Input
                          id="landRecordKhasra"
                          name="landRecordKhasra"
                          type="text"
                          value={formData.landRecordKhasra}
                          onChange={handleChange}
                          placeholder="Khasra Number"
                          className="h-12 rounded-lg border-gray-300 focus:border-[#1A5319] focus:ring-[#1A5319]"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <Label htmlFor="landRecordKhatauni" className="text-sm font-medium text-gray-700 mb-2 block">
                          Land Record (Khatauni)
                        </Label>
                        <Input
                          id="landRecordKhatauni"
                          name="landRecordKhatauni"
                          type="text"
                          value={formData.landRecordKhatauni}
                          onChange={handleChange}
                          placeholder="Khatauni Number"
                          className="h-12 rounded-lg border-gray-300 focus:border-[#1A5319] focus:ring-[#1A5319]"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label htmlFor="surveyNumber" className="text-sm font-medium text-gray-700 mb-2 block">
                          Survey Number
                        </Label>
                        <Input
                          id="surveyNumber"
                          name="surveyNumber"
                          type="text"
                          value={formData.surveyNumber}
                          onChange={handleChange}
                          placeholder="Survey Number"
                          className="h-12 rounded-lg border-gray-300 focus:border-[#1A5319] focus:ring-[#1A5319]"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <Label htmlFor="landAreaSize" className="text-sm font-medium text-gray-700 mb-2 block">
                          Land Area Size (in Hectares) *
                        </Label>
                        <Input
                          id="landAreaSize"
                          name="landAreaSize"
                          type="number"
                          step="0.01"
                          value={formData.landAreaSize}
                          onChange={handleChange}
                          placeholder="e.g. 2.50"
                          className="h-12 rounded-lg border-gray-300 focus:border-[#1A5319] focus:ring-[#1A5319]"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-start space-x-3 p-4 bg-green-50/50 rounded-xl border border-green-100">
                      <input
                        type="checkbox"
                        id="wildAnimalAttackCoverage"
                        checked={formData.wildAnimalAttackCoverage}
                        onChange={(e) => setFormData(prev => ({ ...prev, wildAnimalAttackCoverage: e.target.checked }))}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-[#1A5319] focus:ring-[#1A5319] cursor-pointer"
                        disabled={loading}
                      />
                      <div>
                        <Label htmlFor="wildAnimalAttackCoverage" className="text-sm font-semibold text-[#1A5319] cursor-pointer block">
                          Add Wild Animal Attack Coverage (PMFBY 2026)
                        </Label>
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                          New for 2026: Protect your crop against damage caused by wild animals. Additional premium may apply based on state regulations.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="pt-4">
                    <h3 className="text-lg font-semibold text-[#1A5319] mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5" /> Bank & Security
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="bankName" className="text-sm font-medium text-gray-700 mb-2 block">
                          Bank Name *
                        </Label>
                        <Select
                          value={formData.bankName}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, bankName: value }))}
                          disabled={loading}
                        >
                          <SelectTrigger className="h-12 rounded-lg border-gray-300">
                            <SelectValue placeholder="Select Bank" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {INDIAN_BANKS.map((bank) => (
                              <SelectItem key={bank} value={bank}>
                                {bank}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label htmlFor="bankAccountNo" className="text-sm font-medium text-gray-700 mb-2 block">
                          Account Number *
                        </Label>
                        <Input
                          id="bankAccountNo"
                          name="bankAccountNo"
                          type="text"
                          value={formData.bankAccountNo}
                          onChange={handleChange}
                          placeholder="Enter account number"
                          maxLength={18}
                          className="h-12 rounded-lg border-gray-300 focus:border-[#1A5319] focus:ring-[#1A5319]"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bankIfsc" className="text-sm font-medium text-gray-700 mb-2 block">
                          IFSC Code *
                        </Label>
                        <Input
                          id="bankIfsc"
                          name="bankIfsc"
                          type="text"
                          value={formData.bankIfsc}
                          onChange={handleChange}
                          placeholder="e.g. SBIN0001234"
                          maxLength={11}
                          className="h-12 rounded-lg border-gray-300 focus:border-[#1A5319] focus:ring-[#1A5319]"
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                      <p className="text-[10px] text-blue-700 leading-tight">
                        <strong>Important:</strong> Ensure your bank account is Aadhaar-linked. This is mandatory for receiving PMFBY claim settlements directly into your account (DBT).
                      </p>
                    </div>

                    {/* Document Uploads for Bank & Aadhaar */}
                    <div className="pt-6 border-t border-gray-100 mt-4">
                      <h3 className="text-lg font-semibold text-[#1A5319] mb-4 flex items-center gap-2">
                        <Upload className="w-5 h-5" /> Identity & Bank Documents
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-gray-700">Bank Passbook Copy *</Label>
                          <div className="relative group">
                            {previews.bankPassbookImage ? (
                              <div className="relative rounded-xl overflow-hidden border-2 border-[#1A5319]/20 aspect-video bg-gray-50">
                                <img src={previews.bankPassbookImage} alt="Bank Passbook" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => removeFile('bankPassbookImage')}
                                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#1A5319] hover:bg-green-50/30 transition-all group">
                                <div className="flex flex-col items-center justify-center py-4">
                                  <div className="p-3 bg-gray-100 rounded-full group-hover:bg-green-100 transition-colors mb-2">
                                    <Upload className="w-6 h-6 text-gray-400 group-hover:text-[#1A5319]" />
                                  </div>
                                  <p className="text-sm font-medium text-gray-600">Upload Passbook</p>
                                  <p className="text-xs text-gray-400 mt-1">PDF, JPG up to 10MB</p>
                                </div>
                                <input type="file" name="bankPassbookImage" className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />
                              </label>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-gray-700">Aadhaar Card Copy *</Label>
                          <div className="relative group">
                            {previews.aadhaarCardImage ? (
                              <div className="relative rounded-xl overflow-hidden border-2 border-[#1A5319]/20 aspect-video bg-gray-50">
                                <img src={previews.aadhaarCardImage} alt="Aadhaar Card" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => removeFile('aadhaarCardImage')}
                                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#1A5319] hover:bg-green-50/30 transition-all group">
                                <div className="flex flex-col items-center justify-center py-4">
                                  <div className="p-3 bg-gray-100 rounded-full group-hover:bg-green-100 transition-colors mb-2">
                                    <Upload className="w-6 h-6 text-gray-400 group-hover:text-[#1A5319]" />
                                  </div>
                                  <p className="text-sm font-medium text-gray-600">Upload Aadhaar</p>
                                  <p className="text-xs text-gray-400 mt-1">PDF, JPG up to 10MB</p>
                                </div>
                                <input type="file" name="aadhaarCardImage" className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label htmlFor="insuranceLinked" className="text-sm font-medium text-gray-700 mb-2 block">
                        Is Insurance Linked?
                      </Label>
                      <select
                        id="insuranceLinked"
                        name="insuranceLinked"
                        value={formData.insuranceLinked}
                        onChange={(e) => setFormData({ ...formData, insuranceLinked: e.target.value })}
                        className="w-full h-12 rounded-lg border border-gray-300 px-3 focus:border-[#1A5319] focus:ring-[#1A5319] bg-white"
                        disabled={loading}
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="consentGranted"
                        checked={consentGranted}
                        onChange={(e) => setConsentGranted(e.target.checked)}
                        required
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-[#1A5319] focus:ring-[#1A5319] cursor-pointer"
                        disabled={loading}
                      />
                      <Label htmlFor="consentGranted" className="text-sm text-gray-700 cursor-pointer">
                        I consent to Claimeasy using my Aadhaar number to lookup and verify my insurance policies with external insurers, and to link my Aadhaar to my account for verification purposes. *
                      </Label>
                    </div>
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="acceptTerms"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        required
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-[#1A5319] focus:ring-[#1A5319] cursor-pointer"
                        disabled={loading}
                      />
                      <Label htmlFor="acceptTerms" className="text-sm text-gray-700 cursor-pointer">
                        I accept the{" "}
                        <Link to="/terms" className="text-[#1A5319] hover:underline font-medium">
                          terms and conditions
                        </Link>{" "}
                        and{" "}
                        <Link to="/privacy" className="text-[#1A5319] hover:underline font-medium">
                          privacy policy
                        </Link>
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-6">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1 h-12 rounded-lg border-[#1A5319] text-[#1A5319] hover:bg-green-50"
                    disabled={loading}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                  </Button>
                )}

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 h-12 bg-[#1A5319] hover:bg-[#1A5319]/90 text-white rounded-lg font-semibold shadow-lg transition-all"
                    disabled={loading}
                  >
                    Next Step <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-12 bg-[#1A5319] hover:bg-[#1A5319]/90 text-white text-lg font-semibold rounded-lg shadow-md transition-all"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Account...
                      </span>
                    ) : (
                      "Complete Registration"
                    )}
                  </Button>
                )}
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link to="/login" className="text-[#1A5319] hover:underline font-medium">
                    Login here
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Right Side - Information Panel */}
          <div className="hidden md:flex flex-col justify-center bg-gradient-to-br from-[#1A5319] to-[#2d7a2b] p-8 md:p-12 text-white">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-lg">
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Secure & Fast</h3>
                  <p className="text-sm text-white/90">OTP-based authentication for secure access</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-lg">
                  <Phone className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Mobile First</h3>
                  <p className="text-sm text-white/90">Works seamlessly with your mobile app</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-lg">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Easy Access</h3>
                  <p className="text-sm text-white/90">Quick claim submission and tracking</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/20">
              <p className="text-sm text-white/80">
                <strong>Note:</strong> After registration, you'll be redirected to the login page.
                Use your mobile number and the OTP sent to your phone to complete the login process.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Info Panel */}
        <div className="md:hidden mt-4 p-6 bg-gradient-to-br from-[#1A5319] to-[#2d7a2b] rounded-lg text-white">
          <h3 className="text-lg font-bold mb-3">Why Register?</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>Secure OTP-based authentication</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>Works with your mobile app</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>Quick claim submission and tracking</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FarmerSignup;

