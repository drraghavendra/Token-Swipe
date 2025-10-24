import { CoinbaseMPCSdk } from '@coinbase/coinbase-mpc-sdk';
import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { base } from 'viem/chains';
import { config } from '../config';
import { RedisService } from './RedisService';

export interface Wallet {
  address: string;
  walletId: string;
  publicKey: string;
  chainId: number;
}

export interface Transaction {
  to: string;
  value: string;
  data: string;
  chainId: number;
}

export class MPCWalletService {
  private mpcSdk: CoinbaseMPCSdk;
  private publicClient;
  private redis: RedisService;

  constructor() {
    this.mpcSdk = new CoinbaseMPCSdk({
      apiKey: config.coinbaseMpc.apiKey,
      network: config.coinbaseMpc.network,
    });

    this.publicClient = createPublicClient({
      chain: base,
      transport: http(config.rpc.base),
    });

    this.redis = new RedisService();
  }

  /**
   * Create a new MPC wallet for user
   * SECURITY: User controls their funds through MPC threshold signatures
   */
  async createWallet(userId: string): Promise<Wallet> {
    try {
      const wallet = await this.mpcSdk.createWallet({
        userId,
        metadata: {
          app: 'token-swipe',
          createdAt: new Date().toISOString(),
        },
      });

      const userWallet: Wallet = {
        address: wallet.address,
        walletId: wallet.id,
        publicKey: wallet.publicKey,
        chainId: base.id,
      };

      // Store wallet info in Redis with user ID as key
      await this.redis.set(
        `wallet:${userId}`,
        JSON.stringify(userWallet),
        60 * 60 * 24 // 24 hours TTL
      );

      console.log(`Created MPC wallet for user ${userId}: ${wallet.address}`);
      
      return userWallet;
    } catch (error) {
      console.error('Failed to create MPC wallet:', error);
      throw new Error('MPC wallet creation failed');
    }
  }

  /**
   * Get user's wallet
   */
  async getWallet(userId: string): Promise<Wallet | null> {
    const cached = await this.redis.get(`wallet:${userId}`);
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  }

  /**
   * Sign transaction using MPC
   * SECURITY: Requires user's local key share + platform key share
   */
  async signTransaction(
    walletId: string, 
    transaction: Transaction
  ): Promise<{ signedTransaction: string; hash: string }> {
    try {
      const signedTx = await this.mpcSdk.signTransaction({
        walletId,
        transaction: {
          to: transaction.to,
          value: transaction.value,
          data: transaction.data,
          chainId: transaction.chainId,
        },
      });

      // Estimate gas
      const gasEstimate = await this.publicClient.estimateGas({
        to: transaction.to as `0x${string}`,
        value: parseEther(transaction.value),
        data: transaction.data as `0x${string}`,
      });

      return {
        signedTransaction: signedTx.rawTransaction,
        hash: signedTx.hash,
      };
    } catch (error) {
      console.error('Failed to sign transaction:', error);
      throw new Error('Transaction signing failed');
    }
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(address: string): Promise<bigint> {
    return await this.publicClient.getBalance({
      address: address as `0x${string}`,
    });
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(address: string, limit: number = 50) {
    // This would integrate with Covalent or Moralis for transaction history
    return [];
  }

  /**
   * Export wallet recovery phrase (user-controlled)
   */
  async exportRecoveryPhrase(walletId: string, userId: string): Promise<string> {
    // In a real implementation, this would generate recovery phrases
    // For MPC, this might involve key shard export
    throw new Error('Recovery phrase export not implemented in this demo');
  }
}