import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById, hasAnyUsers } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check if any users exist
    const usersExist = await hasAnyUsers();

    // Get auth token from cookie
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        usersExist,
        message: 'No authentication token found'
      });
    }

    // Verify token
    const payload = await verifyToken(token);
    
    if (!payload) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        usersExist,
        message: 'Invalid or expired token'
      });
    }

    // Get user data
    const user = await getUserById(payload.userId);
    
    if (!user) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        usersExist,
        message: 'User not found'
      });
    }

    // Check if user is still active
    if (user.status !== 'active') {
      return NextResponse.json({
        authenticated: false,
        user: null,
        usersExist,
        message: 'Account is inactive'
      });
    }
    
    // Return user data
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        viewOnlyAssigned: user.viewOnlyAssigned,
        chatter: user.chatter,
      },
      usersExist,
      message: 'Authentication valid'
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({
      authenticated: false,
      user: null,
      usersExist: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
} 