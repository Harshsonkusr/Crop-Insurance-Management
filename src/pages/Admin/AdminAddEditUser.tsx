import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Mail, Lock, Smartphone, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '../../lib/api';

const AdminAddEditUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!userId;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    role: 'FARMER',
    password: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing && userId) {
      fetchUser();
    }
  }, [isEditing, userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/users/${userId}`);
      const user = response.data;
      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobileNumber: user.mobileNumber || '',
        role: user.role || 'FARMER',
        password: '',
        status: user.status || 'active',
      });
    } catch (err: any) {
      console.error("Error fetching user:", err);
      setError(err?.response?.data?.message || "Failed to fetch user data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.name.trim()) {
      setError("Name is required");
      setLoading(false);
      return;
    }

    if (formData.role === 'FARMER') {
      if (!formData.mobileNumber.trim()) {
        setError("Mobile number is required for farmers");
        setLoading(false);
        return;
      }
    } else {
      if (!formData.email.trim()) {
        setError("Email is required");
        setLoading(false);
        return;
      }
      if (!isEditing && !formData.password.trim()) {
        setError("Password is required for new users");
        setLoading(false);
        return;
      }
    }

    try {
      const userData: any = {
        name: formData.name.trim(),
        role: formData.role,
        status: formData.status,
      };

      if (formData.role === 'FARMER') {
        userData.mobileNumber = formData.mobileNumber.trim();
      } else {
        userData.email = formData.email.trim();
        if (formData.password.trim()) {
          userData.password = formData.password.trim();
        }
      }

      if (isEditing) {
        await api.put(`/admin/users/${userId}`, userData);
        setSuccess("User updated successfully!");
      } else {
        await api.post('/admin/users', userData);
        setSuccess("User added successfully!");
      }

      setTimeout(() => {
        navigate("/admin-dashboard/users");
      }, 1500);
    } catch (err: any) {
      console.error("Error saving user:", err);
      setError(err?.response?.data?.message || "Failed to save user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/admin-dashboard/users"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit User' : 'Add New User'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? 'Update user information' : 'Create a new user account'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">{success}</p>
              </div>
            )}

            {/* Name */}
            <div>
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
                className="mt-2"
                required
                disabled={loading}
              />
            </div>

            {/* Role */}
            <div>
              <Label htmlFor="role" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Role <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                disabled={loading}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FARMER">Farmer</SelectItem>
                  <SelectItem value="SERVICE_PROVIDER">Service Provider</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Note: Only Super Admin can create Admin accounts
              </p>
            </div>

            {/* Email or Mobile Number based on role */}
            {formData.role === 'FARMER' ? (
              <div>
                <Label htmlFor="mobileNumber" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Mobile Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="mobileNumber"
                  type="tel"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  placeholder="Enter mobile number"
                  className="mt-2"
                  required
                  disabled={loading}
                />
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                    className="mt-2"
                    required
                    disabled={loading || isEditing}
                  />
                  {isEditing && (
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed after creation
                    </p>
                  )}
                </div>
                {!isEditing && (
                  <div>
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password"
                      className="mt-2"
                      required
                      disabled={loading}
                      minLength={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum 6 characters
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Status */}
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
                disabled={loading}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Link
                to="/admin-dashboard/users"
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create User'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAddEditUser;
