'use client';

import { useState, useMemo } from 'react';
import { 
  ChevronUp, 
  ChevronDown,
  File,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionTableProps {
  data: any[];
  type: 'income' | 'expense' | 'transfer' | 'payout' | 'wages';
  searchQuery: string;
  selectedOperator: string;
  selectedCategory: string;
  selectedModel: string;
}

export function TransactionTable({ 
  data, 
  type,
  searchQuery,
  selectedOperator,
  selectedCategory,
  selectedModel
}: TransactionTableProps) {
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [loadingCheckboxes, setLoadingCheckboxes] = useState<Set<number>>(new Set());

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        Object.values(item).some(value =>
          value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Apply operator filter
    if (selectedOperator !== 'all') {
      filtered = filtered.filter(item => item.operator === selectedOperator);
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Apply model filter (for income and payout only)
    if (selectedModel !== 'all' && (type === 'income' || type === 'payout')) {
      filtered = filtered.filter(item => item.model === selectedModel);
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
  }, [data, searchQuery, selectedOperator, selectedCategory, selectedModel, sortBy, sortOrder, type]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  const handleApprovalToggle = async (item: any) => {
    // Only handle payments (income type transactions)
    if (type !== 'income' || !item.id) return;
    
    const action = item.approved ? 'uncinklo' : 'cinklo';
    
    // Add to loading set
    setLoadingCheckboxes(prev => new Set(prev).add(item.id));
    
    try {
      const response = await fetch(`/api/payments/${item.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action, 
          adminId: 'admin-user-id' // TODO: Replace with actual admin ID
        })
      });
      
      if (response.ok) {
        // Update the item in the data array
        data.forEach(dataItem => {
          if (dataItem.id === item.id) {
            dataItem.approved = !dataItem.approved;
          }
        });
      } else {
        console.error('Failed to update approval status');
      }
    } catch (error) {
      console.error('Error updating approval status:', error);
    } finally {
      // Remove from loading set
      setLoadingCheckboxes(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }
  };

  const handleDeliveredToggle = async (item: any) => {
    // Only handle payments (income type transactions)
    if (type !== 'income' || !item.id) return;
    
    const action = item.delivered ? 'unhotovo' : 'hotovo';
    
    // Add to loading set
    setLoadingCheckboxes(prev => new Set(prev).add(item.id));
    
    try {
      const response = await fetch(`/api/payments/${item.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action, 
          adminId: 'admin-user-id' // TODO: Replace with actual admin ID
        })
      });
      
      if (response.ok) {
        // Update the item in the data array
        data.forEach(dataItem => {
          if (dataItem.id === item.id) {
            dataItem.delivered = !dataItem.delivered;
          }
        });
      } else {
        console.error('Failed to update delivery status');
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
    } finally {
      // Remove from loading set
      setLoadingCheckboxes(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
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

  const getIncomeColumns = () => (
    <>
      <th className="w-[100px] px-3 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        <SortButton field="date">Date</SortButton>
      </th>
      <th className="w-[100px] px-3 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        <SortButton field="amount">Amount</SortButton>
      </th>
      <th className="w-[100px] px-3 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        <SortButton field="operator">Operator</SortButton>
      </th>
      <th className="w-[100px] px-3 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        <SortButton field="model">Model</SortButton>
      </th>
      <th className="w-[120px] px-3 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        <SortButton field="client">Client</SortButton>
      </th>
      <th className="w-[100px] px-3 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        <SortButton field="channel">Channel</SortButton>
      </th>
      <th className="w-[120px] px-3 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        <SortButton field="category">Category</SortButton>
      </th>
      <th className="w-[120px] px-3 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        <SortButton field="toAccount">To Account</SortButton>
      </th>
      <th className="w-[150px] px-3 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        Notes
      </th>
      <th className="w-[60px] px-3 py-3 text-center text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        <File className="w-4 h-4 mx-auto" />
      </th>
      <th className="w-[60px] px-3 py-3 text-center text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        Cinklo
      </th>
      <th className="w-[60px] px-3 py-3 text-center text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        Hotovo
      </th>
    </>
  );

  const getExpenseColumns = () => (
    <>
      <th className="w-[100px] px-3 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        <SortButton field="date">Date</SortButton>
      </th>
      <th className="w-[100px] px-3 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        <SortButton field="amount">Amount</SortButton>
      </th>
      <th className="w-[150px] px-3 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        <SortButton field="name">Name</SortButton>
      </th>
      <th className="w-[120px] px-3 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        <SortButton field="category">Category</SortButton>
      </th>
      <th className="w-[100px] px-3 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        <SortButton field="operator">Operator</SortButton>
      </th>
      <th className="w-[120px] px-3 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        <SortButton field="fromAccount">From Account</SortButton>
      </th>
      <th className="w-[200px] px-3 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        Notes
      </th>
      <th className="w-[60px] px-3 py-3 text-center text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        <File className="w-4 h-4 mx-auto" />
      </th>
      <th className="w-[60px] px-3 py-3 text-center text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        Cinklo
      </th>
      <th className="w-[60px] px-3 py-3 text-center text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        Hotovo
      </th>
    </>
  );

  const getTransferColumns = () => (
    <>
      <th className="w-[100px] px-3 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        <SortButton field="date">Date</SortButton>
      </th>
      <th className="w-[100px] px-3 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        <SortButton field="amount">Amount</SortButton>
      </th>
      <th className="w-[150px] px-3 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        <SortButton field="fromAccount">From Account</SortButton>
      </th>
      <th className="w-[150px] px-3 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        <SortButton field="toAccount">To Account</SortButton>
      </th>
      <th className="w-[200px] px-3 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        Notes
      </th>
      <th className="w-[100px] px-3 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        <SortButton field="operator">Operator</SortButton>
      </th>
      <th className="w-[60px] px-3 py-3 text-center text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        <File className="w-4 h-4 mx-auto" />
      </th>
      <th className="w-[60px] px-3 py-3 text-center text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        Cinklo
      </th>
      <th className="w-[60px] px-3 py-3 text-center text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        Hotovo
      </th>
    </>
  );

  const getPayoutColumns = () => (
    <>
      <th className="w-[100px] px-3 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        <SortButton field="date">Date</SortButton>
      </th>
      <th className="w-[100px] px-3 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        <SortButton field="amount">Amount</SortButton>
      </th>
      <th className="w-[100px] px-3 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        <SortButton field="operator">Operator</SortButton>
      </th>
      <th className="w-[120px] px-3 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        <SortButton field="fromAccount">From Account</SortButton>
      </th>
      <th className="w-[150px] px-3 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        <SortButton field="to">To</SortButton>
      </th>
      <th className="w-[120px] px-3 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        <SortButton field="type">Type</SortButton>
      </th>
      <th className="w-[150px] px-3 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        Notes
      </th>
      <th className="w-[60px] px-3 py-3 text-center text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        <File className="w-4 h-4 mx-auto" />
      </th>
      <th className="w-[60px] px-3 py-3 text-center text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        Cinklo
      </th>
      <th className="w-[60px] px-3 py-3 text-center text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        Hotovo
      </th>
    </>
  );

  // NEW: Wages columns
  const getWagesColumns = () => (
    <>
      <th className="w-[100px] px-3 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        <SortButton field="date">Datum</SortButton>
      </th>
      <th className="w-[150px] px-3 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        <SortButton field="chatterName">Jméno Chattera</SortButton>
      </th>
      <th className="w-[120px] px-3 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        <SortButton field="amountPaid">Vyplacená Částka</SortButton>
      </th>
      <th className="w-[120px] px-3 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        <SortButton field="method">Metoda</SortButton>
      </th>
      <th className="w-[200px] px-3 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        Poznámky
      </th>
      <th className="w-[60px] px-3 py-3 text-center text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        <File className="w-4 h-4 mx-auto" />
      </th>
      <th className="w-[60px] px-3 py-3 text-center text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        Cinklo
      </th>
      <th className="w-[60px] px-3 py-3 text-center text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
        Hotovo
      </th>
    </>
  );

  const renderIncomeRow = (item: any) => (
    <>
      <td className="px-3 py-3 text-sm text-[rgb(var(--foreground))]">
        {new Date(item.date).toLocaleDateString()}
      </td>
      <td className="px-3 py-3 text-sm font-bold text-green-400">
        {item.amount.toLocaleString()} CZK
      </td>
      <td className="px-3 py-3 text-sm text-[rgb(var(--foreground))]">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
            {item.operator.charAt(0)}
          </div>
          <span>{item.operator}</span>
        </div>
      </td>
      <td className="px-3 py-3 text-sm text-[rgb(var(--foreground))]">{item.model}</td>
      <td className="px-3 py-3 text-sm text-[rgb(var(--foreground))]">{item.client}</td>
      <td className="px-3 py-3 text-sm">
        <span className={cn(
          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
          item.channel === 'Fanvue' 
            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
            : item.channel === 'Facebook'
            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            : 'bg-green-500/20 text-green-400 border border-green-500/30'
        )}>
          {item.channel}
        </span>
      </td>
      <td className="px-3 py-3 text-sm text-[rgb(var(--foreground))]">{item.category}</td>
      <td className="px-3 py-3 text-sm text-[rgb(var(--foreground))]">{item.toAccount}</td>
      <td className="px-3 py-3 text-sm text-[rgb(var(--muted-foreground))]">{item.notes}</td>
      <td className="px-3 py-3 text-sm">
        <div className="flex items-center justify-center">
          {item.screenshot ? (
            <File className="w-4 h-4 text-[rgb(var(--neon-orchid))]" />
          ) : (
            <div className="w-4 h-4 rounded bg-[rgba(var(--velvet-gray),0.3)]"></div>
          )}
        </div>
      </td>
      <td className="px-3 py-3 text-sm">
        <div className="flex items-center justify-center">
          <button
            onClick={() => handleApprovalToggle(item)}
            disabled={loadingCheckboxes.has(item.id)}
            className={cn(
              'w-5 h-5 rounded flex items-center justify-center transition-all duration-200',
              item.approved ? 'bg-green-500' : 'border-2 border-[rgba(var(--velvet-gray),0.5)]',
              loadingCheckboxes.has(item.id) 
                ? 'cursor-not-allowed opacity-50' 
                : 'cursor-pointer hover:scale-110'
            )}
          >
            {loadingCheckboxes.has(item.id) ? (
              <Loader2 className="w-3 h-3 animate-spin text-white" />
            ) : (
              item.approved && <Check className="w-3 h-3 text-white" />
            )}
          </button>
        </div>
      </td>
      <td className="px-3 py-3 text-sm">
        <div className="flex items-center justify-center">
          <button
            onClick={() => handleDeliveredToggle(item)}
            disabled={loadingCheckboxes.has(item.id)}
            className={cn(
              'w-5 h-5 rounded flex items-center justify-center transition-all duration-200',
              item.delivered ? 'bg-blue-500' : 'border-2 border-[rgba(var(--velvet-gray),0.5)]',
              loadingCheckboxes.has(item.id) 
                ? 'cursor-not-allowed opacity-50' 
                : 'cursor-pointer hover:scale-110'
            )}
          >
            {loadingCheckboxes.has(item.id) ? (
              <Loader2 className="w-3 h-3 animate-spin text-white" />
            ) : (
              item.delivered && <Check className="w-3 h-3 text-white" />
            )}
          </button>
        </div>
      </td>
    </>
  );

  const renderExpenseRow = (item: any) => (
    <>
      <td className="px-3 py-3 text-sm text-[rgb(var(--foreground))]">
        {new Date(item.date).toLocaleDateString()}
      </td>
      <td className="px-3 py-3 text-sm font-bold text-red-400">
        {item.amount.toLocaleString()} CZK
      </td>
      <td className="px-3 py-3 text-sm text-[rgb(var(--foreground))]">{item.name}</td>
      <td className="px-3 py-3 text-sm">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[rgba(var(--velvet-gray),0.3)] text-[rgb(var(--muted-foreground))] border border-[rgba(var(--velvet-gray),0.5)]">
          {item.category}
        </span>
      </td>
      <td className="px-3 py-3 text-sm text-[rgb(var(--foreground))]">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
            {item.operator.charAt(0)}
          </div>
          <span>{item.operator}</span>
        </div>
      </td>
      <td className="px-3 py-3 text-sm text-[rgb(var(--foreground))]">{item.fromAccount}</td>
      <td className="px-3 py-3 text-sm text-[rgb(var(--muted-foreground))]">{item.notes}</td>
      <td className="px-3 py-3 text-sm">
        <div className="flex items-center justify-center">
          {item.screenshot ? (
            <File className="w-4 h-4 text-[rgb(var(--neon-orchid))]" />
          ) : (
            <div className="w-4 h-4 rounded bg-[rgba(var(--velvet-gray),0.3)]"></div>
          )}
        </div>
      </td>
      <td className="px-3 py-3 text-sm">
        <div className="flex items-center justify-center">
          <div className={cn(
            'w-5 h-5 rounded flex items-center justify-center',
            item.approved ? 'bg-green-500' : 'border-2 border-[rgba(var(--velvet-gray),0.5)]'
          )}>
            {item.approved && <Check className="w-3 h-3 text-white" />}
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-sm">
        <div className="flex items-center justify-center">
          <div className={cn(
            'w-5 h-5 rounded flex items-center justify-center',
            item.delivered ? 'bg-blue-500' : 'border-2 border-[rgba(var(--velvet-gray),0.5)]'
          )}>
            {item.delivered && <Check className="w-3 h-3 text-white" />}
          </div>
        </div>
      </td>
    </>
  );

  const renderTransferRow = (item: any) => (
    <>
      <td className="px-3 py-3 text-sm text-[rgb(var(--foreground))]">
        {new Date(item.date).toLocaleDateString()}
      </td>
      <td className="px-3 py-3 text-sm font-bold text-blue-400">
        {item.amount.toLocaleString()} CZK
      </td>
      <td className="px-3 py-3 text-sm text-[rgb(var(--foreground))]">{item.fromAccount}</td>
      <td className="px-3 py-3 text-sm text-[rgb(var(--foreground))]">{item.toAccount}</td>
      <td className="px-3 py-3 text-sm text-[rgb(var(--muted-foreground))]">{item.notes}</td>
      <td className="px-3 py-3 text-sm text-[rgb(var(--foreground))]">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
            {item.operator.charAt(0)}
          </div>
          <span>{item.operator}</span>
        </div>
      </td>
      <td className="px-3 py-3 text-sm">
        <div className="flex items-center justify-center">
          {item.screenshot ? (
            <File className="w-4 h-4 text-[rgb(var(--neon-orchid))]" />
          ) : (
            <div className="w-4 h-4 rounded bg-[rgba(var(--velvet-gray),0.3)]"></div>
          )}
        </div>
      </td>
      <td className="px-3 py-3 text-sm">
        <div className="flex items-center justify-center">
          <div className={cn(
            'w-5 h-5 rounded flex items-center justify-center',
            item.approved ? 'bg-green-500' : 'border-2 border-[rgba(var(--velvet-gray),0.5)]'
          )}>
            {item.approved && <Check className="w-3 h-3 text-white" />}
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-sm">
        <div className="flex items-center justify-center">
          <div className={cn(
            'w-5 h-5 rounded flex items-center justify-center',
            item.delivered ? 'bg-blue-500' : 'border-2 border-[rgba(var(--velvet-gray),0.5)]'
          )}>
            {item.delivered && <Check className="w-3 h-3 text-white" />}
          </div>
        </div>
      </td>
    </>
  );

  const renderPayoutRow = (item: any) => (
    <>
      <td className="px-3 py-3 text-sm text-[rgb(var(--foreground))]">
        {new Date(item.date).toLocaleDateString()}
      </td>
      <td className="px-3 py-3 text-sm font-bold text-orange-400">
        {item.amount.toLocaleString()} CZK
      </td>
      <td className="px-3 py-3 text-sm text-[rgb(var(--foreground))]">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
            {item.operator.charAt(0)}
          </div>
          <span>{item.operator}</span>
        </div>
      </td>
      <td className="px-3 py-3 text-sm text-[rgb(var(--foreground))]">{item.fromAccount}</td>
      <td className="px-3 py-3 text-sm text-[rgb(var(--foreground))]">{item.to}</td>
      <td className="px-3 py-3 text-sm text-[rgb(var(--foreground))]">{item.type}</td>
      <td className="px-3 py-3 text-sm text-[rgb(var(--muted-foreground))]">{item.notes}</td>
      <td className="px-3 py-3 text-sm">
        <div className="flex items-center justify-center">
          {item.screenshot ? (
            <File className="w-4 h-4 text-[rgb(var(--neon-orchid))]" />
          ) : (
            <div className="w-4 h-4 rounded bg-[rgba(var(--velvet-gray),0.3)]"></div>
          )}
        </div>
      </td>
      <td className="px-3 py-3 text-sm">
        <div className="flex items-center justify-center">
          <div className={cn(
            'w-5 h-5 rounded flex items-center justify-center',
            item.approved ? 'bg-green-500' : 'border-2 border-[rgba(var(--velvet-gray),0.5)]'
          )}>
            {item.approved && <Check className="w-3 h-3 text-white" />}
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-sm">
        <div className="flex items-center justify-center">
          <div className={cn(
            'w-5 h-5 rounded flex items-center justify-center',
            item.delivered ? 'bg-blue-500' : 'border-2 border-[rgba(var(--velvet-gray),0.5)]'
          )}>
            {item.delivered && <Check className="w-3 h-3 text-white" />}
          </div>
        </div>
      </td>
    </>
  );

  // NEW: Render wages row
  const renderWagesRow = (item: any) => (
    <>
      <td className="px-3 py-3 text-sm text-[rgb(var(--foreground))]">
        {new Date(item.date).toLocaleDateString()}
      </td>
      <td className="px-3 py-3 text-sm text-[rgb(var(--foreground))]">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
            {item.chatterName.charAt(0)}
          </div>
          <span>{item.chatterName}</span>
        </div>
      </td>
      <td className="px-3 py-3 text-sm font-bold text-yellow-400">
        {item.amountPaid.toLocaleString()} CZK
      </td>
      <td className="px-3 py-3 text-sm">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[rgba(var(--velvet-gray),0.3)] text-[rgb(var(--muted-foreground))] border border-[rgba(var(--velvet-gray),0.5)]">
          {item.method}
        </span>
      </td>
      <td className="px-3 py-3 text-sm text-[rgb(var(--muted-foreground))]">{item.notes}</td>
      <td className="px-3 py-3 text-sm">
        <div className="flex items-center justify-center">
          {item.screenshot ? (
            <File className="w-4 h-4 text-[rgb(var(--neon-orchid))]" />
          ) : (
            <div className="w-4 h-4 rounded bg-[rgba(var(--velvet-gray),0.3)]"></div>
          )}
        </div>
      </td>
      <td className="px-3 py-3 text-sm">
        <div className="flex items-center justify-center">
          <div className={cn(
            'w-5 h-5 rounded flex items-center justify-center',
            item.approved ? 'bg-green-500' : 'border-2 border-[rgba(var(--velvet-gray),0.5)]'
          )}>
            {item.approved && <Check className="w-3 h-3 text-white" />}
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-sm">
        <div className="flex items-center justify-center">
          <div className={cn(
            'w-5 h-5 rounded flex items-center justify-center',
            item.delivered ? 'bg-blue-500' : 'border-2 border-[rgba(var(--velvet-gray),0.5)]'
          )}>
            {item.delivered && <Check className="w-3 h-3 text-white" />}
          </div>
        </div>
      </td>
    </>
  );

  return (
    <div className="w-full h-full overflow-hidden flex flex-col">
      <div className="w-full overflow-y-auto flex-1">
        <table className="w-full table-fixed border-separate border-spacing-0">
          <thead className="bg-[rgba(var(--velvet-gray),0.3)] border-b border-[rgba(var(--neon-orchid),0.2)] sticky top-0 z-10">
            <tr>
              {type === 'income' && getIncomeColumns()}
              {type === 'expense' && getExpenseColumns()}
              {type === 'transfer' && getTransferColumns()}
              {type === 'payout' && getPayoutColumns()}
              {type === 'wages' && getWagesColumns()}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr
                key={item.id}
                className={cn(
                  'h-12 border-b border-[rgba(var(--neon-orchid),0.1)] cursor-pointer transition-colors duration-200',
                  hoveredRow === index 
                    ? 'bg-[rgba(var(--neon-orchid),0.08)]' 
                    : 'hover:bg-[rgba(var(--neon-orchid),0.05)]'
                )}
                onMouseEnter={() => setHoveredRow(index)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {type === 'income' && renderIncomeRow(item)}
                {type === 'expense' && renderExpenseRow(item)}
                {type === 'transfer' && renderTransferRow(item)}
                {type === 'payout' && renderPayoutRow(item)}
                {type === 'wages' && renderWagesRow(item)}
              </tr>
            ))}
          </tbody>
        </table>

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <div className="text-[rgb(var(--muted-foreground))] text-lg mb-2">No transactions found</div>
            <div className="text-[rgb(var(--muted-foreground))] text-sm">Try adjusting your search or filters</div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {filteredData.length > 0 && (
        <div className="flex items-center justify-between p-4 border-t border-[rgba(var(--neon-orchid),0.2)]">
          {/* Rows per page selector */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-[rgb(var(--muted-foreground))]">Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
              className="px-2 py-1 rounded-md bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] text-xs focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Page info */}
          <div className="text-xs text-[rgb(var(--muted-foreground))]">
            Showing {Math.min((currentPage - 1) * rowsPerPage + 1, filteredData.length)} to {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length} entries
          </div>

          {/* Page navigation */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className={cn(
                "p-1 rounded-md text-xs",
                currentPage === 1
                  ? "text-[rgb(var(--muted-foreground))] cursor-not-allowed"
                  : "text-[rgb(var(--foreground))] hover:bg-[rgba(var(--velvet-gray),0.5)]"
              )}
            >
              First
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={cn(
                "p-1 rounded-md",
                currentPage === 1
                  ? "text-[rgb(var(--muted-foreground))] cursor-not-allowed"
                  : "text-[rgb(var(--foreground))] hover:bg-[rgba(var(--velvet-gray),0.5)]"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page numbers */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Calculate which page numbers to show
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={i}
                    onClick={() => handlePageChange(pageNum)}
                    className={cn(
                      "w-6 h-6 flex items-center justify-center rounded-md text-xs",
                      currentPage === pageNum
                        ? "bg-gradient-to-r from-[rgb(var(--neon-orchid))] to-[rgb(var(--crimson))] text-white"
                        : "text-[rgb(var(--foreground))] hover:bg-[rgba(var(--velvet-gray),0.5)]"
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={cn(
                "p-1 rounded-md",
                currentPage === totalPages
                  ? "text-[rgb(var(--muted-foreground))] cursor-not-allowed"
                  : "text-[rgb(var(--foreground))] hover:bg-[rgba(var(--velvet-gray),0.5)]"
              )}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={cn(
                "p-1 rounded-md text-xs",
                currentPage === totalPages
                  ? "text-[rgb(var(--muted-foreground))] cursor-not-allowed"
                  : "text-[rgb(var(--foreground))] hover:bg-[rgba(var(--velvet-gray),0.5)]"
              )}
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
}