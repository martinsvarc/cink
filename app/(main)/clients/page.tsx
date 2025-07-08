'use client';

import { useState, useMemo, useEffect } from 'react';
import { ClientsTable } from '@/components/clients/clients-table';
import { ClientsFloatingControls } from '@/components/clients/clients-floating-controls';
import { WorkTimeTracker } from '@/components/stream/work-time-tracker';
import { useAuth } from '@/lib/auth-context';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  assignedOperator: string;
  operatorId: string | null;
  modelName: string | null;
  modelId: string | null;
  channel: string;
  summary: string;
  payday: number | null;
  paydayIndicator: string;
  totalCollected: number;
  past7Days: number;
  lastPayment: string;
  avgPayment: number;
  isVIP: boolean;
  tags: string[];
  status: string;
  riskLevel: string;
  createdAt: string;
  updatedAt: string;
  profileUrl: string | null;
}

interface Operator {
  id: string;
  username: string;
  role: string;
}

export default function Clients() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('totalCollected');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedModel, setSelectedModel] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [vipFilter, setVipFilter] = useState('all'); // 'all', 'vip-only', 'non-vip'
  const [clients, setClients] = useState<Client[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeBonus, setTimeBonus] = useState(288); // 144 minutes * 2 CZK = 288 CZK

  // Fetch clients from API
  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/clients');
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      
      const clientsData = await response.json();
      setClients(clientsData);
      
      // Also fetch all tags
      const tagsResponse = await fetch('/api/tags');
      if (tagsResponse.ok) {
        const tagsData = await tagsResponse.json();
        setAllTags(tagsData.map((tag: any) => tag.label));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch operators for admin users
  useEffect(() => {
    if (user?.role === 'admin') {
      fetch('/api/users')
        .then(res => res.json())
        .then(data => {
          const operatorUsers = data.filter((u: any) => u.role === 'setter');
          setOperators(operatorUsers);
        })
        .catch(err => {
          console.error('Failed to fetch operators:', err);
        });
    }
  }, [user]);

  useEffect(() => {
    fetchClients();
  }, []);

  // Update client operator
  const updateClientOperator = async (clientId: string, operatorId: string) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedChatterId: operatorId })
      });
      
      if (response.ok) {
        // Refresh clients list
        fetchClients();
      }
    } catch (error) {
      console.error('Failed to update operator:', error);
    }
  };

  // Update client payday
  const updateClientPayday = async (clientId: string, payday: number) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payday })
      });
      
      if (response.ok) {
        // Update local state for immediate feedback
        setClients(prev => prev.map(c => 
          c.id === clientId ? { ...c, payday } : c
        ));
      }
    } catch (error) {
      console.error('Failed to update payday:', error);
    }
  };

  // Toggle VIP status for a client
  const toggleVIPStatus = async (clientId: string) => {
    try {
      const client = clients.find(c => c.id === clientId);
      if (!client) return;

      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isVIP: !client.isVIP }),
      });

      if (response.ok) {
        const updatedClient = await response.json();
        setClients(prev => prev.map(c => 
          c.id === clientId ? updatedClient : c
        ));
      }
    } catch (error) {
      console.error('Error updating VIP status:', error);
    }
  };

  // Update client tags
  const updateClientTags = async (clientId: string, newTags: string[]) => {
    try {
      // Get current tags to determine what to add/remove
      const client = clients.find(c => c.id === clientId);
      if (!client) return;

      const currentTags = client.tags;
      const tagsToAdd = newTags.filter(tag => !currentTags.includes(tag));
      const tagsToRemove = currentTags.filter(tag => !newTags.includes(tag));

      // Add new tags
      for (const tag of tagsToAdd) {
        await fetch(`/api/clients/${clientId}/tags`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ label: tag }),
        });
      }

      // Remove old tags
      for (const tag of tagsToRemove) {
        await fetch(`/api/clients/${clientId}/tags/${tag}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'remove' }),
        });
      }

      // Update local state
      setClients(prev => prev.map(c => 
        c.id === clientId ? { ...c, tags: newTags } : c
      ));
    } catch (error) {
      console.error('Error updating tags:', error);
    }
  };

  // Update client summary
  const updateClientSummary = async (clientId: string, newSummary: string) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ summary: newSummary }),
      });

      if (response.ok) {
        const updatedClient = await response.json();
        setClients(prev => prev.map(c => 
          c.id === clientId ? updatedClient : c
        ));
      }
    } catch (error) {
      console.error('Error updating summary:', error);
    }
  };

  const handleTimeUpdate = (totalMinutes: number, bonusAmount: number) => {
    setTimeBonus(bonusAmount);
  };

  // Filter and search logic
  const filteredClients = useMemo(() => {
    let filtered = [...clients];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply VIP filter
    if (vipFilter === 'vip-only') {
      filtered = filtered.filter(client => client.isVIP);
    } else if (vipFilter === 'non-vip') {
      filtered = filtered.filter(client => !client.isVIP);
    }

    // Apply tag filters
    if (selectedTags.length > 0) {
      filtered = filtered.filter(client =>
        selectedTags.some(tag => client.tags.includes(tag))
      );
    }

    // Apply active filters
    activeFilters.forEach(filter => {
      switch (filter) {
        case 'top-spenders':
          filtered = filtered.filter(client => client.totalCollected > 10000);
          break;
        case 'momentum':
          filtered = filtered.filter(client => 
            client.tags.includes('Momentum') || 
            client.past7Days > 500
          );
          break;
        case 'paid-today':
          filtered = filtered.filter(client => 
            client.lastPayment.includes('hour') || 
            client.lastPayment === '1 day ago'
          );
          break;
      }
    });

    // Apply model filter
    if (selectedModel !== 'all') {
      filtered = filtered.filter(client => 
        client.assignedOperator.toLowerCase() === selectedModel.toLowerCase()
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof typeof a];
      let bValue: any = b[sortBy as keyof typeof b];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [searchQuery, activeFilters, sortBy, sortOrder, selectedModel, selectedTags, vipFilter, clients]);

  if (loading) {
    return (
      <div className="flex flex-col h-[calc(100vh-80px)]">
        <div className="glow-card p-8 flex-1 mb-16">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[rgb(var(--neon-orchid))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-[rgb(var(--muted-foreground))]">Loading clients...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-[calc(100vh-80px)]">
        <div className="glow-card p-8 flex-1 mb-16">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-red-400 mb-4">Error loading clients</div>
              <div className="text-[rgb(var(--muted-foreground))] mb-4">{error}</div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[rgb(var(--neon-orchid))] text-white rounded-lg hover:bg-[rgb(var(--neon-orchid))]/80 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Clients Table - Fixed Height Container with Scrolling */}
      <div className="glow-card p-0 overflow-hidden flex-1 mb-16">
        <ClientsTable 
          clients={filteredClients}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={(field) => {
            if (sortBy === field) {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            } else {
              setSortBy(field);
              setSortOrder('desc');
            }
          }}
          onToggleVIP={toggleVIPStatus}
          onUpdateTags={updateClientTags}
          onUpdateSummary={updateClientSummary}
          onUpdatePayday={updateClientPayday}
          onUpdateOperator={updateClientOperator}
          allTags={allTags}
          operators={operators}
          user={user}
        />
      </div>

      {/* Floating Controls - Bottom with Search Moved Here */}
      <ClientsFloatingControls 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilters={activeFilters}
        onFiltersChange={setActiveFilters}
        sortBy={sortBy}
        onSortChange={setSortBy}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
        vipFilter={vipFilter}
        onVipFilterChange={setVipFilter}
        allTags={allTags}
      />

      {/* Fixed Timer in Bottom Right */}
      <WorkTimeTracker 
        onTimeUpdate={handleTimeUpdate} 
        showInline={false} 
      />
    </div>
  );
}