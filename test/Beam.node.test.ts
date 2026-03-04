/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { Beam } from '../nodes/Beam/Beam.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('Beam Node', () => {
  let node: Beam;

  beforeAll(() => {
    node = new Beam();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('Beam');
      expect(node.description.name).toBe('beam');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 6 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(6);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(6);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('Wallet Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.beam.eco/v1',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  test('createWallet should create a new wallet successfully', async () => {
    const mockResponse = {
      address: '0x1234567890123456789012345678901234567890',
      network: 'ethereum',
      type: 'standard',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'createWallet';
        case 'network': return 'ethereum';
        case 'type': return 'standard';
        default: return null;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeWalletOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://api.beam.eco/v1/wallets',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      json: true,
      body: {
        network: 'ethereum',
        type: 'standard',
      },
    });
  });

  test('getWallet should retrieve wallet details', async () => {
    const mockResponse = {
      address: '0x1234567890123456789012345678901234567890',
      network: 'ethereum',
      balance: '1000000000000000000',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getWallet';
        case 'address': return '0x1234567890123456789012345678901234567890';
        default: return null;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeWalletOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.beam.eco/v1/wallets/0x1234567890123456789012345678901234567890',
      headers: {
        'Authorization': 'Bearer test-api-key',
      },
      json: true,
    });
  });

  test('getWalletBalance should retrieve wallet balance', async () => {
    const mockResponse = {
      balance: '5000000000000000000',
      tokenAddress: '0xA0b86a33E6441f8312ED4D17C9E7F82a4C1E1234',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getWalletBalance';
        case 'address': return '0x1234567890123456789012345678901234567890';
        case 'tokenAddress': return '0xA0b86a33E6441f8312ED4D17C9E7F82a4C1E1234';
        default: return null;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeWalletOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.beam.eco/v1/wallets/0x1234567890123456789012345678901234567890/balance?tokenAddress=0xA0b86a33E6441f8312ED4D17C9E7F82a4C1E1234',
      headers: {
        'Authorization': 'Bearer test-api-key',
      },
      json: true,
    });
  });

  test('transferTokens should transfer tokens successfully', async () => {
    const mockResponse = {
      txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      status: 'pending',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'transferTokens';
        case 'address': return '0x1234567890123456789012345678901234567890';
        case 'to': return '0x9876543210987654321098765432109876543210';
        case 'amount': return '1000000000000000000';
        case 'tokenAddress': return '0xA0b86a33E6441f8312ED4D17C9E7F82a4C1E1234';
        default: return null;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeWalletOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://api.beam.eco/v1/wallets/0x1234567890123456789012345678901234567890/transfer',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      json: true,
      body: {
        to: '0x9876543210987654321098765432109876543210',
        amount: '1000000000000000000',
        tokenAddress: '0xA0b86a33E6441f8312ED4D17C9E7F82a4C1E1234',
      },
    });
  });

  test('should handle API errors properly', async () => {
    const mockError = new Error('API Error: Wallet not found');

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getWallet';
        case 'address': return '0xinvalidaddress';
        default: return null;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);

    await expect(
      executeWalletOperations.call(mockExecuteFunctions, [{ json: {} }])
    ).rejects.toThrow(mockError);
  });

  test('should continue on fail when configured', async () => {
    const mockError = new Error('API Error');

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getWallet';
        case 'address': return '0xinvalidaddress';
        default: return null;
      }
    });

    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);

    const result = await executeWalletOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result[0].json).toEqual({ error: 'API Error' });
    expect(result[0].pairedItem).toEqual({ item: 0 });
  });
});

describe('Transaction Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.beam.eco/v1',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  test('should create transaction successfully', async () => {
    const mockResponse = {
      hash: '0x123456789abcdef',
      status: 'pending',
      from: '0xfrom',
      to: '0xto',
      amount: '1000000000000000000',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'createTransaction';
        case 'from': return '0xfrom';
        case 'to': return '0xto';
        case 'amount': return '1000000000000000000';
        case 'data': return '';
        default: return '';
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeTransactionOperations.call(mockExecuteFunctions, items);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://api.beam.eco/v1/transactions',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      body: {
        from: '0xfrom',
        to: '0xto',
        amount: '1000000000000000000',
      },
      json: true,
    });
  });

  test('should get transaction by hash successfully', async () => {
    const mockResponse = {
      hash: '0x123456789abcdef',
      status: 'confirmed',
      confirmations: 12,
      blockNumber: 12345,
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getTransaction';
        case 'hash': return '0x123456789abcdef';
        default: return '';
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeTransactionOperations.call(mockExecuteFunctions, items);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.beam.eco/v1/transactions/0x123456789abcdef',
      headers: {
        'Authorization': 'Bearer test-api-key',
      },
      json: true,
    });
  });

  test('should get all transactions with filters', async () => {
    const mockResponse = {
      transactions: [],
      total: 0,
      page: 1,
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getAllTransactions';
        case 'address': return '0xaddress';
        case 'limit': return 20;
        case 'offset': return 0;
        case 'status': return 'confirmed';
        default: return '';
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeTransactionOperations.call(mockExecuteFunctions, items);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.beam.eco/v1/transactions?limit=20&offset=0&address=0xaddress&status=confirmed',
      headers: {
        'Authorization': 'Bearer test-api-key',
      },
      json: true,
    });
  });

  test('should confirm transaction successfully', async () => {
    const mockResponse = {
      hash: '0x123456789abcdef',
      confirmed: true,
      confirmations: 6,
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'confirmTransaction';
        case 'hash': return '0x123456789abcdef';
        case 'confirmations': return 6;
        default: return '';
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeTransactionOperations.call(mockExecuteFunctions, items);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://api.beam.eco/v1/transactions/0x123456789abcdef/confirm',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      body: {
        confirmations: 6,
      },
      json: true,
    });
  });

  test('should estimate transaction fee successfully', async () => {
    const mockResponse = {
      gasPrice: '20000000000',
      gasLimit: '21000',
      estimatedFee: '420000000000000',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'estimateTransactionFee';
        case 'from': return '0xfrom';
        case 'to': return '0xto';
        case 'amount': return '1000000000000000000';
        case 'data': return '';
        default: return '';
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeTransactionOperations.call(mockExecuteFunctions, items);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.beam.eco/v1/transactions/estimate-fee?from=0xfrom&to=0xto&amount=1000000000000000000',
      headers: {
        'Authorization': 'Bearer test-api-key',
      },
      json: true,
    });
  });

  test('should handle API errors', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getTransaction';
        case 'hash': return '0xinvalid';
        default: return '';
      }
    });

    const apiError = new Error('Transaction not found');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(apiError);

    const items = [{ json: {} }];

    await expect(
      executeTransactionOperations.call(mockExecuteFunctions, items),
    ).rejects.toThrow();
  });

  test('should continue on fail when configured', async () => {
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getTransaction';
        case 'hash': return '0xinvalid';
        default: return '';
      }
    });

    const apiError = new Error('Transaction not found');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(apiError);

    const items = [{ json: {} }];
    const result = await executeTransactionOperations.call(mockExecuteFunctions, items);

    expect(result).toEqual([
      { json: { error: 'Transaction not found' }, pairedItem: { item: 0 } },
    ]);
  });
});

describe('SphereMarketplace Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.beam.eco/v1',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  test('should create NFT listing successfully', async () => {
    const mockListing = {
      listingId: 'listing-123',
      tokenId: '1',
      contract: '0x123...',
      price: '1.5',
      status: 'active',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation': return 'createListing';
        case 'tokenId': return '1';
        case 'contract': return '0x123...';
        case 'price': return '1.5';
        case 'duration': return 86400;
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockListing);

    const result = await executeSphereMarketplaceOperations.call(
      mockExecuteFunctions,
      [{ json: {} }],
    );

    expect(result).toEqual([
      {
        json: mockListing,
        pairedItem: { item: 0 },
      },
    ]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://api.beam.eco/v1/sphere/listings',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      body: {
        tokenId: '1',
        contract: '0x123...',
        price: '1.5',
        duration: 86400,
      },
      json: true,
    });
  });

  test('should get listing details successfully', async () => {
    const mockListing = {
      listingId: 'listing-123',
      tokenId: '1',
      price: '1.5',
      seller: '0xabc...',
      status: 'active',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation': return 'getListing';
        case 'listingId': return 'listing-123';
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockListing);

    const result = await executeSphereMarketplaceOperations.call(
      mockExecuteFunctions,
      [{ json: {} }],
    );

    expect(result).toEqual([
      {
        json: mockListing,
        pairedItem: { item: 0 },
      },
    ]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.beam.eco/v1/sphere/listings/listing-123',
      headers: {
        'Authorization': 'Bearer test-api-key',
      },
      json: true,
    });
  });

  test('should get all listings with filters successfully', async () => {
    const mockListings = {
      listings: [
        { listingId: '1', price: '1.0' },
        { listingId: '2', price: '2.0' },
      ],
      total: 2,
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation': return 'getAllListings';
        case 'category': return 'art';
        case 'priceMin': return '1.0';
        case 'priceMax': return '5.0';
        case 'limit': return 50;
        case 'offset': return 0;
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockListings);

    const result = await executeSphereMarketplaceOperations.call(
      mockExecuteFunctions,
      [{ json: {} }],
    );

    expect(result).toEqual([
      {
        json: mockListings,
        pairedItem: { item: 0 },
      },
    ]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.beam.eco/v1/sphere/listings?limit=50&offset=0&category=art&priceMin=1.0&priceMax=5.0',
      headers: {
        'Authorization': 'Bearer test-api-key',
      },
      json: true,
    });
  });

  test('should update listing successfully', async () => {
    const mockUpdatedListing = {
      listingId: 'listing-123',
      price: '2.0',
      description: 'Updated description',
      status: 'active',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation': return 'updateListing';
        case 'listingId': return 'listing-123';
        case 'price': return '2.0';
        case 'description': return 'Updated description';
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockUpdatedListing);

    const result = await executeSphereMarketplaceOperations.call(
      mockExecuteFunctions,
      [{ json: {} }],
    );

    expect(result).toEqual([
      {
        json: mockUpdatedListing,
        pairedItem: { item: 0 },
      },
    ]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'PUT',
      url: 'https://api.beam.eco/v1/sphere/listings/listing-123',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      body: {
        price: '2.0',
        description: 'Updated description',
      },
      json: true,
    });
  });

  test('should buy listing successfully', async () => {
    const mockPurchase = {
      transactionId: 'tx-123',
      listingId: 'listing-123',
      buyer: '0xbuyer...',
      price: '1.5',
      status: 'completed',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation': return 'buyListing';
        case 'listingId': return 'listing-123';
        case 'buyerAddress': return '0xbuyer...';
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockPurchase);

    const result = await executeSphereMarketplaceOperations.call(
      mockExecuteFunctions,
      [{ json: {} }],
    );

    expect(result).toEqual([
      {
        json: mockPurchase,
        pairedItem: { item: 0 },
      },
    ]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://api.beam.eco/v1/sphere/listings/listing-123/buy',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      body: {
        buyerAddress: '0xbuyer...',
      },
      json: true,
    });
  });

  test('should cancel listing successfully', async () => {
    const mockCancellation = {
      listingId: 'listing-123',
      status: 'cancelled',
      cancelledAt: '2024-01-01T00:00:00Z',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation': return 'cancelListing';
        case 'listingId': return 'listing-123';
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockCancellation);

    const result = await executeSphereMarketplaceOperations.call(
      mockExecuteFunctions,
      [{ json: {} }],
    );

    expect(result).toEqual([
      {
        json: mockCancellation,
        pairedItem: { item: 0 },
      },
    ]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'DELETE',
      url: 'https://api.beam.eco/v1/sphere/listings/listing-123',
      headers: {
        'Authorization': 'Bearer test-api-key',
      },
      json: true,
    });
  });

  test('should handle API errors gracefully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      switch (paramName) {
        case 'operation': return 'getListing';
        case 'listingId': return 'invalid-listing';
        default: return undefined;
      }
    });

    const apiError = new Error('Listing not found');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(apiError);
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const result = await executeSphereMarketplaceOperations.call(
      mockExecuteFunctions,
      [{ json: {} }],
    );

    expect(result).toEqual([
      {
        json: { error: 'Listing not found' },
        pairedItem: { item: 0 },
      },
    ]);
  });

  test('should throw error for unknown operation', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === 'operation') return 'unknownOperation';
      return undefined;
    });

    await expect(
      executeSphereMarketplaceOperations.call(mockExecuteFunctions, [{ json: {} }]),
    ).rejects.toThrow('Unknown operation: unknownOperation');
  });
});

describe('Gaming Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.beam.eco/v1',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  test('createGameAsset should create a new game asset', async () => {
    const mockResponse = { id: 'asset123', gameId: 'game1', assetType: 'weapon', created: true };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      const params: any = {
        operation: 'createGameAsset',
        gameId: 'game1',
        assetType: 'weapon',
        metadata: '{"name": "Sword", "damage": 100}',
        owner: 'player123',
      };
      return params[param];
    });

    const result = await executeGamingOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://api.beam.eco/v1/gaming/assets',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      body: {
        gameId: 'game1',
        assetType: 'weapon',
        metadata: { name: 'Sword', damage: 100 },
        owner: 'player123',
      },
      json: true,
    });

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
  });

  test('getGameAsset should retrieve game asset details', async () => {
    const mockResponse = { id: 'asset123', name: 'Epic Sword', owner: 'player123' };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      const params: any = {
        operation: 'getGameAsset',
        assetId: 'asset123',
      };
      return params[param];
    });

    const result = await executeGamingOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.beam.eco/v1/gaming/assets/asset123',
      headers: {
        'Authorization': 'Bearer test-api-key',
      },
      json: true,
    });

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
  });

  test('getAllGameAssets should list game assets with filters', async () => {
    const mockResponse = { assets: [{ id: 'asset1' }, { id: 'asset2' }], total: 2 };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      const params: any = {
        operation: 'getAllGameAssets',
        gameId: 'game1',
        playerId: 'player123',
        limit: 10,
        offset: 0,
      };
      return params[param];
    });

    const result = await executeGamingOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.beam.eco/v1/gaming/assets?gameId=game1&playerId=player123&limit=10&offset=0',
      headers: {
        'Authorization': 'Bearer test-api-key',
      },
      json: true,
    });

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
  });

  test('updateGameAsset should update asset properties', async () => {
    const mockResponse = { id: 'asset123', updated: true };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      const params: any = {
        operation: 'updateGameAsset',
        assetId: 'asset123',
        metadata: '{"name": "Updated Sword"}',
        stats: '{"damage": 150}',
      };
      return params[param];
    });

    const result = await executeGamingOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'PUT',
      url: 'https://api.beam.eco/v1/gaming/assets/asset123',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      body: {
        metadata: { name: 'Updated Sword' },
        stats: { damage: 150 },
      },
      json: true,
    });

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
  });

  test('createAchievement should award achievement to player', async () => {
    const mockResponse = { id: 'achievement123', playerId: 'player123', awarded: true };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      const params: any = {
        operation: 'createAchievement',
        playerId: 'player123',
        achievementId: 'first_win',
        gameId: 'game1',
      };
      return params[param];
    });

    const result = await executeGamingOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://api.beam.eco/v1/gaming/achievements',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      body: {
        playerId: 'player123',
        achievementId: 'first_win',
        gameId: 'game1',
      },
      json: true,
    });

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
  });

  test('getLeaderboard should retrieve game leaderboard', async () => {
    const mockResponse = { leaderboard: [{ player: 'player1', score: 1000 }] };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      const params: any = {
        operation: 'getLeaderboard',
        gameId: 'game1',
        metric: 'score',
        limit: 10,
      };
      return params[param];
    });

    const result = await executeGamingOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.beam.eco/v1/gaming/leaderboard/game1?metric=score&limit=10',
      headers: {
        'Authorization': 'Bearer test-api-key',
      },
      json: true,
    });

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
  });

  test('should handle API errors gracefully', async () => {
    const error = new Error('API Error');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      const params: any = {
        operation: 'getGameAsset',
        assetId: 'invalid',
      };
      return params[param];
    });

    const result = await executeGamingOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
  });
});

describe('DeFi Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.beam.eco/v1',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('stakeTokens', () => {
    it('should stake tokens successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'stakeTokens';
          case 'amount': return '1000';
          case 'tokenAddress': return '0x123...abc';
          case 'protocol': return 'compound';
          case 'duration': return 30;
          default: return undefined;
        }
      });

      const mockResponse = {
        success: true,
        stakeId: 'stake_123',
        transactionHash: '0xabc...def',
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeDeFiOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.beam.eco/v1/defi/stake',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          amount: '1000',
          tokenAddress: '0x123...abc',
          protocol: 'compound',
          duration: 30,
        },
        json: true,
      });
    });
  });

  describe('getStake', () => {
    it('should get stake details successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getStake';
          case 'stakeId': return 'stake_123';
          default: return undefined;
        }
      });

      const mockResponse = {
        stakeId: 'stake_123',
        amount: '1000',
        protocol: 'compound',
        status: 'active',
        rewards: '50',
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeDeFiOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.beam.eco/v1/defi/stakes/stake_123',
        headers: {
          'Authorization': 'Bearer test-api-key',
        },
        json: true,
      });
    });
  });

  describe('getAllStakes', () => {
    it('should list user stakes successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getAllStakes';
          case 'userAddress': return '0xuser123';
          case 'protocol': return 'compound';
          case 'limit': return 10;
          case 'offset': return 0;
          default: return undefined;
        }
      });

      const mockResponse = {
        stakes: [
          { stakeId: 'stake_1', amount: '1000' },
          { stakeId: 'stake_2', amount: '2000' },
        ],
        total: 2,
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeDeFiOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('unstakeTokens', () => {
    it('should unstake tokens successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'unstakeTokens';
          case 'stakeId': return 'stake_123';
          case 'amount': return '500';
          default: return undefined;
        }
      });

      const mockResponse = {
        success: true,
        transactionHash: '0xdef...ghi',
        unstakedAmount: '500',
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeDeFiOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('getLiquidityPools', () => {
    it('should get liquidity pools successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getLiquidityPools';
          case 'tokenA': return '0xtoken1';
          case 'tokenB': return '0xtoken2';
          case 'limit': return 20;
          case 'offset': return 0;
          default: return undefined;
        }
      });

      const mockResponse = {
        pools: [
          { poolId: 'pool_1', tokenA: '0xtoken1', tokenB: '0xtoken2', tvl: '1000000' },
        ],
        total: 1,
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeDeFiOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('addLiquidity', () => {
    it('should add liquidity successfully', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'addLiquidity';
          case 'poolId': return 'pool_123';
          case 'amountA': return '1000';
          case 'amountB': return '2000';
          default: return undefined;
        }
      });

      const mockResponse = {
        success: true,
        transactionHash: '0xliquidity123',
        lpTokensReceived: '1500',
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeDeFiOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should handle API errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'stakeTokens';
        return 'test-value';
      });

      const error = new Error('API Error');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const items = [{ json: {} }];
      const result = await executeDeFiOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json.error).toBe('API Error');
    });

    it('should throw error for unknown operation', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'unknownOperation';
        return 'test-value';
      });

      const items = [{ json: {} }];

      await expect(executeDeFiOperations.call(mockExecuteFunctions, items))
        .rejects
        .toThrow('Unknown operation: unknownOperation');
    });
  });
});
});
