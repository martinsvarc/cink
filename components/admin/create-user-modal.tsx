'use client';

import { useState } from 'react';
import { X, Save, Plus, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateUser: (userData: any) => void;
}

const availablePages = [
  'Dashboard',
  'Analytics', 
  'Cashflow',
  'Clients',
  'Models',
  'Stream',
  'Admin'
];



export function CreateUserModal({ isOpen, onClose, onCreateUser }: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'Setter',
    viewOnlyAssignedData: true,
    accessToPages: [] as string[],
    isActive: true,
    avatar: ''
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.accessToPages.length === 0) {
      newErrors.accessToPages = 'At least one page access is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Remove password confirmation from the data sent
    const { confirmPassword, ...userData } = formData;
    
    // Add avatar if available
    if (avatarPreview) {
      userData.avatar = avatarPreview;
    }
    
    onCreateUser(userData);
    
    // Reset form
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      role: 'Setter',
      viewOnlyAssignedData: true,
      accessToPages: [],
      isActive: true,
      avatar: ''
    });
    setAvatarPreview(null);
    setErrors({});
    onClose();
  };

  const togglePageAccess = (page: string) => {
    setFormData(prev => ({
      ...prev,
      accessToPages: prev.accessToPages.includes(page)
        ? prev.accessToPages.filter(p => p !== page)
        : [...prev.accessToPages, page]
    }));
  };



  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real app, this would upload to a server and get a URL back
    // For this demo, we'll use a local URL
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatarPreview(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-[rgba(var(--charcoal),0.95)] border border-[rgba(var(--neon-orchid),0.3)] backdrop-blur-sm shadow-2xl">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-[rgb(var(--foreground))]">Create New User</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-[rgb(var(--foreground))]">Basic Information</h4>
              
              {/* Avatar Upload */}
              <div className="flex flex-col items-center space-y-3 p-4 border border-[rgba(var(--neon-orchid),0.2)] rounded-lg">
                <Avatar className="w-24 h-24 border-2 border-[rgba(var(--neon-orchid),0.3)]">
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} alt="Preview" />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl font-bold">
                      {formData.username ? formData.username.charAt(0).toUpperCase() : '?'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    id="avatar-upload-new"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                  <label
                    htmlFor="avatar-upload-new"
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[rgba(var(--neon-orchid),0.2)] to-[rgba(var(--crimson),0.2)] border border-[rgba(var(--neon-orchid),0.3)] text-[rgb(var(--foreground))] hover:bg-[rgba(var(--neon-orchid),0.3)] transition-all duration-200 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Avatar</span>
                  </label>
                </div>
              </div>
              
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className={cn(
                    'w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]',
                    errors.username ? 'border-red-500' : 'border-[rgba(var(--neon-orchid),0.2)]'
                  )}
                  placeholder="Enter username"
                />
                {errors.username && (
                  <p className="text-red-400 text-xs mt-1">{errors.username}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className={cn(
                    'w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]',
                    errors.password ? 'border-red-500' : 'border-[rgba(var(--neon-orchid),0.2)]'
                  )}
                  placeholder="Enter password"
                />
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className={cn(
                    'w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]',
                    errors.confirmPassword ? 'border-red-500' : 'border-[rgba(var(--neon-orchid),0.2)]'
                  )}
                  placeholder="Confirm password"
                />
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
                >
                  <option value="Setter">Setter</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              {/* View Only Assigned Data */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="viewOnlyAssignedData"
                  checked={formData.viewOnlyAssignedData}
                  onChange={(e) => setFormData(prev => ({ ...prev, viewOnlyAssignedData: e.target.checked }))}
                  className="w-4 h-4 rounded border-[rgba(var(--neon-orchid),0.3)] bg-[rgba(var(--velvet-gray),0.5)] text-[rgb(var(--neon-orchid))] focus:ring-[rgba(var(--neon-orchid),0.5)]"
                />
                <label htmlFor="viewOnlyAssignedData" className="text-sm font-medium text-[rgb(var(--foreground))]">
                  View Only Assigned Data
                </label>
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded border-[rgba(var(--neon-orchid),0.3)] bg-[rgba(var(--velvet-gray),0.5)] text-[rgb(var(--neon-orchid))] focus:ring-[rgba(var(--neon-orchid),0.5)]"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-[rgb(var(--foreground))]">
                  User is Active
                </label>
              </div>
            </div>

            {/* Right Column - Permissions */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-[rgb(var(--foreground))]">Permissions</h4>
              
              {/* Access to Pages */}
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Access to Pages *
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto p-2 rounded-lg bg-[rgba(var(--velvet-gray),0.2)] border border-[rgba(var(--neon-orchid),0.1)]">
                  {availablePages.map((page) => (
                    <label key={page} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.accessToPages.includes(page)}
                        onChange={() => togglePageAccess(page)}
                        className="w-4 h-4 rounded border-[rgba(var(--neon-orchid),0.3)] bg-[rgba(var(--velvet-gray),0.5)] text-[rgb(var(--neon-orchid))] focus:ring-[rgba(var(--neon-orchid),0.5)]"
                      />
                      <span className="text-sm text-[rgb(var(--foreground))]">{page}</span>
                    </label>
                  ))}
                </div>
                {errors.accessToPages && (
                  <p className="text-red-400 text-xs mt-1">{errors.accessToPages}</p>
                )}
              </div>


            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-[rgba(var(--neon-orchid),0.2)]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgba(var(--velvet-gray),0.5)] transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-2 rounded-lg bg-gradient-to-r from-[rgb(var(--neon-orchid))] to-[rgb(var(--crimson))] text-white font-medium hover:scale-105 transition-all duration-200"
            >
              <Save className="w-4 h-4" />
              <span>Create User</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}