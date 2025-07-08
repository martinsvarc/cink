import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
}

// GET - List all accounts with calculated income/expenses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'week';
    
    // Get all accounts
    const accounts = await prisma.account.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate date range for timeframe
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay() + 1); // Start of week (Monday)
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    }

    // Calculate income and expenses for each account
    const accountsWithMetrics = await Promise.all(
      accounts.map(async (account: Account) => {
        // Calculate income (money coming TO this account)
        const incomeResult = await prisma.transaction.aggregate({
          where: {
            toAccountId: account.id,
            type: 'income',
            timestamp: {
              gte: startDate
            }
          },
          _sum: {
            amount: true
          }
        });

        // Calculate expenses (money going FROM this account)
        const expenseResult = await prisma.transaction.aggregate({
          where: {
            fromAccountId: account.id,
            type: 'expense',
            timestamp: {
              gte: startDate
            }
          },
          _sum: {
            amount: true
          }
        });

        const income = incomeResult._sum.amount || 0;
        const expenses = expenseResult._sum.amount || 0;

        return {
          ...account,
          currentBalance: account.balance,
          income: {
            [timeframe]: income,
            today: timeframe === 'today' ? income : 0,
            week: timeframe === 'week' ? income : 0,
            month: timeframe === 'month' ? income : 0,
            custom: 0
          },
          expenses: {
            [timeframe]: expenses,
            today: timeframe === 'today' ? expenses : 0,
            week: timeframe === 'week' ? expenses : 0,
            month: timeframe === 'month' ? expenses : 0,
            custom: 0
          }
        };
      })
    );

    return NextResponse.json(accountsWithMetrics);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}

// POST - Create new account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, balance, currency = 'CZK' } = body;

    if (!name || !type || balance === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const account = await prisma.account.create({
      data: {
        name,
        type,
        balance: parseInt(balance),
        currency
      }
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error: any) {
    console.error('Error creating account:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Account name already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}

// PUT - Update account
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, balance, type, currency } = body;

    if (!id) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (balance !== undefined) updateData.balance = parseInt(balance);
    if (type !== undefined) updateData.type = type;
    if (currency !== undefined) updateData.currency = currency;

    const account = await prisma.account.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(account);
  } catch (error: any) {
    console.error('Error updating account:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 });
  }
}

// DELETE - Remove account
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    // Check if account has any transactions
    const transactionCount = await prisma.transaction.count({
      where: {
        OR: [
          { fromAccountId: id },
          { toAccountId: id }
        ]
      }
    });

    if (transactionCount > 0) {
      // Soft delete - mark as inactive instead of deleting
      await prisma.account.update({
        where: { id },
        data: { isActive: false }
      });
    } else {
      // Hard delete if no transactions
      await prisma.account.delete({
        where: { id }
      });
    }

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting account:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
} 