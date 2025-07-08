'use client';

import { useState } from 'react';
import { Edit3, Save, X, Zap, Plus, Trash2, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RevenueSetting {
  id: string;
  userId: string;
  chatterId: string;
  user: string;
  defaultChatCommission: number;
  hourlyPay: number;
  milestoneBonus: Record<string, number>;
  weekendBonus: number;
  wildcardBonus: number;
  isActive: boolean;
}

interface RevenueSettingsTableProps {
  settings: RevenueSetting[];
  onUpdateSetting: (setting: RevenueSetting) => void;
  loading?: boolean;
}

export function RevenueSettingsTable({ settings, onUpdateSetting, loading }: RevenueSettingsTableProps) {
  const [editingCell, setEditingCell] = useState<{ userId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editingMilestones, setEditingMilestones] = useState<{ userId: string; milestones: Record<string, number> } | null>(null);
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});
  const [savedStates, setSavedStates] = useState<Record<string, boolean>>({});

  const startEdit = (userId: string, field: string, currentValue: any) => {
    setEditingCell({ userId, field });
    setEditValue(currentValue.toString());
  };

  const saveEdit = async () => {
    if (!editingCell) return;
    
    const setting = settings.find(s => s.userId === editingCell.userId);
    if (!setting) return;

    let value: any = editValue;
    
    // Convert to appropriate type
    if (editingCell.field === 'defaultChatCommission' || 
        editingCell.field === 'weekendBonus' ||
        editingCell.field === 'wildcardBonus') {
      value = parseFloat(editValue);
    } else if (editingCell.field === 'hourlyPay') {
      value = parseInt(editValue);
    }

    const updatedSetting = { ...setting, [editingCell.field]: value };
    
    setSavingStates(prev => ({ ...prev, [editingCell.userId]: true }));
    
    try {
      await onUpdateSetting(updatedSetting);
      
      // Show success feedback
      setSavedStates(prev => ({ ...prev, [editingCell.userId]: true }));
      setTimeout(() => {
        setSavedStates(prev => ({ ...prev, [editingCell.userId]: false }));
      }, 2000);
    } catch (error) {
      console.error('Error updating setting:', error);
    } finally {
      setSavingStates(prev => ({ ...prev, [editingCell.userId]: false }));
    }
    
    setEditingCell(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const isEditing = (userId: string, field: string) => {
    return editingCell?.userId === userId && editingCell?.field === field;
  };

  const startEditMilestones = (userId: string, currentMilestones: Record<string, number>) => {
    setEditingMilestones({ userId, milestones: { ...currentMilestones } });
  };

  const saveMilestones = async () => {
    if (!editingMilestones) return;
    
    const setting = settings.find(s => s.userId === editingMilestones.userId);
    if (!setting) return;

    const updatedSetting = { ...setting, milestoneBonus: editingMilestones.milestones };
    
    setSavingStates(prev => ({ ...prev, [editingMilestones.userId]: true }));
    
    try {
      await onUpdateSetting(updatedSetting);
      
      // Show success feedback
      setSavedStates(prev => ({ ...prev, [editingMilestones.userId]: true }));
      setTimeout(() => {
        setSavedStates(prev => ({ ...prev, [editingMilestones.userId]: false }));
      }, 2000);
    } catch (error) {
      console.error('Error updating milestones:', error);
    } finally {
      setSavingStates(prev => ({ ...prev, [editingMilestones.userId]: false }));
    }
    
    setEditingMilestones(null);
  };

  const cancelEditMilestones = () => {
    setEditingMilestones(null);
  };

  const updateMilestone = (milestone: string, bonus: number) => {
    if (!editingMilestones) return;
    
    setEditingMilestones(prev => prev ? {
      ...prev,
      milestones: { ...prev.milestones, [milestone]: bonus }
    } : null);
  };

  const addMilestone = () => {
    if (!editingMilestones) return;
    
    const newMilestone = '100000'; // Default milestone
    setEditingMilestones(prev => prev ? {
      ...prev,
      milestones: { ...prev.milestones, [newMilestone]: 2 }
    } : null);
  };

  const removeMilestone = (milestone: string) => {
    if (!editingMilestones) return;
    
    const newMilestones = { ...editingMilestones.milestones };
    delete newMilestones[milestone];
    
    setEditingMilestones(prev => prev ? {
      ...prev,
      milestones: newMilestones
    } : null);
  };

  const renderEditableCell = (userId: string, field: string, value: any, suffix?: string) => {
    const isSaving = savingStates[userId];
    const isSaved = savedStates[userId];
    
    if (isEditing(userId, field)) {
      return (
        <div className="flex items-center space-x-2">
          <input
            type="number"
            step="0.1"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-20 px-2 py-1 rounded bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] text-sm focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
            autoFocus
            onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
          />
          <button
            onClick={saveEdit}
            disabled={isSaving}
            className="p-1 text-green-400 hover:text-green-300 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
          </button>
          <button
            onClick={cancelEdit}
            className="p-1 text-red-400 hover:text-red-300"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={() => startEdit(userId, field, value)}
        className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-[rgba(var(--velvet-gray),0.3)] transition-colors group"
      >
        <span className="text-sm font-bold text-[rgb(var(--foreground))]">
          {value}{suffix}
        </span>
        {isSaved ? (
          <Check className="w-3 h-3 text-green-400" />
        ) : (
          <Edit3 className="w-3 h-3 text-[rgb(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </button>
    );
  };

  const renderMilestoneBonuses = (userId: string, milestoneBonus: Record<string, number>) => {
    const isEditingThis = editingMilestones?.userId === userId;
    const currentMilestones = isEditingThis ? editingMilestones.milestones : milestoneBonus;
    const isSaving = savingStates[userId];
    const isSaved = savedStates[userId];

    if (isEditingThis) {
      return (
        <div className="space-y-2">
          {Object.entries(currentMilestones).map(([milestone, bonus]) => (
            <div key={milestone} className="flex items-center space-x-2">
              <input
                type="number"
                value={parseInt(milestone)}
                onChange={(e) => {
                  const oldMilestone = milestone;
                  const newMilestone = e.target.value;
                  const newMilestones = { ...currentMilestones };
                  delete newMilestones[oldMilestone];
                  newMilestones[newMilestone] = bonus;
                  setEditingMilestones(prev => prev ? { ...prev, milestones: newMilestones } : null);
                }}
                className="w-20 px-2 py-1 rounded bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] text-xs"
              />
              <span className="text-xs text-[rgb(var(--muted-foreground))]">CZK:</span>
              <input
                type="number"
                value={bonus}
                onChange={(e) => updateMilestone(milestone, parseFloat(e.target.value))}
                className="w-16 px-2 py-1 rounded bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] text-xs"
              />
              <span className="text-xs text-[rgb(var(--muted-foreground))]">%</span>
              <button
                onClick={() => removeMilestone(milestone)}
                className="p-1 text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          <div className="flex items-center space-x-2">
            <button
              onClick={addMilestone}
              className="flex items-center space-x-1 px-2 py-1 rounded text-xs bg-[rgba(var(--neon-orchid),0.1)] text-[rgb(var(--neon-orchid))] hover:bg-[rgba(var(--neon-orchid),0.2)] transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Add Milestone</span>
            </button>
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <button
              onClick={saveMilestones}
              disabled={isSaving}
              className="flex items-center space-x-1 px-3 py-1 rounded text-xs bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              <span>Save</span>
            </button>
            <button
              onClick={cancelEditMilestones}
              className="flex items-center space-x-1 px-3 py-1 rounded text-xs bg-red-600 text-white hover:bg-red-700"
            >
              <X className="w-3 h-3" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <button
        onClick={() => startEditMilestones(userId, milestoneBonus)}
        className="group"
      >
        <div className="p-2 rounded-lg bg-[rgba(var(--velvet-gray),0.2)] border border-[rgba(var(--neon-orchid),0.1)] hover:bg-[rgba(var(--velvet-gray),0.3)] transition-colors">
          <div className="space-y-1">
            {Object.entries(milestoneBonus).map(([milestone, bonus]) => (
              <div key={milestone} className="flex items-center justify-between text-xs">
                <span className="text-[rgb(var(--muted-foreground))]">
                  {parseInt(milestone).toLocaleString()} CZK:
                </span>
                <span className="text-[rgb(var(--foreground))] font-medium">
                  +{bonus}%
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center mt-2">
            {isSaved ? (
              <Check className="w-3 h-3 text-green-400" />
            ) : (
              <Edit3 className="w-3 h-3 text-[rgb(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        </div>
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[rgb(var(--neon-orchid))]" />
        <span className="ml-2 text-[rgb(var(--foreground))]">Loading revenue settings...</span>
      </div>
    );
  }

  if (settings.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-[rgb(var(--muted-foreground))] mb-2">No chatters found</div>
          <div className="text-sm text-[rgb(var(--muted-foreground))]">
            Users need to have chatter profiles to appear in revenue settings
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-[rgba(var(--velvet-gray),0.3)] border-b border-[rgba(var(--neon-orchid),0.2)]">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
              User
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
              Default Chat Commission
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
              Hourly Pay
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
              Milestone Bonuses
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
              Weekend Bonus
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
              Wildcard Bonus
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(var(--neon-orchid),0.1)]">
          {settings.map((setting) => (
            <tr key={setting.userId} className="hover:bg-[rgba(var(--neon-orchid),0.05)] transition-colors duration-200">
              {/* User */}
              <td className="px-4 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold">
                    {setting.user.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[rgb(var(--foreground))]">
                      {setting.user}
                    </div>
                    <div className="text-xs text-[rgb(var(--muted-foreground))]">
                      {setting.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              </td>

              {/* Default Chat Commission */}
              <td className="px-4 py-4 text-center">
                {renderEditableCell(setting.userId, 'defaultChatCommission', setting.defaultChatCommission, '%')}
              </td>

              {/* Hourly Pay */}
              <td className="px-4 py-4 text-center">
                {renderEditableCell(setting.userId, 'hourlyPay', setting.hourlyPay, ' CZK/hod')}
              </td>

              {/* Milestone Bonuses */}
              <td className="px-4 py-4">
                <div className="flex justify-center">
                  {renderMilestoneBonuses(setting.userId, setting.milestoneBonus)}
                </div>
              </td>

              {/* Weekend Bonus */}
              <td className="px-4 py-4 text-center">
                {renderEditableCell(setting.userId, 'weekendBonus', setting.weekendBonus, 'x')}
              </td>

              {/* Wildcard Bonus */}
              <td className="px-4 py-4 text-center">
                <div className="flex items-center justify-center">
                  <div className="flex items-center space-x-1">
                    <Zap className="w-3 h-3 text-[rgb(var(--sunset-gold))]" />
                    {renderEditableCell(setting.userId, 'wildcardBonus', setting.wildcardBonus, 'x')}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary Row */}
      <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-[rgba(var(--neon-orchid),0.1)] to-[rgba(var(--sunset-gold),0.1)] border border-[rgba(var(--neon-orchid),0.2)]">
        <div className="grid grid-cols-6 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-[rgb(var(--foreground))]">Average Commission</div>
            <div className="text-[rgb(var(--sunset-gold))] font-bold">
              {settings.length > 0 ? (settings.reduce((sum, s) => sum + s.defaultChatCommission, 0) / settings.length).toFixed(1) : 0}%
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium text-[rgb(var(--foreground))]">Average Hourly</div>
            <div className="text-[rgb(var(--sunset-gold))] font-bold">
              {settings.length > 0 ? Math.round(settings.reduce((sum, s) => sum + s.hourlyPay, 0) / settings.length) : 0} CZK/hod
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium text-[rgb(var(--foreground))]">Total Milestones</div>
            <div className="text-[rgb(var(--sunset-gold))] font-bold">
              {settings.reduce((sum, s) => sum + Object.keys(s.milestoneBonus).length, 0)} Active
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium text-[rgb(var(--foreground))]">Weekend Multiplier</div>
            <div className="text-[rgb(var(--sunset-gold))] font-bold">
              {settings.length > 0 ? (settings.reduce((sum, s) => sum + s.weekendBonus, 0) / settings.length).toFixed(1) : 0}x
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium text-[rgb(var(--foreground))]">Wildcard Multiplier</div>
            <div className="text-[rgb(var(--sunset-gold))] font-bold">
              {settings.length > 0 ? (settings.reduce((sum, s) => sum + s.wildcardBonus, 0) / settings.length).toFixed(1) : 0}x
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium text-[rgb(var(--foreground))]">Active Chatters</div>
            <div className="text-[rgb(var(--sunset-gold))] font-bold">
              {settings.filter(s => s.isActive).length} / {settings.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}