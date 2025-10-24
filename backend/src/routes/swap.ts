import express from 'express';
import { MPCWalletService } from '../services/MPCWalletService';
import { DEXAggregatorService } from '../services/DEXAggregatorService';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const mpcWalletService = new MPCWalletService();
const dexService = new DEXAggregatorService();

router.post('/quote', authMiddleware, async (req, res) => {
  try {
    const { tokenIn, tokenOut, amountIn, slippage } = req.body;
    
    const quote = await dexService.getBestQuote(tokenIn, tokenOut, amountIn, slippage);
    
    res.json(quote);
  } catch (error) {
    console.error('Quote error:', error);
    res.status(500).json({ error: 'Failed to get quote' });
  }
});

router.post('/execute', authMiddleware, async (req, res) => {
  try {
    const { tokenIn, tokenOut, amountIn, slippage } = req.body;
    const userId = (req as any).user.id;
    
    // Get user's wallet
    const wallet = await mpcWalletService.getWallet(userId);
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // Get best quote
    const quote = await dexService.getBestQuote(tokenIn, tokenOut, amountIn, slippage);
    
    // Prepare transaction
    const transaction = {
      to: '0x...', // TokenSwipeRouter address
      value: amountIn,
      data: '0x...', // Encoded swap call
      chainId: wallet.chainId,
    };

    // Sign transaction with MPC
    const signedTx = await mpcWalletService.signTransaction(wallet.walletId, transaction);
    
    // In a real implementation, you'd broadcast the transaction here
    // For now, return the signed transaction
    
    res.json({
      transactionHash: signedTx.hash,
      quote,
      status: 'signed'
    });
  } catch (error) {
    console.error('Swap execution error:', error);
    res.status(500).json({ error: 'Swap execution failed' });
  }
});

export { router as swapRouter };