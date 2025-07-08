'use client';

import { useState, useMemo, useEffect } from 'react';
import { AccountCard } from '@/components/cashflow/account-card';
import { TransactionTabs } from '@/components/cashflow/transaction-tabs';
import { AddTransactionModal } from '@/components/cashflow/add-transaction-modal';
import { AddAccountModal } from '@/components/cashflow/add-account-modal';
import { RevenueSparkline } from '@/components/dashboard/revenue-sparkline';
import { FloatingControls } from '@/components/dashboard/floating-controls';
import { AIAnalyticsPanel } from '@/components/analytics/ai-analytics-panel';
import { 
  Wallet, 
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Download,
  DollarSign,
  CreditCard,
  Banknote,
  Users,
  Calculator,
  Plus
} from 'lucide-react';

// Account interface for TypeScript
interface Account {
  id: string;
  name: string;
  type: string;
  currentBalance: number;
  income: { today: number; week: number; month: number; custom: number };
  expenses: { today: number; week: number; month: number; custom: number };
}

// Mock transaction data - CONVERTED TO CZK
const incomeData = [
  {
    id: 1,
    date: '2024-01-15',
    amount: 11250, // 450 * 25
    operator: 'Isabella',
    model: 'Isabella',
    client: 'Michael_VIP',
    channel: 'Fanvue',
    category: 'Premium Video',
    toAccount: 'Wise USD',
    notes: 'Custom content request',
    screenshot: null
  },
  {
    id: 2,
    date: '2024-01-15',
    amount: 5000, // 200 * 25
    operator: 'Sophia',
    model: 'Natalie',
    client: 'David_Elite',
    channel: 'Facebook',
    category: 'Chat Session',
    toAccount: 'Crypto Wallet',
    notes: 'Extended conversation',
    screenshot: null
  },
  {
    id: 3,
    date: '2024-01-14',
    amount: 18750, // 750 * 25
    operator: 'Luna',
    model: 'Sophia',
    client: 'James_VIP',
    channel: 'WhatsApp',
    category: 'Live Call',
    toAccount: 'Wise USD',
    notes: 'Private session',
    screenshot: null
  }
];

const expenseData = [
  {
    id: 1,
    date: '2024-01-15',
    amount: 7475, // 299 * 25
    name: 'Adobe Creative Suite',
    category: 'Software',
    operator: 'Admin',
    fromAccount: 'Wise USD',
    notes: 'Monthly subscription'
  },
  {
    id: 2,
    date: '2024-01-14',
    amount: 30000, // 1200 * 25
    name: 'Office Rent',
    category: 'Rent',
    operator: 'Admin',
    fromAccount: 'Bank CZ',
    notes: 'January rent payment'
  },
  {
    id: 3,
    date: '2024-01-13',
    amount: 11250, // 450 * 25
    name: 'Marketing Campaign',
    category: 'Advertising',
    operator: 'Sarah',
    fromAccount: 'PayPal Business',
    notes: 'Facebook ads'
  }
];

const transferData = [
  {
    id: 1,
    date: '2024-01-15',
    amount: 125000, // 5000 * 25
    fromAccount: 'Wise USD',
    toAccount: 'Bank CZ',
    notes: 'Monthly transfer',
    operator: 'Admin'
  },
  {
    id: 2,
    date: '2024-01-14',
    amount: 62500, // 2500 * 25
    fromAccount: 'Crypto Wallet',
    toAccount: 'Wise USD',
    notes: 'Crypto conversion',
    operator: 'Admin'
  }
];

const payoutData = [
  {
    id: 1,
    date: '2024-01-15',
    amount: 80000, // 3200 * 25
    operator: 'Isabella',
    fromAccount: 'Wise USD',
    to: 'Isabella Personal',
    type: 'Weekly Payout',
    notes: 'Week 2 earnings payout',
    status: 'completed'
  },
  {
    id: 2,
    date: '2024-01-14',
    amount: 70000, // 2800 * 25
    operator: 'Sophia',
    fromAccount: 'Crypto Wallet',
    to: 'Sophia Personal',
    type: 'Weekly Payout',
    notes: 'Week 2 earnings payout',
    status: 'completed'
  },
  {
    id: 3,
    date: '2024-01-13',
    amount: 60000, // 2400 * 25
    operator: 'Luna',
    fromAccount: 'Bank CZ',
    to: 'Luna Personal',
    type: 'Weekly Payout',
    notes: 'Week 2 earnings payout',
    status: 'pending'
  }
];

// NEW: Wages data for chatters - CONVERTED TO CZK
const wagesData = [
  {
    id: 1,
    date: '2024-01-15',
    chatterName: 'Isabella',
    amountPaid: 80000, // 3200 * 25
    method: 'Bank Transfer',
    notes: 'Weekly payout - Week 2'
  },
  {
    id: 2,
    date: '2024-01-14',
    chatterName: 'Sophia',
    amountPaid: 70000, // 2800 * 25
    method: 'Crypto Transfer',
    notes: 'Weekly payout - Week 2'
  },
  {
    id: 3,
    date: '2024-01-13',
    chatterName: 'Luna',
    amountPaid: 60000, // 2400 * 25
    method: 'Bank Transfer',
    notes: 'Weekly payout - Week 2'
  },
  {
    id: 4,
    date: '2024-01-12',
    chatterName: 'Sarah',
    amountPaid: 45000, // 1800 * 25
    method: 'PayPal',
    notes: 'Weekly payout - Week 2'
  }
];

// NEW: Chatter earnings data for wages section - CONVERTED TO CZK
const chatterEarningsData = [
  {
    chatterName: 'Isabella',
    totalEarned: 390000, // 15600 * 25
    totalPaid: 320000, // 12800 * 25
    yetToPay: 70000, // 2800 * 25
    payoutDays: [7, 21]
  },
  {
    chatterName: 'Sophia',
    totalEarned: 330000, // 13200 * 25
    totalPaid: 280000, // 11200 * 25
    yetToPay: 50000, // 2000 * 25
    payoutDays: [14, 28]
  },
  {
    chatterName: 'Luna',
    totalEarned: 295000, // 11800 * 25
    totalPaid: 240000, // 9600 * 25
    yetToPay: 55000, // 2200 * 25
    payoutDays: [7, 21]
  },
  {
    chatterName: 'Sarah',
    totalEarned: 235000, // 9400 * 25
    totalPaid: 180000, // 7200 * 25
    yetToPay: 55000, // 2200 * 25
    payoutDays: [14]
  },
  {
    chatterName: 'Emma',
    totalEarned: 195000, // 7800 * 25
    totalPaid: 160000, // 6400 * 25
    yetToPay: 35000, // 1400 * 25
    payoutDays: [7]
  }
];

export default function Cashflow() {
  const [timeframe, setTimeframe] = useState('week');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedModel, setSelectedModel] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalType, setAddModalType] = useState<'income' | 'expense' | 'transfer' | 'payout'>('income');
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch accounts from API
  useEffect(() => {
    fetchAccounts();
  }, [timeframe]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/accounts?timeframe=${timeframe}`);
      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }
      const data = await response.json();
      setAccounts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [chatters, setChatters] = useState(chatterEarningsData);

  // Get timeframe label
  const getTimeframeLabel = () => {
    switch (timeframe) {
      case 'today':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'total':
        return 'Total Period';
      case 'custom':
        return 'Custom Range';
      default:
        return 'This Week';
    }
  };

  // Calculate totals
  const totalBalance = accounts.reduce((sum: number, account: Account) => sum + account.currentBalance, 0);
  const totalIncome = accounts.reduce((sum: number, account: Account) => sum + account.income[timeframe as keyof typeof account.income], 0);
  const totalExpenses = accounts.reduce((sum: number, account: Account) => sum + account.expenses[timeframe as keyof typeof account.expenses], 0);
  
  // NEW: Calculate profit as INCOME - EXPENSES
  const totalProfit = totalIncome - totalExpenses;
  
  // New calculated metrics
  const totalPayouts = payoutData.reduce((sum, payout) => sum + payout.amount, 0);

  // Calculate chatter wages totals
  const totalEarned = chatters.reduce((sum, chatter) => sum + chatter.totalEarned, 0);
  const totalPaid = chatters.reduce((sum, chatter) => sum + chatter.totalPaid, 0);
  const totalYetToPay = chatters.reduce((sum, chatter) => sum + chatter.yetToPay, 0);

  const handleAddTransaction = (type: 'income' | 'expense' | 'transfer' | 'payout') => {
    setAddModalType(type);
    setShowAddModal(true);
  };

  const handleExportCSV = () => {
    // Export functionality would be implemented here
    console.log('Exporting to CSV...');
  };

  const handleAddAccount = async (newAccount: any) => {
    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newAccount.name,
          type: newAccount.type,
          balance: newAccount.currentBalance,
          currency: 'CZK'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create account');
      }

      // Refresh accounts list
      await fetchAccounts();
      setShowAddAccountModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    }
  };

  const handleUpdateAccount = async (accountId: string, updatedBalance: number) => {
    try {
      const response = await fetch('/api/accounts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: accountId,
          balance: updatedBalance
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update account');
      }

      // Refresh accounts list
      await fetchAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update account');
    }
  };

  const handleUpdateChatterPayoutDays = (chatterName: string, payoutDays: number[]) => {
    setChatters((prev: any) => prev.map((chatter: any) => 
      chatter.chatterName === chatterName 
        ? { ...chatter, payoutDays }
        : chatter
    ));
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      const response = await fetch(`/api/accounts?id=${accountId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      // Refresh accounts list
      await fetchAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-gradient-primary">
            Cashflow Command Center
          </h1>
          <p className="text-[rgb(var(--muted-foreground))] text-lg">
            Financial intelligence matrix • Revenue & expense optimization
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] hover:bg-[rgba(var(--velvet-gray),0.7)] transition-all duration-200"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Export CSV</span>
          </button>
        </div>
      </div>

      {/* 1. TRANSACTION MANAGEMENT - MOVED TO TOP */}
      <TransactionTabs
        incomeData={incomeData}
        expenseData={expenseData}
        transferData={transferData}
        payoutData={payoutData}
        wagesData={wagesData}
        searchQuery={searchQuery}
        selectedOperator={selectedOperator}
        selectedCategory={selectedCategory}
        selectedModel={selectedModel}
        onAddTransaction={handleAddTransaction}
      />

      {/* 2. Summary Cards - NOW 5 CARDS WITH PAYOUTS ADDED */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {/* Total Income */}
        <div className="glow-card p-4 relative overflow-hidden min-h-[140px]">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-green-400 mb-2">
              {totalIncome.toLocaleString()} CZK
            </div>
            <div className="text-sm text-[rgb(var(--muted-foreground))] font-medium uppercase tracking-wide">
              Income ({getTimeframeLabel()})
            </div>
          </div>
          <RevenueSparkline variant="green" />
        </div>

        {/* EXPENSES Card */}
        <div className="glow-card p-4 relative overflow-hidden min-h-[140px]">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-red-400 mb-2">
              {totalExpenses.toLocaleString()} CZK
            </div>
            <div className="text-sm text-[rgb(var(--muted-foreground))] font-medium uppercase tracking-wide">
              Expenses ({getTimeframeLabel()})
            </div>
          </div>
          <RevenueSparkline variant="crimson" />
        </div>

        {/* PROFIT Card (INCOME - EXPENSES) - NEXT TO EXPENSES */}
        <div className="glow-card p-4 relative overflow-hidden min-h-[140px]">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-black mb-2 ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalProfit.toLocaleString()} CZK
            </div>
            <div className="text-sm text-[rgb(var(--muted-foreground))] font-medium uppercase tracking-wide">
              Profit ({getTimeframeLabel()})
            </div>
          </div>
          <RevenueSparkline variant="gold" />
        </div>

        {/* NEW: PAYOUTS Card - RIGHT NEXT TO PROFIT */}
        <div className="glow-card p-4 relative overflow-hidden min-h-[140px]">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Banknote className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-orange-400 mb-2">
              {totalPayouts.toLocaleString()} CZK
            </div>
            <div className="text-sm text-[rgb(var(--muted-foreground))] font-medium uppercase tracking-wide">
              Payouts ({getTimeframeLabel()})
            </div>
          </div>
          <RevenueSparkline variant="crimson" />
        </div>

        {/* Total Balance - MOVED TO FAR RIGHT */}
        <div className="glow-card p-4 relative overflow-hidden min-h-[140px]">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-gradient-primary mb-2">
              {totalBalance.toLocaleString()} CZK
            </div>
            <div className="text-sm text-[rgb(var(--muted-foreground))] font-medium uppercase tracking-wide">
              Total Balance
            </div>
          </div>
          <RevenueSparkline variant="primary" />
        </div>
      </div>

      {/* 3. Account Overview - UPDATED WITH EDIT FUNCTIONALITY */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[rgb(var(--foreground))] uppercase tracking-wider">
                ACCOUNT OVERVIEW
              </h2>
              <p className="text-[rgb(var(--muted-foreground))] text-sm">
                Real-time balance tracking • {getTimeframeLabel()} performance
              </p>
            </div>
          </div>
          
          {/* Add Account Button */}
          <button
            onClick={() => setShowAddAccountModal(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[rgb(var(--neon-orchid))] to-[rgb(var(--crimson))] text-white font-medium hover:scale-105 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Add Account</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-300 hover:text-red-200 underline"
            >
              Dismiss
            </button>
          </div>
        )}
        
        {/* Accounts Grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gradient-to-br from-[rgba(var(--charcoal),0.8)] to-[rgba(var(--charcoal),0.6)] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="w-16 h-16 text-[rgb(var(--muted-foreground))] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-2">No accounts yet</h3>
            <p className="text-[rgb(var(--muted-foreground))] mb-4">Get started by adding your first account</p>
            <button
              onClick={() => setShowAddAccountModal(true)}
              className="px-6 py-2 bg-gradient-to-r from-[rgb(var(--neon-orchid))] to-[rgb(var(--crimson))] text-white rounded-lg hover:scale-105 transition-all duration-200"
            >
              Add Account
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                timeframe={timeframe}
                onUpdateBalance={handleUpdateAccount}
                onDeleteAccount={handleDeleteAccount}
                editable={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* 4. NEW: Chatter's Wages Section - WITH EDITABLE PAYOUT DAYS */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[rgb(var(--foreground))] uppercase tracking-wider">
              VÝPLATY CHATTERŮ
            </h2>
            <p className="text-[rgb(var(--muted-foreground))] text-sm">
              Přehled výdělků a výplat • Finanční správa týmu
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="glow-card p-4 text-center">
            <div className="text-3xl font-black text-green-400 mb-2">
              {totalEarned.toLocaleString()} CZK
            </div>
            <div className="text-sm text-[rgb(var(--muted-foreground))] font-medium uppercase tracking-wide">
              Celkem Vydělali
            </div>
          </div>
          
          <div className="glow-card p-4 text-center">
            <div className="text-3xl font-black text-blue-400 mb-2">
              {totalPaid.toLocaleString()} CZK
            </div>
            <div className="text-sm text-[rgb(var(--muted-foreground))] font-medium uppercase tracking-wide">
              Celkem Vyplaceno
            </div>
          </div>
          
          <div className="glow-card p-4 text-center">
            <div className="text-3xl font-black text-orange-400 mb-2">
              {totalYetToPay.toLocaleString()} CZK
            </div>
            <div className="text-sm text-[rgb(var(--muted-foreground))] font-medium uppercase tracking-wide">
              Zbývá Vyplatit
            </div>
          </div>
        </div>

        {/* Chatter Wages Table - WITH EDITABLE PAYOUT DAYS */}
        <div className="glow-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[rgba(var(--velvet-gray),0.3)] border-b border-[rgba(var(--neon-orchid),0.2)]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                    Chatter
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                    Celkem Vydělali
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                    Celkem Vyplaceno
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                    Zbývá Vyplatit
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-[rgb(var(--foreground))] uppercase tracking-wider">
                    Dny Výplaty
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(var(--neon-orchid),0.1)]">
                {chatters.map((chatter, index) => (
                  <tr key={index} className="hover:bg-[rgba(var(--neon-orchid),0.05)] transition-colors duration-200">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                          {chatter.chatterName.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-[rgb(var(--foreground))]">{chatter.chatterName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-bold text-green-400">{chatter.totalEarned.toLocaleString()} CZK</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-bold text-blue-400">{chatter.totalPaid.toLocaleString()} CZK</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-bold text-orange-400">{chatter.yetToPay.toLocaleString()} CZK</span>
                    </td>
                    <td className="px-4 py-3">
                      <ChatterPayoutDaysSelector 
                        chatterName={chatter.chatterName}
                        selectedDays={chatter.payoutDays}
                        onChange={(days) => handleUpdateChatterPayoutDays(chatter.chatterName, days)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Transaction Modal - WITH SMOOTH TRANSITIONS */}
      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        type={addModalType}
        accounts={accounts}
      />

      {/* Add Account Modal */}
      <AddAccountModal
        isOpen={showAddAccountModal}
        onClose={() => setShowAddAccountModal(false)}
        onAddAccount={handleAddAccount}
      />

      {/* AI Analytics Panel */}
      <AIAnalyticsPanel 
        isOpen={showAIPanel}
        onClose={() => setShowAIPanel(false)}
      />

      {/* Dashboard-style Floating Controls with Search */}
      <FloatingControls 
        currentTimeframe={timeframe}
        onTimeframeChange={setTimeframe}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        selectedOperator={selectedOperator}
        onOperatorChange={setSelectedOperator}
        onAskAnalytics={() => setShowAIPanel(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        enableSearch={true}
      />
    </div>
  );
}

// Chatter Payout Days Selector Component
function ChatterPayoutDaysSelector({ 
  chatterName, 
  selectedDays, 
  onChange 
}: { 
  chatterName: string; 
  selectedDays: number[]; 
  onChange: (days: number[]) => void 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const availableDays = [1, 7, 14, 21, 28];

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter(d => d !== day));
    } else {
      onChange([...selectedDays, day].sort((a, b) => a - b));
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-center px-3 py-1.5 rounded-lg bg-[rgba(var(--velvet-gray),0.3)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] hover:bg-[rgba(var(--velvet-gray),0.5)] transition-all duration-200"
      >
        <div className="flex flex-wrap gap-1 justify-center">
          {selectedDays.length > 0 ? (
            selectedDays.map(day => (
              <span 
                key={day} 
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--neon-orchid))] border border-[rgba(var(--neon-orchid),0.3)]"
              >
                {day}
              </span>
            ))
          ) : (
            <span className="text-sm text-[rgb(var(--muted-foreground))]">Vybrat dny</span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-lg bg-[rgba(var(--charcoal),0.95)] border border-[rgba(var(--neon-orchid),0.2)] backdrop-blur-sm shadow-xl p-2 animate-in fade-in-50 slide-in-from-top-5 duration-200">
          <div className="text-xs text-[rgb(var(--muted-foreground))] mb-2">Dny výplaty:</div>
          <div className="flex flex-wrap gap-2">
            {availableDays.map(day => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  selectedDays.includes(day)
                    ? 'bg-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--neon-orchid))] border border-[rgba(var(--neon-orchid),0.3)]'
                    : 'bg-[rgba(var(--velvet-gray),0.3)] text-[rgb(var(--muted-foreground))] border border-[rgba(var(--velvet-gray),0.5)] hover:bg-[rgba(var(--neon-orchid),0.1)]'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className="px-2 py-1 text-xs text-[rgb(var(--neon-orchid))] hover:text-[rgb(var(--foreground))]"
            >
              Hotovo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}