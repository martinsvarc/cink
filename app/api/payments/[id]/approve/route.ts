import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { recalculateCommissions } from '@/lib/payment-engine';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paymentId = params.id;
    const body = await request.json();
    const { action, adminId } = body; // action: 'cinklo' | 'hotovo' | 'uncinklo' | 'unhotovo'

    if (!paymentId || !action || !adminId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the payment
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { chatter: true }
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    let updateData: any = {};
    let activityType = '';

    // Handle different actions
    switch (action) {
      case 'cinklo':
        updateData = {
          cinklo: true,
          cinkoProcessedAt: new Date()
        };
        activityType = 'payment_approved_cinklo';
        break;
        
      case 'hotovo':
        updateData = {
          hotovo: true,
          hotovoProcessedAt: new Date()
        };
        activityType = 'payment_approved_hotovo';
        break;
        
      case 'uncinklo':
        updateData = {
          cinklo: false,
          cinkoProcessedAt: null,
          // Reset commission fields when unchecking cinklo
          commissionEarned: 0,
          dailyVolumeAtTime: 0,
          thresholdMet: false
        };
        activityType = 'payment_unapproved_cinklo';
        break;
        
      case 'unhotovo':
        updateData = {
          hotovo: false,
          hotovoProcessedAt: null
        };
        activityType = 'payment_unapproved_hotovo';
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Update payment
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: updateData,
      include: {
        chatter: { include: { user: true } },
        model: true,
        client: true
      }
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        paymentId: paymentId,
        createdBy: adminId,
        actionType: activityType,
        details: {
          action,
          amount: payment.amount,
          previousStatus: {
            cinklo: payment.cinklo,
            hotovo: payment.hotovo
          },
          newStatus: {
            cinklo: updateData.cinklo ?? payment.cinklo,
            hotovo: updateData.hotovo ?? payment.hotovo
          }
        }
      }
    });

    // Recalculate commissions if CINKLO status changed
    if (action === 'cinklo' || action === 'uncinklo') {
      try {
        const commissionResult = await recalculateCommissions(
          payment.chatterId,
          payment.timestamp
        );

        // Create notification for chatter
        await prisma.notification.create({
          data: {
            title: action === 'cinklo' ? 'Payment Approved!' : 'Payment Unapproved',
            body: action === 'cinklo' 
              ? `Your payment of ${payment.amount} CZK has been approved. ${commissionResult.thresholdMet ? `Commission: ${commissionResult.totalCommission} CZK` : 'No commission (threshold not met)'}` 
              : `Your payment of ${payment.amount} CZK has been unapproved.`,
            type: 'payment',
            userId: payment.chatter.userId,
            metadata: {
              paymentId: payment.id,
              amount: payment.amount,
              commissionEarned: commissionResult.thresholdMet ? commissionResult.totalCommission : 0,
              thresholdMet: commissionResult.thresholdMet
            }
          }
        });

        return NextResponse.json({
          success: true,
          payment: updatedPayment,
          commissionResult,
          message: `Payment ${action} successfully`
        });

      } catch (commissionError) {
        console.error('Commission calculation error:', commissionError);
        
        // Still return success for the approval, but note the commission error
        return NextResponse.json({
          success: true,
          payment: updatedPayment,
          warning: 'Payment approved but commission calculation failed',
          error: commissionError
        });
      }
    } else {
      // For hotovo/unhotovo, just return success
      return NextResponse.json({
        success: true,
        payment: updatedPayment,
        message: `Payment ${action} successfully`
      });
    }

  } catch (error) {
    console.error('Payment approval error:', error);
    return NextResponse.json(
      { error: 'Failed to process payment approval' },
      { status: 500 }
    );
  }
}

// Get payment approval status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paymentId = params.id;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        chatter: { include: { user: true } },
        model: true,
        client: true,
        activity: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      payment,
      approvalStatus: {
        cinklo: payment.cinklo,
        hotovo: payment.hotovo,
        cinkoProcessedAt: payment.cinkoProcessedAt,
        hotovoProcessedAt: payment.hotovoProcessedAt
      }
    });

  } catch (error) {
    console.error('Payment status fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment status' },
      { status: 500 }
    );
  }
}