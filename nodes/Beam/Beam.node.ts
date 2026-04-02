/**
 * Copyright (c) 2026 Velocity BPA
 * 
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://github.com/VelocityBPA/n8n-nodes-beam/blob/main/LICENSE
 * 
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeApiError,
} from 'n8n-workflow';

export class Beam implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Beam',
    name: 'beam',
    icon: 'file:beam.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the Beam API',
    defaults: {
      name: 'Beam',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'beamApi',
        required: true,
      },
    ],
    properties: [
      // Resource selector
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Wallet',
            value: 'wallet',
          },
          {
            name: 'Transaction',
            value: 'transaction',
          },
          {
            name: 'Address',
            value: 'address',
          },
          {
            name: 'Asset',
            value: 'asset',
          },
          {
            name: 'Node',
            value: 'node',
          },
          {
            name: 'SphereMarketplace',
            value: 'sphereMarketplace',
          },
          {
            name: 'Gaming',
            value: 'gaming',
          },
          {
            name: 'DeFi',
            value: 'deFi',
          }
        ],
        default: 'wallet',
      },
      // Operation dropdowns per resource
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['wallet'] } },
  options: [
    { name: 'Create Wallet', value: 'createWallet', description: 'Create a new Beam wallet', action: 'Create a wallet' },
    { name: 'Get Wallet', value: 'getWallet', description: 'Get wallet information', action: 'Get a wallet' },
    { name: 'Get Wallet Balance', value: 'getWalletBalance', description: 'Get wallet balance', action: 'Get wallet balance' },
    { name: 'Update Wallet', value: 'updateWallet', description: 'Update wallet settings', action: 'Update a wallet' },
    { name: 'Delete Wallet', value: 'deleteWallet', description: 'Delete a wallet', action: 'Delete a wallet' },
    { name: 'List Wallets', value: 'listWallets', description: 'List all wallets', action: 'List wallets' },
    {
      name: 'Get Wallet Transactions',
      value: 'getWalletTransactions',
      description: 'Get wallet transaction history',
      action: 'Get wallet transactions',
    },
    {
      name: 'Transfer Tokens',
      value: 'transferTokens',
      description: 'Transfer tokens from wallet',
      action: 'Transfer tokens',
    },
  ],
  default: 'createWallet',
},
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['transaction'] } },
	options: [
		{
			name: 'Send Transaction',
			value: 'sendTransaction',
			description: 'Send BEAM tokens',
			action: 'Send transaction'
		},
		{
			name: 'Get Transaction',
			value: 'getTransaction',
			description: 'Get transaction details by ID',
			action: 'Get transaction'
		},
		{
			name: 'Get Transaction History',
			value: 'getTransactionHistory',
			description: 'Get transaction history for a wallet',
			action: 'Get transaction history'
		},
		{
			name: 'Estimate Transaction Fee',
			value: 'estimateTransactionFee',
			description: 'Estimate transaction fee for a transfer',
			action: 'Estimate transaction fee'
		},
		{
			name: 'Get Transaction Status',
			value: 'getTransactionStatus',
			description: 'Get current status of a transaction',
			action: 'Get transaction status'
		},
    {
      name: 'Create Transaction',
      value: 'createTransaction',
      description: 'Create and broadcast a new transaction',
      action: 'Create transaction',
    },
    {
      name: 'Get All Transactions',
      value: 'getAllTransactions',
      description: 'List transactions with optional filters',
      action: 'Get all transactions',
    },
    {
      name: 'Confirm Transaction',
      value: 'confirmTransaction',
      description: 'Wait for transaction confirmation',
      action: 'Confirm transaction',
    },
	],
	default: 'sendTransaction',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['address'] } },
  options: [
    { name: 'Generate Address', value: 'generateAddress', description: 'Generate new receiving address', action: 'Generate address' },
    { name: 'Get Address', value: 'getAddress', description: 'Get address information', action: 'Get address' },
    { name: 'List Addresses', value: 'listAddresses', description: 'List wallet addresses', action: 'List addresses' },
    { name: 'Update Address', value: 'updateAddress', description: 'Update address properties', action: 'Update address' },
    { name: 'Expire Address', value: 'expireAddress', description: 'Expire an address', action: 'Expire address' },
  ],
  default: 'generateAddress',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['asset'] } },
  options: [
    { name: 'Create Asset', value: 'createAsset', description: 'Create new confidential asset', action: 'Create asset' },
    { name: 'Get Asset', value: 'getAsset', description: 'Get asset information', action: 'Get asset' },
    { name: 'List Assets', value: 'listAssets', description: 'List all assets', action: 'List assets' },
    { name: 'Mint Asset', value: 'mintAsset', description: 'Mint additional asset tokens', action: 'Mint asset' },
    { name: 'Burn Asset', value: 'burnAsset', description: 'Burn asset tokens', action: 'Burn asset' }
  ],
  default: 'createAsset',
},
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['node'],
		},
	},
	options: [
		{
			name: 'Get Node Status',
			value: 'getNodeStatus',
			description: 'Get node status and sync information',
			action: 'Get node status',
		},
		{
			name: 'Get Node Peers',
			value: 'getNodePeers',
			description: 'Get connected peers',
			action: 'Get node peers',
		},
		{
			name: 'Get Blocks',
			value: 'getBlocks',
			description: 'Get recent blocks',
			action: 'Get blocks',
		},
		{
			name: 'Get Block',
			value: 'getBlock',
			description: 'Get specific block',
			action: 'Get block',
		},
		{
			name: 'Get Mining Info',
			value: 'getMiningInfo',
			description: 'Get mining information',
			action: 'Get mining info',
		},
	],
	default: 'getNodeStatus',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['sphereMarketplace'],
    },
  },
  options: [
    {
      name: 'Create Listing',
      value: 'createListing',
      description: 'Create NFT marketplace listing',
      action: 'Create listing',
    },
    {
      name: 'Get Listing',
      value: 'getListing',
      description: 'Get listing details',
      action: 'Get listing',
    },
    {
      name: 'Get All Listings',
      value: 'getAllListings',
      description: 'Browse marketplace listings',
      action: 'Get all listings',
    },
    {
      name: 'Update Listing',
      value: 'updateListing',
      description: 'Update listing price or details',
      action: 'Update listing',
    },
    {
      name: 'Buy Listing',
      value: 'buyListing',
      description: 'Purchase listed NFT',
      action: 'Buy listing',
    },
    {
      name: 'Cancel Listing',
      value: 'cancelListing',
      description: 'Cancel marketplace listing',
      action: 'Cancel listing',
    },
  ],
  default: 'createListing',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['gaming'],
    },
  },
  options: [
    {
      name: 'Create Game Asset',
      value: 'createGameAsset',
      description: 'Create new game asset/item',
      action: 'Create game asset',
    },
    {
      name: 'Get Game Asset',
      value: 'getGameAsset',
      description: 'Get game asset details',
      action: 'Get game asset',
    },
    {
      name: 'Get All Game Assets',
      value: 'getAllGameAssets',
      description: 'List game assets by player or game',
      action: 'Get all game assets',
    },
    {
      name: 'Update Game Asset',
      value: 'updateGameAsset',
      description: 'Update game asset properties',
      action: 'Update game asset',
    },
    {
      name: 'Create Achievement',
      value: 'createAchievement',
      description: 'Award achievement to player',
      action: 'Create achievement',
    },
    {
      name: 'Get Leaderboard',
      value: 'getLeaderboard',
      description: 'Get game leaderboard',
      action: 'Get leaderboard',
    },
  ],
  default: 'createGameAsset',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['deFi'],
    },
  },
  options: [
    {
      name: 'Stake Tokens',
      value: 'stakeTokens',
      description: 'Stake tokens in DeFi protocol',
      action: 'Stake tokens',
    },
    {
      name: 'Get Stake',
      value: 'getStake',
      description: 'Get staking position details',
      action: 'Get stake details',
    },
    {
      name: 'Get All Stakes',
      value: 'getAllStakes',
      description: 'List user staking positions',
      action: 'List staking positions',
    },
    {
      name: 'Unstake Tokens',
      value: 'unstakeTokens',
      description: 'Unstake tokens from protocol',
      action: 'Unstake tokens',
    },
    {
      name: 'Get Liquidity Pools',
      value: 'getLiquidityPools',
      description: 'Get available liquidity pools',
      action: 'Get liquidity pools',
    },
    {
      name: 'Add Liquidity',
      value: 'addLiquidity',
      description: 'Add liquidity to pool',
      action: 'Add liquidity to pool',
    },
  ],
  default: 'stakeTokens',
},
      // Parameter definitions
{
  displayName: 'Seed',
  name: 'seed',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['wallet'], operation: ['createWallet'] } },
  default: '',
  description: 'Wallet seed phrase for creation',
},
{
  displayName: 'Password',
  name: 'password',
  type: 'string',
  typeOptions: { password: true },
  required: true,
  displayOptions: { show: { resource: ['wallet'], operation: ['createWallet'] } },
  default: '',
  description: 'Password to secure the wallet',
},
{
  displayName: 'Network',
  name: 'network',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['wallet'],
      operation: ['createWallet'],
    },
  },
  default: '',
  description: 'The blockchain network for the wallet',
},
{
  displayName: 'Type',
  name: 'type',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['wallet'],
      operation: ['createWallet'],
    },
  },
  default: '',
  description: 'The type of wallet to create',
},
{
  displayName: 'Wallet ID',
  name: 'walletId',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['wallet'], operation: ['getWallet', 'getWalletBalance', 'updateWallet', 'deleteWallet'] } },
  default: '',
  description: 'The ID of the wallet',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['wallet'],
      operation: ['getWalletTransactions', 'transferTokens'],
    },
  },
  default: '',
  description: 'The wallet address',
},
{
  displayName: 'Settings',
  name: 'settings',
  type: 'json',
  required: true,
  displayOptions: { show: { resource: ['wallet'], operation: ['updateWallet'] } },
  default: '{}',
  description: 'Wallet settings to update as JSON object',
},
{
  displayName: 'Token Address',
  name: 'tokenAddress',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['wallet'],
      operation: ['getWalletBalance', 'transferTokens'],
    },
  },
  default: '',
  description: 'The token contract address (optional for native tokens)',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['wallet'],
      operation: ['listWallets', 'getWalletTransactions'],
    },
  },
  default: 10,
  description: 'Maximum number of results to return',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['wallet'],
      operation: ['listWallets', 'getWalletTransactions'],
    },
  },
  default: 0,
  description: 'Number of results to skip',
},
{
  displayName: 'To',
  name: 'to',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['wallet'],
      operation: ['transferTokens'],
    },
  },
  default: '',
  description: 'The recipient wallet address',
},
{
  displayName: 'Amount',
  name: 'amount',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['wallet'],
      operation: ['transferTokens'],
    },
  },
  default: '',
  description: 'The amount to transfer',
},
{
	displayName: 'Wallet ID',
	name: 'walletId',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['sendTransaction', 'getTransactionHistory']
		}
	},
	default: '',
	description: 'The ID of the wallet to use for the transaction'
},
{
	displayName: 'Amount',
	name: 'amount',
	type: 'number',
	required: true,
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['sendTransaction', 'estimateTransactionFee']
		}
	},
	default: 0,
	description: 'The amount of BEAM tokens to send (in BEAM units)'
},
{
	displayName: 'Recipient',
	name: 'recipient',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['sendTransaction', 'estimateTransactionFee']
		}
	},
	default: '',
	description: 'The recipient wallet address'
},
{
	displayName: 'Fee',
	name: 'fee',
	type: 'number',
	required: false,
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['sendTransaction']
		}
	},
	default: 0,
	description: 'Custom transaction fee (optional, will use network default if not specified)'
},
{
	displayName: 'Transaction ID',
	name: 'txId',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['getTransaction', 'getTransactionStatus']
		}
	},
	default: '',
	description: 'The transaction ID to query'
},
{
	displayName: 'Limit',
	name: 'limit',
	type: 'number',
	required: false,
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['getTransactionHistory']
		}
	},
	default: 100,
	description: 'Maximum number of transactions to return'
},
{
	displayName: 'Offset',
	name: 'offset',
	type: 'number',
	required: false,
	displayOptions: {
		show: {
			resource: ['transaction'],
			operation: ['getTransactionHistory']
		}
	},
	default: 0,
	description: 'Number of transactions to skip'
},
{
  displayName: 'From Address',
  name: 'from',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['createTransaction', 'estimateTransactionFee'],
    },
  },
  default: '',
  description: 'The sender address',
},
{
  displayName: 'To Address',
  name: 'to',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['createTransaction', 'estimateTransactionFee'],
    },
  },
  default: '',
  description: 'The recipient address',
},
{
  displayName: 'Data',
  name: 'data',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['createTransaction', 'estimateTransactionFee'],
    },
  },
  default: '',
  description: 'Optional transaction data (hex encoded)',
},
{
  displayName: 'Transaction Hash',
  name: 'hash',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['confirmTransaction'],
    },
  },
  default: '',
  description: 'The transaction hash',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['getAllTransactions'],
    },
  },
  default: '',
  description: 'Filter transactions by address',
},
{
  displayName: 'Status',
  name: 'status',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['getAllTransactions'],
    },
  },
  options: [
    {
      name: 'All',
      value: '',
    },
    {
      name: 'Pending',
      value: 'pending',
    },
    {
      name: 'Confirmed',
      value: 'confirmed',
    },
    {
      name: 'Failed',
      value: 'failed',
    },
  ],
  default: '',
  description: 'Filter transactions by status',
},
{
  displayName: 'Confirmations',
  name: 'confirmations',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['confirmTransaction'],
    },
  },
  default: 1,
  description: 'Number of confirmations to wait for',
},
{
  displayName: 'Wallet ID',
  name: 'walletId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['address'],
      operation: ['generateAddress'],
    },
  },
  default: '',
  description: 'The ID of the wallet to generate the address for',
},
{
  displayName: 'Expiration',
  name: 'expiration',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['address'],
      operation: ['generateAddress'],
    },
  },
  default: 3600,
  description: 'Address expiration time in seconds',
},
{
  displayName: 'Address ID',
  name: 'addressId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['address'],
      operation: ['getAddress', 'updateAddress', 'expireAddress'],
    },
  },
  default: '',
  description: 'The ID of the address',
},
{
  displayName: 'Active Only',
  name: 'active',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['address'],
      operation: ['listAddresses'],
    },
  },
  default: true,
  description: 'Whether to return only active addresses',
},
{
  displayName: 'Label',
  name: 'label',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['address'],
      operation: ['updateAddress'],
    },
  },
  default: '',
  description: 'Label for the address',
},
{
  displayName: 'Asset Metadata',
  name: 'metadata',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['asset'], operation: ['createAsset'] } },
  default: '',
  description: 'Metadata for the asset',
},
{
  displayName: 'Asset ID',
  name: 'assetId',
  type: 'string',
  required: true,
  displayOptions: { show: { resource: ['asset'], operation: ['getAsset', 'mintAsset', 'burnAsset'] } },
  default: '',
  description: 'The unique identifier of the asset',
},
{
	displayName: 'Limit',
	name: 'limit',
	type: 'number',
	default: 10,
	description: 'Number of blocks to retrieve',
	displayOptions: {
		show: {
			resource: ['node'],
			operation: ['getBlocks'],
		},
	},
},
{
	displayName: 'Height',
	name: 'height',
	type: 'number',
	default: 0,
	description: 'Block height to start from (optional)',
	displayOptions: {
		show: {
			resource: ['node'],
			operation: ['getBlocks'],
		},
	},
},
{
	displayName: 'Block Height',
	name: 'blockHeight',
	type: 'number',
	required: true,
	default: 1,
	description: 'Height of the specific block to retrieve',
	displayOptions: {
		show: {
			resource: ['node'],
			operation: ['getBlock'],
		},
	},
},
{
  displayName: 'Token ID',
  name: 'tokenId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['sphereMarketplace'],
      operation: ['createListing'],
    },
  },
  default: '',
  description: 'The NFT token ID to list',
},
{
  displayName: 'Contract Address',
  name: 'contract',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['sphereMarketplace'],
      operation: ['createListing'],
    },
  },
  default: '',
  description: 'The NFT contract address',
},
{
  displayName: 'Price',
  name: 'price',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['sphereMarketplace'],
      operation: ['createListing', 'updateListing'],
    },
  },
  default: '',
  description: 'The listing price in ETH',
},
{
  displayName: 'Duration',
  name: 'duration',
  type: 'number',
  required: true,
  displayOptions: {
    show: {
      resource: ['sphereMarketplace'],
      operation: ['createListing'],
    },
  },
  default: 86400,
  description: 'The listing duration in seconds',
},
{
  displayName: 'Listing ID',
  name: 'listingId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['sphereMarketplace'],
      operation: ['getListing', 'updateListing', 'buyListing', 'cancelListing'],
    },
  },
  default: '',
  description: 'The unique listing ID',
},
{
  displayName: 'Category',
  name: 'category',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['sphereMarketplace'],
      operation: ['getAllListings'],
    },
  },
  default: '',
  description: 'Filter by NFT category',
},
{
  displayName: 'Minimum Price',
  name: 'priceMin',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['sphereMarketplace'],
      operation: ['getAllListings'],
    },
  },
  default: '',
  description: 'Minimum price filter',
},
{
  displayName: 'Maximum Price',
  name: 'priceMax',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['sphereMarketplace'],
      operation: ['getAllListings'],
    },
  },
  default: '',
  description: 'Maximum price filter',
},
{
  displayName: 'Description',
  name: 'description',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['sphereMarketplace'],
      operation: ['updateListing'],
    },
  },
  default: '',
  description: 'Updated listing description',
},
{
  displayName: 'Buyer Address',
  name: 'buyerAddress',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['sphereMarketplace'],
      operation: ['buyListing'],
    },
  },
  default: '',
  description: 'The buyer wallet address',
},
{
  displayName: 'Game ID',
  name: 'gameId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['gaming'],
      operation: ['createGameAsset'],
    },
  },
  default: '',
  description: 'The ID of the game',
},
{
  displayName: 'Asset Type',
  name: 'assetType',
  type: 'options',
  required: true,
  displayOptions: {
    show: {
      resource: ['gaming'],
      operation: ['createGameAsset'],
    },
  },
  options: [
    {
      name: 'Weapon',
      value: 'weapon',
    },
    {
      name: 'Armor',
      value: 'armor',
    },
    {
      name: 'Collectible',
      value: 'collectible',
    },
    {
      name: 'Currency',
      value: 'currency',
    },
  ],
  default: 'weapon',
  description: 'The type of game asset',
},
{
  displayName: 'Owner',
  name: 'owner',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['gaming'],
      operation: ['createGameAsset'],
    },
  },
  default: '',
  description: 'The owner address of the asset',
},
{
  displayName: 'Achievement ID',
  name: 'achievementId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['gaming'],
      operation: ['createAchievement'],
    },
  },
  default: '',
  description: 'The ID of the achievement to award',
},
{
  displayName: 'Player ID',
  name: 'playerId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['gaming'],
      operation: ['createAchievement'],
    },
  },
  default: '',
  description: 'The ID of the player receiving the achievement',
},
{
  displayName: 'Metric',
  name: 'metric',
  type: 'options',
  required: true,
  displayOptions: {
    show: {
      resource: ['gaming'],
      operation: ['getLeaderboard'],
    },
  },
  options: [
    {
      name: 'Score',
      value: 'score',
    },
    {
      name: 'Level',
      value: 'level',
    },
    {
      name: 'Experience',
      value: 'experience',
    },
    {
      name: 'Wins',
      value: 'wins',
    },
  ],
  default: 'score',
  description: 'The metric to rank by',
},
{
  displayName: 'Protocol',
  name: 'protocol',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['deFi'],
      operation: ['stakeTokens', 'getAllStakes'],
    },
  },
  default: '',
  description: 'DeFi protocol name',
},
{
  displayName: 'Stake ID',
  name: 'stakeId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['deFi'],
      operation: ['getStake', 'unstakeTokens'],
    },
  },
  default: '',
  description: 'ID of the staking position',
},
{
  displayName: 'User Address',
  name: 'userAddress',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['deFi'],
      operation: ['getAllStakes'],
    },
  },
  default: '',
  description: 'User wallet address',
},
{
  displayName: 'Pool ID',
  name: 'poolId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['deFi'],
      operation: ['addLiquidity'],
    },
  },
  default: '',
  description: 'ID of the liquidity pool',
},
{
  displayName: 'Amount A',
  name: 'amountA',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['deFi'],
      operation: ['addLiquidity'],
    },
  },
  default: '',
  description: 'Amount of first token to add',
},
{
  displayName: 'Amount B',
  name: 'amountB',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['deFi'],
      operation: ['addLiquidity'],
    },
  },
  default: '',
  description: 'Amount of second token to add',
},
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    switch (resource) {
      case 'wallet':
        return [await executeWalletOperations.call(this, items)];
      case 'transaction':
        return [await executeTransactionOperations.call(this, items)];
      case 'address':
        return [await executeAddressOperations.call(this, items)];
      case 'asset':
        return [await executeAssetOperations.call(this, items)];
      case 'node':
        return [await executeNodeOperations.call(this, items)];
      case 'sphereMarketplace':
        return [await executeSphereMarketplaceOperations.call(this, items)];
      case 'gaming':
        return [await executeGamingOperations.call(this, items)];
      case 'deFi':
        return [await executeDeFiOperations.call(this, items)];
      default:
        throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
    }
  }
}

// ============================================================
// Resource Handler Functions
// ============================================================

async function executeWalletOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('beamApi') as any;
  
  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      const baseUrl = credentials.baseUrl || 'https://api.beam.mw/v1';
      
      switch (operation) {
        case 'createWallet': {
          const seed = this.getNodeParameter('seed', i) as string;
          const password = this.getNodeParameter('password', i) as string;
          const network = this.getNodeParameter('network', i) as string;
          const type = this.getNodeParameter('type', i) as string;
          
          const options: any = {
            method: 'POST',
            url: `${baseUrl}/wallet/create`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: {
              seed,
              password,
              network,
              type,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getWallet': {
          const walletId = this.getNodeParameter('walletId', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${baseUrl}/wallet/${walletId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'getWalletBalance': {
          const address = this.getNodeParameter('address', i) as string;
          const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;

          let url = `${baseUrl}/wallets/${address}/balance`;
          const queryParams: any = {};

          if (tokenAddress) {
            queryParams.tokenAddress = tokenAddress;
          }

          const queryString = new URLSearchParams(queryParams).toString();
          if (queryString) {
            url += `?${queryString}`;
          }

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'updateWallet': {
          const walletId = this.getNodeParameter('walletId', i) as string;
          const settings = this.getNodeParameter('settings', i) as string;
          
          const options: any = {
            method: 'PUT',
            url: `${baseUrl}/wallet/${walletId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.parse(settings),
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'deleteWallet': {
          const walletId = this.getNodeParameter('walletId', i) as string;
          
          const options: any = {
            method: 'DELETE',
            url: `${baseUrl}/wallet/${walletId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        case 'listWallets': {
          const limit = this.getNodeParameter('limit', i) as number;
          const offset = this.getNodeParameter('offset', i) as number;
          
          const options: any = {
            method: 'GET',
            url: `${baseUrl}/wallet`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            qs: {
              limit,
              offset,
            },
            json: true,
          };
          
          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getWalletTransactions': {
          const address = this.getNodeParameter('address', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;
          const offset = this.getNodeParameter('offset', i) as number;

          const queryParams: any = {};
          if (limit) {
            queryParams.limit = limit.toString();
          }
          if (offset) {
            queryParams.offset = offset.toString();
          }

          const queryString = new URLSearchParams(queryParams).toString();
          const url = `${baseUrl}/wallets/${address}/transactions${queryString ? `?${queryString}` : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'transferTokens': {
          const address = this.getNodeParameter('address', i) as string;
          const to = this.getNodeParameter('to', i) as string;
          const amount = this.getNodeParameter('amount', i) as string;
          const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;

          const body: any = {
            to,
            amount,
          };

          if (tokenAddress) {
            body.tokenAddress = tokenAddress;
          }

          const options: any = {
            method: 'POST',
            url: `${baseUrl}/wallets/${address}/transfer`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
            body,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }
        
        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }
      
      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }
  
  return returnData;
}

async function executeTransactionOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const operation = this.getNodeParameter('operation', 0) as string;
	const credentials = await this.getCredentials('beamApi') as any;
  const baseUrl = credentials.baseUrl || 'https://api.beam.mw/v1';

	for (let i = 0; i < items.length; i++) {
		try {
			let result: any;

			switch (operation) {
				case 'sendTransaction': {
					const walletId = this.getNodeParameter('walletId', i) as string;
					const amount = this.getNodeParameter('amount', i) as number;
					const recipient = this.getNodeParameter('recipient', i) as string;
					const fee = this.getNodeParameter('fee', i) as number;

					const body: any = {
						walletId,
						amount,
						recipient
					};

					if (fee > 0) {
						body.fee = fee;
					}

					const options: any = {
						method: 'POST',
						url: `${baseUrl}/transaction/send`,
						headers: {
							'Authorization': `Bearer ${credentials.apiKey}`,
							'Content-Type': 'application/json'
						},
						body,
						json: true
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'getTransaction': {
					const txId = this.getNodeParameter('txId', i) as string;

					const options: any = {
						method: 'GET',
						url: `${baseUrl}/transaction/${txId}`,
						headers: {
							'Authorization': `Bearer ${credentials.apiKey}`
						},
						json: true
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'getTransactionHistory': {
					const walletId = this.getNodeParameter('walletId', i) as string;
					const limit = this.getNodeParameter('limit', i) as number;
					const offset = this.getNodeParameter('offset', i) as number;

					const queryParams = new URLSearchParams({
						walletId,
						limit: limit.toString(),
						offset: offset.toString()
					});

					const options: any = {
						method: 'GET',
						url: `${baseUrl}/transaction?${queryParams}`,
						headers: {
							'Authorization': `Bearer ${credentials.apiKey}`
						},
						json: true
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'estimateTransactionFee': {
					const amount = this.getNodeParameter('amount', i) as number;
					const recipient = this.getNodeParameter('recipient', i) as string;

					const options: any = {
						method: 'POST',
						url: `${baseUrl}/transaction/estimate`,
						headers: {
							'Authorization': `Bearer ${credentials.apiKey}`,
							'Content-Type': 'application/json'
						},
						body: {
							amount,
							recipient
						},
						json: true
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'getTransactionStatus': {
					const txId = this.getNodeParameter('txId', i) as string;

					const options: any = {
						method: 'GET',
						url: `${baseUrl}/transaction/${txId}/status`,
						headers: {
							'Authorization': `Bearer ${credentials.apiKey}`
						},
						json: true
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

        case 'createTransaction': {
          const from = this.getNodeParameter('from', i) as string;
          const to = this.getNodeParameter('to', i) as string;
          const amount = this.getNodeParameter('amount', i) as string;
          const data = this.getNodeParameter('data', i) as string;

          const body: any = {
            from,
            to,
            amount,
          };

          if (data) {
            body.data = data;
          }

          const options: any = {
            method: 'POST',
            url: `${baseUrl}/transactions`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAllTransactions': {
          const address = this.getNodeParameter('address', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;
          const offset = this.getNodeParameter('offset', i) as number;
          const status = this.getNodeParameter('status', i) as string;

          const queryParams: any = {
            limit: limit.toString(),
            offset: offset.toString(),
          };

          if (address) {
            queryParams.address = address;
          }

          if (status) {
            queryParams.status = status;
          }

          const queryString = Object.keys(queryParams)
            .map((key: string) => `${key}=${encodeURIComponent(queryParams[key])}`)
            .join('&');

          const options: any = {
            method: 'GET',
            url: `${baseUrl}/transactions?${queryString}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'confirmTransaction': {
          const hash = this.getNodeParameter('hash', i) as string;
          const confirmations = this.getNodeParameter('confirmations', i) as number;

          const body: any = {
            confirmations,
          };

          const options: any = {
            method: 'POST',
            url: `${baseUrl}/transactions/${hash}/confirm`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

				default:
					throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
			}

			returnData.push({ json: result, pairedItem: { item: i } });

		} catch (error: any) {
			if (this.continueOnFail()) {
				returnData.push({
					json: { error: error.message },
					pairedItem: { item: i }
				});
			} else {
				throw new NodeApiError(this.getNode(), error);
			}
		}
	}

	return returnData;
}

async function executeAddressOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('beamApi') as any;
  const baseUrl = credentials.baseUrl || 'https://api.beam.mw/v1';

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'generateAddress': {
          const walletId = this.getNodeParameter('walletId', i) as string;
          const expiration = this.getNodeParameter('expiration', i) as number;

          const options: any = {
            method: 'POST',
            url: `${baseUrl}/address/generate`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: {
              walletId,
              expiration,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAddress': {
          const addressId = this.getNodeParameter('addressId', i) as string;

          const options: any = {
            method: 'GET',
            url: `${baseUrl}/address/${addressId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'listAddresses': {
          const walletId = this.getNodeParameter('walletId', i) as string;
          const active = this.getNodeParameter('active', i) as boolean;

          const queryParams = new URLSearchParams();
          if (walletId) {
            queryParams.append('walletId', walletId);
          }
          queryParams.append('active', active.toString());

          const options: any = {
            method: 'GET',
            url: `${baseUrl}/address?${queryParams.toString()}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'updateAddress': {
          const addressId = this.getNodeParameter('addressId', i) as string;
          const label = this.getNodeParameter('label', i) as string;
          const expiration = this.getNodeParameter('expiration', i) as number;

          const body: any = {};
          if (label) {
            body.label = label;
          }
          if (expiration) {
            body.expiration = expiration;
          }

          const options: any = {
            method: 'PUT',
            url: `${baseUrl}/address/${addressId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'expireAddress': {
          const addressId = this.getNodeParameter('addressId', i) as string;

          const options: any = {
            method: 'DELETE',
            url: `${baseUrl}/address/${addressId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }

  return returnData;
}

async function executeAssetOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('beamApi') as any;
  const baseUrl = credentials.baseUrl || 'https://api.beam.mw/v1';

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'createAsset': {
          const walletId = this.getNodeParameter('walletId', i) as string;
          const metadata = this.getNodeParameter('metadata', i) as string;
          const amount = this.getNodeParameter('amount', i) as number;

          const options: any = {
            method: 'POST',
            url: `${baseUrl}/asset/create`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: {
              walletId,
              metadata,
              amount,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAsset': {
          const assetId = this.getNodeParameter('assetId', i) as string;

          const options: any = {
            method: 'GET',
            url: `${baseUrl}/asset/${assetId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'listAssets': {
          const walletId = this.getNodeParameter('walletId', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;
          const offset = this.getNodeParameter('offset', i) as number;

          const options: any = {
            method: 'GET',
            url: `${baseUrl}/asset`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            qs: {
              walletId,
              limit,
              offset,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'mintAsset': {
          const assetId = this.getNodeParameter('assetId', i) as string;
          const amount = this.getNodeParameter('amount', i) as number;

          const options: any = {
            method: 'POST',
            url: `${baseUrl}/asset/mint`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: {
              assetId,
              amount,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'burnAsset': {
          const assetId = this.getNodeParameter('assetId', i) as string;
          const amount = this.getNodeParameter('amount', i) as number;

          const options: any = {
            method: 'POST',
            url: `${baseUrl}/asset/burn`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: {
              assetId,
              amount,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }

  return returnData;
}

async function executeNodeOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const operation = this.getNodeParameter('operation', 0) as string;
	const credentials = await this.getCredentials('beamApi') as any;
  const baseUrl = credentials.baseUrl || 'https://api.beam.mw/v1';

	for (let i = 0; i < items.length; i++) {
		try {
			let result: any;

			switch (operation) {
				case 'getNodeStatus': {
					const options: any = {
						method: 'GET',
						url: `${baseUrl}/node/status`,
						headers: {
							'Authorization': `Bearer ${credentials.apiKey}`,
							'Content-Type': 'application/json',
						},
						json: true,
					};
					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'getNodePeers': {
					const options: any = {
						method: 'GET',
						url: `${baseUrl}/node/peers`,
						headers: {
							'Authorization': `Bearer ${credentials.apiKey}`,
							'Content-Type': 'application/json',
						},
						json: true,
					};
					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'getBlocks': {
					const limit = this.getNodeParameter('limit', i) as number;
					const height = this.getNodeParameter('height', i) as number;
					
					const queryParams = new URLSearchParams();
					if (limit) queryParams.append('limit', limit.toString());
					if (height) queryParams.append('height', height.toString());
					
					const queryString = queryParams.toString();
					const url = queryString 
						? `${baseUrl}/node/blocks?${queryString}`
						: `${baseUrl}/node/blocks`;

					const options: any = {
						method: 'GET',
						url,
						headers: {
							'Authorization': `Bearer ${credentials.apiKey}`,
							'Content-Type': 'application/json',
						},
						json: true,
					};
					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'getBlock': {
					const blockHeight = this.getNodeParameter('blockHeight', i) as number;
					
					const options: any = {
						method: 'GET',
						url: `${baseUrl}/node/block/${blockHeight}`,
						headers: {
							'Authorization': `Bearer ${credentials.apiKey}`,
							'Content-Type': 'application/json',
						},
						json: true,
					};
					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'getMiningInfo': {
					const options: any = {
						method: 'GET',
						url: `${baseUrl}/node/mining`,
						headers: {
							'Authorization': `Bearer ${credentials.apiKey}`,
							'Content-Type': 'application/json',
						},
						json: true,
					};
					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				default:
					throw new NodeOperationError(
						this.getNode(),
						`Unknown operation: ${operation}`,
					);
			}

			returnData.push({
				json: result,
				pairedItem: { item: i },
			});
		} catch (error: any) {
			if (this.continueOnFail()) {
				returnData.push({
					json: { error: error.message },
					pairedItem: { item: i },
				});
			} else {
				throw new NodeApiError(this.getNode(), error);
			}
		}
	}

	return returnData;
}

async function executeSphereMarketplaceOperations(
  this: IExecuteFunctions,
  items