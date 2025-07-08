import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: params.id },
      include: {
        assignedChatter: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true
              }
            }
          }
        },
        tags: true,
        payments: {
          select: {
            id: true,
            amount: true,
            timestamp: true,
            category: true
          },
          orderBy: {
            timestamp: 'desc'
          }
        }
      }
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Calculate additional fields
    const totalCollected = client.payments.reduce((sum: number, payment: any) => sum + payment.amount, 0);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const past7DaysPayments = client.payments.filter(
      (payment: any) => payment.timestamp >= sevenDaysAgo
    );
    const past7Days = past7DaysPayments.reduce((sum: number, payment: any) => sum + payment.amount, 0);
    
    const lastPayment = client.payments[0];
    const lastPaymentDate = lastPayment 
      ? formatRelativeTime(lastPayment.timestamp)
      : 'Never';
    
    const avgPayment = client.payments.length > 0 
      ? Math.round(totalCollected / client.payments.length)
      : 0;

    // Get primary model (most recent payment's model)
    let primaryModel = null;
    if (client.payments[0]) {
      const recentPayment = await prisma.payment.findFirst({
        where: { clientId: client.id },
        include: { model: true },
        orderBy: { timestamp: 'desc' }
      });
      primaryModel = recentPayment?.model || null;
    }

    const paydayDay = client.payday || null;
    const paydayIndicator = paydayDay 
      ? `${paydayDay}${getOrdinalSuffix(paydayDay)} of month`
      : 'Not set';

    const enrichedClient = {
      id: client.id,
      name: client.name,
      email: null, // Not stored in current schema
      phone: null, // Not stored in current schema
      assignedOperator: client.assignedChatter?.user?.name || 'Unassigned',
      operatorId: client.assignedChatter?.user?.id || null,
      modelName: primaryModel?.name || null,
      modelId: primaryModel?.id || null,
      channel: client.channel || 'Unknown',
      summary: client.notes || '',
      payday: paydayDay,
      paydayIndicator,
      totalCollected,
      past7Days,
      lastPayment: lastPaymentDate,
      avgPayment,
      isVIP: false, // Default for now
      tags: client.tags.map((tag: any) => tag.label),
      status: client.statusIndicator || 'active',
      riskLevel: 'low', // Default for now
      createdAt: client.createdAt,
      updatedAt: client.createdAt, // Using createdAt as fallback
      profileUrl: client.profileUrl
    };

    return NextResponse.json(enrichedClient);
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    
    // Validate the data
    const allowedFields = ['name', 'email', 'phone', 'notes', 'payday', 'channel', 'status', 'riskLevel', 'isVIP', 'assignedChatterId'];
    const updateData: any = {};
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    // Handle summary field (map to notes)
    if (data.summary !== undefined) {
      updateData.notes = data.summary;
    }

    // Handle operatorId field (map to assignedChatterId)
    if (data.operatorId !== undefined) {
      updateData.assignedChatterId = data.operatorId;
    }

    // Validate payday if provided
    if (updateData.payday !== undefined) {
      const payday = parseInt(updateData.payday);
      if (isNaN(payday) || payday < 1 || payday > 31) {
        return NextResponse.json(
          { error: 'Payday must be a number between 1 and 31' },
          { status: 400 }
        );
      }
      // Store payday as integer (1-31)
      updateData.payday = payday;
    }

    // Update the client
    const updatedClient = await prisma.client.update({
      where: { id: params.id },
      data: updateData,
      include: {
        assignedChatter: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true
              }
            }
          }
        },
        tags: true,
        payments: {
          select: {
            id: true,
            amount: true,
            timestamp: true,
            category: true
          },
          orderBy: {
            timestamp: 'desc'
          }
        }
      }
    });

    // Calculate additional fields for response
    const totalCollected = updatedClient.payments.reduce((sum: number, payment: any) => sum + payment.amount, 0);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const past7DaysPayments = updatedClient.payments.filter(
      (payment: any) => payment.timestamp >= sevenDaysAgo
    );
    const past7Days = past7DaysPayments.reduce((sum: number, payment: any) => sum + payment.amount, 0);
    
    const lastPayment = updatedClient.payments[0];
    const lastPaymentDate = lastPayment 
      ? formatRelativeTime(lastPayment.timestamp)
      : 'Never';
    
    const avgPayment = updatedClient.payments.length > 0 
      ? Math.round(totalCollected / updatedClient.payments.length)
      : 0;

    // Get primary model (most recent payment's model)
    let primaryModel = null;
    if (updatedClient.payments[0]) {
      const recentPayment = await prisma.payment.findFirst({
        where: { clientId: updatedClient.id },
        include: { model: true },
        orderBy: { timestamp: 'desc' }
      });
      primaryModel = recentPayment?.model || null;
    }

    const paydayDay = updatedClient.payday || null;
    const paydayIndicator = paydayDay 
      ? `${paydayDay}${getOrdinalSuffix(paydayDay)} of month`
      : 'Not set';

    const enrichedClient = {
      id: updatedClient.id,
      name: updatedClient.name,
      email: null, // Not stored in current schema
      phone: null, // Not stored in current schema
      assignedOperator: updatedClient.assignedChatter?.user?.name || 'Unassigned',
      operatorId: updatedClient.assignedChatter?.user?.id || null,
      modelName: primaryModel?.name || null,
      modelId: primaryModel?.id || null,
      channel: updatedClient.channel || 'Unknown',
      summary: updatedClient.notes || '',
      payday: paydayDay,
      paydayIndicator,
      totalCollected,
      past7Days,
      lastPayment: lastPaymentDate,
      avgPayment,
      isVIP: false, // Default for now
      tags: updatedClient.tags.map((tag: any) => tag.label),
      status: updatedClient.statusIndicator || 'active',
      riskLevel: 'low', // Default for now
      createdAt: updatedClient.createdAt,
      updatedAt: updatedClient.createdAt, // Using createdAt as fallback
      profileUrl: updatedClient.profileUrl
    };

    return NextResponse.json(enrichedClient);
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  
  if (j === 1 && k !== 11) {
    return 'st';
  }
  if (j === 2 && k !== 12) {
    return 'nd';
  }
  if (j === 3 && k !== 13) {
    return 'rd';
  }
  return 'th';
} 