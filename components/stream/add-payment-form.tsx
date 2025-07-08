'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Upload, Crown, CreditCard, User, FileText, Camera, Tag, X, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreateClientPopover } from '@/components/clients/create-client-popover';
import { toast } from 'sonner';

interface AddPaymentFormProps {
  onAddPayment: (paymentData: any) => void;
  currentProvision: number;
}

// Updated quick amounts as requested
const quickAmounts = [500, 1000, 1500, 2000, 2500, 5000];

const defaultCategories = [
  'Premium Video',
  'Chat Session',
  'Live Call',
  'Custom Content',
  'Subscription',
  'Tips',
  'Private Show'
];

// Debounce function for search
function debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

export function AddPaymentForm({ onAddPayment, currentProvision }: AddPaymentFormProps) {
  // State management as requested
  const [amount, setAmount] = useState('');
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [clientSearch, setClientSearch] = useState('');
  const [suggestedClients, setSuggestedClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showCreatePopover, setShowCreatePopover] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [notes, setNotes] = useState('');

  // Additional state for UI
  const [categories, setCategories] = useState(defaultCategories);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  
  // Loading states
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [isSearchingClients, setIsSearchingClients] = useState(false);

  // Fetch real models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setIsLoadingModels(true);
        const response = await fetch('/api/models');
        const data = await response.json();
        setModels(data.models || []);
        console.log('✅ Loaded models:', data.models);
      } catch (error) {
        console.error('❌ Error fetching models:', error);
      } finally {
        setIsLoadingModels(false);
      }
    };

    fetchModels();
  }, []);

  // Fetch channels for selected model
  useEffect(() => {
    const fetchChannels = async () => {
      if (!selectedModel) {
        setChannels([]);
        return;
      }

      try {
        setIsLoadingChannels(true);
        const response = await fetch(`/api/models/${selectedModel.id}/channels`);
        const data = await response.json();
        setChannels(data.channels || []);
        console.log('✅ Loaded channels for model:', selectedModel.name, data.channels);
      } catch (error) {
        console.error('❌ Error fetching channels:', error);
        setChannels([]);
      } finally {
        setIsLoadingChannels(false);
      }
    };

    fetchChannels();
  }, [selectedModel]);

  // Fetch real accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setIsLoadingAccounts(true);
        const response = await fetch('/api/accounts');
        const data = await response.json();
        setAccounts(data || []);
        console.log('✅ Loaded accounts:', data);
      } catch (error) {
        console.error('❌ Error fetching accounts:', error);
      } finally {
        setIsLoadingAccounts(false);
      }
    };

    fetchAccounts();
  }, []);

  // Close client dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showClientDropdown) {
        const target = event.target as Element;
        if (!target.closest('.client-dropdown-container')) {
          setShowClientDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showClientDropdown]);

  // Client search functionality
  const searchClients = async (query: string) => {
    if (query.length < 1) {
      setSuggestedClients([]);
      return;
    }
    
    try {
      setIsSearchingClients(true);
      const response = await fetch(`/api/clients/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSuggestedClients(data.clients || []);
      console.log('✅ Found clients:', data.clients);
    } catch (error) {
      console.error('❌ Error searching clients:', error);
      setSuggestedClients([]);
    } finally {
      setIsSearchingClients(false);
    }
  };

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce(searchClients, 300),
    []
  );

  // Handle client search input
  const handleClientSearchChange = (value: string) => {
    setClientSearch(value);
    setSelectedClient(null);
    setShowClientDropdown(true);
    debouncedSearch(value);
  };

  // Handle client selection
  const handleClientSelect = (client: any) => {
    setSelectedClient(client);
    setClientSearch(client.name);
    setShowClientDropdown(false);
  };

  // Handle client creation from popover
  const handleClientCreated = (newClient: any) => {
    console.log('🎯 handleClientCreated called with:', newClient);
    
    // Verify we have a real client with ID
    if (!newClient || !newClient.id) {
      console.error('❌ Invalid client data received:', newClient);
      toast.error('Chyba: Klient nebyl správně vytvořen');
      return;
    }

    console.log('✅ Setting selected client to:', newClient);
    setSelectedClient(newClient);
    setClientSearch(newClient.name);
    setSuggestedClients([]);
    setShowCreatePopover(false);
    toast.success(`Klient "${newClient.name}" byl úspěšně vytvořen!`);
  };

  // Handle quick amount selection
  const handleQuickAmount = (amount: number) => {
    setAmount(amount.toString());
  };

  // Handle model selection
  const handleModelChange = (model: any) => {
    setSelectedModel(model);
    setSelectedChannel(null); // Reset channel when model changes
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
    }
  };

  // Handle adding new category
  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories(prev => [...prev, newCategory.trim()]);
      setSelectedCategory(newCategory.trim());
      setNewCategory('');
      setShowNewCategoryInput(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !selectedModel || !selectedChannel || !selectedClient || !selectedAccount || !selectedCategory) {
      toast.error('Prosím vyplňte všechna povinná pole');
      return;
    }

    // Verify client has a real ID (not temporary)
    if (!selectedClient.id || selectedClient.id.startsWith('client_')) {
      console.error('❌ Attempting to submit payment with temporary client ID:', selectedClient);
      toast.error('Chyba: Klient nebyl správně uložen do databáze');
      return;
    }

    setIsSubmitting(true);

    try {
      const paymentData = {
        amount: parseFloat(amount),
        modelId: selectedModel.id,
        channelId: selectedChannel.id,
        clientId: selectedClient.id,
        accountId: selectedAccount.id,
        category: selectedCategory,
        notes,
        screenshot: screenshot ? 'uploaded' : null
      };

      console.log('📝 Submitting payment with verified client:', {
        ...paymentData,
        clientName: selectedClient.name,
        clientIdType: typeof selectedClient.id,
        isTemporaryId: selectedClient.id.startsWith('client_')
      });

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('✅ Payment created:', result.payment);
        
        setShowSuccessAnimation(true);
        
        // Call parent handler for UI updates
        onAddPayment({
          amount: parseFloat(amount),
          model: selectedModel.name,
          channel: selectedChannel.channelName,
          client: selectedClient.name,
          account: selectedAccount.name,
          category: selectedCategory,
          notes,
          screenshot
        });

        // Hide success animation after 2 seconds
        setTimeout(() => {
          setShowSuccessAnimation(false);
        }, 2000);

        // Reset form
        setAmount('');
        setSelectedModel(null);
        setSelectedChannel(null);
        setClientSearch('');
        setSelectedClient(null);
        setSelectedAccount(null);
        setSelectedCategory('');
        setNotes('');
        setScreenshot(null);
        setSuggestedClients([]);
      } else {
        toast.error(`Chyba při ukládání: ${result.error || 'Neznámá chyba'}`);
      }
    } catch (error) {
      console.error('❌ Payment submission error:', error);
      toast.error('Chyba při odesílání platby. Zkuste to znovu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-full mx-auto">
      <div className="glow-card p-6 relative overflow-visible">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Row 1: Amount Selection */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-[rgb(var(--foreground))] uppercase">Částka</span>
            </div>
            
            <div className="flex flex-wrap gap-2 items-center">
              {/* Quick Amount Buttons */}
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => handleQuickAmount(quickAmount)}
                  className={cn(
                    'px-4 py-2 rounded-md text-sm font-bold transition-colors duration-200 cursor-pointer',
                    amount === quickAmount.toString()
                      ? 'bg-gradient-to-r from-[rgb(var(--neon-orchid))] to-[rgb(var(--crimson))] text-white shadow-md'
                      : 'bg-[rgba(var(--sunset-gold),0.15)] text-[rgb(var(--foreground))] border border-[rgba(var(--sunset-gold),0.3)] hover:border-[rgba(var(--neon-orchid),0.5)]'
                  )}
                >
                  {quickAmount.toLocaleString()} <span className="text-xs opacity-80">CZK</span>
                </button>
              ))}
              
              {/* Custom Amount Input */}
              <div className="flex-1 min-w-[200px]">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
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
            
            {isLoadingModels ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[rgb(var(--neon-orchid))]" />
                <span className="ml-2 text-sm text-[rgb(var(--muted-foreground))]">Načítání modelek...</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {models.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => handleModelChange(model)}
                    className={cn(
                      'flex-1 min-w-[120px] px-3 py-2 rounded-md text-sm font-bold transition-colors duration-200 cursor-pointer',
                      selectedModel?.id === model.id
                        ? 'bg-gradient-to-r from-[rgb(var(--sunset-gold))] to-[rgb(var(--neon-orchid))] text-white shadow-md'
                        : 'bg-[rgba(var(--purple-500),0.15)] text-[rgb(var(--foreground))] border border-[rgba(var(--purple-500),0.3)] hover:border-[rgba(var(--neon-orchid),0.5)]'
                    )}
                  >
                    {model.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Row 3: Channel Selection */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-[rgb(var(--foreground))] uppercase">Kanál</span>
            </div>
            
            {isLoadingChannels ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-[rgb(var(--neon-orchid))]" />
                <span className="ml-2 text-sm text-[rgb(var(--muted-foreground))]">Načítání kanálů...</span>
              </div>
            ) : channels.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {channels.map((channel) => (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => setSelectedChannel(channel)}
                    className={cn(
                      'flex-1 min-w-[120px] px-3 py-2 rounded-md text-sm font-bold transition-colors duration-200 cursor-pointer',
                      selectedChannel?.id === channel.id
                        ? 'bg-gradient-to-r from-[rgb(var(--neon-orchid))] to-[rgb(var(--sunset-gold))] text-white shadow-md'
                        : 'bg-[rgba(var(--blue-500),0.15)] text-[rgb(var(--foreground))] border border-[rgba(var(--blue-500),0.3)] hover:border-[rgba(var(--neon-orchid),0.5)]'
                    )}
                  >
                    {channel.channelName}
                  </button>
                ))}
              </div>
            ) : selectedModel ? (
              <div className="text-sm text-[rgb(var(--muted-foreground))] text-center py-4">
                Žádné kanály k dispozici pro tuto modelku
              </div>
            ) : (
              <div className="text-sm text-[rgb(var(--muted-foreground))] text-center py-4">
                Nejdříve vyberte modelku
              </div>
            )}
          </div>

          {/* Row 4: Client Selection */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
              <span className="text-sm font-bold text-[rgb(var(--foreground))] uppercase">Klient</span>
            </div>
            
            <div className="relative client-dropdown-container">
              <div className="relative">
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => handleClientSearchChange(e.target.value)}
                  onFocus={() => setShowClientDropdown(true)}
                  className={cn(
                    "w-full px-3 py-2 rounded-md text-sm bg-[rgba(var(--velvet-gray),0.5)] border text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:outline-none transition-all duration-200 cursor-text",
                    selectedClient 
                      ? "border-green-400 bg-[rgba(34,197,94,0.15)]" 
                      : "border-[rgba(var(--neon-orchid),0.2)] focus:border-[rgba(var(--neon-orchid),0.5)]"
                  )}
                  placeholder="Hledat klienta..."
                />
                {isSearchingClients && (
                  <div className="absolute right-3 top-2.5">
                    <Loader2 className="w-3 h-3 animate-spin text-[rgb(var(--neon-orchid))]" />
                  </div>
                )}
                {selectedClient && (
                  <div className="absolute right-3 top-2.5">
                    <User className="w-3 h-3 text-green-400" />
                  </div>
                )}
              </div>
              
              {/* Selected Client Info */}
              {selectedClient && (
                <div className="mt-2 p-2 bg-[rgba(34,197,94,0.1)] border border-green-400/30 rounded text-xs text-green-400">
                  ✅ Vybraný klient: <strong>{selectedClient.name}</strong>
                  {selectedClient.id && (
                    <span className="ml-2 opacity-70">
                      (ID: {selectedClient.id.length > 20 ? selectedClient.id.substring(0, 20) + '...' : selectedClient.id})
                    </span>
                  )}
                </div>
              )}
              
              {/* Client Dropdown */}
              {showClientDropdown && suggestedClients.length > 0 && clientSearch && (
                <div className="absolute z-10 w-full mt-1 bg-[rgb(var(--charcoal))] border border-[rgba(var(--neon-orchid),0.3)] rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {suggestedClients.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => handleClientSelect(client)}
                      className="w-full px-3 py-2 text-left hover:bg-[rgba(var(--neon-orchid),0.1)] text-sm text-[rgb(var(--foreground))] flex items-center justify-between"
                    >
                      <span>{client.name}</span>
                      {client.isVIP && <span className="text-xs text-[rgb(var(--sunset-gold))]">VIP</span>}
                    </button>
                  ))}
                </div>
              )}
              
              {/* No results message with create button */}
              {showClientDropdown && suggestedClients.length === 0 && clientSearch && clientSearch.length > 0 && !isSearchingClients && (
                <div className="absolute z-10 w-full mt-1 bg-[rgb(var(--charcoal))] border border-[rgba(var(--neon-orchid),0.3)] rounded-md shadow-lg">
                  <div className="p-4 text-center">
                    <p className="text-[rgb(var(--muted-foreground))] mb-2 text-sm">Klient nenalezen</p>
                    <button 
                      type="button"
                      onClick={() => {
                        console.log('🔄 Opening create client popover for:', clientSearch);
                        setShowCreatePopover(true);
                        setShowClientDropdown(false);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-[rgb(var(--neon-orchid))] to-[rgb(var(--sunset-gold))] text-white rounded text-sm font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Přidat nového klienta "{clientSearch}"
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Row 5: Account Selection */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
              <span className="text-sm font-bold text-[rgb(var(--foreground))] uppercase">Účet</span>
            </div>
            
            {isLoadingAccounts ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-[rgb(var(--neon-orchid))]" />
                <span className="ml-2 text-sm text-[rgb(var(--muted-foreground))]">Načítání účtů...</span>
              </div>
            ) : (
              <select
                value={selectedAccount?.id || ''}
                onChange={(e) => {
                  const account = accounts.find(a => a.id === e.target.value);
                  setSelectedAccount(account || null);
                }}
                className="w-full px-3 py-2 rounded-md text-sm bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)] transition-all duration-200 cursor-pointer"
              >
                <option value="">Vybrat účet</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.type})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Row 6: Category Selection */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
              <span className="text-sm font-bold text-[rgb(var(--foreground))] uppercase">Kategorie</span>
            </div>
            
            {showNewCategoryInput ? (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Nová kategorie"
                  className="flex-1 px-3 py-2 rounded-md text-sm bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)] transition-all duration-200"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {setShowNewCategoryInput(false); setNewCategory('');}}
                  className="px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
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

          {/* Row 7: Screenshot Upload */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Camera className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
              <span className="text-sm font-bold text-[rgb(var(--foreground))] uppercase">Snímek</span>
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
                  screenshot && 'border-green-400 bg-[rgba(34,197,94,0.15)] text-green-400'
                )}
              >
                <Upload className="w-4 h-4 mr-2" />
                {screenshot ? 'Nahráno' : 'Upload'}
              </label>
            </div>
          </div>

          {/* Row 8: Notes */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
              <span className="text-sm font-bold text-[rgb(var(--foreground))] uppercase">Poznámky</span>
            </div>
            
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
                <Loader2 className="w-5 h-5 animate-spin" />
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
                <div className="w-24 h-24 mx-auto bg-green-500 rounded-full flex items-center justify-center">
                  <Plus className="w-12 h-12 text-white" />
                </div>
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

      {/* Client Creation Popover */}
      <CreateClientPopover 
        isOpen={showCreatePopover}
        onClose={() => setShowCreatePopover(false)}
        defaultName={clientSearch}
        onClientCreated={handleClientCreated}
      />
    </div>
  );
}