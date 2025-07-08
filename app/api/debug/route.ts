import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const test = searchParams.get('test') || 'default';
    
    console.log('🔍 Debug API called with test:', test);
    
    return NextResponse.json({ 
      success: true,
      message: 'Debug API working',
      test: test,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Debug API error:', error);
    
    return NextResponse.json({ 
      error: 'Debug API failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 