/**
 * Beam Blockchain Node for n8n
 * 
 * A comprehensive n8n community node for interacting with the Beam blockchain.
 * 
 * @author Velocity BPA
 * @website https://velobpa.com
 * @github https://github.com/Velocity-BPA
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

// Import operations and fields
import { walletOperations, walletFields, executeWallet } from './actions/wallet';
import { nftOperations, nftFields, executeNft } from './actions/nft';
import { collectionOperations, collectionFields, executeCollection } from './actions/collection';
import { marketplaceOperations, marketplaceFields, executeMarketplace } from './actions/marketplace';
import { mintingOperations, mintingFields, executeMinting } from './actions/minting';
import { gamingOperations, gamingFields, executeGaming } from './actions/gaming';
import { meritCircleOperations, meritCircleFields, executeMeritCircle } from './actions/meritCircle';
import { contractOperations, contractFields, executeContract } from './actions/contract';
import { bridgeOperations, bridgeFields, executeBridge } from './actions/bridge';
import { dexOperations, dexFields, executeDex } from './actions/dex';
import { stakingOperations, stakingFields, executeStaking } from './actions/staking';
import { blockOperations, blockFields, executeBlock } from './actions/block';
import { transactionOperations, transactionFields, executeTransaction } from './actions/transaction';
import { eventsOperations, eventsFields, executeEvents } from './actions/events';
import { playerOperations, playerFields, executePlayer } from './actions/player';
import { assetOperations, assetFields, executeAsset } from './actions/asset';
import { utilityOperations, utilityFields, executeUtility } from './actions/utility';

// Helper to ensure array
const toArray = (item: INodeProperties | INodeProperties[]): INodeProperties[] => 
	Array.isArray(item) ? item : [item];

export class Beam implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Beam',
		name: 'beam',
		icon: 'file:beam.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the Beam gaming blockchain',
		defaults: {
			name: 'Beam',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{ name: 'beamNetwork', required: true },
			{ name: 'beamApi', required: false },
			{ name: 'sphereMarketplace', required: false },
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Asset (In-Game)', value: 'asset' },
					{ name: 'Block', value: 'block' },
					{ name: 'Bridge', value: 'bridge' },
					{ name: 'Collection', value: 'collection' },
					{ name: 'Contract', value: 'contract' },
					{ name: 'DEX', value: 'dex' },
					{ name: 'Events', value: 'events' },
					{ name: 'Gaming', value: 'gaming' },
					{ name: 'Marketplace', value: 'marketplace' },
					{ name: 'Merit Circle', value: 'meritCircle' },
					{ name: 'Minting', value: 'minting' },
					{ name: 'NFT', value: 'nft' },
					{ name: 'Player', value: 'player' },
					{ name: 'Staking', value: 'staking' },
					{ name: 'Transaction', value: 'transaction' },
					{ name: 'Utility', value: 'utility' },
					{ name: 'Wallet', value: 'wallet' },
				],
				default: 'wallet',
			},
			// Wallet
			...toArray(walletOperations),
			...toArray(walletFields),
			// NFT
			...toArray(nftOperations),
			...toArray(nftFields),
			// Collection
			...toArray(collectionOperations),
			...toArray(collectionFields),
			// Marketplace
			...toArray(marketplaceOperations),
			...toArray(marketplaceFields),
			// Minting
			...toArray(mintingOperations),
			...toArray(mintingFields),
			// Gaming
			...toArray(gamingOperations),
			...toArray(gamingFields),
			// Merit Circle
			...toArray(meritCircleOperations),
			...toArray(meritCircleFields),
			// Contract
			...toArray(contractOperations),
			...toArray(contractFields),
			// Bridge
			...toArray(bridgeOperations),
			...toArray(bridgeFields),
			// DEX
			...toArray(dexOperations),
			...toArray(dexFields),
			// Staking
			...toArray(stakingOperations),
			...toArray(stakingFields),
			// Block
			...toArray(blockOperations),
			...toArray(blockFields),
			// Transaction
			...toArray(transactionOperations),
			...toArray(transactionFields),
			// Events
			...toArray(eventsOperations),
			...toArray(eventsFields),
			// Player
			...toArray(playerOperations),
			...toArray(playerFields),
			// Asset
			...toArray(assetOperations),
			...toArray(assetFields),
			// Utility
			...toArray(utilityOperations),
			...toArray(utilityFields),
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let result: IDataObject;

				switch (resource) {
					case 'wallet':
						result = await executeWallet.call(this, i, operation);
						break;
					case 'nft':
						result = await executeNft.call(this, i, operation);
						break;
					case 'collection':
						result = await executeCollection.call(this, i, operation);
						break;
					case 'marketplace':
						result = await executeMarketplace.call(this, i, operation);
						break;
					case 'minting':
						result = await executeMinting.call(this, i, operation);
						break;
					case 'gaming':
						result = await executeGaming.call(this, i, operation);
						break;
					case 'meritCircle':
						result = await executeMeritCircle.call(this, i, operation);
						break;
					case 'contract':
						result = await executeContract.call(this, i, operation);
						break;
					case 'bridge':
						result = await executeBridge.call(this, i, operation);
						break;
					case 'dex':
						result = await executeDex.call(this, i, operation);
						break;
					case 'staking':
						result = await executeStaking.call(this, i, operation);
						break;
					case 'block':
						result = await executeBlock.call(this, i, operation);
						break;
					case 'transaction':
						result = await executeTransaction.call(this, i, operation);
						break;
					case 'events':
						result = await executeEvents.call(this, i, operation);
						break;
					case 'player':
						result = await executePlayer.call(this, i, operation);
						break;
					case 'asset':
						result = await executeAsset.call(this, i, operation);
						break;
					case 'utility':
						result = await executeUtility.call(this, i, operation);
						break;
					default:
						throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`, { itemIndex: i });
				}

				returnData.push({ json: result, pairedItem: { item: i } });
			} catch (err) {
				const error = err as Error;
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error.message, resource, operation },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
