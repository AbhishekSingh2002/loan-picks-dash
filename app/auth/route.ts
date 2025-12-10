// =============================================================================
// WHY: Authentication route handler
// Handles login, logout, and session management
// Uses JWT tokens for stateless authentication
// In production, integrate with NextAuth.js or similar
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sign, verify } from 'jsonwebtoken';

// =============================================================================
// WHY: Validation schemas for auth requests
// =============================================================================

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

const SignupSchema = LoginSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters')
});

// =============================================================================
// WHY: JWT secret (in production, use environment variable)
// =============================================================================

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// =============================================================================
// WHY: POST /auth/login - User login
// Validates credentials and returns JWT token
// =============================================================================

export async function POST(request: NextRequest) {
  const { pathname } = new URL(request.url);

  // WHY: Route to appropriate handler based on path
  if (pathname === '/auth/login') {
    return handleLogin(request);
  } else if (pathname === '/auth/signup') {
    return handleSignup(request);
  } else if (pathname === '/auth/logout') {
    return handleLogout();
  } else if (pathname === '/auth/me') {
    return handleGetCurrentUser(request);
  }

  return NextResponse.json(
    { success: false, error: 'Route not found' },
    { status: 404 }
  );
}

// =============================================================================
// WHY: Handle login request
// =============================================================================

async function handleLogin(request: NextRequest) {
  try {
    const body = await request.json();
    
    // WHY: Validate request body
    const validatedData = LoginSchema.parse(body);

    // WHY: In production, verify credentials against database
    // For demo, accept any valid email/password
    // const user = await db.user.findUnique({ where: { email: validatedData.email } });
    // if (!user || !await bcrypt.compare(validatedData.password, user.passwordHash)) {
    //   return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    // }

    // Mock user for demonstration
    const user = {
      id: 'user-123',
      email: validatedData.email,
      name: 'Demo User',
      createdAt: new Date().toISOString()
    };

    // WHY: Generate JWT token
    const token = sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // WHY: Return token and user data
    const response = NextResponse.json({
      success: true,
      user,
      token
    });

    // WHY: Set HTTP-only cookie for additional security
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}

// =============================================================================
// WHY: Handle signup request
// =============================================================================

async function handleSignup(request: NextRequest) {
  try {
    const body = await request.json();
    
    // WHY: Validate request body
    const validatedData = SignupSchema.parse(body);

    // WHY: In production, check if user exists and hash password
    // const existingUser = await db.user.findUnique({ where: { email: validatedData.email } });
    // if (existingUser) {
    //   return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    // }
    // const passwordHash = await bcrypt.hash(validatedData.password, 10);
    // const user = await db.user.create({ data: { ...validatedData, passwordHash } });

    // Mock user for demonstration
    const user = {
      id: `user-${Date.now()}`,
      email: validatedData.email,
      name: validatedData.name,
      createdAt: new Date().toISOString()
    };

    // WHY: Generate JWT token
    const token = sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // WHY: Return token and user data
    const response = NextResponse.json({
      success: true,
      user,
      token
    });

    // WHY: Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      );
    }

    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, error: 'Signup failed' },
      { status: 500 }
    );
  }
}

// =============================================================================
// WHY: Handle logout request
// =============================================================================

async function handleLogout() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully'
  });

  // WHY: Clear auth cookie
  response.cookies.delete('auth-token');

  return response;
}

// =============================================================================
// WHY: Get current user from token
// =============================================================================

async function handleGetCurrentUser(request: NextRequest) {
  try {
    // WHY: Get token from cookie or Authorization header
    const token = request.cookies.get('auth-token')?.value ||
                  request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // WHY: Verify and decode token
    const decoded = verify(token, JWT_SECRET) as any;

    // WHY: In production, fetch fresh user data from database
    // const user = await db.user.findUnique({ where: { id: decoded.userId } });

    return NextResponse.json({
      success: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name
      }
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid token' },
      { status: 401 }
    );
  }
}

// =============================================================================
// WHY: GET /auth/me - Get current user
// =============================================================================

export async function GET(request: NextRequest) {
  return handleGetCurrentUser(request);
}

// Moved to lib/auth-utils.ts