/**
 * Wallet Resource Actions
 * 
 * Operations for managing BEAM wallets including balance checks,
 * transfers, and token management.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { createBeamClient } from '../../transport/beamClient';
import { weiToBeam, beamToWei, formatBalance } from '../../utils/unitConverter';
import { ethers } from 'ethers';

export const walletOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['wallet'],
			},
		},
		options: [
			{
				name: 'Get BEAM Balance',
				value: 'getBalance',
				description: 'Get native BEAM balance for an address',
				action: 'Get BEAM balance',
			},
			{
				name: 'Get Wrapped BEAM Balance',
				value: 'getWrappedBalance',
				description: 'Get wrapped BEAM (WBEAM) balance',
				action: 'Get wrapped BEAM balance',
			},
			{
				name: 'Get Token Balances',
				value: 'getTokenBalances',
				description: 'Get all token balances for an address',
				action: 'Get token balances',
			},
			{
				name: 'Get Wallet NFTs',
				value: 'getWalletNfts',
				description: 'Get all NFTs owned by an address',
				action: 'Get wallet NFTs',
			},
			{
				name: 'Transfer BEAM',
				value: 'transferBeam',
				description: 'Transfer native BEAM to another address',
				action: 'Transfer BEAM',
			},
			{
				name: 'Transfer Token',
				value: 'transferToken',
				description: 'Transfer ERC20 token to another address',
				action: 'Transfer token',
			},
			{
				name: 'Validate Address',
				value: 'validateAddress',
				description: 'Check if an address is valid',
				action: 'Validate address',
			},
			{
				name: 'Get Transaction History',
				value: 'getTransactionHistory',
				description: 'Get transaction history for an address',
				action: 'Get transaction history',
			},
			{
				name: 'Wrap BEAM',
				value: 'wrapBeam',
				description: 'Wrap BEAM to WBEAM',
				action: 'Wrap BEAM',
			},
			{
				name: 'Unwrap BEAM',
				value: 'unwrapBeam',
				description: 'Unwrap WBEAM to BEAM',
				action: 'Unwrap BEAM',
			},
		],
		default: 'getBalance',
	},
];

export const walletFields: INodeProperties[] = [
	// Address field for most operations
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['wallet'],
				operation: [
					'getBalance',
					'getWrappedBalance',
					'getTokenBalances',
					'getWalletNfts',
					'validateAddress',
					'getTransactionHistory',
				],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'The wallet address to query',
	},
	// Transfer BEAM fields
	{
		displayName: 'To Address',
		name: 'toAddress',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['wallet'],
				operation: ['transferBeam', 'transferToken'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'The recipient address',
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['wallet'],
				operation: ['transferBeam', 'wrapBeam', 'unwrapBeam'],
			},
		},
		default: '',
		placeholder: '1.5',
		description: 'Amount in BEAM',
	},
	// Token transfer fields
	{
		displayName: 'Token Address',
		name: 'tokenAddress',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['wallet'],
				operation: ['transferToken'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'The ERC20 token contract address',
	},
	{
		displayName: 'Token Amount',
		name: 'tokenAmount',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['wallet'],
				operation: ['transferToken'],
			},
		},
		default: '',
		placeholder: '100',
		description: 'Amount of tokens to transfer',
	},
	// Additional options
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['wallet'],
				operation: ['transferBeam', 'transferToken', 'wrapBeam', 'unwrapBeam'],
			},
		},
		options: [
			{
				displayName: 'Gas Limit',
				name: 'gasLimit',
				type: 'number',
				default: 21000,
				description: 'Maximum gas to use for the transaction',
			},
			{
				displayName: 'Max Fee Per Gas (Gwei)',
				name: 'maxFeePerGas',
				type: 'number',
				default: 30,
				description: 'Maximum fee per gas in gwei',
			},
			{
				displayName: 'Wait for Confirmation',
				name: 'waitForConfirmation',
				type: 'boolean',
				default: true,
				description: 'Whether to wait for the transaction to be confirmed',
			},
		],
	},
];

export async function executeWallet(
	this: IExecuteFunctions,
	index: number,
	operation: string
): Promise<IDataObject> {
	const credentials = await this.getCredentials('beamNetwork');
	
	const client = createBeamClient({
		network: credentials.network as string,
		rpcUrl: credentials.rpcUrl as string,
		privateKey: credentials.privateKey as string,
		chainId: credentials.chainId as number,
	});

	let result: IDataObject = {};

	switch (operation) {
		case 'getBalance': {
			const address = this.getNodeParameter('address', index) as string;
			
			if (!client.isValidAddress(address)) {
				throw new Error('Invalid address format');
			}
			
			const balance = await client.getBalance(address);
			result = {
				address,
				balance: balance.toString(),
				balanceFormatted: weiToBeam(balance),
				symbol: 'BEAM',
			};
			break;
		}

		case 'getWrappedBalance': {
			const address = this.getNodeParameter('address', index) as string;
			
			if (!client.isValidAddress(address)) {
				throw new Error('Invalid address format');
			}
			
			const balance = await client.getWrappedBeamBalance(address);
			result = {
				address,
				balance: balance.toString(),
				balanceFormatted: weiToBeam(balance),
				symbol: 'WBEAM',
			};
			break;
		}

		case 'getTokenBalances': {
			const address = this.getNodeParameter('address', index) as string;
			
			if (!client.isValidAddress(address)) {
				throw new Error('Invalid address format');
			}
			
			// Get native and wrapped BEAM balances
			const [beamBalance, wbeamBalance] = await Promise.all([
				client.getBalance(address),
				client.getWrappedBeamBalance(address),
			]);
			
			result = {
				address,
				balances: [
					{
						token: 'BEAM',
						balance: beamBalance.toString(),
						balanceFormatted: weiToBeam(beamBalance),
						isNative: true,
					},
					{
						token: 'WBEAM',
						balance: wbeamBalance.toString(),
						balanceFormatted: weiToBeam(wbeamBalance),
						isNative: false,
					},
				],
			};
			break;
		}

		case 'transferBeam': {
			const toAddress = this.getNodeParameter('toAddress', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			const options = this.getNodeParameter('options', index, {}) as {
				gasLimit?: number;
				maxFeePerGas?: number;
				waitForConfirmation?: boolean;
			};
			
			if (!client.isValidAddress(toAddress)) {
				throw new Error('Invalid recipient address format');
			}
			
			const amountWei = beamToWei(amount);
			
			const tx = await client.transferBeam(toAddress, amountWei, {
				gasLimit: options.gasLimit ? BigInt(options.gasLimit) : undefined,
				maxFeePerGas: options.maxFeePerGas 
					? ethers.parseUnits(options.maxFeePerGas.toString(), 'gwei') 
					: undefined,
			});
			
			if (options.waitForConfirmation !== false) {
				const receipt = await tx.wait();
				result = {
					txHash: tx.hash,
					from: tx.from,
					to: toAddress,
					amount,
					amountWei: amountWei.toString(),
					status: receipt?.status === 1 ? 'success' : 'failed',
					blockNumber: receipt?.blockNumber,
					gasUsed: receipt?.gasUsed?.toString(),
				};
			} else {
				result = {
					txHash: tx.hash,
					from: tx.from,
					to: toAddress,
					amount,
					amountWei: amountWei.toString(),
					status: 'pending',
				};
			}
			break;
		}

		case 'transferToken': {
			const toAddress = this.getNodeParameter('toAddress', index) as string;
			const tokenAddress = this.getNodeParameter('tokenAddress', index) as string;
			const tokenAmount = this.getNodeParameter('tokenAmount', index) as string;
			const options = this.getNodeParameter('options', index, {}) as {
				gasLimit?: number;
				maxFeePerGas?: number;
				waitForConfirmation?: boolean;
			};
			
			if (!client.isValidAddress(toAddress)) {
				throw new Error('Invalid recipient address format');
			}
			if (!client.isValidAddress(tokenAddress)) {
				throw new Error('Invalid token address format');
			}
			
			// Get token decimals
			const tokenInfo = await client.getTokenInfo(tokenAddress);
			const amountWei = ethers.parseUnits(tokenAmount, tokenInfo.decimals);
			
			const tx = await client.transferToken(tokenAddress, toAddress, amountWei, {
				gasLimit: options.gasLimit ? BigInt(options.gasLimit) : undefined,
				maxFeePerGas: options.maxFeePerGas 
					? ethers.parseUnits(options.maxFeePerGas.toString(), 'gwei') 
					: undefined,
			});
			
			if (options.waitForConfirmation !== false) {
				const receipt = await tx.wait();
				result = {
					txHash: tx.hash,
					from: tx.from,
					to: toAddress,
					tokenAddress,
					tokenSymbol: tokenInfo.symbol,
					amount: tokenAmount,
					status: receipt?.status === 1 ? 'success' : 'failed',
					blockNumber: receipt?.blockNumber,
					gasUsed: receipt?.gasUsed?.toString(),
				};
			} else {
				result = {
					txHash: tx.hash,
					from: tx.from,
					to: toAddress,
					tokenAddress,
					tokenSymbol: tokenInfo.symbol,
					amount: tokenAmount,
					status: 'pending',
				};
			}
			break;
		}

		case 'validateAddress': {
			const address = this.getNodeParameter('address', index) as string;
			const isValid = client.isValidAddress(address);
			
			result = {
				address,
				isValid,
				checksumAddress: isValid ? client.getChecksumAddress(address) : null,
			};
			break;
		}

		case 'wrapBeam': {
			const amount = this.getNodeParameter('amount', index) as string;
			const options = this.getNodeParameter('options', index, {}) as {
				gasLimit?: number;
				maxFeePerGas?: number;
				waitForConfirmation?: boolean;
			};
			
			const amountWei = beamToWei(amount);
			
			const tx = await client.wrapBeam(amountWei, {
				gasLimit: options.gasLimit ? BigInt(options.gasLimit) : undefined,
				maxFeePerGas: options.maxFeePerGas 
					? ethers.parseUnits(options.maxFeePerGas.toString(), 'gwei') 
					: undefined,
			});
			
			if (options.waitForConfirmation !== false) {
				const receipt = await tx.wait();
				result = {
					txHash: tx.hash,
					amount,
					amountWei: amountWei.toString(),
					status: receipt?.status === 1 ? 'success' : 'failed',
					blockNumber: receipt?.blockNumber,
				};
			} else {
				result = {
					txHash: tx.hash,
					amount,
					amountWei: amountWei.toString(),
					status: 'pending',
				};
			}
			break;
		}

		case 'unwrapBeam': {
			const amount = this.getNodeParameter('amount', index) as string;
			const options = this.getNodeParameter('options', index, {}) as {
				gasLimit?: number;
				maxFeePerGas?: number;
				waitForConfirmation?: boolean;
			};
			
			const amountWei = beamToWei(amount);
			
			const tx = await client.unwrapBeam(amountWei, {
				gasLimit: options.gasLimit ? BigInt(options.gasLimit) : undefined,
				maxFeePerGas: options.maxFeePerGas 
					? ethers.parseUnits(options.maxFeePerGas.toString(), 'gwei') 
					: undefined,
			});
			
			if (options.waitForConfirmation !== false) {
				const receipt = await tx.wait();
				result = {
					txHash: tx.hash,
					amount,
					amountWei: amountWei.toString(),
					status: receipt?.status === 1 ? 'success' : 'failed',
					blockNumber: receipt?.blockNumber,
				};
			} else {
				result = {
					txHash: tx.hash,
					amount,
					amountWei: amountWei.toString(),
					status: 'pending',
				};
			}
			break;
		}

		case 'getWalletNfts':
		case 'getTransactionHistory': {
			// These would typically use an indexer API
			const address = this.getNodeParameter('address', index) as string;
			result = {
				address,
				message: 'This operation requires an indexer API. Use the Beam API credentials for full functionality.',
			};
			break;
		}

		default:
			throw new Error(`Unsupported operation: ${operation}`);
	}

	return { ...result, timestamp: new Date().toISOString() };
}
