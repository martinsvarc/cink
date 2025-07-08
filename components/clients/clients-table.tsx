'use client';

import { useState, useEffect } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Star, 
  Calendar,
  Edit3,
  X,
  Plus,
  Tag,
  File,
  ChevronLeft,
  ChevronRight,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  assignedOperator: string | null;
  operatorId: string | null;
  modelName: string | null;
  modelId: string | null;
  channel: string | null;
  summary: string | null;
  payday: number | null;
  paydayIndicator: string | null;
  totalCollected: number;
  past7Days: number;
  lastPayment: string | null;
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

interface AuthUser {
  id: string;
  username: string;
  role: string;
}

interface ClientsTableProps {
  clients: Client[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  onToggleVIP: (clientId: string) => void;
  onUpdateTags: (clientId: string, tags: string[]) => void;
  onUpdateSummary: (clientId: string, summary: string) => void;
  onUpdatePayday: (clientId: string, payday: number) => void;
  onUpdateOperator: (clientId: string, operatorId: string) => void;
  allTags: string[];
  operators: Operator[];
  user: AuthUser | null;
}

// Summary Modal Component
function SummaryModal({ 
  client, 
  isOpen, 
  onClose, 
  onSave 
}: { 
  client: Client | null; 
  isOpen: boolean; 
  onClose: () => void;
  onSave: (summary: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [summaryText, setSummaryText] = useState(client?.summary || '');

  // Update summaryText when client changes
  useEffect(() => {
    if (client) {
      setSummaryText(client.summary || '');
    }
  }, [client]);

  const handleSave = () => {
    if (client) {
      onSave(summaryText);
      setIsEditing(false);
    }
  };

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl bg-[rgba(var(--charcoal),0.95)] border border-[rgba(var(--neon-orchid),0.3)] backdrop-blur-sm shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[rgb(var(--foreground))]">Client Summary</h3>
            <button
              onClick={onClose}
              className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mb-4">
            <div className="text-sm font-medium text-[rgb(var(--foreground))] mb-2">{client.name}</div>
            {isEditing ? (
              <textarea
                value={summaryText}
                onChange={(e) => setSummaryText(e.target.value)}
                className="w-full h-32 p-3 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] resize-none focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
                placeholder="Enter client summary..."
              />
            ) : (
              <div className="p-3 rounded-lg bg-[rgba(var(--velvet-gray),0.3)] text-[rgb(var(--foreground))] min-h-[120px]">
                {summaryText}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-[rgb(var(--muted-foreground))]">
              Last updated by Isabella • 2 hours ago
            </div>
            <button
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[rgb(var(--neon-orchid))] to-[rgb(var(--crimson))] text-white text-sm font-medium hover:scale-105 transition-all duration-200"
            >
              <Edit3 className="w-3 h-3" />
              <span>{isEditing ? 'Save' : 'Edit'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tag Editor Modal Component
function TagEditorModal({ 
  client, 
  isOpen, 
  onClose, 
  onSave,
  allTags 
}: { 
  client: Client | null; 
  isOpen: boolean; 
  onClose: () => void;
  onSave: (tags: string[]) => void;
  allTags: string[];
}) {
  const [selectedTags, setSelectedTags] = useState<string[]>(client?.tags || []);
  const [newTag, setNewTag] = useState('');

  // Update selectedTags when client changes
  useEffect(() => {
    if (client) {
      setSelectedTags(client.tags);
    }
  }, [client]);

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const createNewTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      setSelectedTags([...selectedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleSave = () => {
    if (client) {
      onSave(selectedTags);
      onClose();
    }
  };

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-[rgba(var(--charcoal),0.95)] border border-[rgba(var(--neon-orchid),0.3)] backdrop-blur-sm shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[rgb(var(--foreground))]">Edit Tags</h3>
            <button
              onClick={onClose}
              className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mb-4">
            <div className="text-sm font-medium text-[rgb(var(--foreground))] mb-2">{client.name}</div>
            
            {/* Selected Tags */}
            <div className="mb-4">
              <div className="text-xs text-[rgb(var(--muted-foreground))] mb-2">Current Tags:</div>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-[rgb(var(--neon-orchid))]/20 text-[rgb(var(--neon-orchid))] border border-[rgb(var(--neon-orchid))]/30"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Available Tags */}
            <div className="mb-4">
              <div className="text-xs text-[rgb(var(--muted-foreground))] mb-2">Available Tags:</div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {allTags.filter(tag => !selectedTags.includes(tag)).map((tag, index) => (
                  <button
                    key={index}
                    onClick={() => addTag(tag)}
                    className="px-2 py-1 rounded-full text-xs font-medium bg-[rgba(var(--velvet-gray),0.3)] text-[rgb(var(--muted-foreground))] border border-[rgba(var(--velvet-gray),0.5)] hover:bg-[rgba(var(--neon-orchid),0.2)] hover:text-[rgb(var(--neon-orchid))] hover:border-[rgba(var(--neon-orchid),0.3)] transition-all duration-200"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Create New Tag */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Create new tag..."
                className="flex-1 px-3 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] text-sm focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
                onKeyPress={(e) => e.key === 'Enter' && createNewTag()}
              />
              <button
                onClick={createNewTag}
                className="px-3 py-2 rounded-lg bg-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--neon-orchid))] border border-[rgba(var(--neon-orchid),0.3)] hover:bg-[rgba(var(--neon-orchid),0.3)] transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgba(var(--velvet-gray),0.5)] transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[rgb(var(--neon-orchid))] to-[rgb(var(--crimson))] text-white font-medium hover:scale-105 transition-all duration-200"
            >
              <span>Save Tags</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ClientsTable({ 
  clients, 
  sortBy, 
  sortOrder, 
  onSort, 
  onToggleVIP, 
  onUpdateTags, 
  onUpdateSummary,
  onUpdatePayday,
  onUpdateOperator,
  allTags,
  operators,
  user
}: ClientsTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [summaryModal, setSummaryModal] = useState<{ isOpen: boolean; client: Client | null }>({
    isOpen: false,
    client: null
  });
  const [tagModal, setTagModal] = useState<{ isOpen: boolean; client: Client | null }>({
    isOpen: false,
    client: null
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default to 10 rows

  // Get status bubble color based on status
  const getStatusBubbleColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-400';
      case 'warning':
        return 'bg-yellow-400';
      case 'risk':
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
  };

  // Extract payday number from payday indicator
  const extractPaydayNumber = (paydayIndicator: string) => {
    if (paydayIndicator === 'Irregular') return 'Irr';
    
    // Extract number if present
    const match = paydayIndicator.match(/(\d+)/);
    if (match) {
      return match[1];
    }
    
    return '';
  };

  const getTagColor = (tag: string) => {
    if (tag.includes('🔥')) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (tag === 'VIP') return 'bg-[rgb(var(--sunset-gold))]/20 text-[rgb(var(--sunset-gold))] border-[rgb(var(--sunset-gold))]/30';
    if (tag === 'Whale') return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    if (tag === 'Top Spender') return 'bg-[rgb(var(--neon-orchid))]/20 text-[rgb(var(--neon-orchid))] border-[rgb(var(--neon-orchid))]/30';
    if (tag === 'Momentum') return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (tag === 'Vyplaty Dnes') return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    return 'bg-[rgba(var(--velvet-gray),0.3)] text-[rgb(var(--muted-foreground))] border-[rgba(var(--velvet-gray),0.5)]';
  };

  const SortButton = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <button
      onClick={() => onSort(field)}
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

  // Pagination
  const totalPages = Math.ceil(clients.length / rowsPerPage);
  const paginatedClients = clients.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Fixed Table Container - Prevents Expansion */}
      <div className="w-full flex-1 overflow-auto">
        <table className="w-full table-fixed border-separate border-spacing-0">
          {/* Table Header - Sticky */}
          <thead className="bg-[rgba(var(--velvet-gray),0.3)] border-b border-[rgba(var(--neon-orchid),0.2)] sticky top-0 z-10">
            <tr>
              <th className="w-[180px] px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                <SortButton field="name">Client Name</SortButton>
              </th>
              <th className="w-[160px] px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                <SortButton field="assignedOperator">Operator</SortButton>
              </th>
              <th className="w-[110px] px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                <SortButton field="model">Model</SortButton>
              </th>
              <th className="w-[80px] px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                <SortButton field="channel">Channel</SortButton>
              </th>
              <th className="w-[60px] px-3 py-2 text-center text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                <File className="w-4 h-4 mx-auto" />
              </th>
              <th className="w-[60px] px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                <SortButton field="paydayIndicator">Payday</SortButton>
              </th>
              <th className="w-[120px] px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                <SortButton field="totalCollected">Total Collected</SortButton>
              </th>
              <th className="w-[100px] px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                <SortButton field="past7Days">Past 7 Days</SortButton>
              </th>
              <th className="w-[100px] px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                <SortButton field="lastPayment">Last Payment</SortButton>
              </th>
              <th className="w-[100px] px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                <SortButton field="avgPayment">Avg Payment</SortButton>
              </th>
              <th className="w-[150px] px-3 py-2 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                Tags
              </th>
            </tr>
          </thead>

          {/* Table Body - Fixed Row Heights, Individual Row Hover Only */}
          <tbody>
            {paginatedClients.map((client) => (
              <tr
                key={client.id}
                className={cn(
                  'h-12 border-b border-[rgba(var(--neon-orchid),0.1)] cursor-pointer',
                  'transition-colors duration-200',
                  hoveredRow === client.id 
                    ? 'bg-[rgba(var(--neon-orchid),0.08)]' 
                    : 'hover:bg-[rgba(var(--neon-orchid),0.05)]'
                )}
                onMouseEnter={() => setHoveredRow(client.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {/* Client Name - Colored Status Bubble + Clickable Link */}
                <td className="px-3 py-2 h-12">
                  <div className="flex items-center space-x-2 h-full">
                    {/* Status Bubble - Replaces Text */}
                    <div className={cn(
                      'w-2 h-2 rounded-full flex-shrink-0',
                      getStatusBubbleColor(client.status)
                    )}></div>
                    
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {client.name ? client.name.charAt(0) : '?'}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      {client.profileUrl ? (
                        <a 
                          href={client.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-[rgb(var(--foreground))] hover:text-[rgb(var(--neon-orchid))] transition-colors truncate block w-full text-left underline"
                        >
                          {client.name}
                        </a>
                      ) : (
                        <span className="text-sm font-medium text-[rgb(var(--foreground))] truncate block w-full text-left">
                          {client.name}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Operator */}
                <td className="px-3 py-2 h-12">
                  <div className="flex items-center space-x-2 h-full">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {client.assignedOperator ? client.assignedOperator.charAt(0) : '?'}
                    </div>
                    {user?.role === 'admin' ? (
                      <select 
                        value={client.operatorId || ''}
                        onChange={(e) => onUpdateOperator(client.id, e.target.value)}
                        className="bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] rounded px-2 py-1 text-sm text-[rgb(var(--foreground))] focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)] hover:border-[rgba(var(--neon-orchid),0.3)]"
                      >
                        <option value="">Unassigned</option>
                        {operators.map(op => (
                          <option key={op.id} value={op.id}>{op.username}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm text-[rgb(var(--foreground))] truncate">
                        {client.assignedOperator || 'Unassigned'}
                      </span>
                    )}
                  </div>
                </td>

                {/* Model */}
                <td className="px-3 py-2 h-12">
                  <div className="flex items-center space-x-2 h-full">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {client.modelName ? client.modelName.charAt(0) : 'M'}
                    </div>
                    <span className="text-sm text-[rgb(var(--foreground))] truncate">
                      {client.modelName || 'No Model'}
                    </span>
                  </div>
                </td>

                {/* Channel */}
                <td className="px-3 py-2 h-12">
                  <div className="flex items-center h-full">
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                      client.channel === 'FB' 
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    )}>
                      {client.channel}
                    </span>
                  </div>
                </td>

                {/* Summary - Just Document Icon */}
                <td className="px-3 py-2 h-12">
                  <div className="flex items-center justify-center h-full">
                    <button
                      onClick={() => setSummaryModal({ isOpen: true, client })}
                      className="p-1 rounded text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--neon-orchid))] hover:bg-[rgba(var(--velvet-gray),0.5)] transition-all duration-200"
                    >
                      <File className="w-4 h-4" />
                    </button>
                  </div>
                </td>

                {/* Payday - Simple Number */}
                <td className="px-3 py-2 h-12">
                  <div className="flex items-center h-full">
                    <span className="text-sm font-bold text-gradient-gold">
                      {client.payday || '-'}
                    </span>
                  </div>
                </td>

                {/* Total Collected */}
                <td className="px-3 py-2 h-12">
                  <div className="flex items-center h-full">
                    <div className="text-sm font-bold text-gradient-gold">
                      ${client.totalCollected.toLocaleString()}
                    </div>
                  </div>
                </td>

                {/* Past 7 Days */}
                <td className="px-3 py-2 h-12">
                  <div className="flex items-center h-full">
                    <div className={cn(
                      'text-sm font-bold',
                      client.past7Days > 500 ? 'text-green-400' : 
                      client.past7Days > 0 ? 'text-[rgb(var(--foreground))]' : 
                      'text-red-400'
                    )}>
                      ${client.past7Days.toLocaleString()}
                    </div>
                  </div>
                </td>

                {/* Last Payment */}
                <td className="px-3 py-2 h-12">
                  <div className="flex items-center h-full">
                    <div className="text-sm text-[rgb(var(--foreground))] truncate">
                      {client.lastPayment || 'Nikdy'}
                    </div>
                  </div>
                </td>

                {/* Avg Payment */}
                <td className="px-3 py-2 h-12">
                  <div className="flex items-center h-full">
                    <div className="text-sm font-medium text-[rgb(var(--foreground))]">
                      ${client.avgPayment}
                    </div>
                  </div>
                </td>

                {/* Tags - Max 2 Side-by-Side, Clickable - SMALLER */}
                <td className="px-3 py-2 h-12">
                  <div className="flex items-center h-full">
                    <button
                      onClick={() => setTagModal({ isOpen: true, client })}
                      className="flex items-center space-x-1 hover:bg-[rgba(var(--velvet-gray),0.3)] rounded p-1 transition-all duration-200 w-full h-full"
                    >
                      <div className="flex items-center space-x-1 flex-1 min-w-0">
                        {client.tags.slice(0, 1).map((tag, index) => (
                          <span
                            key={index}
                            className={cn(
                              'inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium border truncate',
                              getTagColor(tag)
                            )}
                          >
                            {tag}
                          </span>
                        ))}
                        {client.tags.length > 1 && (
                          <span className="text-xs text-[rgb(var(--muted-foreground))] flex-shrink-0">
                            +{client.tags.length - 1}
                          </span>
                        )}
                      </div>
                      <Tag className="w-3 h-3 text-[rgb(var(--muted-foreground))] flex-shrink-0" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {clients.length === 0 && (
          <div className="text-center py-12">
            <div className="text-[rgb(var(--muted-foreground))] text-lg mb-2">No clients found</div>
            <div className="text-[rgb(var(--muted-foreground))] text-sm">Try adjusting your search or filters</div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {clients.length > 0 && (
        <div className="flex items-center justify-between p-4 border-t border-[rgba(var(--neon-orchid),0.2)]">
          {/* Rows per page selector */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-[rgb(var(--muted-foreground))]">Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
              className="px-2 py-1 rounded-md bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] text-xs focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Page info */}
          <div className="text-xs text-[rgb(var(--muted-foreground))]">
            Showing {Math.min((currentPage - 1) * rowsPerPage + 1, clients.length)} to {Math.min(currentPage * rowsPerPage, clients.length)} of {clients.length} entries
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

      {/* Summary Modal */}
      <SummaryModal 
        client={summaryModal.client}
        isOpen={summaryModal.isOpen}
        onClose={() => setSummaryModal({ isOpen: false, client: null })}
        onSave={(summary) => {
          if (summaryModal.client) {
            onUpdateSummary(summaryModal.client.id, summary);
            setSummaryModal({ isOpen: false, client: null });
          }
        }}
      />

      {/* Tag Editor Modal */}
      <TagEditorModal 
        client={tagModal.client}
        isOpen={tagModal.isOpen}
        onClose={() => setTagModal({ isOpen: false, client: null })}
        onSave={(tags) => {
          if (tagModal.client) {
            onUpdateTags(tagModal.client.id, tags);
          }
        }}
        allTags={allTags}
      />
    </div>
  );
}