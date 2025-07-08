import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Transform the data to match UI expectations
    const transformedUsers = users.map((user: any) => ({
      id: user.id,
      username: user.username,
      role: user.role,
      viewOnlyAssignedData: user.viewOnlyAssigned,
      accessToPages: getAccessToPages(user.role), // Helper function to determine pages based on role
      lastLogin: user.lastLogin ? user.lastLogin.toISOString() : 'Never',
      isActive: user.status === 'active',
      avatar: user.avatarUrl
    }));

    return NextResponse.json(transformedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, role, viewOnlyAssignedData, isActive, avatar } = body;

    // Validate required fields
    if (!username || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username,
        passwordHash,
        role,
        viewOnlyAssigned: viewOnlyAssignedData,
        status: isActive ? 'active' : 'inactive',
        avatarUrl: avatar || null
      }
    });

    // Transform the response to match UI expectations
    const transformedUser = {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
      viewOnlyAssignedData: newUser.viewOnlyAssigned,
      accessToPages: getAccessToPages(newUser.role),
      lastLogin: 'Never',
      isActive: newUser.status === 'active',
      avatar: newUser.avatarUrl
    };

    return NextResponse.json(transformedUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

// Helper function to determine page access based on role
function getAccessToPages(role: string): string[] {
  switch (role.toLowerCase()) {
    case 'admin':
      return ['Dashboard', 'Analytics', 'Cashflow', 'Clients', 'Models', 'Stream', 'Admin'];
    case 'setter':
      return ['Dashboard', 'Stream', 'Clients', 'Models'];
    default:
      return ['Dashboard'];
  }
} 