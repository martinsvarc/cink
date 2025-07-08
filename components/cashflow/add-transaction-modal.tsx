'use client';

import { useState } from 'react';
import { X, Save, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Account {
  id: string;
  name: string;
  type: string;
}

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'income' | 'expense' | 'transfer' | 'payout';
  accounts: Account[];
}

export function AddTransactionModal({ isOpen, onClose, type, accounts }: AddTransactionModalProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    operator: '',
    model: '',
    client: '',
    channel: '',
    category: '',
    toAccount: '',
    fromAccount: '',
    name: '',
    notes: '',
    screenshot: null as File | null,
    payoutType: '',
    status: 'pending'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Submitting transaction:', formData);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, screenshot: file }));
    }
  };

  if (!isOpen) return null;

  const getModalTitle = () => {
    switch (type) {
      case 'income':
        return 'Add Income Transaction';
      case 'expense':
        return 'Add Expense Transaction';
      case 'transfer':
        return 'Add Transfer Transaction';
      case 'payout':
        return 'Add Payout Transaction';
      default:
        return 'Add Transaction';
    }
  };

  const renderIncomeFields = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
            Operator
          </label>
          <select
            value={formData.operator}
            onChange={(e) => setFormData(prev => ({ ...prev, operator: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
          >
            <option value="">Select Operator</option>
            <option value="Isabella">Isabella</option>
            <option value="Sophia">Sophia</option>
            <option value="Luna">Luna</option>
            <option value="Sarah">Sarah</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
            Model
          </label>
          <select
            value={formData.model}
            onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
          >
            <option value="">Select Model</option>
            <option value="Isabella">Isabella</option>
            <option value="Natalie">Natalie</option>
            <option value="Sophia">Sophia</option>
            <option value="Luna">Luna</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
            Client
          </label>
          <input
            type="text"
            value={formData.client}
            onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
            placeholder="Client name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
            Channel
          </label>
          <select
            value={formData.channel}
            onChange={(e) => setFormData(prev => ({ ...prev, channel: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
          >
            <option value="">Select Channel</option>
            <option value="Fanvue">Fanvue</option>
            <option value="Facebook">Facebook</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Telegram">Telegram</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
          >
            <option value="">Select Category</option>
            <option value="Premium Video">Premium Video</option>
            <option value="Chat Session">Chat Session</option>
            <option value="Live Call">Live Call</option>
            <option value="Custom Content">Custom Content</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
            To Account
          </label>
          <select
            value={formData.toAccount}
            onChange={(e) => setFormData(prev => ({ ...prev, toAccount: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
          >
            <option value="">Select Account</option>
            {accounts.map(account => (
              <option key={account.id} value={account.name}>{account.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
          Screenshot
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="screenshot-upload"
          />
          <label
            htmlFor="screenshot-upload"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] hover:bg-[rgba(var(--velvet-gray),0.7)] cursor-pointer transition-all duration-200"
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm">Upload Screenshot</span>
          </label>
          {formData.screenshot && (
            <span className="text-sm text-green-400">{formData.screenshot.name}</span>
          )}
        </div>
      </div>
    </>
  );

  const renderExpenseFields = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
            Name (Vendor/Person)
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
            placeholder="Vendor or person name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
          >
            <option value="">Select Category</option>
            <option value="Software">Software</option>
            <option value="Rent">Rent</option>
            <option value="Advertising">Advertising</option>
            <option value="Equipment">Equipment</option>
            <option value="Utilities">Utilities</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
            Operator
          </label>
          <select
            value={formData.operator}
            onChange={(e) => setFormData(prev => ({ ...prev, operator: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
          >
            <option value="">Select Operator</option>
            <option value="Admin">Admin</option>
            <option value="Isabella">Isabella</option>
            <option value="Sophia">Sophia</option>
            <option value="Luna">Luna</option>
            <option value="Sarah">Sarah</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
            From Account
          </label>
          <select
            value={formData.fromAccount}
            onChange={(e) => setFormData(prev => ({ ...prev, fromAccount: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
          >
            <option value="">Select Account</option>
            {accounts.map(account => (
              <option key={account.id} value={account.name}>{account.name}</option>
            ))}
          </select>
        </div>
      </div>
    </>
  );

  const renderTransferFields = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
            From Account
          </label>
          <select
            value={formData.fromAccount}
            onChange={(e) => setFormData(prev => ({ ...prev, fromAccount: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
          >
            <option value="">Select Account</option>
            {accounts.map(account => (
              <option key={account.id} value={account.name}>{account.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
            To Account
          </label>
          <select
            value={formData.toAccount}
            onChange={(e) => setFormData(prev => ({ ...prev, toAccount: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
          >
            <option value="">Select Account</option>
            {accounts.map(account => (
              <option key={account.id} value={account.name}>{account.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
          Operator
        </label>
        <select
          value={formData.operator}
          onChange={(e) => setFormData(prev => ({ ...prev, operator: e.target.value }))}
          className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
        >
          <option value="">Select Operator</option>
          <option value="Admin">Admin</option>
          <option value="Isabella">Isabella</option>
          <option value="Sophia">Sophia</option>
          <option value="Luna">Luna</option>
          <option value="Sarah">Sarah</option>
        </select>
      </div>
    </>
  );

  const renderPayoutFields = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
            Operator
          </label>
          <select
            value={formData.operator}
            onChange={(e) => setFormData(prev => ({ ...prev, operator: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
          >
            <option value="">Select Operator</option>
            <option value="Isabella">Isabella</option>
            <option value="Sophia">Sophia</option>
            <option value="Luna">Luna</option>
            <option value="Sarah">Sarah</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
            Model
          </label>
          <select
            value={formData.model}
            onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
          >
            <option value="">Select Model</option>
            <option value="Isabella">Isabella</option>
            <option value="Natalie">Natalie</option>
            <option value="Sophia">Sophia</option>
            <option value="Luna">Luna</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
            Payout Type
          </label>
          <select
            value={formData.payoutType}
            onChange={(e) => setFormData(prev => ({ ...prev, payoutType: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
          >
            <option value="">Select Type</option>
            <option value="Weekly Payout">Weekly Payout</option>
            <option value="Monthly Payout">Monthly Payout</option>
            <option value="Bonus Payout">Bonus Payout</option>
            <option value="Commission">Commission</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
          To Account
        </label>
        <input
          type="text"
          value={formData.toAccount}
          onChange={(e) => setFormData(prev => ({ ...prev, toAccount: e.target.value }))}
          className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
          placeholder="Operator's personal account"
        />
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in-50 duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-xl bg-[rgba(var(--charcoal),0.95)] border border-[rgba(var(--neon-orchid),0.3)] backdrop-blur-sm shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[rgb(var(--foreground))]">{getModalTitle()}</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Common Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Type-specific Fields */}
            {type === 'income' && renderIncomeFields()}
            {type === 'expense' && renderExpenseFields()}
            {type === 'transfer' && renderTransferFields()}
            {type === 'payout' && renderPayoutFields()}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)] resize-none"
                rows={3}
                placeholder="Additional notes..."
              />
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
              className="flex items-center space-x-2 px-6 py-2 rounded-lg bg-gradient-to-r from-[rgb(var(--neon-orchid))] to-[rgb(var(--crimson))] text-white font-medium hover:scale-105 transition-all duration-200"
            >
              <Save className="w-4 h-4" />
              <span>Save Transaction</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}