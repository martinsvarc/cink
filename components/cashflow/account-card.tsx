'use client';

import { useState } from 'react';
import { 
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Bitcoin,
  Building,
  Edit3,
  Save,
  X,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Account {
  id: string;
  name: string;
  type: string;
  currentBalance: number;
  income: { today: number; week: number; month: number; custom: number };
  expenses: { today: number; week: number; month: number; custom: number };
}

interface AccountCardProps {
  account: Account;
  timeframe: string;
  onUpdateBalance?: (accountId: string, newBalance: number) => void;
  onDeleteAccount?: (accountId: string) => void;
  editable?: boolean;
}

export function AccountCard({ account, timeframe, onUpdateBalance, onDeleteAccount, editable = false }: AccountCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBalance, setEditedBalance] = useState(account.currentBalance.toString());

  const getAccountIcon = () => {
    switch (account.type) {
      case 'crypto':
        return Bitcoin;
      case 'paypal':
        return CreditCard;
      case 'bank':
        return Building;
      default:
        return Wallet;
    }
  };

  const getAccountColor = () => {
    switch (account.type) {
      case 'crypto':
        return 'from-orange-500 to-yellow-500';
      case 'paypal':
        return 'from-blue-500 to-indigo-500';
      case 'bank':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-purple-500 to-pink-500';
    }
  };

  const getTimeframeIncome = () => {
    return account.income[timeframe as keyof typeof account.income] || 0;
  };

  const getTimeframeExpenses = () => {
    return account.expenses[timeframe as keyof typeof account.expenses] || 0;
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedBalance(account.currentBalance.toString());
  };

  const handleSaveBalance = () => {
    if (onUpdateBalance) {
      const newBalance = parseFloat(editedBalance);
      if (!isNaN(newBalance)) {
        onUpdateBalance(account.id, newBalance);
      }
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedBalance(account.currentBalance.toString());
  };

  const handleDeleteAccount = () => {
    if (onDeleteAccount && confirm(`Are you sure you want to delete the account "${account.name}"?`)) {
      onDeleteAccount(account.id);
    }
  };

  const Icon = getAccountIcon();

  return (
    <div 
      className={cn(
        'glow-card p-5 transition-all duration-300 cursor-pointer relative overflow-hidden group',
        isHovered && !isEditing && 'transform scale-105 shadow-2xl'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg',
          getAccountColor()
        )}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        
        {/* Account Type Badge and Actions */}
        <div className="flex items-center space-x-2">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-[rgba(var(--velvet-gray),0.3)] text-[rgb(var(--muted-foreground))] border border-[rgba(var(--velvet-gray),0.5)]">
            {account.type.toUpperCase()}
          </span>
          {editable && onDeleteAccount && (
            <button
              onClick={handleDeleteAccount}
              className="p-1 rounded-full bg-[rgba(var(--crimson),0.2)] text-[rgb(var(--crimson))] hover:bg-[rgba(var(--crimson),0.3)] transition-all duration-200 opacity-0 group-hover:opacity-100"
              style={{ opacity: isHovered ? 1 : 0 }}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Account Name */}
      <h3 className="text-lg font-bold text-[rgb(var(--foreground))] mb-3">
        {account.name}
      </h3>

      {/* Current Balance - Editable */}
      <div className="text-center mb-4">
        {isEditing ? (
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={editedBalance}
              onChange={(e) => setEditedBalance(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
              autoFocus
            />
            <button
              onClick={handleSaveBalance}
              className="p-2 rounded-lg bg-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--neon-orchid))] hover:bg-[rgba(var(--neon-orchid),0.3)] transition-all duration-200"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancelEdit}
              className="p-2 rounded-lg bg-[rgba(var(--crimson),0.2)] text-[rgb(var(--crimson))] hover:bg-[rgba(var(--crimson),0.3)] transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <div className="text-2xl font-black text-gradient-primary mb-1">
              {account.currentBalance.toLocaleString()} CZK
            </div>
            {editable && (
              <button
                onClick={handleEditClick}
                className="absolute -right-2 top-0 p-1 rounded-full bg-[rgba(var(--velvet-gray),0.3)] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--neon-orchid))] hover:bg-[rgba(var(--velvet-gray),0.5)] transition-all duration-200 opacity-0 group-hover:opacity-100"
                style={{ opacity: isHovered ? 1 : 0 }}
              >
                <Edit3 className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
        <div className="text-xs text-[rgb(var(--muted-foreground))] uppercase tracking-wide">
          Current Balance
        </div>
      </div>

      {/* Income & Expenses */}
      <div className="space-y-3">
        {/* Income */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-[rgb(var(--muted-foreground))]">Income</span>
          </div>
          <span className="text-sm font-bold text-green-400">
            +{getTimeframeIncome().toLocaleString()} CZK
          </span>
        </div>

        {/* Expenses */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-sm text-[rgb(var(--muted-foreground))]">Expenses</span>
          </div>
          <span className="text-sm font-bold text-red-400">
            -{getTimeframeExpenses().toLocaleString()} CZK
          </span>
        </div>
      </div>

      {/* Net Flow */}
      <div className="pt-3 mt-3 border-t border-[rgba(var(--border),0.3)]">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[rgb(var(--muted-foreground))] font-medium">Net Flow</span>
          <span className={cn(
            'text-sm font-bold',
            getTimeframeIncome() - getTimeframeExpenses() >= 0 ? 'text-green-400' : 'text-red-400'
          )}>
            {getTimeframeIncome() - getTimeframeExpenses() >= 0 ? '+' : ''}
            {(getTimeframeIncome() - getTimeframeExpenses()).toLocaleString()} CZK
          </span>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      {isHovered && !isEditing && (
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(var(--neon-orchid),0.05)] to-[rgba(var(--sunset-gold),0.05)] pointer-events-none" />
      )}
    </div>
  );
}