'use client';

import { useState, useMemo } from 'react';
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
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Transaction {
  id: number;
  date: string;
  amount: number;
  operator: string;
  model: string;
  client: string;
  channel: string;
  category: string;
  account: string;
  notes: string;
  screenshot?: string;
  approved: boolean;
}

interface MyTransactionsTableProps {
  transactions: Transaction[];
}

export function MyTransactionsTable({ transactions }: MyTransactionsTableProps) {
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [localTransactions, setLocalTransactions] = useState(transactions);
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Update local state when props change
  useState(() => {
    setLocalTransactions(transactions);
  });

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...localTransactions];
    
    // Apply status filter
    if (statusFilter === 'approved') {
      filtered = filtered.filter(t => t.approved);
    } else if (statusFilter === 'pending') {
      filtered = filtered.filter(t => !t.approved);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Transaction];
      let bValue: any = b[sortBy as keyof Transaction];

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
  }, [localTransactions, sortBy, sortOrder, statusFilter]);

  // Paginate transactions
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredTransactions, currentPage, rowsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);

  const handleApprovalToggle = (transactionId: number) => {
    setLocalTransactions(prev => 
      prev.map(transaction => 
        transaction.id === transactionId 
          ? { ...transaction, approved: !transaction.approved }
          : transaction
      )
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(1); // Reset to first page when changing rows per page
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
    if (channel.includes('FB') || channel.includes('Facebook')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (channel.includes('WhatsApp')) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (channel.includes('Telegram')) return 'bg-blue-400/20 text-blue-300 border-blue-400/30';
    if (channel.includes('Instagram')) return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const statusFilters = [
    { id: 'all', label: 'Všechny', count: localTransactions.length },
    { id: 'approved', label: 'Schválené', count: localTransactions.filter(t => t.approved).length },
    { id: 'pending', label: 'Čekající', count: localTransactions.filter(t => !t.approved).length }
  ];

  return (
    <div className="w-full h-full overflow-hidden flex flex-col">
      {/* Status Filter Buttons */}
      <div className="flex items-center space-x-2 p-4 border-b border-[rgba(var(--neon-orchid),0.2)]">
        <Filter className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
        <span className="text-sm font-medium text-[rgb(var(--foreground))]">Status:</span>
        {statusFilters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setStatusFilter(filter.id as any)}
            className={cn(
              'flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
              statusFilter === filter.id
                ? 'bg-gradient-to-r from-[rgb(var(--neon-orchid))] to-[rgb(var(--crimson))] text-white shadow-lg'
                : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)]'
            )}
          >
            <span>{filter.label}</span>
            <span className="text-xs opacity-70">({filter.count})</span>
          </button>
        ))}
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full table-fixed border-separate border-spacing-0">
          {/* Table Header - Sticky */}
          <thead className="bg-[rgba(var(--velvet-gray),0.3)] border-b border-[rgba(var(--neon-orchid),0.2)] sticky top-0 z-10">
            <tr>
              <th className="w-[90px] px-2 py-2 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                <SortButton field="date">Datum a čas</SortButton>
              </th>
              <th className="w-[80px] px-2 py-2 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                <SortButton field="amount">Částka</SortButton>
              </th>
              <th className="w-[80px] px-2 py-2 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                <SortButton field="model">Modelka</SortButton>
              </th>
              <th className="w-[100px] px-2 py-2 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                <SortButton field="client">Klient</SortButton>
              </th>
              <th className="w-[100px] px-2 py-2 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                <SortButton field="channel">Kanál</SortButton>
              </th>
              <th className="w-[90px] px-2 py-2 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                <SortButton field="category">Kategorie</SortButton>
              </th>
              <th className="w-[80px] px-2 py-2 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                <SortButton field="account">Na účet</SortButton>
              </th>
              <th className="w-[120px] px-2 py-2 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                Poznámky
              </th>
              <th className="w-[70px] px-2 py-2 text-center text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                <File className="w-4 h-4 mx-auto" />
              </th>
              <th className="w-[80px] px-2 py-2 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                <SortButton field="approved">Approved</SortButton>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {paginatedTransactions.map((transaction, index) => (
              <tr
                key={transaction.id}
                className={cn(
                  'h-10 border-b border-[rgba(var(--neon-orchid),0.1)] cursor-pointer transition-colors duration-200',
                  hoveredRow === index 
                    ? 'bg-[rgba(var(--neon-orchid),0.08)]' 
                    : 'hover:bg-[rgba(var(--neon-orchid),0.05)]'
                )}
                onMouseEnter={() => setHoveredRow(index)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {/* Date */}
                <td className="px-2 py-2 h-10">
                  <div className="flex items-center h-full">
                    <div className="text-xs text-[rgb(var(--foreground))]">
                      {new Date(transaction.date).toLocaleDateString('cs-CZ')}
                      <br />
                      <span className="text-[rgb(var(--muted-foreground))]">
                        {new Date(transaction.date).toLocaleTimeString('cs-CZ', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Amount */}
                <td className="px-2 py-2 h-10">
                  <div className="flex items-center h-full">
                    <div className="text-sm font-bold text-green-400">
                      {transaction.amount.toLocaleString()} <span className="text-xs opacity-80">CZK</span>
                    </div>
                  </div>
                </td>

                {/* Model */}
                <td className="px-2 py-2 h-10">
                  <div className="flex items-center space-x-1 h-full">
                    <span className="text-xs text-[rgb(var(--foreground))] truncate">{transaction.model}</span>
                  </div>
                </td>

                {/* Client */}
                <td className="px-2 py-2 h-10">
                  <div className="flex items-center space-x-1 h-full">
                    <span className="text-xs text-[rgb(var(--foreground))] truncate">{transaction.client}</span>
                  </div>
                </td>

                {/* Channel */}
                <td className="px-2 py-2 h-10">
                  <div className="flex items-center h-full">
                    <span className={cn(
                      'inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium border truncate',
                      getChannelColor(transaction.channel)
                    )}>
                      {transaction.channel}
                    </span>
                  </div>
                </td>

                {/* Category */}
                <td className="px-2 py-2 h-10">
                  <div className="flex items-center h-full">
                    <span className="text-xs text-[rgb(var(--foreground))] truncate">{transaction.category}</span>
                  </div>
                </td>

                {/* Account */}
                <td className="px-2 py-2 h-10">
                  <div className="flex items-center space-x-1 h-full">
                    <span className="text-xs text-[rgb(var(--foreground))] truncate">{transaction.account}</span>
                  </div>
                </td>

                {/* Notes */}
                <td className="px-2 py-2 h-10">
                  <div className="flex items-center h-full">
                    <span className="text-xs text-[rgb(var(--muted-foreground))] truncate">{transaction.notes}</span>
                  </div>
                </td>

                {/* Screenshot - File Icon */}
                <td className="px-2 py-2 h-10">
                  <div className="flex items-center justify-center h-full">
                    {transaction.screenshot ? (
                      <button className="p-1 text-[rgb(var(--neon-orchid))] hover:text-[rgb(var(--foreground))] transition-colors">
                        <File className="w-3 h-3" />
                      </button>
                    ) : (
                      <div className="w-3 h-3 bg-[rgba(var(--velvet-gray),0.3)] rounded"></div>
                    )}
                  </div>
                </td>

                {/* Approved Checkbox */}
                <td className="px-2 py-2 h-10">
                  <div className="flex items-center justify-center h-full">
                    <button
                      onClick={() => handleApprovalToggle(transaction.id)}
                      className={cn(
                        'w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200',
                        transaction.approved
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-[rgb(var(--muted-foreground))] hover:border-[rgb(var(--neon-orchid))]'
                      )}
                    >
                      {transaction.approved && <Check className="w-3 h-3" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {filteredTransactions.length === 0 && (
          <div className="text-center py-8">
            <div className="text-[rgb(var(--muted-foreground))] text-sm mb-2">
              {statusFilter === 'all' ? 'Žádné transakce dnes' : 
               statusFilter === 'approved' ? 'Žádné schválené transakce' : 
               'Žádné čekající transakce'}
            </div>
            <div className="text-[rgb(var(--muted-foreground))] text-xs">
              {statusFilter === 'all' ? 'Začni přidávat platby pomocí formuláře výše' : 'Zkus změnit filtr'}
            </div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {filteredTransactions.length > 0 && (
        <div className="flex items-center justify-between p-4 border-t border-[rgba(var(--neon-orchid),0.2)]">
          {/* Rows per page selector */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-[rgb(var(--muted-foreground))]">Řádků na stránku:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
              className="px-2 py-1 rounded-md bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] text-xs focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Page info */}
          <div className="text-xs text-[rgb(var(--muted-foreground))]">
            Zobrazeno {Math.min((currentPage - 1) * rowsPerPage + 1, filteredTransactions.length)} až {Math.min(currentPage * rowsPerPage, filteredTransactions.length)} z {filteredTransactions.length} záznamů
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
              První
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
              Poslední
            </button>
          </div>
        </div>
      )}
    </div>
  );
}