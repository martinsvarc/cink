import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// JWT secret - in production, this should be a secure environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'pink-empire-suite-secret-key';
const JWT_SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

export interface AuthUser {
  id: string;
  username: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  role: string;
  status: string;
  viewOnlyAssigned: boolean;
  chatter?: {
    id: string;
    isActive: boolean;
  } | null;
}

export interface TokenPayload {
  userId: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
  [key: string]: any; // Add index signature for jose compatibility
}

// Hash password using bcrypt
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Verify password against hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate JWT token
export async function generateToken(user: AuthUser): Promise<string> {
  const payload: TokenPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
  };

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET_KEY);
}

// Verify JWT token
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_KEY);
    return payload as TokenPayload;
  } catch (error: unknown) {
    console.error('JWT verification failed:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

// Get user by username
export async function getUserByUsername(username: string): Promise<AuthUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        chatter: {
          select: {
            id: true,
            isActive: true,
          }
        }
      }
    });

    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      name: user.name || undefined,
      email: user.email || undefined,
      avatarUrl: user.avatarUrl || undefined,
      role: user.role,
      status: user.status,
      viewOnlyAssigned: user.viewOnlyAssigned,
      chatter: user.chatter,
    };
  } catch (error) {
    console.error('Error fetching user by username:', error);
    return null;
  }
}

// Get user by ID
export async function getUserById(id: string): Promise<AuthUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        chatter: {
          select: {
            id: true,
            isActive: true,
          }
        }
      }
    });

    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      name: user.name || undefined,
      email: user.email || undefined,
      avatarUrl: user.avatarUrl || undefined,
      role: user.role,
      status: user.status,
      viewOnlyAssigned: user.viewOnlyAssigned,
      chatter: user.chatter,
    };
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
}

// Create new user
export async function createUser(userData: {
  username: string;
  password: string;
  name?: string;
  email?: string;
  role?: string;
}): Promise<AuthUser | null> {
  try {
    // Check if any users exist to determine if this should be an admin
    const userCount = await prisma.user.count();
    const isFirstUser = userCount === 0;

    const hashedPassword = await hashPassword(userData.password);

    const user = await prisma.user.create({
      data: {
        username: userData.username,
        passwordHash: hashedPassword,
        name: userData.name,
        email: userData.email,
        role: isFirstUser ? 'admin' : (userData.role || 'chatter'),
        status: 'active',
        viewOnlyAssigned: isFirstUser ? false : true, // Admin sees all, others only assigned
      },
      include: {
        chatter: {
          select: {
            id: true,
            isActive: true,
          }
        }
      }
    });

    // Update lastLogin
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    return {
      id: user.id,
      username: user.username,
      name: user.name || undefined,
      email: user.email || undefined,
      avatarUrl: user.avatarUrl || undefined,
      role: user.role,
      status: user.status,
      viewOnlyAssigned: user.viewOnlyAssigned,
      chatter: user.chatter,
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

// Authenticate user
export async function authenticateUser(username: string, password: string): Promise<AuthUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        chatter: {
          select: {
            id: true,
            isActive: true,
          }
        }
      }
    });

    if (!user) return null;

    // Check if user is active
    if (user.status !== 'active') return null;

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) return null;

    // Update lastLogin
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    return {
      id: user.id,
      username: user.username,
      name: user.name || undefined,
      email: user.email || undefined,
      avatarUrl: user.avatarUrl || undefined,
      role: user.role,
      status: user.status,
      viewOnlyAssigned: user.viewOnlyAssigned,
      chatter: user.chatter,
    };
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
}

// Check if any users exist (for initial setup)
export async function hasAnyUsers(): Promise<boolean> {
  try {
    const count = await prisma.user.count();
    return count > 0;
  } catch (error) {
    console.error('Error checking user count:', error);
    return false;
  }
}

// Check if user has admin privileges
export function isAdmin(user: AuthUser): boolean {
  return user.role === 'admin';
}

// Check if user can perform admin actions
export function canPerformAdminActions(user: AuthUser): boolean {
  return isAdmin(user);
}

// Check if user can view all data or only assigned data
export function canViewAllData(user: AuthUser): boolean {
  return isAdmin(user) || !user.viewOnlyAssigned;
} 