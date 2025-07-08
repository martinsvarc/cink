import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('🧪 Test API called');
    
    // Test basic database operations
    const result = await prisma.user.findMany();
    
    return NextResponse.json({
      success: true,
      message: 'API working!',
      userCount: result.length
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}