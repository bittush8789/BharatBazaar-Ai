import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/client';

export const authServiceRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'bharatbazaar_secret_key_2025';

// Mock OTP storage in-memory for active sessions
const activeOtps = new Map<string, { otp: string; expiresAt: number }>();

// POST /api/auth/send-otp
authServiceRouter.post('/send-otp', async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        service: 'auth-service',
        success: false,
        message: 'Invalid 10-digit Indian phone number',
      });
    }

    // Generate 6-digit OTP (e.g. 123456 or random for dev/testing)
    const generatedOtp = phone === '9876543210' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    activeOtps.set(phone, {
      otp: generatedOtp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    });

    res.json({
      service: 'auth-service',
      success: true,
      message: `OTP sent successfully to +91 ${phone}`,
      otp: generatedOtp, // Included for dev testing
    });
  } catch (error: any) {
    console.error('[AuthService] send-otp error:', error);
    res.status(500).json({ service: 'auth-service', success: false, message: error.message });
  }
});

// POST /api/auth/verify-otp
authServiceRouter.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { phone, otp, name } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ service: 'auth-service', success: false, message: 'Phone and OTP are required' });
    }

    const stored = activeOtps.get(phone);
    const isValidDemo = otp === '123456' || otp === '4321';
    const isMatchingStored = stored && stored.otp === otp && stored.expiresAt > Date.now();

    if (!isValidDemo && !isMatchingStored) {
      return res.status(401).json({ service: 'auth-service', success: false, message: 'Invalid or expired OTP' });
    }

    activeOtps.delete(phone);

    // Find or create user in PostgreSQL
    let user = await db.user.findUnique({
      where: { phone },
      include: { addresses: true },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          phone,
          name: name || `Customer ${phone.slice(-4)}`,
          email: `${phone}@bharatbazaar.in`,
          gender: 'other',
          memberSince: 'March 2025',
          addresses: {
            create: {
              street: 'Main Market Road',
              city: 'New Delhi',
              state: 'Delhi',
              pincode: '110001',
              isDefault: true,
            },
          },
        },
        include: { addresses: true },
      });
    }

    const token = jwt.sign(
      { userId: user.id, phone: user.phone, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const defaultAddress = user.addresses[0] || null;

    res.json({
      service: 'auth-service',
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        gender: user.gender,
        isLoggedIn: true,
        memberSince: user.memberSince,
        savedAddress: defaultAddress
          ? {
              street: defaultAddress.street,
              city: defaultAddress.city,
              state: defaultAddress.state,
              pincode: defaultAddress.pincode,
            }
          : undefined,
      },
    });
  } catch (error: any) {
    console.error('[AuthService] verify-otp error:', error);
    res.status(500).json({ service: 'auth-service', success: false, message: error.message });
  }
});

// POST /api/auth/login-email
authServiceRouter.post('/login-email', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ service: 'auth-service', success: false, message: 'Email is required' });
    }

    let user = await db.user.findFirst({
      where: { email },
      include: { addresses: true },
    });

    if (!user) {
      // Create user for seamless demo login
      const cleanPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
      user = await db.user.create({
        data: {
          phone: cleanPhone,
          name: email.split('@')[0],
          email,
          gender: 'female',
          memberSince: 'March 2025',
        },
        include: { addresses: true },
      });
    }

    const token = jwt.sign(
      { userId: user.id, phone: user.phone, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const defaultAddress = user.addresses[0] || null;

    res.json({
      service: 'auth-service',
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        gender: user.gender,
        isLoggedIn: true,
        memberSince: user.memberSince,
        savedAddress: defaultAddress
          ? {
              street: defaultAddress.street,
              city: defaultAddress.city,
              state: defaultAddress.state,
              pincode: defaultAddress.pincode,
            }
          : undefined,
      },
    });
  } catch (error: any) {
    console.error('[AuthService] login-email error:', error);
    res.status(500).json({ service: 'auth-service', success: false, message: error.message });
  }
});

// POST /api/auth/google - Authenticate user via Google Sign-In
authServiceRouter.post('/google', async (req: Request, res: Response) => {
  try {
    const { email, name, avatar, googleId } = req.body;
    if (!email) {
      return res.status(400).json({ service: 'auth-service', success: false, message: 'Google email is required' });
    }

    let user = await db.user.findFirst({
      where: {
        OR: [
          { email },
          ...(googleId ? [{ googleId }] : []),
        ],
      },
      include: { addresses: true },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          name: name || email.split('@')[0],
          email,
          avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          googleId: googleId || `goog_${Date.now()}`,
          phone: `+91-GGL-${Math.floor(1000 + Math.random() * 9000)}`,
          gender: 'other',
          memberSince: 'March 2025',
          addresses: {
            create: {
              street: '42, Cyber City Hub',
              city: 'Gurugram',
              state: 'Haryana',
              pincode: '122002',
              isDefault: true,
            },
          },
        },
        include: { addresses: true },
      });
    } else if (avatar && !user.avatar) {
      user = await db.user.update({
        where: { id: user.id },
        data: { avatar },
        include: { addresses: true },
      });
    }

    const token = jwt.sign(
      { userId: user.id, phone: user.phone || 'Google User', name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const defaultAddress = user.addresses[0] || null;

    res.json({
      service: 'auth-service',
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone || '',
        email: user.email,
        avatar: user.avatar,
        gender: user.gender,
        isLoggedIn: true,
        memberSince: user.memberSince,
        savedAddress: defaultAddress
          ? {
              street: defaultAddress.street,
              city: defaultAddress.city,
              state: defaultAddress.state,
              pincode: defaultAddress.pincode,
            }
          : undefined,
      },
    });
  } catch (error: any) {
    console.error('[AuthService] google login error:', error);
    res.status(500).json({ service: 'auth-service', success: false, message: error.message });
  }
});

// GET /api/auth/me
authServiceRouter.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ service: 'auth-service', success: false, message: 'Missing token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      include: { addresses: true },
    });

    if (!user) {
      return res.status(404).json({ service: 'auth-service', success: false, message: 'User not found' });
    }

    const defaultAddress = user.addresses[0] || null;

    res.json({
      service: 'auth-service',
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        gender: user.gender,
        isLoggedIn: true,
        memberSince: user.memberSince,
        savedAddress: defaultAddress
          ? {
              street: defaultAddress.street,
              city: defaultAddress.city,
              state: defaultAddress.state,
              pincode: defaultAddress.pincode,
            }
          : undefined,
      },
    });
  } catch (error: any) {
    res.status(401).json({ service: 'auth-service', success: false, message: 'Invalid token' });
  }
});

// PATCH /api/auth/profile
authServiceRouter.patch('/profile', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ service: 'auth-service', success: false, message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const { name, email, gender, savedAddress } = req.body;

    const user = await db.user.update({
      where: { id: decoded.userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(gender && { gender }),
      },
      include: { addresses: true },
    });

    if (savedAddress) {
      if (user.addresses.length > 0) {
        await db.address.update({
          where: { id: user.addresses[0].id },
          data: {
            street: savedAddress.street,
            city: savedAddress.city,
            state: savedAddress.state,
            pincode: savedAddress.pincode,
          },
        });
      } else {
        await db.address.create({
          data: {
            userId: user.id,
            street: savedAddress.street,
            city: savedAddress.city,
            state: savedAddress.state,
            pincode: savedAddress.pincode,
            isDefault: true,
          },
        });
      }
    }

    const updated = await db.user.findUnique({
      where: { id: user.id },
      include: { addresses: true },
    });

    const addr = updated?.addresses[0] || null;

    res.json({
      service: 'auth-service',
      success: true,
      user: {
        id: updated?.id,
        name: updated?.name,
        phone: updated?.phone,
        email: updated?.email,
        gender: updated?.gender,
        isLoggedIn: true,
        memberSince: updated?.memberSince,
        savedAddress: addr
          ? {
              street: addr.street,
              city: addr.city,
              state: addr.state,
              pincode: addr.pincode,
            }
          : undefined,
      },
    });
  } catch (error: any) {
    console.error('[AuthService] profile update error:', error);
    res.status(500).json({ service: 'auth-service', success: false, message: error.message });
  }
});
