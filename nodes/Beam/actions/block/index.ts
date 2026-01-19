import type { INodeProperties, IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { BeamClient } from '../../transport/beamClient';
import { formatTimestamp } from '../../utils/unitConverter';

export const blockOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['block'],
		},
	},
	options: [
		{
			name: 'Get Block',
			value: 'getBlock',
			description: 'Get block by number or hash',
			action: 'Get block by number or hash',
		},
		{
			name: 'Get Latest Block',
			value: 'getLatestBlock',
			description: 'Get the latest block',
			action: 'Get the latest block',
		},
		{
			name: 'Get Block Transactions',
			value: 'getBlockTransactions',
			description: 'Get all transactions in a block',
			action: 'Get all transactions in a block',
		},
		{
			name: 'Get Block Time',
			value: 'getBlockTime',
			description: 'Get the timestamp of a block',
			action: 'Get the timestamp of a block',
		},
		{
			name: 'Get Finalized Block',
			value: 'getFinalizedBlock',
			description: 'Get the latest finalized block',
			action: 'Get the latest finalized block',
		},
		{
			name: 'Get Block Range',
			value: 'getBlockRange',
			description: 'Get multiple blocks in a range',
			action: 'Get multiple blocks in a range',
		},
	],
	default: 'getLatestBlock',
};

export const blockFields: INodeProperties[] = [
	// Block Identifier Type
	{
		displayName: 'Block Identifier',
		name: 'blockIdentifier',
		type: 'options',
		required: true,
		default: 'number',
		description: 'How to identify the block',
		displayOptions: {
			show: {
				resource: ['block'],
				operation: ['getBlock', 'getBlockTransactions', 'getBlockTime'],
			},
		},
		options: [
			{ name: 'Block Number', value: 'number' },
			{ name: 'Block Hash', value: 'hash' },
		],
	},

	// Block Number
	{
		displayName: 'Block Number',
		name: 'blockNumber',
		type: 'number',
		required: true,
		default: 0,
		description: 'The block number',
		displayOptions: {
			show: {
				resource: ['block'],
				operation: ['getBlock', 'getBlockTransactions', 'getBlockTime'],
				blockIdentifier: ['number'],
			},
		},
	},

	// Block Hash
	{
		displayName: 'Block Hash',
		name: 'blockHash',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'The block hash',
		displayOptions: {
			show: {
				resource: ['block'],
				operation: ['getBlock', 'getBlockTransactions', 'getBlockTime'],
				blockIdentifier: ['hash'],
			},
		},
	},

	// Block Range
	{
		displayName: 'Start Block',
		name: 'startBlock',
		type: 'number',
		required: true,
		default: 0,
		description: 'Starting block number',
		displayOptions: {
			show: {
				resource: ['block'],
				operation: ['getBlockRange'],
			},
		},
	},
	{
		displayName: 'End Block',
		name: 'endBlock',
		type: 'number',
		required: true,
		default: 0,
		description: 'Ending block number',
		displayOptions: {
			show: {
				resource: ['block'],
				operation: ['getBlockRange'],
			},
		},
	},

	// Block Options
	{
		displayName: 'Options',
		name: 'blockOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['block'],
				operation: ['getBlock', 'getLatestBlock', 'getFinalizedBlock'],
			},
		},
		options: [
			{
				displayName: 'Include Transactions',
				name: 'includeTransactions',
				type: 'boolean',
				default: false,
				description: 'Whether to include full transaction objects',
			},
		],
	},
];

export async function executeBlock(
	this: IExecuteFunctions,
	client: BeamClient,
	operation: string,
	itemIndex: number,
): Promise<IDataObject> {
	switch (operation) {
		case 'getBlock': {
			const identifierType = this.getNodeParameter('blockIdentifier', itemIndex) as string;
			const options = this.getNodeParameter('blockOptions', itemIndex, {}) as IDataObject;

			let blockId: string | number;
			if (identifierType === 'number') {
				blockId = this.getNodeParameter('blockNumber', itemIndex) as number;
			} else {
				blockId = this.getNodeParameter('blockHash', itemIndex) as string;
			}

			let block;
			if (options.includeTransactions) {
				block = await client.getBlockWithTransactions(blockId);
			} else {
				block = await client.getBlock(blockId);
			}

			if (!block) {
				throw new NodeOperationError(
					this.getNode(),
					`Block not found: ${blockId}`,
					{ itemIndex },
				);
			}

			return {
				number: block.number,
				hash: block.hash,
				parentHash: block.parentHash,
				timestamp: block.timestamp,
				timestampFormatted: formatTimestamp(block.timestamp),
				nonce: block.nonce,
				difficulty: block.difficulty?.toString(),
				gasLimit: block.gasLimit?.toString(),
				gasUsed: block.gasUsed?.toString(),
				miner: block.miner,
				extraData: block.extraData,
				baseFeePerGas: block.baseFeePerGas?.toString(),
				transactionCount: block.transactions?.length || 0,
				transactions: options.includeTransactions ? block.transactions : block.transactions?.map((t: any) => typeof t === 'string' ? t : t.hash),
			};
		}

		case 'getLatestBlock': {
			const options = this.getNodeParameter('blockOptions', itemIndex, {}) as IDataObject;

			const blockNumber = await client.getBlockNumber();
			let block;

			if (options.includeTransactions) {
				block = await client.getBlockWithTransactions(blockNumber);
			} else {
				block = await client.getBlock(blockNumber);
			}

			return {
				number: block.number,
				hash: block.hash,
				parentHash: block.parentHash,
				timestamp: block.timestamp,
				timestampFormatted: formatTimestamp(block.timestamp),
				gasLimit: block.gasLimit?.toString(),
				gasUsed: block.gasUsed?.toString(),
				miner: block.miner,
				baseFeePerGas: block.baseFeePerGas?.toString(),
				transactionCount: block.transactions?.length || 0,
				transactions: options.includeTransactions ? block.transactions : undefined,
			};
		}

		case 'getBlockTransactions': {
			const identifierType = this.getNodeParameter('blockIdentifier', itemIndex) as string;

			let blockId: string | number;
			if (identifierType === 'number') {
				blockId = this.getNodeParameter('blockNumber', itemIndex) as number;
			} else {
				blockId = this.getNodeParameter('blockHash', itemIndex) as string;
			}

			const block = await client.getBlockWithTransactions(blockId);

			if (!block) {
				throw new NodeOperationError(
					this.getNode(),
					`Block not found: ${blockId}`,
					{ itemIndex },
				);
			}

			const transactions = block.transactions.map((tx: any) => ({
				hash: tx.hash,
				from: tx.from,
				to: tx.to,
				value: tx.value?.toString(),
				gasPrice: tx.gasPrice?.toString(),
				gasLimit: tx.gasLimit?.toString(),
				nonce: tx.nonce,
				data: tx.data?.substring(0, 66) + (tx.data?.length > 66 ? '...' : ''),
				type: tx.type,
			}));

			return {
				blockNumber: block.number,
				blockHash: block.hash,
				transactionCount: transactions.length,
				transactions,
				timestamp: new Date().toISOString(),
			};
		}

		case 'getBlockTime': {
			const identifierType = this.getNodeParameter('blockIdentifier', itemIndex) as string;

			let blockId: string | number;
			if (identifierType === 'number') {
				blockId = this.getNodeParameter('blockNumber', itemIndex) as number;
			} else {
				blockId = this.getNodeParameter('blockHash', itemIndex) as string;
			}

			const block = await client.getBlock(blockId);

			if (!block) {
				throw new NodeOperationError(
					this.getNode(),
					`Block not found: ${blockId}`,
					{ itemIndex },
				);
			}

			const timestamp = Number(block.timestamp);
			const date = new Date(timestamp * 1000);

			return {
				blockNumber: block.number,
				blockHash: block.hash,
				timestamp,
				timestampMs: timestamp * 1000,
				isoDate: date.toISOString(),
				localDate: date.toLocaleString(),
				unixTime: timestamp,
			};
		}

		case 'getFinalizedBlock': {
			const options = this.getNodeParameter('blockOptions', itemIndex, {}) as IDataObject;

			// Beam uses quick finality - get latest block as finalized
			const blockNumber = await client.getBlockNumber();
			// For Avalanche subnets, finality is typically 1-2 seconds
			const finalizedNumber = Math.max(0, blockNumber - 2);

			let block;
			if (options.includeTransactions) {
				block = await client.getBlockWithTransactions(finalizedNumber);
			} else {
				block = await client.getBlock(finalizedNumber);
			}

			return {
				number: block.number,
				hash: block.hash,
				parentHash: block.parentHash,
				timestamp: block.timestamp,
				timestampFormatted: formatTimestamp(block.timestamp),
				gasUsed: block.gasUsed?.toString(),
				miner: block.miner,
				finalized: true,
				latestBlock: blockNumber,
				confirmations: blockNumber - finalizedNumber,
			};
		}

		case 'getBlockRange': {
			const startBlock = this.getNodeParameter('startBlock', itemIndex) as number;
			const endBlock = this.getNodeParameter('endBlock', itemIndex) as number;

			if (endBlock < startBlock) {
				throw new NodeOperationError(
					this.getNode(),
					'End block must be greater than or equal to start block',
					{ itemIndex },
				);
			}

			const rangeSize = endBlock - startBlock + 1;
			if (rangeSize > 100) {
				throw new NodeOperationError(
					this.getNode(),
					'Maximum range is 100 blocks',
					{ itemIndex },
				);
			}

			const blocks: IDataObject[] = [];
			for (let i = startBlock; i <= endBlock; i++) {
				const block = await client.getBlock(i);
				if (block) {
					blocks.push({
						number: block.number,
						hash: block.hash,
						timestamp: block.timestamp,
						timestampFormatted: formatTimestamp(block.timestamp),
						transactionCount: block.transactions?.length || 0,
						gasUsed: block.gasUsed?.toString(),
						miner: block.miner,
					});
				}
			}

			return {
				startBlock,
				endBlock,
				count: blocks.length,
				blocks,
				timestamp: new Date().toISOString(),
			};
		}

		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unknown operation: ${operation}`,
				{ itemIndex },
			);
	}
}
