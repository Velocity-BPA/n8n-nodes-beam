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
            name: 'unknown',
            value: 'unknown',
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
  displayOptions: {
    show: {
      resource: ['wallet'],
    },
  },
  options: [
    {
      name: 'Create Wallet',
      value: 'createWallet',
      description: 'Create a new wallet',
      action: 'Create wallet',
    },
    {
      name: 'Get Wallet',
      value: 'getWallet',
      description: 'Get wallet details by address',
      action: 'Get wallet',
    },
    {
      name: 'Get Wallet Balance',
      value: 'getWalletBalance',
      description: 'Get wallet balance',
      action: 'Get wallet balance',
    },
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
    {
      name: 'Delete Wallet',
      value: 'deleteWallet',
      description: 'Remove wallet from management',
      action: 'Delete wallet',
    },
  ],
  default: 'createWallet',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
    },
  },
  options: [
    {
      name: 'Create Transaction',
      value: 'createTransaction',
      description: 'Create and broadcast a new transaction',
      action: 'Create transaction',
    },
    {
      name: 'Get Transaction',
      value: 'getTransaction',
      description: 'Get transaction details by hash',
      action: 'Get transaction',
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
    {
      name: 'Estimate Transaction Fee',
      value: 'estimateTransactionFee',
      description: 'Estimate gas fees for a transaction',
      action: 'Estimate transaction fee',
    },
  ],
  default: 'createTransaction',
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
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['wallet'],
      operation: ['getWallet', 'getWalletBalance', 'getWalletTransactions', 'transferTokens', 'deleteWallet'],
    },
  },
  default: '',
  description: 'The wallet address',
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
      operation: ['getWalletTransactions'],
    },
  },
  default: 10,
  description: 'Maximum number of transactions to return',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['wallet'],
      operation: ['getWalletTransactions'],
    },
  },
  default: 0,
  description: 'Number of transactions to skip',
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
  displayName: 'Amount',
  name: 'amount',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['createTransaction', 'estimateTransactionFee'],
    },
  },
  default: '',
  description: 'Amount to transfer (in wei for Ethereum)',
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
      operation: ['getTransaction', 'confirmTransaction'],
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
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['getAllTransactions'],
    },
  },
  default: 10,
  description: 'Maximum number of transactions to return',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['getAllTransactions'],
    },
  },
  default: 0,
  description: 'Number of transactions to skip',
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
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['sphereMarketplace'],
      operation: ['getAllListings'],
    },
  },
  default: 50,
  description: 'Maximum number of listings to return',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['sphereMarketplace'],
      operation: ['getAllListings'],
    },
  },
  default: 0,
  description: 'Number of listings to skip',
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
  displayName: 'Metadata',
  name: 'metadata',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['gaming'],
      operation: ['createGameAsset'],
    },
  },
  default: '{}',
  description: 'Asset metadata including name, description, and properties',
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
  displayName: 'Asset ID',
  name: 'assetId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['gaming'],
      operation: ['getGameAsset', 'updateGameAsset'],
    },
  },
  default: '',
  description: 'The ID of the game asset',
},
{
  displayName: 'Game ID',
  name: 'gameId',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['gaming'],
      operation: ['getAllGameAssets'],
    },
  },
  default: '',
  description: 'Filter assets by game ID',
},
{
  displayName: 'Player ID',
  name: 'playerId',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['gaming'],
      operation: ['getAllGameAssets'],
    },
  },
  default: '',
  description: 'Filter assets by player ID',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['gaming'],
      operation: ['getAllGameAssets', 'getLeaderboard'],
    },
  },
  default: 50,
  description: 'Maximum number of results to return',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['gaming'],
      operation: ['getAllGameAssets'],
    },
  },
  default: 0,
  description: 'Number of results to skip',
},
{
  displayName: 'Metadata',
  name: 'metadata',
  type: 'json',
  required: false,
  displayOptions: {
    show: {
      resource: ['gaming'],
      operation: ['updateGameAsset'],
    },
  },
  default: '{}',
  description: 'Updated asset metadata',
},
{
  displayName: 'Stats',
  name: 'stats',
  type: 'json',
  required: false,
  displayOptions: {
    show: {
      resource: ['gaming'],
      operation: ['updateGameAsset'],
    },
  },
  default: '{}',
  description: 'Updated asset stats',
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
  displayName: 'Game ID',
  name: 'gameId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['gaming'],
      operation: ['createAchievement', 'getLeaderboard'],
    },
  },
  default: '',
  description: 'The ID of the game',
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
  displayName: 'Amount',
  name: 'amount',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['deFi'],
      operation: ['stakeTokens'],
    },
  },
  default: '',
  description: 'Amount of tokens to stake',
},
{
  displayName: 'Token Address',
  name: 'tokenAddress',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['deFi'],
      operation: ['stakeTokens'],
    },
  },
  default: '',
  description: 'Address of the token to stake',
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
  displayName: 'Duration',
  name: 'duration',
  type: 'number',
  required: true,
  displayOptions: {
    show: {
      resource: ['deFi'],
      operation: ['stakeTokens'],
    },
  },
  default: 0,
  description: 'Staking duration in days',
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
  displayName: 'Amount to Unstake',
  name: 'amount',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['deFi'],
      operation: ['unstakeTokens'],
    },
  },
  default: '',
  description: 'Amount of tokens to unstake',
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
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['deFi'],
      operation: ['getAllStakes', 'getLiquidityPools'],
    },
  },
  default: 100,
  description: 'Maximum number of results to return',
},
{
  displayName: 'Offset',
  name: 'offset',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['deFi'],
      operation: ['getAllStakes', 'getLiquidityPools'],
    },
  },
  default: 0,
  description: 'Number of results to skip',
},
{
  displayName: 'Token A',
  name: 'tokenA',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['deFi'],
      operation: ['getLiquidityPools'],
    },
  },
  default: '',
  description: 'First token address for liquidity pool filtering',
},
{
  displayName: 'Token B',
  name: 'tokenB',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['deFi'],
      operation: ['getLiquidityPools'],
    },
  },
  default: '',
  description: 'Second token address for liquidity pool filtering',
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
      case 'unknown':
        return [await executeunknownOperations.call(this, items)];
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
      const baseUrl = credentials.baseUrl || 'https://api.beam.eco/v1';

      switch (operation) {
        case 'createWallet': {
          const network = this.getNodeParameter('network', i) as string;
          const type = this.getNodeParameter('type', i) as string;

          const options: any = {
            method: 'POST',
            url: `${baseUrl}/wallets`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
            body: {
              network,
              type,
            },
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getWallet': {
          const address = this.getNodeParameter('address', i) as string;

          const options: any = {
            method: 'GET',
            url: `${baseUrl}/wallets/${address}`,
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

        case 'deleteWallet': {
          const address = this.getNodeParameter('address', i) as string;

          const options: any = {
            method: 'DELETE',
            url: `${baseUrl}/wallets/${address}`,
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

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
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
            url: `${credentials.baseUrl}/transactions`,
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

        case 'getTransaction': {
          const hash = this.getNodeParameter('hash', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/transactions/${hash}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
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
            url: `${credentials.baseUrl}/transactions?${queryString}`,
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
            url: `${credentials.baseUrl}/transactions/${hash}/confirm`,
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

        case 'estimateTransactionFee': {
          const from = this.getNodeParameter('from', i) as string;
          const to = this.getNodeParameter('to', i) as string;
          const amount = this.getNodeParameter('amount', i) as string;
          const data = this.getNodeParameter('data', i) as string;

          const queryParams: any = {
            from,
            to,
            amount,
          };

          if (data) {
            queryParams.data = data;
          }

          const queryString = Object.keys(queryParams)
            .map((key: string) => `${key}=${encodeURIComponent(queryParams[key])}`)
            .join('&');

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/transactions/estimate-fee?${queryString}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
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

      returnData.push({ json: result, pairedItem: { item: i } });
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

// PARSE ERROR for unknown — manual fix needed
// Raw: // No additional imports

{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['nft'],
    },
  },
  options: [
    {
      name: 'Mint NFT',
      value: 'mintNft',
      description: 'Mint a new NFT',
     

async function executeSphereMarketplaceOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('beamApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'createListing': {
          const tokenId = this.getNodeParameter('tokenId', i) as string;
          const contract = this.getNodeParameter('contract', i) as string;
          const price = this.getNodeParameter('price', i) as string;
          const duration = this.getNodeParameter('duration', i) as number;

          const body: any = {
            tokenId,
            contract,
            price,
            duration,
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/sphere/listings`,
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

        case 'getListing': {
          const listingId = this.getNodeParameter('listingId', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/sphere/listings/${listingId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAllListings': {
          const category = this.getNodeParameter('category', i) as string;
          const priceMin = this.getNodeParameter('priceMin', i) as string;
          const priceMax = this.getNodeParameter('priceMax', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;
          const offset = this.getNodeParameter('offset', i) as number;

          const queryParams: any = { limit, offset };
          if (category) queryParams.category = category;
          if (priceMin) queryParams.priceMin = priceMin;
          if (priceMax) queryParams.priceMax = priceMax;

          const queryString = new URLSearchParams(queryParams).toString();

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/sphere/listings?${queryString}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'updateListing': {
          const listingId = this.getNodeParameter('listingId', i) as string;
          const price = this.getNodeParameter('price', i) as string;
          const description = this.getNodeParameter('description', i) as string;

          const body: any = {};
          if (price) body.price = price;
          if (description) body.description = description;

          const options: any = {
            method: 'PUT',
            url: `${credentials.baseUrl}/sphere/listings/${listingId}`,
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

        case 'buyListing': {
          const listingId = this.getNodeParameter('listingId', i) as string;
          const buyerAddress = this.getNodeParameter('buyerAddress', i) as string;

          const body: any = {
            buyerAddress,
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/sphere/listings/${listingId}/buy`,
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

        case 'cancelListing': {
          const listingId = this.getNodeParameter('listingId', i) as string;

          const options: any = {
            method: 'DELETE',
            url: `${credentials.baseUrl}/sphere/listings/${listingId}`,
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

async function executeGamingOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('beamApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'createGameAsset': {
          const gameId = this.getNodeParameter('gameId', i) as string;
          const assetType = this.getNodeParameter('assetType', i) as string;
          const metadata = this.getNodeParameter('metadata', i) as any;
          const owner = this.getNodeParameter('owner', i) as string;

          const body: any = {
            gameId,
            assetType,
            metadata: typeof metadata === 'string' ? JSON.parse(metadata) : metadata,
            owner,
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/gaming/assets`,
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

        case 'getGameAsset': {
          const assetId = this.getNodeParameter('assetId', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/gaming/assets/${assetId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAllGameAssets': {
          const gameId = this.getNodeParameter('gameId', i) as string;
          const playerId = this.getNodeParameter('playerId', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;
          const offset = this.getNodeParameter('offset', i) as number;

          const queryParams: any = {};
          if (gameId) queryParams.gameId = gameId;
          if (playerId) queryParams.playerId = playerId;
          if (limit) queryParams.limit = limit.toString();
          if (offset) queryParams.offset = offset.toString();

          const queryString = new URLSearchParams(queryParams).toString();
          const url = `${credentials.baseUrl}/gaming/assets${queryString ? `?${queryString}` : ''}`;

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

        case 'updateGameAsset': {
          const assetId = this.getNodeParameter('assetId', i) as string;
          const metadata = this.getNodeParameter('metadata', i) as any;
          const stats = this.getNodeParameter('stats', i) as any;

          const body: any = {};
          if (metadata) {
            body.metadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
          }
          if (stats) {
            body.stats = typeof stats === 'string' ? JSON.parse(stats) : stats;
          }

          const options: any = {
            method: 'PUT',
            url: `${credentials.baseUrl}/gaming/assets/${assetId}`,
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

        case 'createAchievement': {
          const playerId = this.getNodeParameter('playerId', i) as string;
          const achievementId = this.getNodeParameter('achievementId', i) as string;
          const gameId = this.getNodeParameter('gameId', i) as string;

          const body: any = {
            playerId,
            achievementId,
            gameId,
          };

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/gaming/achievements`,
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

        case 'getLeaderboard': {
          const gameId = this.getNodeParameter('gameId', i) as string;
          const metric = this.getNodeParameter('metric', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;

          const queryParams: any = {
            metric,
          };
          if (limit) queryParams.limit = limit.toString();

          const queryString = new URLSearchParams(queryParams).toString();
          const url = `${credentials.baseUrl}/gaming/leaderboard/${gameId}?${queryString}`;

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

async function executeDeFiOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('beamApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'stakeTokens': {
          const amount = this.getNodeParameter('amount', i) as string;
          const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;
          const protocol = this.getNodeParameter('protocol', i) as string;
          const duration = this.getNodeParameter('duration', i) as number;

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/defi/stake`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: {
              amount,
              tokenAddress,
              protocol,
              duration,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getStake': {
          const stakeId = this.getNodeParameter('stakeId', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/defi/stakes/${stakeId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAllStakes': {
          const userAddress = this.getNodeParameter('userAddress', i) as string;
          const protocol = this.getNodeParameter('protocol', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;
          const offset = this.getNodeParameter('offset', i) as number;

          const queryParams = new URLSearchParams();
          queryParams.append('userAddress', userAddress);
          if (protocol) queryParams.append('protocol', protocol);
          queryParams.append('limit', limit.toString());
          queryParams.append('offset', offset.toString());

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/defi/stakes?${queryParams.toString()}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'unstakeTokens': {
          const stakeId = this.getNodeParameter('stakeId', i) as string;
          const amount = this.getNodeParameter('amount', i) as string;

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/defi/unstake`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: {
              stakeId,
              amount,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getLiquidityPools': {
          const tokenA = this.getNodeParameter('tokenA', i) as string;
          const tokenB = this.getNodeParameter('tokenB', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;
          const offset = this.getNodeParameter('offset', i) as number;

          const queryParams = new URLSearchParams();
          if (tokenA) queryParams.append('tokenA', tokenA);
          if (tokenB) queryParams.append('tokenB', tokenB);
          queryParams.append('limit', limit.toString());
          queryParams.append('offset', offset.toString());

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/defi/pools?${queryParams.toString()}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'addLiquidity': {
          const poolId = this.getNodeParameter('poolId', i) as string;
          const amountA = this.getNodeParameter('amountA', i) as string;
          const amountB = this.getNodeParameter('amountB', i) as string;

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/defi/pools/add-liquidity`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: {
              poolId,
              amountA,
              amountB,
            },
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
          pairedItem: { item: i },
        });
      } else {
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }

  return returnData;
}
