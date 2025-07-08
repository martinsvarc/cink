'use client';

import { useState } from 'react';
import { 
  Edit3, 
  RotateCcw, 
  Trash2,
  Shield,
  ShieldCheck,
  Eye,
  EyeOff,
  Clock,
  Upload
} from 'lucide-react';
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

interface UserManagementTableProps {
  users: User[];
  onEditUser: (userId: string, updatedData: any) => void;
  onResetPassword: (userId: string) => void;
  onRemoveUser: (userId: string) => void;
  onUpdateAvatar: (userId: string, avatarUrl: string) => void;
  onEditUserClick: (user: User) => void;
}

export function UserManagementTable({ 
  users, 
  onEditUser, 
  onResetPassword, 
  onRemoveUser,
  onUpdateAvatar,
  onEditUserClick
}: UserManagementTableProps) {
  const [avatarUploadId, setAvatarUploadId] = useState<string | null>(null);

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'setter':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return <ShieldCheck className="w-3 h-3" />;
      case 'setter':
        return <Shield className="w-3 h-3" />;
      default:
        return <Shield className="w-3 h-3" />;
    }
  };

  const formatLastLogin = (lastLogin: string) => {
    if (lastLogin === 'Never') return lastLogin;
    return new Date(lastLogin).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAvatarUpload = (userId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real app, this would upload to a server and get a URL back
    // For this demo, we'll use a local URL
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onUpdateAvatar(userId, event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    setAvatarUploadId(null);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[rgba(var(--velvet-gray),0.3)] border-b border-[rgba(var(--neon-orchid),0.2)]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                Username
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                Role
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                View Only Assigned
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                Access to Pages
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(var(--neon-orchid),0.1)]">
            {users.map((user) => (
              <tr 
                key={user.id} 
                className={cn(
                  'hover:bg-[rgba(var(--neon-orchid),0.05)] transition-colors duration-200',
                  !user.isActive && 'opacity-60'
                )}
              >
                {/* Username */}
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <div className="relative group">
                      <Avatar className="w-8 h-8 border-2 border-[rgba(var(--neon-orchid),0.3)]">
                        {user.avatar ? (
                          <AvatarImage src={user.avatar} alt={user.username} />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-bold">
                            {user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      
                      {/* Upload Avatar Button - Shows on Hover */}
                      <button
                        onClick={() => setAvatarUploadId(user.id)}
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[rgba(var(--neon-orchid),0.8)] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <Upload className="w-3 h-3" />
                      </button>
                      
                      {/* Hidden File Input */}
                      {avatarUploadId === user.id && (
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id={`avatar-upload-${user.id}`}
                          onChange={(e) => handleAvatarUpload(user.id, e)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      
                      {/* Upload Modal/Overlay */}
                      {avatarUploadId === user.id && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setAvatarUploadId(null)}>
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
                          <div className="relative bg-[rgba(var(--charcoal),0.95)] border border-[rgba(var(--neon-orchid),0.3)] rounded-xl p-6 w-80 animate-in fade-in-50 slide-in-from-bottom-10 duration-300">
                            <h3 className="text-lg font-bold text-[rgb(var(--foreground))] mb-4">Upload Profile Picture</h3>
                            <div className="flex flex-col items-center space-y-4">
                              <Avatar className="w-24 h-24 border-2 border-[rgba(var(--neon-orchid),0.3)]">
                                {user.avatar ? (
                                  <AvatarImage src={user.avatar} alt={user.username} />
                                ) : (
                                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl font-bold">
                                    {user.username.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <label
                                htmlFor={`avatar-upload-${user.id}`}
                                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[rgb(var(--neon-orchid))] to-[rgb(var(--crimson))] text-white font-medium hover:scale-105 transition-all duration-200 cursor-pointer"
                              >
                                <Upload className="w-4 h-4" />
                                <span>Select Image</span>
                              </label>
                              <p className="text-xs text-[rgb(var(--muted-foreground))]">
                                Recommended: Square image, at least 200x200px
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setAvatarUploadId(null);
                              }}
                              className="absolute top-2 right-2 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[rgb(var(--foreground))]">
                        {user.username}
                      </div>
                      <div className={cn(
                        'text-xs',
                        user.isActive ? 'text-green-400' : 'text-red-400'
                      )}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Role */}
                <td className="px-4 py-3">
                  <span className={cn(
                    'inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border',
                    getRoleColor(user.role)
                  )}>
                    {getRoleIcon(user.role)}
                    <span>{user.role}</span>
                  </span>
                </td>

                {/* View Only Assigned Data */}
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center">
                    {user.viewOnlyAssignedData ? (
                      <Eye className="w-4 h-4 text-[rgb(var(--neon-orchid))]" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                    )}
                  </div>
                </td>

                {/* Access to Pages */}
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {user.accessToPages.slice(0, 3).map((page, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-[rgba(var(--velvet-gray),0.3)] text-[rgb(var(--muted-foreground))] border border-[rgba(var(--velvet-gray),0.5)]"
                      >
                        {page}
                      </span>
                    ))}
                    {user.accessToPages.length > 3 && (
                      <span className="text-xs text-[rgb(var(--muted-foreground))]">
                        +{user.accessToPages.length - 3} more
                      </span>
                    )}
                  </div>
                </td>



                {/* Last Login */}
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3 text-[rgb(var(--muted-foreground))]" />
                    <span className="text-sm text-[rgb(var(--foreground))]">
                      {formatLastLogin(user.lastLogin)}
                    </span>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => onEditUserClick(user)}
                      className="p-1 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--neon-orchid))] transition-colors"
                      title="Edit user"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onResetPassword(user.id)}
                      className="p-1 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--sunset-gold))] transition-colors"
                      title="Reset password"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


    </>
  );
}