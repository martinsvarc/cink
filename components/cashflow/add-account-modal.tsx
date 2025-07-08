'use client';

import { useState } from 'react';
import { X, Save, Building, CreditCard, Bitcoin, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAccount: (account: any) => void;
}

export function AddAccountModal({ isOpen, onClose, onAddAccount }: AddAccountModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank',
    currentBalance: '',
    currency: 'CZK'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.currentBalance.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    onAddAccount({
      ...formData,
      currentBalance: parseFloat(formData.currentBalance)
    });
    
    // Reset form
    setFormData({
      name: '',
      type: 'bank',
      currentBalance: '',
      currency: 'CZK'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in-50 duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-[rgba(var(--charcoal),0.95)] border border-[rgba(var(--neon-orchid),0.3)] backdrop-blur-sm shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[rgb(var(--foreground))]">Add New Account</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Account Name */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Account Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
                placeholder="e.g., Wise USD, Crypto Wallet"
                required
              />
            </div>

            {/* Account Type */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'bank' }))}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200',
                    formData.type === 'bank'
                      ? 'bg-gradient-to-r from-[rgba(var(--neon-orchid),0.2)] to-[rgba(var(--crimson),0.2)] border-[rgba(var(--neon-orchid),0.3)]'
                      : 'bg-[rgba(var(--velvet-gray),0.3)] border-[rgba(var(--velvet-gray),0.5)]'
                  )}
                >
                  <Building className={cn(
                    'w-6 h-6 mb-1',
                    formData.type === 'bank' ? 'text-[rgb(var(--neon-orchid))]' : 'text-[rgb(var(--muted-foreground))]'
                  )} />
                  <span className={cn(
                    'text-xs font-medium',
                    formData.type === 'bank' ? 'text-[rgb(var(--neon-orchid))]' : 'text-[rgb(var(--muted-foreground))]'
                  )}>Bank</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'crypto' }))}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200',
                    formData.type === 'crypto'
                      ? 'bg-gradient-to-r from-[rgba(var(--neon-orchid),0.2)] to-[rgba(var(--crimson),0.2)] border-[rgba(var(--neon-orchid),0.3)]'
                      : 'bg-[rgba(var(--velvet-gray),0.3)] border-[rgba(var(--velvet-gray),0.5)]'
                  )}
                >
                  <Bitcoin className={cn(
                    'w-6 h-6 mb-1',
                    formData.type === 'crypto' ? 'text-[rgb(var(--neon-orchid))]' : 'text-[rgb(var(--muted-foreground))]'
                  )} />
                  <span className={cn(
                    'text-xs font-medium',
                    formData.type === 'crypto' ? 'text-[rgb(var(--neon-orchid))]' : 'text-[rgb(var(--muted-foreground))]'
                  )}>Crypto</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'paypal' }))}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200',
                    formData.type === 'paypal'
                      ? 'bg-gradient-to-r from-[rgba(var(--neon-orchid),0.2)] to-[rgba(var(--crimson),0.2)] border-[rgba(var(--neon-orchid),0.3)]'
                      : 'bg-[rgba(var(--velvet-gray),0.3)] border-[rgba(var(--velvet-gray),0.5)]'
                  )}
                >
                  <CreditCard className={cn(
                    'w-6 h-6 mb-1',
                    formData.type === 'paypal' ? 'text-[rgb(var(--neon-orchid))]' : 'text-[rgb(var(--muted-foreground))]'
                  )} />
                  <span className={cn(
                    'text-xs font-medium',
                    formData.type === 'paypal' ? 'text-[rgb(var(--neon-orchid))]' : 'text-[rgb(var(--muted-foreground))]'
                  )}>PayPal</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'other' }))}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200',
                    formData.type === 'other'
                      ? 'bg-gradient-to-r from-[rgba(var(--neon-orchid),0.2)] to-[rgba(var(--crimson),0.2)] border-[rgba(var(--neon-orchid),0.3)]'
                      : 'bg-[rgba(var(--velvet-gray),0.3)] border-[rgba(var(--velvet-gray),0.5)]'
                  )}
                >
                  <Wallet className={cn(
                    'w-6 h-6 mb-1',
                    formData.type === 'other' ? 'text-[rgb(var(--neon-orchid))]' : 'text-[rgb(var(--muted-foreground))]'
                  )} />
                  <span className={cn(
                    'text-xs font-medium',
                    formData.type === 'other' ? 'text-[rgb(var(--neon-orchid))]' : 'text-[rgb(var(--muted-foreground))]'
                  )}>Other</span>
                </button>
              </div>
            </div>

            {/* Starting Balance */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Starting Balance (CZK) *
              </label>
              <input
                type="number"
                value={formData.currentBalance}
                onChange={(e) => setFormData(prev => ({ ...prev, currentBalance: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
              >
                <option value="CZK">CZK</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgba(var(--velvet-gray),0.5)] transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[rgb(var(--neon-orchid))] to-[rgb(var(--crimson))] text-white font-medium hover:scale-105 transition-all duration-200"
            >
              <Save className="w-4 h-4" />
              <span>Add Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}