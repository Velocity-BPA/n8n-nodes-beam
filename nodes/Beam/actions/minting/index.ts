import type { INodeProperties, IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { createBeamClient } from '../../transport/beamClient';

export const mintingOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['minting'] } },
	options: [
		{ name: 'Mint NFT', value: 'mintNft', description: 'Mint a new NFT', action: 'Mint nft' },
		{ name: 'Batch Mint NFTs', value: 'batchMintNfts', description: 'Mint multiple NFTs', action: 'Batch mint nfts' },
		{ name: 'Get Mint Status', value: 'getMintStatus', description: 'Get minting status', action: 'Get mint status' },
		{ name: 'Get Mintable Assets', value: 'getMintableAssets', description: 'Get mintable assets', action: 'Get mintable assets' },
		{ name: 'Prepare Mint', value: 'prepareMint', description: 'Prepare mint transaction', action: 'Prepare mint' },
		{ name: 'Get Minting Fees', value: 'getMintingFees', description: 'Get minting fees', action: 'Get minting fees' },
		{ name: 'Create Drop', value: 'createDrop', description: 'Create NFT drop', action: 'Create drop' },
		{ name: 'Get Drop Info', value: 'getDropInfo', description: 'Get drop information', action: 'Get drop info' },
		{ name: 'Purchase from Drop', value: 'purchaseFromDrop', description: 'Purchase from drop', action: 'Purchase from drop' },
	],
	default: 'mintNft',
};

export const mintingFields: INodeProperties[] = [
	{
		displayName: 'Contract Address',
		name: 'contractAddress',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['minting'], operation: ['mintNft', 'batchMintNfts', 'getMintableAssets', 'prepareMint', 'getMintingFees'] } },
	},
	{
		displayName: 'Recipient Address',
		name: 'recipientAddress',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['minting'], operation: ['mintNft', 'batchMintNfts'] } },
	},
	{
		displayName: 'Token URI',
		name: 'tokenUri',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['minting'], operation: ['mintNft'] } },
	},
	{
		displayName: 'Quantity',
		name: 'quantity',
		type: 'number',
		default: 1,
		displayOptions: { show: { resource: ['minting'], operation: ['batchMintNfts', 'purchaseFromDrop'] } },
	},
	{
		displayName: 'Transaction Hash',
		name: 'transactionHash',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['minting'], operation: ['getMintStatus'] } },
	},
	{
		displayName: 'Drop ID',
		name: 'dropId',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['minting'], operation: ['getDropInfo', 'purchaseFromDrop'] } },
	},
	{
		displayName: 'Drop Name',
		name: 'dropName',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['minting'], operation: ['createDrop'] } },
	},
];

export async function executeMinting(
	this: IExecuteFunctions,
	index: number,
	operation: string,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('beamNetwork') as any;
	const client = createBeamClient(credentials);

	switch (operation) {
		case 'mintNft': {
			const contractAddress = this.getNodeParameter('contractAddress', index) as string;
			const recipientAddress = this.getNodeParameter('recipientAddress', index) as string;
			const tokenUri = this.getNodeParameter('tokenUri', index, '') as string;
			return {
				contractAddress,
				recipientAddress,
				tokenUri,
				status: 'pending',
				timestamp: new Date().toISOString(),
			};
		}
		case 'batchMintNfts': {
			const contractAddress = this.getNodeParameter('contractAddress', index) as string;
			const recipientAddress = this.getNodeParameter('recipientAddress', index) as string;
			const quantity = this.getNodeParameter('quantity', index) as number;
			return {
				contractAddress,
				recipientAddress,
				quantity,
				status: 'pending',
				timestamp: new Date().toISOString(),
			};
		}
		case 'getMintStatus': {
			const transactionHash = this.getNodeParameter('transactionHash', index) as string;
			const receipt = await client.getTransactionReceipt(transactionHash);
			return {
				transactionHash,
				status: receipt ? (receipt.status === 1 ? 'confirmed' : 'failed') : 'pending',
				blockNumber: receipt?.blockNumber,
				timestamp: new Date().toISOString(),
			};
		}
		case 'getMintableAssets': {
			const contractAddress = this.getNodeParameter('contractAddress', index) as string;
			return {
				contractAddress,
				assets: [],
				timestamp: new Date().toISOString(),
			};
		}
		case 'prepareMint': {
			const contractAddress = this.getNodeParameter('contractAddress', index) as string;
			return {
				contractAddress,
				prepared: true,
				timestamp: new Date().toISOString(),
			};
		}
		case 'getMintingFees': {
			const contractAddress = this.getNodeParameter('contractAddress', index) as string;
			const gasPrice = await client.getGasPrice();
			return {
				contractAddress,
				estimatedGas: '100000',
				gasPrice: gasPrice.toString(),
				timestamp: new Date().toISOString(),
			};
		}
		case 'createDrop': {
			const dropName = this.getNodeParameter('dropName', index) as string;
			return {
				dropName,
				status: 'created',
				timestamp: new Date().toISOString(),
			};
		}
		case 'getDropInfo': {
			const dropId = this.getNodeParameter('dropId', index) as string;
			return {
				dropId,
				name: '',
				totalSupply: 0,
				minted: 0,
				timestamp: new Date().toISOString(),
			};
		}
		case 'purchaseFromDrop': {
			const dropId = this.getNodeParameter('dropId', index) as string;
			const quantity = this.getNodeParameter('quantity', index) as number;
			return {
				dropId,
				quantity,
				status: 'pending',
				timestamp: new Date().toISOString(),
			};
		}
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}
}
