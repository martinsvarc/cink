'use client';

import * as React from 'react';
import { 
  ChevronUp, 
  ChevronDown,
  Eye,
  Upload,
  Edit3,
  Trash2,
  Check,
  X,
  Filter,
  File,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types for the payment data
interface PaymentData {
  id: number;
  dateTime: string;
  amount: number;
  operator: string;
  model: string;
  client: string;
  channel: string;
  category: string;
  toAccount: string;
  notes: string;
  screenshot?: string | null;
  approved: boolean;
  delivered: boolean;
}

interface EnhancedActivityFeedProps {
  currentTimeframe?: string;
  selectedOperator?: string;
  enableCheckboxes?: boolean;
}

export function EnhancedActivityFeed({ 
  currentTimeframe = 'daily', 
  selectedOperator = 'all',
  enableCheckboxes = false 
}: EnhancedActivityFeedProps) {
  const [sortBy, setSortBy] = React.useState('dateTime');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [hoveredRow, setHoveredRow] = React.useState<number | null>(null);
  const [localData, setLocalData] = React.useState<PaymentData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [loadingCheckboxes, setLoadingCheckboxes] = React.useState<Set<number>>(new Set());

  // Fetch payments data from API
  React.useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/payments');
        if (!response.ok) {
          throw new Error(`Failed to fetch payments: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Check if the response is successful and has payments array
        if (!data.success || !data.payments) {
          throw new Error('Invalid API response format');
        }
        
                  // Transform the data to match our expected format
          const transformedData = data.payments.map((payment: any) => ({
            id: payment.id,
            dateTime: new Date(payment.timestamp).toLocaleString('en-GB', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            }).replace(',', ''),
            amount: payment.amount || 0,
            operator: payment.chatter?.user?.name || 'N/A',
            model: payment.model?.name || 'N/A',
            client: payment.client?.name || 'N/A',
            channel: payment.channel || 'N/A',
            category: payment.category || 'N/A',
            toAccount: payment.toAccount || 'N/A',
            notes: payment.notes || '',
            screenshot: payment.screenshot || null,
            approved: payment.cinklo || false,
            delivered: payment.hotovo || false
          }));
        
        setLocalData(transformedData);
      } catch (err) {
        console.error('Error fetching payments:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch payments');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Filter data based on timeframe and operator
  const filteredData = React.useMemo(() => {
    let filtered = [...localData];
    
    // Filter by operator
    if (selectedOperator !== 'all') {
      filtered = filtered.filter(item => 
        item.operator.toLowerCase() === selectedOperator.toLowerCase()
      );
    }
    
    // Filter by timeframe (for now, return all data regardless of timeframe)
    // In a real app, this would filter based on the timeframe
    
    return filtered;
  }, [localData, currentTimeframe, selectedOperator]);

  // Sort data
  const sortedData = React.useMemo(() => {
    return [...filteredData].sort((a, b) => {
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
  }, [filteredData, sortBy, sortOrder]);

  const handleApprovalToggle = async (id: number) => {
    if (!enableCheckboxes) return;
    
    // Find the current item to get its current state
    const currentItem = localData.find(item => item.id === id);
    if (!currentItem) return;
    
    const action = currentItem.approved ? 'uncinklo' : 'cinklo';
    
    // Add to loading set
    setLoadingCheckboxes(prev => new Set(prev).add(id));
    
    try {
      const response = await fetch(`/api/payments/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action, 
          adminId: 'admin-user-id' // TODO: Replace with actual admin ID
        })
      });
      
      if (response.ok) {
        // Update local state
        setLocalData((prev: PaymentData[]) => 
          prev.map((item: PaymentData) => 
            item.id === id 
              ? { ...item, approved: !item.approved }
              : item
          )
        );
      } else {
        console.error('Failed to update approval status');
      }
    } catch (error) {
      console.error('Error updating approval status:', error);
    } finally {
      // Remove from loading set
      setLoadingCheckboxes(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleDeliveredToggle = async (id: number) => {
    if (!enableCheckboxes) return;
    
    // Find the current item to get its current state
    const currentItem = localData.find(item => item.id === id);
    if (!currentItem) return;
    
    const action = currentItem.delivered ? 'unhotovo' : 'hotovo';
    
    // Add to loading set
    setLoadingCheckboxes(prev => new Set(prev).add(id));
    
    try {
      const response = await fetch(`/api/payments/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action, 
          adminId: 'admin-user-id' // TODO: Replace with actual admin ID
        })
      });
      
      if (response.ok) {
        // Update local state
        setLocalData((prev: PaymentData[]) => 
          prev.map((item: PaymentData) => 
            item.id === id 
              ? { ...item, delivered: !item.delivered }
              : item
          )
        );
      } else {
        console.error('Failed to update delivery status');
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
    } finally {
      // Remove from loading set
      setLoadingCheckboxes(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const SortButton = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <button
      onClick={() => {
        if (sortBy === field) {
          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
          setSortBy(field);
          setSortOrder('desc');
        }
      }}
      className="flex items-center space-x-1 text-left hover:text-[rgb(var(--neon-orchid))] transition-colors duration-200"
    >
      <span>{children}</span>
      {sortBy === field && (
        sortOrder === 'asc' ? 
        <ChevronUp className="w-3 h-3" /> : 
        <ChevronDown className="w-3 h-3" />
      )}
    </button>
  );

  const getChannelColor = (channel: string) => {
    if (channel.includes('Fanvue')) return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    if (channel.includes('Facebook')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (channel.includes('WhatsApp')) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (channel.includes('Telegram')) return 'bg-blue-400/20 text-blue-300 border-blue-400/30';
    if (channel.includes('Instagram')) return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex items-center space-x-2 text-[rgb(var(--muted-foreground))]">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading payments...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-2">Error loading payments</div>
          <div className="text-[rgb(var(--muted-foreground))] text-sm mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[rgb(var(--neon-orchid))] text-white rounded hover:bg-[rgb(var(--neon-orchid))]/80 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden">
      <div className="w-full h-full overflow-y-auto">
        <table className="w-full table-fixed border-separate border-spacing-0">
          {/* Frozen Header */}
          <thead className="bg-[rgba(var(--velvet-gray),0.3)] border-b border-[rgba(var(--neon-orchid),0.2)] sticky top-0 z-10">
            <tr>
              <th className="w-[100px] px-2 py-2 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                <SortButton field="dateTime">Date & Time</SortButton>
              </th>
              <th className="w-[80px] px-2 py-2 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                <SortButton field="amount">Amount</SortButton>
              </th>
              <th className="w-[80px] px-2 py-2 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                <SortButton field="operator">Operator</SortButton>
              </th>
              <th className="w-[80px] px-2 py-2 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                <SortButton field="model">Model</SortButton>
              </th>
              <th className="w-[100px] px-2 py-2 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                <SortButton field="client">Client</SortButton>
              </th>
              <th className="w-[80px] px-2 py-2 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                <SortButton field="channel">Channel</SortButton>
              </th>
              <th className="w-[100px] px-2 py-2 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                <SortButton field="category">Category</SortButton>
              </th>
              <th className="w-[100px] px-2 py-2 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                <SortButton field="toAccount">To Account</SortButton>
              </th>
              <th className="w-[120px] px-2 py-2 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                Notes
              </th>
              <th className="w-[60px] px-2 py-2 text-center text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                <File className="w-4 h-4 mx-auto" />
              </th>
              <th className="w-[60px] px-2 py-2 text-center text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                Cinklo
              </th>
              <th className="w-[60px] px-2 py-2 text-center text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                Hotovo
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => (
              <tr
                key={item.id}
                className={cn(
                  'h-10 border-b border-[rgba(var(--neon-orchid),0.1)] cursor-pointer transition-colors duration-200',
                  hoveredRow === index 
                    ? 'bg-[rgba(var(--neon-orchid),0.08)]' 
                    : 'hover:bg-[rgba(var(--neon-orchid),0.05)]'
                )}
                onMouseEnter={() => setHoveredRow(index)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {/* Date & Time */}
                <td className="px-2 py-2 h-10">
                  <div className="flex items-center h-full">
                    <div className="text-xs text-[rgb(var(--foreground))]">
                      {item.dateTime.split(' ')[0]}
                      <br />
                      <span className="text-[rgb(var(--muted-foreground))]">
                        {item.dateTime.split(' ')[1]}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Amount */}
                <td className="px-2 py-2 h-10">
                  <div className="flex items-center h-full">
                    <div className="text-sm font-bold text-green-400">
                      {item.amount.toLocaleString()} <span className="text-xs opacity-80">CZK</span>
                    </div>
                  </div>
                </td>

                {/* Operator */}
                <td className="px-2 py-2 h-10">
                  <div className="flex items-center space-x-1 h-full">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                      {item.operator.charAt(0)}
                    </div>
                    <span className="text-xs text-[rgb(var(--foreground))] truncate">{item.operator}</span>
                  </div>
                </td>

                {/* Model */}
                <td className="px-2 py-2 h-10">
                  <div className="flex items-center space-x-1 h-full">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                      {item.model.charAt(0)}
                    </div>
                    <span className="text-xs text-[rgb(var(--foreground))] truncate">{item.model}</span>
                  </div>
                </td>

                {/* Client */}
                <td className="px-2 py-2 h-10">
                  <div className="flex items-center h-full">
                    <span className="text-xs text-[rgb(var(--foreground))] truncate">{item.client}</span>
                  </div>
                </td>

                {/* Channel */}
                <td className="px-2 py-2 h-10">
                  <div className="flex items-center h-full">
                    <span className={cn(
                      'inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium border truncate',
                      getChannelColor(item.channel)
                    )}>
                      {item.channel}
                    </span>
                  </div>
                </td>

                {/* Category */}
                <td className="px-2 py-2 h-10">
                  <div className="flex items-center h-full">
                    <span className="text-xs text-[rgb(var(--foreground))] truncate">{item.category}</span>
                  </div>
                </td>

                {/* To Account */}
                <td className="px-2 py-2 h-10">
                  <div className="flex items-center h-full">
                    <span className="text-xs text-[rgb(var(--foreground))] truncate">{item.toAccount}</span>
                  </div>
                </td>

                {/* Notes */}
                <td className="px-2 py-2 h-10">
                  <div className="flex items-center h-full">
                    <span className="text-xs text-[rgb(var(--muted-foreground))] truncate">{item.notes}</span>
                  </div>
                </td>

                {/* Screenshot - File Icon */}
                <td className="px-2 py-2 h-10">
                  <div className="flex items-center justify-center h-full">
                    {item.screenshot ? (
                      <button className="p-1 text-[rgb(var(--neon-orchid))] hover:text-[rgb(var(--foreground))] transition-colors">
                        <File className="w-3 h-3" />
                      </button>
                    ) : (
                      <div className="w-3 h-3 bg-[rgba(var(--velvet-gray),0.3)] rounded"></div>
                    )}
                  </div>
                </td>

                {/* Cinklo (Green Checkbox) */}
                <td className="px-2 py-2 h-10">
                  <div className="flex items-center justify-center h-full">
                    <button
                      onClick={() => handleApprovalToggle(item.id)}
                      disabled={loadingCheckboxes.has(item.id)}
                      className={cn(
                        'w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200',
                        item.approved
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-[rgb(var(--muted-foreground))] hover:border-green-500',
                        loadingCheckboxes.has(item.id) 
                          ? 'cursor-not-allowed opacity-50' 
                          : 'cursor-pointer'
                      )}
                    >
                      {loadingCheckboxes.has(item.id) ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        item.approved && <Check className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </td>

                {/* Hotovo (Blue Checkbox) */}
                <td className="px-2 py-2 h-10">
                  <div className="flex items-center justify-center h-full">
                    <button
                      onClick={() => handleDeliveredToggle(item.id)}
                      disabled={loadingCheckboxes.has(item.id)}
                      className={cn(
                        'w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200',
                        item.delivered
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'border-[rgb(var(--muted-foreground))] hover:border-blue-500',
                        loadingCheckboxes.has(item.id) 
                          ? 'cursor-not-allowed opacity-50' 
                          : 'cursor-pointer'
                      )}
                    >
                      {loadingCheckboxes.has(item.id) ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        item.delivered && <Check className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {sortedData.length === 0 && !loading && (
          <div className="text-center py-8">
            <div className="text-[rgb(var(--muted-foreground))] text-lg mb-2">No transactions found</div>
            <div className="text-[rgb(var(--muted-foreground))] text-sm">
              {selectedOperator !== 'all' 
                ? `No activity for ${selectedOperator} in the selected timeframe`
                : 'No activity recorded for the selected timeframe'
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}