'use client';

import { useState } from 'react';
import { StreamProgressBar } from '@/components/stream/stream-progress-bar';
import { AddPaymentForm } from '@/components/stream/add-payment-form';
import { PersonalEarningsCards } from '@/components/stream/personal-earnings-cards';
import { DailyLeaderboard } from '@/components/stream/daily-leaderboard';
import { MyTransactionsTable } from '@/components/stream/my-transactions-table';
import { WorkTimeTracker } from '@/components/stream/work-time-tracker';
import { 
  Zap,
  TrendingUp,
  Trophy,
  Receipt,
  DollarSign
} from 'lucide-react';

// Mock data for current setter
const currentSetter = {
  name: 'Sarah',
  todayRevenue: 8420,
  provisionRate: 20, // 20%
  nextMilestone: 10000
};

// Mock earnings data
const earningsData = {
  today: 8420,
  last7Days: 47680,
  last14Days: 89340,
  last30Days: 186750,
  availableForPayout: 35420,
  totalPaidOut: 124680
};

// Mock leaderboard data - Updated with operators instead of models
const leaderboardData = [
  { id: 1, name: 'Isabella', revenue: 12450, avatar: 'I' },
  { id: 2, name: 'Sophia', revenue: 10890, avatar: 'S' },
  { id: 3, name: 'Sarah', revenue: 8420, avatar: 'S', isCurrentUser: true },
  { id: 4, name: 'Luna', revenue: 7650, avatar: 'L' },
  { id: 5, name: 'Emma', revenue: 6890, avatar: 'E' },
  { id: 6, name: 'Maya', revenue: 5420, avatar: 'M' },
  { id: 7, name: 'Zoe', revenue: 4680, avatar: 'Z' },
  { id: 8, name: 'Alex', revenue: 3890, avatar: 'A' }
];

export default function Stream() {
  const [payments, setPayments] = useState<any[]>([
    {
      id: 1,
      date: new Date().toISOString(),
      amount: 1500,
      operator: 'Sarah',
      model: 'Isabella',
      client: 'Michael_VIP',
      channel: 'Isabella Fanvue',
      category: 'Premium Video',
      account: 'Revolut',
      notes: 'Custom content request',
      screenshot: 'screenshot1.jpg',
      approved: true
    },
    {
      id: 2,
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      amount: 750,
      operator: 'Sarah',
      model: 'Natalie',
      client: 'David_Elite',
      channel: 'Natalie Personal FB',
      category: 'Chat Session',
      account: 'Wise USD',
      notes: 'Extended conversation',
      screenshot: null,
      approved: false
    },
    {
      id: 3,
      date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      amount: 2000,
      operator: 'Sarah',
      model: 'Sophia',
      client: 'James_VIP',
      channel: 'Sophia Fanvue',
      category: 'Live Call',
      account: 'Paysafe',
      notes: 'Private session',
      screenshot: 'screenshot2.jpg',
      approved: true
    },
    {
      id: 4,
      date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      amount: 500,
      operator: 'Sarah',
      model: 'Luna',
      client: 'Peter_Premium',
      channel: 'Luna FB Page',
      category: 'Chat Session',
      account: 'Revolut',
      notes: 'Regular chat',
      screenshot: null,
      approved: true
    }
  ]);
  const [timeBonus, setTimeBonus] = useState(288); // 144 minutes * 2 CZK = 288 CZK

  const handleAddPayment = (paymentData: any) => {
    // Add new payment to the list
    const newPayment = {
      id: Date.now(),
      ...paymentData,
      date: new Date().toISOString(),
      operator: currentSetter.name,
      approved: false // New payments start as unapproved
    };
    setPayments(prev => [newPayment, ...prev]);
    
    // Update today's revenue (this would normally be handled by the backend)
    currentSetter.todayRevenue += paymentData.amount;
  };

  const handleTimeUpdate = (totalMinutes: number, bonusAmount: number) => {
    setTimeBonus(bonusAmount);
  };

  // Calculate total provision including time bonus
  const submissionProvision = Math.round(currentSetter.todayRevenue * (currentSetter.provisionRate / 100));
  const totalProvision = submissionProvision + timeBonus;

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden pb-20">
      <div className="w-full max-w-7xl mx-auto px-4 space-y-8">
        
        {/* PŘIDAT PLATBU - Top Section */}
        <section className="w-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[rgb(var(--foreground))] uppercase tracking-wider">
                  PŘIDAT PLATBU
                </h2>
                <p className="text-[rgb(var(--muted-foreground))] text-sm">
                  Nová platba od klienta • Rychlé zadání s inteligentní kalkulací
                </p>
              </div>
            </div>
          </div>
          
          <div className="w-full">
            <AddPaymentForm 
              onAddPayment={handleAddPayment}
              currentProvision={totalProvision}
            />
          </div>
        </section>

        {/* Progress Bar Section */}
        <section className="w-full">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[rgb(var(--foreground))] uppercase tracking-wider">
                REVENUE PROGRESS
              </h2>
              <p className="text-[rgb(var(--muted-foreground))] text-sm">
                Dnešní výkonnost a provizní systém
              </p>
            </div>
          </div>
          
          <StreamProgressBar 
            currentRevenue={currentSetter.todayRevenue}
            provisionRate={currentSetter.provisionRate}
            nextMilestone={currentSetter.nextMilestone}
            timeBonus={timeBonus}
          />
        </section>

        {/* Personal Earnings Overview */}
        <section className="w-full">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[rgb(var(--foreground))] uppercase tracking-wider">
                OSOBNÍ VÝDĚLKY
              </h2>
              <p className="text-[rgb(var(--muted-foreground))] text-sm">
                Tvoje výkonnost a provize • Přehled všech období
              </p>
            </div>
          </div>
          
          <PersonalEarningsCards earnings={earningsData} />
        </section>

        {/* Bottom Section - Fixed Layout */}
        <section className="w-full">
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Daily Leaderboard */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[rgb(var(--foreground))] uppercase tracking-wider">
                    ŽEBŘÍČEK
                  </h2>
                  <p className="text-[rgb(var(--muted-foreground))] text-sm">
                    Soutěž mezi operátory
                  </p>
                </div>
              </div>
              
              <div className="h-96">
                <DailyLeaderboard data={leaderboardData} />
              </div>
            </div>

            {/* My Transactions Table */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <Receipt className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[rgb(var(--foreground))] uppercase tracking-wider">
                      MOJE TRANSAKCE
                    </h2>
                    <p className="text-[rgb(var(--muted-foreground))] text-sm">
                      Přehled tvých plateb • Detailní historie
                    </p>
                  </div>
                </div>
                
                {/* Date Filter Component */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <input
                    type="date"
                    className="px-3 py-1.5 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] text-sm focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                  <span className="text-[rgb(var(--muted-foreground))] text-sm">–</span>
                  <input
                    type="date"
                    className="px-3 py-1.5 rounded-lg bg-[rgba(var(--velvet-gray),0.5)] border border-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--foreground))] text-sm focus:outline-none focus:border-[rgba(var(--neon-orchid),0.5)]"
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              
              <div className="glow-card p-0 overflow-hidden h-96">
                <MyTransactionsTable transactions={payments} />
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Fixed Timer in Bottom Right */}
      <WorkTimeTracker 
        onTimeUpdate={handleTimeUpdate} 
        showInline={false} 
      />
    </div>
  );
}