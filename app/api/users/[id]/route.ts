import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

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

// PATCH - Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get auth token and verify user
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { username, password, role, viewOnlyAssignedData, isActive, avatar } = body;
    const userId = params.id;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if username is being changed and if it's already taken
    if (username && username !== existingUser.username) {
      const usernameTaken = await prisma.user.findUnique({
        where: { username }
      });

      if (usernameTaken) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
      }
    }

    // Prepare update data
    const updateData: any = {};
    
    if (username) updateData.username = username;
    if (role) updateData.role = role;
    if (typeof viewOnlyAssignedData === 'boolean') updateData.viewOnlyAssigned = viewOnlyAssignedData;
    if (typeof isActive === 'boolean') updateData.status = isActive ? 'active' : 'inactive';
    if (avatar !== undefined) updateData.avatarUrl = avatar || null;

    // Hash password if provided
    if (password && password.trim() !== '') {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    // Transform the response to match UI expectations
    const transformedUser = {
      id: updatedUser.id,
      username: updatedUser.username,
      role: updatedUser.role,
      viewOnlyAssignedData: updatedUser.viewOnlyAssigned,
      accessToPages: getAccessToPages(updatedUser.role),
      lastLogin: updatedUser.lastLogin ? updatedUser.lastLogin.toISOString() : 'Never',
      isActive: updatedUser.status === 'active',
      avatar: updatedUser.avatarUrl
    };

    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get auth token and verify user
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = params.id;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent user from deleting themselves
    if (payload.userId === userId) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Check if user has a chatter profile (might have dependencies)
    const chatter = await prisma.chatter.findUnique({
      where: { userId }
    });

    if (chatter) {
      // Instead of hard delete, set status to inactive to preserve data integrity
      await prisma.user.update({
        where: { id: userId },
        data: { status: 'inactive' }
      });

      return NextResponse.json({ 
        message: 'User deactivated (has chatter profile with data)',
        deactivated: true 
      });
    } else {
      // Safe to delete if no chatter profile
      await prisma.user.delete({
        where: { id: userId }
      });

      return NextResponse.json({ 
        message: 'User deleted successfully',
        deleted: true 
      });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
} 