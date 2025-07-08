'use client';

import { useState, useEffect } from 'react';
import { UserManagementTable } from '@/components/admin/user-management-table';
import { RevenueSettingsTable } from '@/components/admin/revenue-settings-table';
import { PerformanceGoalsWidget } from '@/components/admin/performance-goals-widget';
import { CreateUserModal } from '@/components/admin/create-user-modal';
import { EditUserModal } from '@/components/admin/edit-user-modal';
import { 
  Settings,
  Users,
  DollarSign,
  Plus,
  Shield,
  Target
} from 'lucide-react';



// Revenue settings will be fetched from API

export default function Admin() {
  const [users, setUsers] = useState<any[]>([]);
  const [revenueSettings, setRevenueSettings] = useState<any[]>([]);
  const [performanceGoals, setPerformanceGoals] = useState<any>({
    daily: { chattingRevenueGoal: 0, profitGoal: 0, enabled: true },
    weekly: { chattingRevenueGoal: 0, profitGoal: 0, enabled: true },
    monthly: { chattingRevenueGoal: 0, profitGoal: 0, enabled: true }
  });
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [loadingRevenue, setLoadingRevenue] = useState(false);
  const [loadingGoals, setLoadingGoals] = useState(false);
  const [hasGoalChanges, setHasGoalChanges] = useState(false);
  const [originalGoals, setOriginalGoals] = useState<any>({});
  const [savingGoals, setSavingGoals] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch users from database
  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(error => console.error('Error fetching users:', error));
  }, []);

  // Fetch revenue settings from database
  useEffect(() => {
    setLoadingRevenue(true);
    fetch('/api/revenue-settings')
      .then(res => res.json())
      .then(data => setRevenueSettings(data))
      .catch(error => console.error('Error fetching revenue settings:', error))
      .finally(() => setLoadingRevenue(false));
  }, []);

  // Fetch performance goals from database
  useEffect(() => {
    setLoadingGoals(true);
    fetch('/api/performance-goals')
      .then(res => res.json())
      .then(data => {
        setPerformanceGoals(data);
        setOriginalGoals(data);
      })
      .catch(error => console.error('Error fetching performance goals:', error))
      .finally(() => setLoadingGoals(false));
  }, []);

  // User Management Functions
  const handleCreateUser = async (userData: any) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const newUser = await response.json();
        setUsers(prev => [...prev, newUser]);
        setShowCreateUserModal(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
    }
  };

  const handleEditUser = (userId: string, updatedUser: any) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? updatedUser : user
    ));
  };

  const handleResetPassword = (userId: string) => {
    // In a real app, this would trigger a password reset
    console.log('Resetting password for user:', userId);
    alert('Password reset email sent!');
  };

  const handleRemoveUser = (userId: string) => {
    // Remove user from local state (API call is handled by EditUserModal)
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  const handleUpdateAvatar = (userId: string, avatarUrl: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, avatar: avatarUrl } : user
    ));
  };

  // Revenue Settings Functions
  const handleUpdateRevenueSetting = async (setting: any) => {
    try {
      const response = await fetch(`/api/revenue-settings/${setting.chatterId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          defaultCommission: setting.defaultChatCommission,
          hourlyRate: setting.hourlyPay,
          milestoneTiers: setting.milestoneBonus,
          weekendBonusMultiplier: setting.weekendBonus,
          wildcardBonusMultiplier: setting.wildcardBonus,
        }),
      });

      if (response.ok) {
        const updatedSetting = await response.json();
        setRevenueSettings(prev => prev.map((s: any) => 
          s.userId === setting.userId ? updatedSetting : s
        ));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update revenue setting');
      }
    } catch (error) {
      console.error('Error updating revenue setting:', error);
      alert('Failed to update revenue setting');
    }
  };

  // Performance Goals Functions
  const handleUpdatePerformanceGoal = (period: string, field: string, value: any) => {
    setPerformanceGoals((prev: any) => ({
      ...prev,
      [period]: {
        ...(prev[period as keyof typeof prev] || {}),
        [field]: value
      }
    }));
    setHasGoalChanges(true);
  };

  // Save performance goals to database
  const handleSavePerformanceGoals = async () => {
    setSavingGoals(true);
    try {
      const response = await fetch('/api/performance-goals', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ goals: performanceGoals }),
      });

      if (response.ok) {
        setOriginalGoals(performanceGoals);
        setHasGoalChanges(false);
        setSaveSuccess(true);
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save performance goals');
      }
    } catch (error) {
      console.error('Error saving performance goals:', error);
      alert('Failed to save performance goals');
    } finally {
      setSavingGoals(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gradient-primary">
          System Administration
        </h1>
        <p className="text-[rgb(var(--muted-foreground))] text-lg">
          Platform configuration and advanced system controls
        </p>
      </div>

      {/* 1. User Management Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[rgb(var(--foreground))] uppercase tracking-wider">
                USER MANAGEMENT
              </h2>
              <p className="text-[rgb(var(--muted-foreground))] text-sm">
                System access control • Role-based permissions
              </p>
            </div>
          </div>

          {/* Create New User Button */}
          <button
            onClick={() => setShowCreateUserModal(true)}
            className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[rgb(var(--neon-orchid))] to-[rgb(var(--crimson))] text-white font-medium hover:scale-105 transition-all duration-200 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Create New User</span>
          </button>
        </div>

        {/* User Management Table */}
        <div className="glow-card p-0 overflow-hidden">
          <UserManagementTable
            users={users}
            onEditUser={handleEditUser}
            onResetPassword={handleResetPassword}
            onRemoveUser={handleRemoveUser}
            onUpdateAvatar={handleUpdateAvatar}
            onEditUserClick={setEditingUser}
          />
        </div>
      </div>

      {/* 2. Revenue Settings Section */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[rgb(var(--foreground))] uppercase tracking-wider">
              REVENUE SETTINGS
            </h2>
            <p className="text-[rgb(var(--muted-foreground))] text-sm">
              Commission rates and bonus configuration • Financial optimization
            </p>
          </div>
        </div>

        {/* Revenue Settings Table */}
        <div className="glow-card p-0 overflow-hidden">
          <RevenueSettingsTable
            settings={revenueSettings}
            onUpdateSetting={handleUpdateRevenueSetting}
            loading={loadingRevenue}
          />
        </div>
      </div>

      {/* 3. Performance Goals Section */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[rgb(var(--foreground))] uppercase tracking-wider">
              PERFORMANCE GOALS
            </h2>
            <p className="text-[rgb(var(--muted-foreground))] text-sm">
              Revenue and profit targets • Performance benchmarks
            </p>
          </div>
        </div>

        {/* Performance Goals Widget */}
        <div className="glow-card p-0 overflow-hidden">
          {loadingGoals ? (
            <div className="p-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--neon-orchid))]"></div>
              <p className="mt-2 text-[rgb(var(--muted-foreground))]">Loading performance goals...</p>
            </div>
          ) : (
            <PerformanceGoalsWidget
              goals={performanceGoals}
              onUpdateGoal={handleUpdatePerformanceGoal}
            />
          )}
        </div>
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showCreateUserModal}
        onClose={() => setShowCreateUserModal(false)}
        onCreateUser={handleCreateUser}
      />

      {/* Edit User Modal - At root level for proper positioning */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          onSave={(updatedUser) => {
            handleEditUser(editingUser.id, updatedUser);
            setEditingUser(null);
          }}
          onDelete={(userId) => {
            handleRemoveUser(userId);
            setEditingUser(null);
          }}
        />
      )}

      {/* Save Goals Button - Fixed Position */}
      {(hasGoalChanges || savingGoals) && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={handleSavePerformanceGoals}
            disabled={savingGoals}
            className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[rgb(var(--neon-orchid))] to-[rgb(var(--crimson))] text-white font-medium hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {savingGoals ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Target className="w-5 h-5" />
                <span>Save Performance Goals</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Success Notification */}
      {saveSuccess && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-green-500 text-white font-medium shadow-lg">
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
              <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span>Performance Goals Saved!</span>
          </div>
        </div>
      )}

    </div>
  );
}