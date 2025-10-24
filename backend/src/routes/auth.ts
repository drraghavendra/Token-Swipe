import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import { MPCWalletService } from '../services/MPCWalletService';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const oauthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const mpcWalletService = new MPCWalletService();

router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    
    const ticket = await oauthClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const userId = `google_${payload.sub}`;
    
    // Create or get user wallet
    let wallet = await mpcWalletService.getWallet(userId);
    if (!wallet) {
      wallet = await mpcWalletService.createWallet(userId);
    }

    // In a real app, you'd create a session token
    const sessionToken = Buffer.from(`${userId}:${Date.now()}`).toString('base64');

    res.json({
      user: {
        id: userId,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      },
      wallet: {
        address: wallet.address,
        chainId: wallet.chainId,
      },
      sessionToken,
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: (req as any).user });
});

router.post('/logout', authMiddleware, (req, res) => {
  // In a real app, you'd invalidate the session token
  res.json({ message: 'Logged out successfully' });
});

export { router as authRouter };