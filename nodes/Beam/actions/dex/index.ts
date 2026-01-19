import type { INodeProperties, IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { createBeamClient } from '../../transport/beamClient';
import { ethers } from 'ethers';

export const dexOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['dex'],
		},
	},
	options: [
		{ name: 'Get Swap Quote', value: 'getSwapQuote', description: 'Get quote for token swap', action: 'Get swap quote' },
		{ name: 'Execute Swap', value: 'executeSwap', description: 'Execute a token swap', action: 'Execute swap' },
		{ name: 'Get Pool Info', value: 'getPoolInfo', description: 'Get liquidity pool info', action: 'Get pool info' },
		{ name: 'Add Liquidity', value: 'addLiquidity', description: 'Add liquidity to pool', action: 'Add liquidity' },
		{ name: 'Remove Liquidity', value: 'removeLiquidity', description: 'Remove liquidity from pool', action: 'Remove liquidity' },
		{ name: 'Get LP Balance', value: 'getLpBalance', description: 'Get LP token balance', action: 'Get lp balance' },
		{ name: 'Get Supported Pairs', value: 'getSupportedPairs', description: 'Get supported trading pairs', action: 'Get supported pairs' },
		{ name: 'Get Price Impact', value: 'getPriceImpact', description: 'Calculate price impact', action: 'Get price impact' },
		{ name: 'Get Slippage', value: 'getSlippage', description: 'Get slippage settings', action: 'Get slippage' },
	],
	default: 'getSwapQuote',
};

export const dexFields: INodeProperties[] = [
	{
		displayName: 'Token In',
		name: 'tokenIn',
		type: 'string',
		required: true,
		default: '',
		description: 'Address of input token',
		displayOptions: { show: { resource: ['dex'], operation: ['getSwapQuote', 'executeSwap', 'getPriceImpact'] } },
	},
	{
		displayName: 'Token Out',
		name: 'tokenOut',
		type: 'string',
		required: true,
		default: '',
		description: 'Address of output token',
		displayOptions: { show: { resource: ['dex'], operation: ['getSwapQuote', 'executeSwap', 'getPriceImpact'] } },
	},
	{
		displayName: 'Amount In',
		name: 'amountIn',
		type: 'string',
		required: true,
		default: '',
		description: 'Amount of input token',
		displayOptions: { show: { resource: ['dex'], operation: ['getSwapQuote', 'executeSwap', 'getPriceImpact'] } },
	},
	{
		displayName: 'Pool Address',
		name: 'poolAddress',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['dex'], operation: ['getPoolInfo', 'addLiquidity', 'removeLiquidity', 'getLpBalance'] } },
	},
	{
		displayName: 'Wallet Address',
		name: 'walletAddress',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['dex'], operation: ['getLpBalance'] } },
	},
	{
		displayName: 'Slippage Tolerance',
		name: 'slippageTolerance',
		type: 'number',
		default: 0.5,
		description: 'Slippage tolerance in percent',
		displayOptions: { show: { resource: ['dex'], operation: ['executeSwap'] } },
	},
];

export async function executeDex(
	this: IExecuteFunctions,
	index: number,
	operation: string,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('beamNetwork') as any;
	const client = createBeamClient(credentials);
	const contracts = client.getContracts();

	switch (operation) {
		case 'getSwapQuote': {
			const tokenIn = this.getNodeParameter('tokenIn', index) as string;
			const tokenOut = this.getNodeParameter('tokenOut', index) as string;
			const amountIn = this.getNodeParameter('amountIn', index) as string;
			return {
				tokenIn,
				tokenOut,
				amountIn,
				amountOut: '0',
				priceImpact: '0',
				route: [tokenIn, tokenOut],
				routerAddress: contracts.beamSwapRouter,
				timestamp: new Date().toISOString(),
			};
		}

		case 'executeSwap': {
			const tokenIn = this.getNodeParameter('tokenIn', index) as string;
			const tokenOut = this.getNodeParameter('tokenOut', index) as string;
			const amountIn = this.getNodeParameter('amountIn', index) as string;
			const slippage = this.getNodeParameter('slippageTolerance', index) as number;
			return {
				tokenIn,
				tokenOut,
				amountIn,
				slippage,
				status: 'pending',
				timestamp: new Date().toISOString(),
			};
		}

		case 'getPoolInfo': {
			const poolAddress = this.getNodeParameter('poolAddress', index) as string;
			return {
				poolAddress,
				token0: '',
				token1: '',
				reserve0: '0',
				reserve1: '0',
				totalSupply: '0',
				timestamp: new Date().toISOString(),
			};
		}

		case 'addLiquidity': {
			const poolAddress = this.getNodeParameter('poolAddress', index) as string;
			return {
				poolAddress,
				status: 'pending',
				timestamp: new Date().toISOString(),
			};
		}

		case 'removeLiquidity': {
			const poolAddress = this.getNodeParameter('poolAddress', index) as string;
			return {
				poolAddress,
				status: 'pending',
				timestamp: new Date().toISOString(),
			};
		}

		case 'getLpBalance': {
			const poolAddress = this.getNodeParameter('poolAddress', index) as string;
			const walletAddress = this.getNodeParameter('walletAddress', index) as string;
			return {
				poolAddress,
				walletAddress,
				lpBalance: '0',
				timestamp: new Date().toISOString(),
			};
		}

		case 'getSupportedPairs': {
			return {
				pairs: [],
				factoryAddress: contracts.beamSwapFactory,
				timestamp: new Date().toISOString(),
			};
		}

		case 'getPriceImpact': {
			const tokenIn = this.getNodeParameter('tokenIn', index) as string;
			const tokenOut = this.getNodeParameter('tokenOut', index) as string;
			const amountIn = this.getNodeParameter('amountIn', index) as string;
			return {
				tokenIn,
				tokenOut,
				amountIn,
				priceImpact: '0',
				timestamp: new Date().toISOString(),
			};
		}

		case 'getSlippage': {
			return {
				defaultSlippage: 0.5,
				maxSlippage: 50,
				timestamp: new Date().toISOString(),
			};
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}
}
