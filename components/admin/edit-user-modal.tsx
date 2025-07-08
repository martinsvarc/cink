'use client';

import { useState, useEffect } from 'react';
import { X, Save, Upload, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface User {
  id: string;
  username: string;
  role: string;
  viewOnlyAssignedData: boolean;
  accessToPages: string[];
  lastLogin: string;
  isActive: boolean;
  avatar?: string;
}

interface EditUserModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: any) => void;
  onDelete: (userId: string) => void;
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



// Helper function to determine page access based on role (same as API)
function getAccessToPages(role: string): string[] {
  switch (role.toLowerCase()) {
    case 'admin':
      return ['Dashboard', 'Analytics', 'Cashflow', 'Clients', 'Models', 'Stream', 'Admin'];
    case 'setter':
      return ['Dashboard', 'Stream', 'Clients', 'Models'];
    default:
      return ['Dashboard'];
  }
}

export function EditUserModal({ user, isOpen, onClose, onSave, onDelete }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'Setter',
    viewOnlyAssignedData: true,
    accessToPages: [] as string[],
    isActive: true,
    avatar: ''
  });
  const [newAvatar, setNewAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        password: '', // Always start with empty password
        role: user.role,
        viewOnlyAssignedData: user.viewOnlyAssignedData,
        accessToPages: getAccessToPages(user.role), // Use role-based access
        isActive: user.isActive,
        avatar: user.avatar || ''
      });
      setNewAvatar(user.avatar || null);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updateData: any = {
        username: formData.username,
        role: formData.role,
        viewOnlyAssignedData: formData.viewOnlyAssignedData,
        isActive: formData.isActive,
        avatar: newAvatar || formData.avatar
      };

      // Only include password if it's not empty
      if (formData.password.trim() !== '') {
        updateData.password = formData.password;
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
        credentials: 'include', // Include cookies for authentication
      });

      if (response.ok) {
        const updatedUser = await response.json();
        onSave(updatedUser);
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  // Update access to pages when role changes
  const handleRoleChange = (newRole: string) => {
    setFormData(prev => ({
      ...prev,
      role: newRole,
      accessToPages: getAccessToPages(newRole)
    }));
  };

  // Handle delete user
  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
        credentials: 'include', // Include cookies for authentication
      });

      if (response.ok) {
        const result = await response.json();
        onDelete(user.id);
        onClose();
        alert(result.message);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };



  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real app, this would upload to a server and get a URL back
    // For this demo, we'll use a local URL
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setNewAvatar(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-gray-900 border-4 border-purple-500 shadow-2xl shadow-purple-500/30">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-[rgb(var(--foreground))]">Edit User: {user.username}</h3>
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
                  {newAvatar ? (
                    <AvatarImage src={newAvatar} alt={formData.username} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl font-bold">
                      {formData.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    id="avatar-upload"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[rgba(var(--neon-orchid),0.2)] to-[rgba(var(--crimson),0.2)] border border-[rgba(var(--neon-orchid),0.3)] text-[rgb(var(--foreground))] hover:bg-[rgba(var(--neon-orchid),0.3)] transition-all duration-200 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Change Avatar</span>
                  </label>
                </div>
              </div>
              
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Password (leave empty to keep current)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
                  placeholder="Enter new password (optional)"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
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

              {/* Last Login Info */}
              <div className="p-3 rounded-lg bg-[rgba(var(--velvet-gray),0.2)] border border-[rgba(var(--neon-orchid),0.1)]">
                <div className="text-sm text-[rgb(var(--muted-foreground))]">Last Login:</div>
                <div className="text-sm font-medium text-[rgb(var(--foreground))]">{user.lastLogin}</div>
              </div>
            </div>

            {/* Right Column - Permissions */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-[rgb(var(--foreground))]">Permissions</h4>
              
              {/* Access to Pages - Role-based (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Access to Pages (based on role)
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto p-2 rounded-lg bg-[rgba(var(--velvet-gray),0.2)] border border-[rgba(var(--neon-orchid),0.1)]">
                  {availablePages.map((page) => (
                    <label key={page} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.accessToPages.includes(page)}
                        disabled
                        className="w-4 h-4 rounded border-[rgba(var(--neon-orchid),0.3)] bg-[rgba(var(--velvet-gray),0.5)] text-[rgb(var(--neon-orchid))] opacity-60 cursor-not-allowed"
                      />
                      <span className={cn(
                        "text-sm",
                        formData.accessToPages.includes(page) 
                          ? "text-[rgb(var(--foreground))]" 
                          : "text-[rgb(var(--muted-foreground))]"
                      )}>{page}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                  Page access is automatically determined by the user's role
                </p>
              </div>


            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[rgba(var(--neon-orchid),0.2)]">
            {/* Delete Button */}
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all duration-200 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete User</span>
            </button>

            {/* Save/Cancel Buttons */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-6 py-2 rounded-lg text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgba(var(--velvet-gray),0.5)] transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center space-x-2 px-6 py-2 rounded-lg bg-gradient-to-r from-[rgb(var(--neon-orchid))] to-[rgb(var(--crimson))] text-white font-medium hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
              >
                <Save className="w-4 h-4" />
                <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
          <div className="bg-[rgba(var(--charcoal),0.95)] border border-red-500/30 rounded-xl p-6 w-96">
            <h4 className="text-lg font-bold text-red-400 mb-4">Confirm Delete</h4>
            <p className="text-[rgb(var(--foreground))] mb-4">
              Are you sure you want to delete user <strong>{user.username}</strong>?
            </p>
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-6">
              This action cannot be undone. Users with data will be deactivated instead of deleted.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgba(var(--velvet-gray),0.5)] transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}