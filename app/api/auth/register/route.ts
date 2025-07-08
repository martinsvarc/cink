import { NextRequest, NextResponse } from 'next/server';
import { createUser, generateToken, hasAnyUsers } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, name, email } = body;

    // Validate required fields
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Validate username format (alphanumeric and underscores only)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: 'Username can only contain letters, numbers, and underscores' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Check if this is the first user (will become admin)
    const usersExist = await hasAnyUsers();
    
    // Create the user
    const user = await createUser({
      username,
      password,
      name,
      email,
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 409 }
      );
    }

    // Generate JWT token
    const token = await generateToken(user);

    // Create response with user data
    const response = NextResponse.json({
      success: true,
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
      message: usersExist 
        ? 'Account created successfully' 
        : 'Welcome! You are now the administrator of PINK™ Command Center',
      isFirstUser: !usersExist
    });

    // Set HTTP-only cookie with the JWT token
    console.log('Setting auth token cookie...');
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // Use 'lax' for development
      maxAge: 24 * 60 * 60, // 24 hours in seconds
      path: '/'
    });
    
    console.log('Registration successful, cookie set:', {
      tokenLength: token.length,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60
    });

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific database errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 