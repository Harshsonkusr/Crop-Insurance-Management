import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Save, X, User, Mail, Phone, MapPin, Calendar, Shield, CreditCard, ChevronRight, ChevronLeft, Loader2, Search, Tractor } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '../../lib/api';
import { fetchStatesAndDistricts, fetchLocationByPincode, fetchTehsilsAndVillages, State as StateType } from '../../services/locationService';
import { INDIAN_BANKS } from '../../services/bankService';

const CROP_TYPES = [
  "Cereals", "Pulses", "Oilseeds", "Commercial Crops", "Fruits", "Vegetables", "Spices", "Others"
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

interface FarmerData {
  id?: string;
  name: string;
  email: string;
  mobileNumber: string;
  aadhaarNumber: string;
  gender: string;
  dob: string;
  casteCategory: string;
  farmerType: string;
  farmerCategory: string;
  loaneeStatus: string;

  state: string;
  district: string;
  tehsil: string;
  village: string;
  pincode: string;
  address: string;

  farmName: string;
  landRecordKhasra: string;
  landRecordKhatauni: string;
  surveyNumber: string;
  landAreaSize: string;
  insuranceUnit: string;
  cropType: string;
  cropName: string;
  cropVariety: string;
  cropSeason: string;
  latitude: string;
  longitude: string;

  bankName: string;
  bankAccountNo: string;
  bankIfsc: string;
  insuranceLinked: boolean;
  wildAnimalAttackCoverage: boolean;
  status: string;
}

const InsurerAddFarmer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const editingFarmer = location.state?.farmer;

  const [formData, setFormData] = useState<FarmerData>({
    name: '',
    email: '',
    mobileNumber: '',
    aadhaarNumber: '',
    gender: '',
    dob: '',
    casteCategory: '',
    farmerType: '',
    farmerCategory: '',
    loaneeStatus: '',
    state: '',
    district: '',
    tehsil: '',
    village: '',
    pincode: '',
    address: '',
    farmName: '',
    landRecordKhasra: '',
    landRecordKhatauni: '',
    surveyNumber: '',
    landAreaSize: '',
    insuranceUnit: '',
    cropType: '',
    cropName: '',
    cropVariety: '',
    cropSeason: '',
    latitude: '',
    longitude: '',
    bankName: '',
    bankAccountNo: '',
    bankIfsc: '',
    insuranceLinked: false,
    wildAnimalAttackCoverage: false,
    status: 'active',
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Location states
  const [states, setStates] = useState<StateType[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [tehsils, setTehsils] = useState<string[]>([]);
  const [villages, setVillages] = useState<string[]>([]);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  useEffect(() => {
    const loadStates = async () => {
      const data = await fetchStatesAndDistricts();
      setStates(data);
    };
    loadStates();
  }, []);

  useEffect(() => {
    if (formData.state) {
      const stateObj = states.find(s => s.state === formData.state);
      setDistricts(stateObj ? stateObj.districts : []);
    }
  }, [formData.state, states]);

  useEffect(() => {
    const loadTehsils = async () => {
      if (formData.district) {
        const data = await fetchTehsilsAndVillages(formData.district);
        setTehsils(data.tehsils);
      }
    };
    loadTehsils();
  }, [formData.district]);

  useEffect(() => {
    if (editingFarmer) {
      setFormData({
        ...formData,
        ...editingFarmer,
        mobileNumber: editingFarmer.mobileNumber || editingFarmer.contact || '',
        id: editingFarmer.id || editingFarmer._id,
      });
    }
  }, [editingFarmer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
      }
      setPincodeLoading(false);
    }
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!formData.name || !formData.mobileNumber || !formData.aadhaarNumber) {
        setError("Name, Mobile, and Aadhaar are required");
        return false;
      }
      if (formData.mobileNumber.length < 10) {
        setError("Invalid mobile number");
        return false;
      }
      if (formData.aadhaarNumber.length !== 12) {
        setError("Aadhaar must be 12 digits");
        return false;
      }
    } else if (step === 2) {
      if (!formData.state || !formData.district || !formData.village) {
        setError("State, District, and Village are required");
        return false;
      }
      if (!formData.landAreaSize || !formData.cropType) {
        setError("Land area and Crop Type are required");
        return false;
      }
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (formData.id) {
        await api.put(`/insurer/farmers/${formData.id}`, formData);
        setSuccess('Farmer updated successfully!');
      } else {
        await api.post(`/insurer/farmers`, formData);
        setSuccess('Farmer added successfully!');
      }
      setTimeout(() => navigate('/insurer-dashboard/farmer-management'), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save farmer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <User className="h-8 w-8 text-purple-600" />
            {editingFarmer ? 'Edit Farmer' : 'Add New Farmer'}
          </h1>
          <p className="text-gray-600 mt-1">Alignment with National Farmer Database Requirements</p>
        </div>
        <Link to="/insurer-dashboard/farmer-management">
          <Button variant="outline"><X className="h-4 w-4 mr-2" /> Cancel</Button>
        </Link>
      </div>

      {/* Step Indicator */}
      <div className="flex justify-between items-center mb-8 px-4">
        {[
          { step: 1, label: 'Personal', icon: User },
          { step: 2, label: 'Farm & Land', icon: MapPin },
          { step: 3, label: 'Bank & Review', icon: CreditCard },
        ].map((s, i) => (
          <React.Fragment key={s.step}>
            <div className="flex flex-col items-center gap-2 bg-white p-2 rounded-lg z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep >= s.step ? 'bg-purple-600 border-purple-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-400'}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <span className={`text-xs font-medium ${currentStep >= s.step ? 'text-purple-600' : 'text-gray-500'}`}>{s.label}</span>
            </div>
            {i < 2 && <div className={`flex-1 h-0.5 -mt-6 ${currentStep > s.step ? 'bg-purple-600' : 'bg-gray-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg">{success}</div>}

        {/* --- STEP 1: PERSONAL INFO --- */}
        {currentStep === 1 && (
          <Card className="border-l-4 border-l-purple-500 shadow-lg">
            <CardHeader className="bg-purple-50/50 border-b border-purple-100">
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input name="name" value={formData.name} onChange={handleChange} placeholder="As per Aadhaar" />
                </div>
                <div className="space-y-2">
                  <Label>Mobile Number *</Label>
                  <Input name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} placeholder="10 Digits" />
                </div>
                <div className="space-y-2">
                  <Label>Aadhaar Number *</Label>
                  <Input name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} placeholder="12 Digits" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={formData.gender} onValueChange={v => handleSelectChange('gender', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input name="dob" type="date" value={formData.dob} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Caste Category</Label>
                  <Select value={formData.casteCategory} onValueChange={v => handleSelectChange('casteCategory', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="OBC">OBC</SelectItem>
                      <SelectItem value="SC">SC</SelectItem>
                      <SelectItem value="ST">ST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Farmer Type</Label>
                  <Select value={formData.farmerType} onValueChange={v => handleSelectChange('farmerType', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Owner">Owner</SelectItem>
                      <SelectItem value="Tenant">Tenant</SelectItem>
                      <SelectItem value="Sharecropper">Sharecropper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Farmer Category</Label>
                  <Select value={formData.farmerCategory} onValueChange={v => handleSelectChange('farmerCategory', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Small">Small (1-2 Ha)</SelectItem>
                      <SelectItem value="Marginal">Marginal (&lt;1 Ha)</SelectItem>
                      <SelectItem value="Large">Large (&gt;2 Ha)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Loanee Status</Label>
                  <Select value={formData.loaneeStatus} onValueChange={v => handleSelectChange('loaneeStatus', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Loanee">Loanee</SelectItem>
                      <SelectItem value="Non-Loanee">Non-Loanee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* --- STEP 2: FARM & LAND --- */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <Card className="border-l-4 border-l-cyan-500 shadow-lg">
              <CardHeader className="bg-cyan-50/50 border-b border-cyan-100">
                <CardTitle className="flex items-center gap-2 text-cyan-900">
                  <MapPin className="h-5 w-5" />
                  Location Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Pincode</Label>
                    <div className="relative">
                      <Input value={formData.pincode} onChange={handlePincodeChange} placeholder="6 Digits" />
                      {pincodeLoading && <Loader2 className="h-4 w-4 animate-spin absolute right-2 top-3" />}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>State *</Label>
                    <Select value={formData.state} onValueChange={v => handleSelectChange('state', v)}>
                      <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
                      <SelectContent>
                        {states.map(s => <SelectItem key={s.state} value={s.state}>{s.state}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>District *</Label>
                    <Select value={formData.district} onValueChange={v => handleSelectChange('district', v)}>
                      <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                      <SelectContent>
                        {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Village *</Label>
                    <Input name="village" value={formData.village} onChange={handleChange} placeholder="Village name" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tehsil / Block</Label>
                    <Select value={formData.tehsil} onValueChange={v => handleSelectChange('tehsil', v)}>
                      <SelectTrigger><SelectValue placeholder="Select Tehsil" /></SelectTrigger>
                      <SelectContent>
                        {tehsils.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Farm Address (Full)</Label>
                    <Input name="address" value={formData.address} onChange={handleChange} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 shadow-lg">
              <CardHeader className="bg-green-50/50 border-b border-green-100">
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <Tractor className="h-5 w-5" />
                  Crop & Land Registry
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Farm Name</Label>
                    <Input name="farmName" value={formData.farmName} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label>Survey Number</Label>
                    <Input name="surveyNumber" value={formData.surveyNumber} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label>Insurance Unit (GP/Village)</Label>
                    <Input name="insuranceUnit" value={formData.insuranceUnit} onChange={handleChange} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Khasra Number</Label>
                    <Input name="landRecordKhasra" value={formData.landRecordKhasra} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label>Khatauni Number</Label>
                    <Input name="landRecordKhatauni" value={formData.landRecordKhatauni} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label>Land Area (Hectares) *</Label>
                    <Input name="landAreaSize" type="number" step="0.01" value={formData.landAreaSize} onChange={handleChange} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Crop Type *</Label>
                    <Select value={formData.cropType} onValueChange={v => handleSelectChange('cropType', v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {CROP_TYPES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Crop Name</Label>
                    <Select value={formData.cropName} onValueChange={v => handleSelectChange('cropName', v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {(CROPS_BY_TYPE[formData.cropType] || []).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Crop Season</Label>
                    <Select value={formData.cropSeason} onValueChange={v => handleSelectChange('cropSeason', v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kharif">Kharif</SelectItem>
                        <SelectItem value="Rabi">Rabi</SelectItem>
                        <SelectItem value="Summer">Summer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Crop Variety</Label>
                    <Input name="cropVariety" value={formData.cropVariety} onChange={handleChange} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* --- STEP 3: BANK & REVIEW --- */}
        {currentStep === 3 && (
          <Card className="border-l-4 border-l-amber-500 shadow-lg">
            <CardHeader className="bg-amber-50/50 border-b border-amber-100">
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <CreditCard className="h-5 w-5" />
                Bank Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Bank Name</Label>
                  <Select value={formData.bankName} onValueChange={v => handleSelectChange('bankName', v)}>
                    <SelectTrigger><SelectValue placeholder="Select Bank" /></SelectTrigger>
                    <SelectContent>
                      {INDIAN_BANKS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input name="bankAccountNo" value={formData.bankAccountNo} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>IFSC Code</Label>
                  <Input name="bankIfsc" value={formData.bankIfsc} onChange={handleChange} placeholder="e.g. SBIN0001234" />
                </div>
              </div>
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <input type="checkbox" name="insuranceLinked" checked={formData.insuranceLinked} onChange={handleChange} className="w-4 h-4 text-purple-600" />
                  <Label>Insurance Linked with Bank Account?</Label>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" name="wildAnimalAttackCoverage" checked={formData.wildAnimalAttackCoverage} onChange={handleChange} className="w-4 h-4 text-purple-600" />
                  <Label>Coverage for Wild Animal Attack (Add-on)?</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* --- NAVIGATION BUTTONS --- */}
        <div className="flex justify-between pt-4">
          {currentStep > 1 ? (
            <Button type="button" variant="outline" onClick={() => setCurrentStep(prev => prev - 1)}>
              <ChevronLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
          ) : <div></div>}

          {currentStep < 3 ? (
            <Button type="button" className="bg-purple-600" onClick={() => setCurrentStep(prev => prev + 1)}>
              Next Step <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Processing...' : editingFarmer ? 'Update Farmer' : 'Register Farmer'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default InsurerAddFarmer;
