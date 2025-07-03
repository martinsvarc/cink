'use client';

import { useState } from 'react';
import { Plus, Upload, Crown, CreditCard, User, FileText, Camera, Tag, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddPaymentFormProps {
  onAddPayment: (paymentData: any) => void;
  currentProvision: number;
}

const quickAmounts = [7500, 12500, 25000, 37500, 50000, 125000];

// Map display names to real database IDs
const models = [
  { id: 'cmcnaqo6h0003ujeosugqo5l7', name: 'Isabella', displayKey: 'isabella' },
  { id: 'cmcnaqo6h0003ujeosugqo5l7', name: 'Natalie', displayKey: 'natalie' }, // Using same ID for now
  { id: 'cmcnaqo6h0003ujeosugqo5l7', name: 'Sophia', displayKey: 'sophia' },   // Using same ID for now
  { id: 'cmcnaqo6h0003ujeosugqo5l7', name: 'Luna', displayKey: 'luna' },       // Using same ID for now
  { id: 'cmcnaqo6h0003ujeosugqo5l7', name: 'Aria', displayKey: 'aria' }        // Using same ID for now
];

const channels = {
  isabella: ['Isabella Fanvue', 'Isabella FB Page', 'Isabella WhatsApp'],
  natalie: ['Natalie Fanvue', 'Natalie Personal FB', 'Natalie Telegram'],
  sophia: ['Sophia Fanvue', 'Sophia Private FB'],
  luna: ['Luna Fanvue', 'Luna FB Page', 'Luna Instagram'],
  aria: ['Aria Fanvue', 'Aria Private Chat']
};

const accounts = [
  'Revolut',
  'Paysafe',
  'Anza Bank',
  'Wise USD',
  'Crypto Wallet'
];

const defaultCategories = [
  'Premium Video',
  'Chat Session',
  'Live Call',
  'Custom Content',
  'Subscription',
  'Tips',
  'Private Show'
];

export function AddPaymentForm({ onAddPayment, currentProvision }: AddPaymentFormProps) {
  const [formData, setFormData] = useState({
    amount: '',
    model: '',
    channel: '',
    client: '',
    account: '',
    category: '',
    notes: '',
    screenshot: null as File | null
  });

  const [categories, setCategories] = useState(defaultCategories);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAmountChange = (amount: string) => {
    setFormData(prev => ({ ...prev, amount }));
  };

  const handleQuickAmount = (amount: number) => {
    handleAmountChange(amount.toString());
  };

  const handleModelChange = (model: string) => {
    setFormData(prev => ({ 
      ...prev, 
      model, 
      channel: '' // Reset channel when model changes
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, screenshot: file }));
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories(prev => [...prev, newCategory.trim()]);
      setFormData(prev => ({ ...prev, category: newCategory.trim() }));
      setNewCategory('');
      setShowNewCategoryInput(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.model || !formData.channel || !formData.client || !formData.account || !formData.category) {
      alert('Prosím vyplňte všechna povinná pole');
      return;
    }

    setIsSubmitting(true);

    try {
      // Find the real model ID from the displayKey
      const selectedModel = models.find(m => m.displayKey === formData.model);
      
      // Call your backend API with real IDs
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          chatterId: 'cmcnaqnxz0002ujeoy5obvm7r', // Real chatter ID from your test data
          modelId: selectedModel?.id || 'cmcnaqo6h0003ujeosugqo5l7', // Real model ID
          clientName: formData.client,
          clientProfileUrl: `https://example.com/profile/${formData.client}`,
          channel: formData.channel,
          category: formData.category,
          notes: formData.notes,
          toAccount: formData.account,
          source: 'web-form',
          screenshot: formData.screenshot ? 'screenshot-url' : null,
          workSessionId: null
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Success!
        console.log('Payment created:', result.payment);
        
        setShowSuccessAnimation(true);
        
        // Call parent handler for UI updates
        onAddPayment({
          amount: parseFloat(formData.amount),
          model: formData.model,
          channel: formData.channel,
          client: formData.client,
          account: formData.account,
          category: formData.category,
          notes: formData.notes,
          screenshot: formData.screenshot
        });

        // Hide success animation after 2 seconds
        setTimeout(() => {
          setShowSuccessAnimation(false);
        }, 2000);

        // Reset form
        setFormData({
          amount: '',
          model: '',
          channel: '',
          client: '',
          account: '',
          category: '',
          notes: '',
          screenshot: null
        });
      } else {
        // Error from API
        alert(`Chyba při ukládání: ${result.error || 'Neznámá chyba'}`);
      }
    } catch (error) {
      console.error('Payment submission error:', error);
      alert('Chyba při odesílání platby. Zkuste to znovu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableChannels = formData.model ? channels[formData.model as keyof typeof channels] || [] : [];

  return (
    <div className="w-full max-w-full mx-auto">
      <div className="glow-card p-6 relative overflow-visible">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Row 1: Amount Selection - Quick buttons + Custom input on same row */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-[rgb(var(--foreground))] uppercase">Částka</span>
            </div>
            
            <div className="flex flex-wrap gap-2 items-center">
              {/* Quick Amount Buttons */}
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleQuickAmount(amount)}
                  className={cn(
                    'px-4 py-2 rounded-md text-sm font-bold transition-colors duration-200 cursor-pointer',
                    formData.amount === amount.toString()
                      ? 'bg-gradient-to-r from-[rgb(var(--neon-orchid))] to-[rgb(var(--crimson))] text-white shadow-md'
                      : 'bg-[rgba(var(--sunset-gold),0.15)] text-[rgb(var(--foreground))] border border-[rgba(var(--sunset-gold),0.3)] hover:border-[rgba(var(--neon-orchid),0.5)]'
                  )}
                >
                  {amount.toLocaleString()} <span className="text-xs opacity-80">CZK</span>
                </button>
              ))}
              
              {/* Custom Amount Input - Same Row */}
              <div className="flex-1 min-w-[200px]">
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full px-4 py-2 rounded-md text-sm font-bold bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)] transition-all duration-200 cursor-text no-spinner"
                  placeholder="Vlastní částka (CZK)..."
                />
              </div>
            </div>
          </div>

          {/* Row 2: Model Selection */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Crown className="w-4 h-4 text-[rgb(var(--sunset-gold))]" />
              <span className="text-sm font-bold text-[rgb(var(--foreground))] uppercase">Modelka</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {models.map((model) => (
                <button
                  key={model.displayKey}
                  type="button"
                  onClick={() => handleModelChange(model.displayKey)}
                  className={cn(
                    'flex-1 min-w-[120px] px-3 py-2 rounded-md text-sm font-bold transition-colors duration-200 cursor-pointer',
                    formData.model === model.displayKey
                      ? 'bg-gradient-to-r from-[rgb(var(--sunset-gold))] to-[rgb(var(--neon-orchid))] text-white shadow-md'
                      : 'bg-[rgba(var(--purple-500),0.15)] text-[rgb(var(--foreground))] border border-[rgba(var(--purple-500),0.3)] hover:border-[rgba(var(--neon-orchid),0.5)]'
                  )}
                >
                  {model.name}
                </button>
              ))}
            </div>
            
            <div className="w-full">
              <select
                value={formData.channel}
                onChange={(e) => setFormData(prev => ({ ...prev, channel: e.target.value }))}
                className={cn(
                  'w-full px-4 py-3 rounded-md text-sm bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)] transition-all duration-200 cursor-pointer',
                  !formData.model && 'opacity-50 cursor-not-allowed'
                )}
                disabled={!formData.model}
              >
                <option value="">Vybrat kanál</option>
                {availableChannels.map((channel) => (
                  <option key={channel} value={channel}>{channel}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Client, Account, Category, Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Client with New Client Modal */}
            <div className="space-y-2">
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3 text-[rgb(var(--muted-foreground))]" />
                <span className="text-xs font-bold text-[rgb(var(--foreground))] uppercase">Klient</span>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.client}
                  onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                  className="flex-1 px-3 py-2 rounded-md text-sm bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)] transition-all duration-200 cursor-text"
                  placeholder="Jméno klienta"
                />
                <button
                  type="button"
                  onClick={() => setShowNewClientModal(true)}
                  className="px-3 py-2 rounded-md bg-[rgba(var(--neon-orchid),0.2)] border border-[rgba(var(--neon-orchid),0.3)] text-[rgb(var(--neon-orchid))] hover:bg-[rgba(var(--neon-orchid),0.3)] transition-all duration-200 cursor-pointer"
                  title="Přidat nového klienta"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Account */}
            <div className="space-y-2">
              <div className="flex items-center space-x-1">
                <CreditCard className="w-3 h-3 text-[rgb(var(--muted-foreground))]" />
                <span className="text-xs font-bold text-[rgb(var(--foreground))] uppercase">Účet</span>
              </div>
              <select
                value={formData.account}
                onChange={(e) => setFormData(prev => ({ ...prev, account: e.target.value }))}
                className="w-full px-3 py-2 rounded-md text-sm bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)] transition-all duration-200 cursor-pointer"
              >
                <option value="">Vybrat účet</option>
                {accounts.map((account) => (
                  <option key={account} value={account}>{account}</option>
                ))}
              </select>
            </div>
            
            {/* Category with Add New Option */}
            <div className="space-y-2">
              <div className="flex items-center space-x-1">
                <Tag className="w-3 h-3 text-[rgb(var(--muted-foreground))]" />
                <span className="text-xs font-bold text-[rgb(var(--foreground))] uppercase">Kategorie</span>
              </div>
              
              {showNewCategoryInput ? (
                <div className="flex space-x-1">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Nová kategorie"
                    className="flex-1 px-2 py-2 rounded-md text-sm bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)] transition-all duration-200"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-2 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {setShowNewCategoryInput(false); setNewCategory('');}}
                    className="px-2 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex space-x-1">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="flex-1 px-3 py-2 rounded-md text-sm bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)] transition-all duration-200 cursor-pointer"
                  >
                    <option value="">Vybrat kategorii</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewCategoryInput(true)}
                    className="px-3 py-2 rounded-md bg-[rgba(var(--neon-orchid),0.2)] border border-[rgba(var(--neon-orchid),0.3)] text-[rgb(var(--neon-orchid))] hover:bg-[rgba(var(--neon-orchid),0.3)] transition-all duration-200"
                    title="Přidat novou kategorii"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            {/* Screenshot Upload */}
            <div className="space-y-2">
              <div className="flex items-center space-x-1">
                <Camera className="w-3 h-3 text-[rgb(var(--muted-foreground))]" />
                <span className="text-xs font-bold text-[rgb(var(--foreground))] uppercase">Snímek</span>
              </div>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="screenshot-upload"
                />
                <label
                  htmlFor="screenshot-upload"
                  className={cn(
                    'w-full flex items-center justify-center px-3 py-2 rounded-md cursor-pointer transition-colors duration-200 text-sm font-medium',
                    'bg-[rgba(var(--sunset-gold),0.15)] border border-[rgba(var(--sunset-gold),0.3)] text-[rgb(var(--foreground))] hover:border-[rgba(var(--neon-orchid),0.5)]',
                    formData.screenshot && 'border-green-400 bg-[rgba(34,197,94,0.15)] text-green-400'
                  )}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {formData.screenshot ? 'Nahráno' : 'Upload'}
                </label>
              </div>
            </div>
          </div>

          {/* Row 4: Notes */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
              <span className="text-sm font-bold text-[rgb(var(--foreground))] uppercase">Poznámky</span>
            </div>
            
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-4 py-3 rounded-md text-sm bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)] transition-all duration-200 cursor-text"
              placeholder="Dodatečné informace..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-lg font-black text-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-[rgba(255,255,255,0.2)] cursor-pointer",
              isSubmitting 
                ? "bg-gray-600 cursor-not-allowed opacity-70" 
                : "bg-gradient-to-r from-[rgb(var(--neon-orchid))] via-[rgb(var(--crimson))] to-[rgb(var(--sunset-gold))] text-white hover:scale-105"
            )}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="uppercase tracking-wider">Odesílám...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span className="uppercase tracking-wider">Přidat Platbu (CZK)</span>
              </>
            )}
          </button>
        </form>

        {/* Success Animation Overlay */}
        {showSuccessAnimation && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center rounded-xl z-50 success-animation">
            <div className="text-center">
              <div className="relative mb-4">
                <img 
                  src="https://res.cloudinary.com/dmbzcxhjn/image/upload/w_120,h_120,c_fill,f_auto,q_auto/glowing-checkmark-inside-circle-animated-600nw-2465375571_r9dnpc.webp"
                  alt="Success"
                  className="w-24 h-24 mx-auto success-checkmark"
                />
              </div>
              <div className="text-2xl font-bold text-white mb-2 animate-pulse">
                Platba úspěšně přidána!
              </div>
              <div className="text-sm text-gray-300">
                Čeká na schválení administrátorem
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Client Modal */}
      {showNewClientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[rgb(var(--charcoal))] p-6 rounded-lg border border-[rgba(var(--neon-orchid),0.3)] max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-[rgb(var(--foreground))] mb-4">Přidat nového klienta</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Jméno klienta"
                className="w-full px-3 py-2 rounded-md bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))]"
              />
              <input
                type="url"
                placeholder="URL profilu (Instagram, FB, atd.)"
                className="w-full px-3 py-2 rounded-md bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))]"
              />
              <textarea
                placeholder="Poznámky o klientovi"
                rows={3}
                className="w-full px-3 py-2 rounded-md bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))]"
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowNewClientModal(false)}
                  className="flex-1 px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                >
                  Zrušit
                </button>
                <button
                  onClick={() => {
                    // Handle new client creation here
                    setShowNewClientModal(false);
                  }}
                  className="flex-1 px-4 py-2 rounded-md bg-[rgb(var(--neon-orchid))] text-white hover:bg-[rgba(var(--neon-orchid),0.8)] transition-colors"
                >
                  Přidat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}