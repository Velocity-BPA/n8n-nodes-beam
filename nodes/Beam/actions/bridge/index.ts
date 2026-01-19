import type { INodeProperties, IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { createBridgeClient, BridgeTransaction } from '../../transport/bridgeClient';
import { createBeamClient } from '../../transport/beamClient';
import { BRIDGE_CHAINS } from '../../constants/networks';

export const bridgeOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['bridge'],
		},
	},
	options: [
		{
			name: 'Get Bridge Info',
			value: 'getBridgeInfo',
			description: 'Get information about the Beam bridge',
			action: 'Get information about the beam bridge',
		},
		{
			name: 'Bridge from Ethereum',
			value: 'bridgeFromEthereum',
			description: 'Bridge assets from Ethereum to Beam',
			action: 'Bridge assets from ethereum to beam',
		},
		{
			name: 'Bridge to Ethereum',
			value: 'bridgeToEthereum',
			description: 'Bridge assets from Beam to Ethereum',
			action: 'Bridge assets from beam to ethereum',
		},
		{
			name: 'Bridge from Avalanche',
			value: 'bridgeFromAvalanche',
			description: 'Bridge assets from Avalanche to Beam',
			action: 'Bridge assets from avalanche to beam',
		},
		{
			name: 'Get Bridge Status',
			value: 'getBridgeStatus',
			description: 'Check status of a bridge transaction',
			action: 'Check status of a bridge transaction',
		},
		{
			name: 'Get Pending Bridges',
			value: 'getPendingBridges',
			description: 'Get pending bridge transactions for an address',
			action: 'Get pending bridge transactions',
		},
		{
			name: 'Get Bridge History',
			value: 'getBridgeHistory',
			description: 'Get bridge transaction history',
			action: 'Get bridge transaction history',
		},
		{
			name: 'Get Supported Assets',
			value: 'getSupportedAssets',
			description: 'Get list of bridgeable assets',
			action: 'Get list of bridgeable assets',
		},
		{
			name: 'Estimate Bridge Fee',
			value: 'estimateBridgeFee',
			description: 'Estimate fees for a bridge transaction',
			action: 'Estimate fees for a bridge transaction',
		},
	],
	default: 'getBridgeInfo',
};

export const bridgeFields: INodeProperties[] = [
	{
		displayName: 'Source Chain',
		name: 'sourceChain',
		type: 'options',
		required: true,
		default: 'ethereum',
		description: 'The chain to bridge from',
		displayOptions: {
			show: {
				resource: ['bridge'],
				operation: ['bridgeFromEthereum', 'bridgeFromAvalanche', 'estimateBridgeFee'],
			},
		},
		options: [
			{ name: 'Ethereum', value: 'ethereum' },
			{ name: 'Avalanche C-Chain', value: 'avalanche' },
			{ name: 'Arbitrum', value: 'arbitrum' },
		],
	},
	{
		displayName: 'Destination Chain',
		name: 'destinationChain',
		type: 'options',
		required: true,
		default: 'ethereum',
		description: 'The chain to bridge to',
		displayOptions: {
			show: {
				resource: ['bridge'],
				operation: ['bridgeToEthereum'],
			},
		},
		options: [
			{ name: 'Ethereum', value: 'ethereum' },
			{ name: 'Avalanche C-Chain', value: 'avalanche' },
			{ name: 'Arbitrum', value: 'arbitrum' },
		],
	},
	{
		displayName: 'Asset',
		name: 'asset',
		type: 'options',
		required: true,
		default: 'BEAM',
		description: 'The asset to bridge',
		displayOptions: {
			show: {
				resource: ['bridge'],
				operation: ['bridgeFromEthereum', 'bridgeToEthereum', 'bridgeFromAvalanche', 'estimateBridgeFee'],
			},
		},
		options: [
			{ name: 'BEAM (Native)', value: 'BEAM' },
			{ name: 'USDC', value: 'USDC' },
			{ name: 'USDT', value: 'USDT' },
			{ name: 'WETH', value: 'WETH' },
			{ name: 'Custom Token', value: 'custom' },
		],
	},
	{
		displayName: 'Token Address',
		name: 'tokenAddress',
		type: 'string',
		default: '',
		required: true,
		description: 'The contract address of the custom token',
		displayOptions: {
			show: {
				resource: ['bridge'],
				operation: ['bridgeFromEthereum', 'bridgeToEthereum', 'bridgeFromAvalanche'],
				asset: ['custom'],
			},
		},
		placeholder: '0x...',
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		required: true,
		default: '',
		description: 'Amount to bridge (in token units)',
		displayOptions: {
			show: {
				resource: ['bridge'],
				operation: ['bridgeFromEthereum', 'bridgeToEthereum', 'bridgeFromAvalanche', 'estimateBridgeFee'],
			},
		},
		placeholder: '1.0',
	},
	{
		displayName: 'Recipient Address',
		name: 'recipientAddress',
		type: 'string',
		default: '',
		description: 'Destination wallet address (leave empty to use same as sender)',
		displayOptions: {
			show: {
				resource: ['bridge'],
				operation: ['bridgeFromEthereum', 'bridgeToEthereum', 'bridgeFromAvalanche'],
			},
		},
		placeholder: '0x...',
	},
	{
		displayName: 'Transaction Hash',
		name: 'transactionHash',
		type: 'string',
		required: true,
		default: '',
		description: 'The transaction hash to check status for',
		displayOptions: {
			show: {
				resource: ['bridge'],
				operation: ['getBridgeStatus'],
			},
		},
		placeholder: '0x...',
	},
	{
		displayName: 'Wallet Address',
		name: 'walletAddress',
		type: 'string',
		required: true,
		default: '',
		description: 'The wallet address to get bridge history for',
		displayOptions: {
			show: {
				resource: ['bridge'],
				operation: ['getPendingBridges', 'getBridgeHistory'],
			},
		},
		placeholder: '0x...',
	},
	{
		displayName: 'Options',
		name: 'historyOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['bridge'],
				operation: ['getBridgeHistory'],
			},
		},
		options: [
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 20,
				description: 'Maximum number of transactions to return',
			},
			{
				displayName: 'Chain Filter',
				name: 'chain',
				type: 'options',
				default: 'all',
				options: [
					{ name: 'All Chains', value: 'all' },
					{ name: 'Ethereum', value: 'ethereum' },
					{ name: 'Avalanche', value: 'avalanche' },
					{ name: 'Arbitrum', value: 'arbitrum' },
				],
			},
			{
				displayName: 'Direction',
				name: 'direction',
				type: 'options',
				default: 'all',
				options: [
					{ name: 'All', value: 'all' },
					{ name: 'Incoming (to Beam)', value: 'incoming' },
					{ name: 'Outgoing (from Beam)', value: 'outgoing' },
				],
			},
		],
	},
	{
		displayName: 'Transaction Options',
		name: 'txOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['bridge'],
				operation: ['bridgeFromEthereum', 'bridgeToEthereum', 'bridgeFromAvalanche'],
			},
		},
		options: [
			{
				displayName: 'Gas Limit',
				name: 'gasLimit',
				type: 'number',
				default: 300000,
				description: 'Maximum gas to use for the transaction',
			},
			{
				displayName: 'Wait for Confirmation',
				name: 'waitForConfirmation',
				type: 'boolean',
				default: true,
				description: 'Whether to wait for transaction confirmation',
			},
		],
	},
];

export async function executeBridge(
	this: IExecuteFunctions,
	index: number,
	operation: string,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('beamNetwork') as {
		network: string;
		rpcUrl?: string;
		privateKey?: string;
		chainId?: number;
	};
	
	const beamClient = createBeamClient(credentials);
	const bridgeClient = createBridgeClient(beamClient);

	switch (operation) {
		case 'getBridgeInfo': {
			const bridgeInfo = await bridgeClient.getBridgeInfo();
			const supportedChains = Object.entries(BRIDGE_CHAINS).map(([key, config]) => ({
				id: key,
				name: config.name,
				chainId: config.chainId,
			}));

			return {
				...bridgeInfo,
				supportedChains,
				timestamp: new Date().toISOString(),
			};
		}

		case 'bridgeFromEthereum':
		case 'bridgeFromAvalanche': {
			const sourceChain = this.getNodeParameter('sourceChain', index) as string;
			const asset = this.getNodeParameter('asset', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			const recipientAddress = this.getNodeParameter('recipientAddress', index, '') as string;

			let tokenAddress = '';
			if (asset === 'custom') {
				tokenAddress = this.getNodeParameter('tokenAddress', index) as string;
			}

			const chainId = BRIDGE_CHAINS[sourceChain as keyof typeof BRIDGE_CHAINS]?.chainId || 1;
			const walletAddress = await beamClient.getAddress();

			const result = await bridgeClient.bridgeToChain(
				chainId,
				recipientAddress || walletAddress,
				amount,
				asset === 'custom' ? tokenAddress : undefined,
			);

			return {
				transactionHash: result.hash,
				sourceChain,
				destinationChain: 'beam',
				asset: asset === 'custom' ? tokenAddress : asset,
				amount,
				recipient: recipientAddress || walletAddress,
				status: 'initiated',
				estimatedTime: '10-30 minutes',
				timestamp: new Date().toISOString(),
			};
		}

		case 'bridgeToEthereum': {
			const destinationChain = this.getNodeParameter('destinationChain', index) as string;
			const asset = this.getNodeParameter('asset', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			const recipientAddress = this.getNodeParameter('recipientAddress', index, '') as string;

			let tokenAddress = '';
			if (asset === 'custom') {
				tokenAddress = this.getNodeParameter('tokenAddress', index) as string;
			}

			const chainId = BRIDGE_CHAINS[destinationChain as keyof typeof BRIDGE_CHAINS]?.chainId || 1;
			const walletAddress = await beamClient.getAddress();

			const result = await bridgeClient.bridgeToChain(
				chainId,
				recipientAddress || walletAddress,
				amount,
				asset === 'custom' ? tokenAddress : undefined,
			);

			return {
				transactionHash: result.hash,
				sourceChain: 'beam',
				destinationChain,
				asset: asset === 'custom' ? tokenAddress : asset,
				amount,
				recipient: recipientAddress || walletAddress,
				status: 'initiated',
				estimatedTime: '10-30 minutes',
				timestamp: new Date().toISOString(),
			};
		}

		case 'getBridgeStatus': {
			const transactionHash = this.getNodeParameter('transactionHash', index) as string;
			const status = await bridgeClient.getBridgeStatus(transactionHash);

			return {
				transactionHash,
				...status,
				timestamp: new Date().toISOString(),
			};
		}

		case 'getPendingBridges': {
			const walletAddress = this.getNodeParameter('walletAddress', index) as string;
			const pendingBridges = await bridgeClient.getPendingBridges(walletAddress);

			return {
				walletAddress,
				count: pendingBridges.length,
				pendingBridges,
				timestamp: new Date().toISOString(),
			};
		}

		case 'getBridgeHistory': {
			const walletAddress = this.getNodeParameter('walletAddress', index) as string;
			const options = this.getNodeParameter('historyOptions', index, {}) as IDataObject;

			const history = await bridgeClient.getBridgeHistory(
				walletAddress,
				(options.limit as number) || 20,
			);

			let filteredHistory = history as BridgeTransaction[];
			if (options.chain && options.chain !== 'all') {
				const chainId = BRIDGE_CHAINS[options.chain as keyof typeof BRIDGE_CHAINS]?.chainId;
				filteredHistory = filteredHistory.filter((tx) =>
					tx.sourceChain === chainId || tx.destChain === chainId
				);
			}
			if (options.direction && options.direction !== 'all') {
				filteredHistory = filteredHistory.filter((tx) => {
					if (options.direction === 'incoming') return tx.destChain === 4337;
					return tx.sourceChain === 4337;
				});
			}

			return {
				walletAddress,
				count: filteredHistory.length,
				history: filteredHistory,
				timestamp: new Date().toISOString(),
			};
		}

		case 'getSupportedAssets': {
			const supportedAssets = await bridgeClient.getSupportedAssets(1);

			return {
				count: supportedAssets.length,
				assets: supportedAssets,
				chains: Object.keys(BRIDGE_CHAINS),
				timestamp: new Date().toISOString(),
			};
		}

		case 'estimateBridgeFee': {
			const sourceChain = this.getNodeParameter('sourceChain', index) as string;
			const asset = this.getNodeParameter('asset', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;

			let tokenAddress = '0x0000000000000000000000000000000000000000';
			if (asset === 'custom') {
				tokenAddress = this.getNodeParameter('tokenAddress', index) as string;
			}

			const chainId = BRIDGE_CHAINS[sourceChain as keyof typeof BRIDGE_CHAINS]?.chainId || 1;

			const feeEstimate = await bridgeClient.estimateBridgeFee(
				chainId,
				tokenAddress,
				amount,
			);

			return {
				sourceChain,
				destinationChain: 'beam',
				asset: asset === 'custom' ? tokenAddress : asset,
				amount,
				...feeEstimate,
				timestamp: new Date().toISOString(),
			};
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}
}
