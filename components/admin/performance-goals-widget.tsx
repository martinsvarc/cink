'use client';

import { useState, useEffect } from 'react';
import { Edit3, Save, X, Calendar, DollarSign, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PerformanceGoals {
  daily: {
    chattingRevenueGoal: number;
    profitGoal: number;
    enabled: boolean;
  };
  weekly: {
    chattingRevenueGoal: number;
    profitGoal: number;
    enabled: boolean;
  };
  monthly: {
    chattingRevenueGoal: number;
    profitGoal: number;
    enabled: boolean;
  };
}

interface PerformanceGoalsWidgetProps {
  goals: PerformanceGoals;
  onUpdateGoal: (period: string, field: string, value: any) => void;
}

export function PerformanceGoalsWidget({ goals, onUpdateGoal }: PerformanceGoalsWidgetProps) {
  const [editingCell, setEditingCell] = useState<{ period: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [progressData, setProgressData] = useState<any>({});
  const [loadingProgress, setLoadingProgress] = useState(false);

  // Fetch progress data
  useEffect(() => {
    const fetchProgressData = async () => {
      setLoadingProgress(true);
      try {
        const response = await fetch('/api/performance-goals/progress');
        if (response.ok) {
          const data = await response.json();
          setProgressData(data);
        }
      } catch (error) {
        console.error('Error fetching progress data:', error);
      } finally {
        setLoadingProgress(false);
      }
    };

    fetchProgressData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchProgressData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const startEdit = (period: string, field: string, currentValue: any) => {
    setEditingCell({ period, field });
    setEditValue(currentValue.toString());
  };

  const saveEdit = () => {
    if (!editingCell) return;
    
    let value: any = editValue;
    
    // Convert to appropriate type
    if (editingCell.field === 'chattingRevenueGoal' || editingCell.field === 'profitGoal') {
      value = parseInt(editValue);
    }
    
    onUpdateGoal(editingCell.period, editingCell.field, value);
    setEditingCell(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const isEditing = (period: string, field: string) => {
    return editingCell?.period === period && editingCell?.field === field;
  };

  const renderEditableCell = (period: string, field: string, value: any) => {
    if (isEditing(period, field)) {
      return (
        <div className="flex items-center space-x-2 animate-pulse">
          <input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-32 px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.4)] text-[rgb(var(--foreground))] text-sm focus:outline-none focus:border-[rgba(var(--neon-orchid),0.8)] focus:ring-2 focus:ring-[rgba(var(--neon-orchid),0.3)] transition-all duration-200"
            autoFocus
            onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
          />
          <button
            onClick={saveEdit}
            className="p-1.5 text-green-400 hover:text-green-300 hover:bg-[rgba(34,197,94,0.1)] rounded-full transition-all duration-200 hover:scale-110"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={cancelEdit}
            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-[rgba(239,68,68,0.1)] rounded-full transition-all duration-200 hover:scale-110"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={() => startEdit(period, field, value)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-[rgba(var(--velvet-gray),0.3)] transition-all duration-200 group hover:scale-105 hover:shadow-lg"
      >
        <span className="text-sm font-bold text-[rgb(var(--foreground))] group-hover:text-[rgb(var(--neon-orchid))] transition-colors duration-200">
          {value.toLocaleString()} CZK
        </span>
        <Edit3 className="w-4 h-4 text-[rgb(var(--muted-foreground))] opacity-0 group-hover:opacity-100 group-hover:text-[rgb(var(--neon-orchid))] transition-all duration-200" />
      </button>
    );
  };

  const handleToggle = (period: string) => {
    const currentValue = goals[period as keyof PerformanceGoals]?.enabled ?? true;
    onUpdateGoal(period, 'enabled', !currentValue);
  };

  const getPeriodIcon = (period: string) => {
    switch (period) {
      case 'daily':
        return Calendar;
      case 'weekly':
        return TrendingUp;
      case 'monthly':
        return Target;
      default:
        return Calendar;
    }
  };

  const getPeriodColor = (period: string) => {
    switch (period) {
      case 'daily':
        return 'from-blue-500 to-indigo-500';
      case 'weekly':
        return 'from-purple-500 to-pink-500';
      case 'monthly':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const calculateProgress = (period: string, type: 'revenue' | 'profit') => {
    const currentData = progressData[period];
    const goalData = goals[period as keyof PerformanceGoals];
    
    if (!currentData || !goalData) return 0;
    
    const current = type === 'revenue' ? (currentData.currentRevenue || 0) : (currentData.currentProfit || 0);
    const goal = type === 'revenue' ? (goalData.chattingRevenueGoal || 0) : (goalData.profitGoal || 0);
    
    return goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-yellow-500';
    if (progress >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const periods = [
    { key: 'daily', label: 'Daily Goals', description: 'Target revenue and profit per day' },
    { key: 'weekly', label: 'Weekly Goals', description: 'Target revenue and profit per week' },
    { key: 'monthly', label: 'Monthly Goals', description: 'Target revenue and profit per month' }
  ];

  return (
    <div className="p-6">
      <div className="grid grid-cols-3 gap-6">
        {periods.map((period) => {
          const Icon = getPeriodIcon(period.key);
          const goalData = goals[period.key as keyof PerformanceGoals];
          
          // Use default values if no goal data exists yet
          const defaultGoals = {
            daily: { chattingRevenueGoal: 50000, profitGoal: 35000, enabled: true },
            weekly: { chattingRevenueGoal: 350000, profitGoal: 245000, enabled: true },
            monthly: { chattingRevenueGoal: 1500000, profitGoal: 1050000, enabled: false }
          };
          
          const displayGoal = goalData || defaultGoals[period.key as keyof typeof defaultGoals];
          
          return (
            <div key={period.key} className="space-y-4">
              {/* Period Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    'w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center',
                    getPeriodColor(period.key)
                  )}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[rgb(var(--foreground))] uppercase tracking-wider">
                      {period.label}
                    </h3>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">
                      {period.description}
                    </p>
                  </div>
                </div>
                
                {/* Enable/Disable Toggle */}
                <button
                  onClick={() => handleToggle(period.key)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200',
                    displayGoal.enabled
                      ? 'bg-gradient-to-r from-[rgb(var(--neon-orchid))] to-[rgb(var(--crimson))]'
                      : 'bg-[rgba(var(--velvet-gray),0.5)]'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
                      displayGoal.enabled ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>

              {/* Goals Content with Smooth Animation */}
              <div className={cn(
                'space-y-4 p-4 rounded-lg border transition-all duration-250 ease-in-out overflow-hidden',
                displayGoal.enabled
                  ? 'bg-[rgba(var(--velvet-gray),0.2)] border-[rgba(var(--neon-orchid),0.2)] max-h-96 opacity-100'
                  : 'bg-[rgba(var(--velvet-gray),0.1)] border-[rgba(var(--velvet-gray),0.3)] max-h-20 opacity-60'
              )}>
                <div className={cn(
                  'card-expansion-content transition-all duration-200 ease-in-out',
                  displayGoal.enabled ? 'opacity-100 transform-none' : 'opacity-0 transform translate-y-2'
                )}>
                  {/* Chatting Revenue Goal */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-[rgb(var(--sunset-gold))]" />
                      <span className="text-sm font-medium text-[rgb(var(--foreground))]">
                        Chatting Revenue Goal
                      </span>
                    </div>
                    {renderEditableCell(period.key, 'chattingRevenueGoal', displayGoal.chattingRevenueGoal)}
                  </div>

                  {/* Profit Goal */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-[rgb(var(--neon-orchid))]" />
                      <span className="text-sm font-medium text-[rgb(var(--foreground))]">
                        Profit Goal
                      </span>
                    </div>
                    {renderEditableCell(period.key, 'profitGoal', displayGoal.profitGoal)}
                  </div>

                  {/* Progress Indicators with Real Data */}
                  {displayGoal.enabled && (
                    <div className="pt-2 border-t border-[rgba(var(--neon-orchid),0.1)] space-y-3">
                      {loadingProgress ? (
                        <div className="text-center text-xs text-[rgb(var(--muted-foreground))]">
                          Loading progress...
                        </div>
                      ) : (
                        <>
                          {/* Revenue Progress */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-[rgb(var(--muted-foreground))]">
                              <span>Revenue Progress ({progressData[period.key]?.period || period.key})</span>
                              <span>
                                {progressData[period.key]?.currentRevenue?.toLocaleString() || '0'} / {displayGoal.chattingRevenueGoal.toLocaleString()} CZK
                              </span>
                            </div>
                            <div className="w-full bg-[rgba(var(--velvet-gray),0.3)] rounded-full h-2">
                              <div 
                                className={cn(
                                  'h-2 rounded-full transition-all duration-500',
                                  getProgressColor(calculateProgress(period.key, 'revenue'))
                                )}
                                style={{ width: `${calculateProgress(period.key, 'revenue')}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-[rgb(var(--muted-foreground))] text-right">
                              {calculateProgress(period.key, 'revenue').toFixed(1)}%
                            </div>
                          </div>

                          {/* Profit Progress */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-[rgb(var(--muted-foreground))]">
                              <span>Profit Progress ({progressData[period.key]?.period || period.key})</span>
                              <span>
                                {progressData[period.key]?.currentProfit?.toLocaleString() || '0'} / {displayGoal.profitGoal.toLocaleString()} CZK
                              </span>
                            </div>
                            <div className="w-full bg-[rgba(var(--velvet-gray),0.3)] rounded-full h-2">
                              <div 
                                className={cn(
                                  'h-2 rounded-full transition-all duration-500',
                                  getProgressColor(calculateProgress(period.key, 'profit'))
                                )}
                                style={{ width: `${calculateProgress(period.key, 'profit')}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-[rgb(var(--muted-foreground))] text-right">
                              {calculateProgress(period.key, 'profit').toFixed(1)}%
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Row */}
      <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-[rgba(var(--neon-orchid),0.1)] to-[rgba(var(--sunset-gold),0.1)] border border-[rgba(var(--neon-orchid),0.2)]">
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-[rgb(var(--foreground))]">Active Goals</div>
            <div className="text-[rgb(var(--sunset-gold))] font-bold">
              {Object.values(goals).filter(g => g?.enabled).length}/3
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium text-[rgb(var(--foreground))]">Monthly Revenue Target</div>
            <div className="text-[rgb(var(--sunset-gold))] font-bold">
              {(() => {
                const enabledGoals = Object.values(goals).filter(g => g?.enabled);
                const monthlyTarget = goals?.monthly?.enabled ? goals.monthly.chattingRevenueGoal : 
                                    (goals?.daily?.enabled ? goals.daily.chattingRevenueGoal * 30 : 0);
                return monthlyTarget.toLocaleString();
              })()} CZK
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium text-[rgb(var(--foreground))]">Monthly Profit Target</div>
            <div className="text-[rgb(var(--sunset-gold))] font-bold">
              {(() => {
                const enabledGoals = Object.values(goals).filter(g => g?.enabled);
                const monthlyProfit = goals?.monthly?.enabled ? goals.monthly.profitGoal : 
                                    (goals?.daily?.enabled ? goals.daily.profitGoal * 30 : 0);
                return monthlyProfit.toLocaleString();
              })()} CZK
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium text-[rgb(var(--foreground))]">Avg Daily Target</div>
            <div className="text-[rgb(var(--sunset-gold))] font-bold">
              {(() => {
                if (goals?.daily?.enabled) {
                  return goals.daily.chattingRevenueGoal.toLocaleString();
                } else if (goals?.weekly?.enabled) {
                  return Math.round(goals.weekly.chattingRevenueGoal / 7).toLocaleString();
                } else if (goals?.monthly?.enabled) {
                  return Math.round(goals.monthly.chattingRevenueGoal / 30).toLocaleString();
                }
                return '0';
              })()} CZK
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}