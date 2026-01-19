/**
 * Bridge Client for Beam
 * 
 * Handles cross-chain bridging operations between Beam
 * and other supported chains (Ethereum, Avalanche, Arbitrum).
 */

import { ethers, Contract, TransactionResponse } from 'ethers';
import { BeamClient } from './beamClient';
import { BRIDGE_ABI } from '../constants/contracts';
import { BRIDGE_CHAINS } from '../constants/networks';

export interface BridgeInfo {
	sourceChain: string;
	destChain: string;
	supportedTokens: string[];
	minAmount: string;
	maxAmount: string;
	estimatedTime: number; // in minutes
}

export interface BridgeTransaction {
	id: string;
	sourceChain: number;
	destChain: number;
	sender: string;
	recipient: string;
	token: string;
	amount: string;
	status: 'pending' | 'processing' | 'completed' | 'failed';
	sourceTxHash: string;
	destTxHash?: string;
	initiatedAt: number;
	completedAt?: number;
}

export interface BridgeFeeEstimate {
	baseFee: string;
	gasFee: string;
	totalFee: string;
	currency: string;
}

export class BridgeClient {
	private beamClient: BeamClient;

	constructor(beamClient: BeamClient) {
		this.beamClient = beamClient;
	}

	/**
	 * Get bridge information
	 */
	async getBridgeInfo(): Promise<{
		supportedChains: typeof BRIDGE_CHAINS;
		beamChainId: number;
	}> {
		const chainId = await this.beamClient.getChainId();
		return {
			supportedChains: BRIDGE_CHAINS,
			beamChainId: Number(chainId),
		};
	}

	/**
	 * Get supported assets for bridging
	 */
	async getSupportedAssets(destChainId: number): Promise<Array<{
		symbol: string;
		address: string;
		decimals: number;
		minAmount: string;
		maxAmount: string;
	}>> {
		// This would typically call a bridge API
		// For now, return common bridgeable assets
		return [
			{
				symbol: 'BEAM',
				address: '0x0000000000000000000000000000000000000000',
				decimals: 18,
				minAmount: '1000000000000000000', // 1 BEAM
				maxAmount: '1000000000000000000000000', // 1M BEAM
			},
			{
				symbol: 'USDC',
				address: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',
				decimals: 6,
				minAmount: '1000000', // 1 USDC
				maxAmount: '1000000000000', // 1M USDC
			},
		];
	}

	/**
	 * Estimate bridge fee
	 */
	async estimateBridgeFee(
		destChainId: number,
		tokenAddress: string,
		amount: string
	): Promise<BridgeFeeEstimate> {
		const contracts = this.beamClient.getContracts();
		const provider = this.beamClient.getProvider();
		
		const bridge = new Contract(contracts.bridgeMainnet, BRIDGE_ABI, provider);
		
		try {
			const fee = await bridge.getBridgeFee(destChainId, amount);
			
			// Get current gas price for gas fee estimate
			const feeData = await provider.getFeeData();
			const estimatedGas = BigInt(200000); // Approximate bridge gas
			const gasFee = (feeData.gasPrice || BigInt(0)) * estimatedGas;
			
			return {
				baseFee: fee.toString(),
				gasFee: gasFee.toString(),
				totalFee: (BigInt(fee) + gasFee).toString(),
				currency: 'BEAM',
			};
		} catch (error) {
			// Return default estimate if contract call fails
			return {
				baseFee: '100000000000000000', // 0.1 BEAM
				gasFee: '50000000000000000', // 0.05 BEAM
				totalFee: '150000000000000000', // 0.15 BEAM
				currency: 'BEAM',
			};
		}
	}

	/**
	 * Bridge tokens to another chain
	 */
	async bridgeToChain(
		destChainId: number,
		recipient: string,
		amount: string,
		tokenAddress?: string
	): Promise<TransactionResponse> {
		const contracts = this.beamClient.getContracts();
		const signer = this.beamClient.getSigner();
		
		const bridge = new Contract(contracts.bridgeMainnet, BRIDGE_ABI, signer);
		
		// Get fee estimate
		const feeEstimate = await this.estimateBridgeFee(destChainId, tokenAddress || '', amount);
		
		// Execute bridge transaction
		if (!tokenAddress || tokenAddress === '0x0000000000000000000000000000000000000000') {
			// Bridge native BEAM
			return bridge.bridgeToChain(destChainId, recipient, amount, {
				value: BigInt(amount) + BigInt(feeEstimate.totalFee),
				gasLimit: BigInt(250000),
			});
		} else {
			// Bridge ERC20 token
			// First approve the bridge contract
			const token = new Contract(tokenAddress, [
				'function approve(address spender, uint256 amount) returns (bool)',
			], signer);
			
			await token.approve(contracts.bridgeMainnet, amount);
			
			return bridge.bridgeToChain(destChainId, recipient, amount, {
				value: BigInt(feeEstimate.totalFee),
				gasLimit: BigInt(300000),
			});
		}
	}

	/**
	 * Get pending bridge transactions
	 */
	async getPendingBridges(userAddress: string): Promise<BridgeTransaction[]> {
		const contracts = this.beamClient.getContracts();
		const provider = this.beamClient.getProvider();
		
		const bridge = new Contract(contracts.bridgeMainnet, BRIDGE_ABI, provider);
		
		try {
			const pending = await bridge.getPendingBridges(userAddress);
			
			return pending.map((tx: {
				id: bigint;
				amount: bigint;
				destChainId: bigint;
				timestamp: bigint;
				status: number;
			}) => ({
				id: tx.id.toString(),
				sourceChain: 4337, // Beam
				destChain: Number(tx.destChainId),
				sender: userAddress,
				recipient: userAddress,
				token: 'BEAM',
				amount: tx.amount.toString(),
				status: this.mapBridgeStatus(tx.status),
				sourceTxHash: '',
				initiatedAt: Number(tx.timestamp),
			}));
		} catch (error) {
			return [];
		}
	}

	/**
	 * Get bridge transaction status
	 */
	async getBridgeStatus(bridgeId: string): Promise<BridgeTransaction | null> {
		// This would typically call a bridge API
		// Implementation depends on the specific bridge infrastructure
		return null;
	}

	/**
	 * Get bridge history for a user
	 */
	async getBridgeHistory(
		userAddress: string,
		limit: number = 10
	): Promise<BridgeTransaction[]> {
		// This would typically call a bridge API or indexer
		// For now, return pending bridges
		return this.getPendingBridges(userAddress);
	}

	/**
	 * Map numeric status to string
	 */
	private mapBridgeStatus(status: number): 'pending' | 'processing' | 'completed' | 'failed' {
		switch (status) {
			case 0: return 'pending';
			case 1: return 'processing';
			case 2: return 'completed';
			case 3: return 'failed';
			default: return 'pending';
		}
	}

	/**
	 * Get chain name from ID
	 */
	getChainName(chainId: number): string {
		for (const [name, config] of Object.entries(BRIDGE_CHAINS)) {
			if (config.chainId === chainId) {
				return config.name;
			}
		}
		if (chainId === 4337) return 'Beam Mainnet';
		if (chainId === 13337) return 'Beam Testnet';
		return `Chain ${chainId}`;
	}

	/**
	 * Check if chain is supported
	 */
	isChainSupported(chainId: number): boolean {
		return Object.values(BRIDGE_CHAINS).some(c => c.chainId === chainId);
	}
}

/**
 * Create bridge client from Beam client
 */
export function createBridgeClient(beamClient: BeamClient): BridgeClient {
	return new BridgeClient(beamClient);
}
