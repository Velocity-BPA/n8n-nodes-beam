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

    it('should define 5 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(5);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(5);
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
        apiKey: 'test-key', 
        baseUrl: 'https://api.beam.mw/v1' 
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { 
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn() 
      },
    };
  });

  describe('createWallet', () => {
    it('should create a wallet successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createWallet')
        .mockReturnValueOnce('test-seed-phrase')
        .mockReturnValueOnce('test-password');
      
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
        walletId: 'wallet-123',
        status: 'created' 
      });

      const result = await executeWalletOperations.call(mockExecuteFunctions, [{ json: {} }]);
      
      expect(result[0].json.walletId).toBe('wallet-123');
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://api.beam.mw/v1/wallet/create',
        headers: {
          'Authorization': 'Bearer test-key',
          'Content-Type': 'application/json',
        },
        body: {
          seed: 'test-seed-phrase',
          password: 'test-password',
        },
        json: true,
      });
    });

    it('should handle createWallet errors', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createWallet')
        .mockReturnValueOnce('test-seed')
        .mockReturnValueOnce('test-password');
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      const result = await executeWalletOperations.call(mockExecuteFunctions, [{ json: {} }]);
      
      expect(result[0].json.error).toBe('API Error');
    });
  });

  describe('getWallet', () => {
    it('should get wallet information successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getWallet')
        .mockReturnValueOnce('wallet-123');
      
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
        walletId: 'wallet-123',
        balance: 100 
      });

      const result = await executeWalletOperations.call(mockExecuteFunctions, [{ json: {} }]);
      
      expect(result[0].json.walletId).toBe('wallet-123');
    });
  });

  describe('listWallets', () => {
    it('should list wallets with pagination', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('listWallets')
        .mockReturnValueOnce(10)
        .mockReturnValueOnce(0);
      
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ 
        wallets: [],
        total: 0 
      });

      const result = await executeWalletOperations.call(mockExecuteFunctions, [{ json: {} }]);
      
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.beam.mw/v1/wallet',
        headers: {
          'Authorization': 'Bearer test-key',
        },
        qs: {
          limit: 10,
          offset: 0,
        },
        json: true,
      });
    });
  });
});

describe('Transaction Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-api-key',
				baseUrl: 'https://api.beam.mw/v1'
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
				requestWithAuthentication: jest.fn()
			}
		};
	});

	describe('sendTransaction operation', () => {
		it('should send transaction successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('sendTransaction')
				.mockReturnValueOnce('wallet123')
				.mockReturnValueOnce(100)
				.mockReturnValueOnce('recipient-address')
				.mockReturnValueOnce(0.01);

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				txId: 'tx123',
				status: 'pending'
			});

			const result = await executeTransactionOperations.call(
				mockExecuteFunctions,
				[{ json: {} }]
			);

			expect(result).toEqual([{
				json: { txId: 'tx123', status: 'pending' },
				pairedItem: { item: 0 }
			}]);
		});

		it('should handle send transaction error', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('sendTransaction')
				.mockReturnValueOnce('wallet123')
				.mockReturnValueOnce(100)
				.mockReturnValueOnce('invalid-address')
				.mockReturnValueOnce(0.01);

			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(
				new Error('Invalid recipient address')
			);
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeTransactionOperations.call(
				mockExecuteFunctions,
				[{ json: {} }]
			);

			expect(result).toEqual([{
				json: { error: 'Invalid recipient address' },
				pairedItem: { item: 0 }
			}]);
		});
	});

	describe('getTransaction operation', () => {
		it('should get transaction successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getTransaction')
				.mockReturnValueOnce('tx123');

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				txId: 'tx123',
				amount: 100,
				status: 'confirmed'
			});

			const result = await executeTransactionOperations.call(
				mockExecuteFunctions,
				[{ json: {} }]
			);

			expect(result).toEqual([{
				json: { txId: 'tx123', amount: 100, status: 'confirmed' },
				pairedItem: { item: 0 }
			}]);
		});
	});

	describe('getTransactionHistory operation', () => {
		it('should get transaction history successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getTransactionHistory')
				.mockReturnValueOnce('wallet123')
				.mockReturnValueOnce(50)
				.mockReturnValueOnce(0);

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				transactions: [
					{ txId: 'tx1', amount: 100 },
					{ txId: 'tx2', amount: 50 }
				]
			});

			const result = await executeTransactionOperations.call(
				mockExecuteFunctions,
				[{ json: {} }]
			);

			expect(result).toEqual([{
				json: {
					transactions: [
						{ txId: 'tx1', amount: 100 },
						{ txId: 'tx2', amount: 50 }
					]
				},
				pairedItem: { item: 0 }
			}]);
		});
	});

	describe('estimateTransactionFee operation', () => {
		it('should estimate fee successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('estimateTransactionFee')
				.mockReturnValueOnce(100)
				.mockReturnValueOnce('recipient-address');

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				estimatedFee: 0.01,
				currency: 'BEAM'
			});

			const result = await executeTransactionOperations.call(
				mockExecuteFunctions,
				[{ json: {} }]
			);

			expect(result).toEqual([{
				json: { estimatedFee: 0.01, currency: 'BEAM' },
				pairedItem: { item: 0 }
			}]);
		});
	});

	describe('getTransactionStatus operation', () => {
		it('should get transaction status successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getTransactionStatus')
				.mockReturnValueOnce('tx123');

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				txId: 'tx123',
				status: 'confirmed',
				confirmations: 6
			});

			const result = await executeTransactionOperations.call(
				mockExecuteFunctions,
				[{ json: {} }]
			);

			expect(result).toEqual([{
				json: { txId: 'tx123', status: 'confirmed', confirmations: 6 },
				pairedItem: { item: 0 }
			}]);
		});
	});
});

describe('Address Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-key',
        baseUrl: 'https://api.beam.mw/v1',
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

  describe('generateAddress operation', () => {
    it('should generate address successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('generateAddress')
        .mockReturnValueOnce('wallet-123')
        .mockReturnValueOnce(3600);

      const mockResponse = {
        addressId: 'addr-123',
        address: 'beam-address-123',
        walletId: 'wallet-123',
        expiration: 3600,
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeAddressOperations.call(mockExecuteFunctions, items);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 },
      }]);
    });

    it('should handle generateAddress error', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('generateAddress')
        .mockReturnValueOnce('wallet-123')
        .mockReturnValueOnce(3600);

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const items = [{ json: {} }];
      const result = await executeAddressOperations.call(mockExecuteFunctions, items);

      expect(result).toEqual([{
        json: { error: 'API Error' },
        pairedItem: { item: 0 },
      }]);
    });
  });

  describe('getAddress operation', () => {
    it('should get address successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getAddress')
        .mockReturnValueOnce('addr-123');

      const mockResponse = {
        addressId: 'addr-123',
        address: 'beam-address-123',
        walletId: 'wallet-123',
        status: 'active',
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeAddressOperations.call(mockExecuteFunctions, items);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 },
      }]);
    });
  });

  describe('listAddresses operation', () => {
    it('should list addresses successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('listAddresses')
        .mockReturnValueOnce('wallet-123')
        .mockReturnValueOnce(true);

      const mockResponse = {
        addresses: [
          { addressId: 'addr-1', address: 'beam-address-1' },
          { addressId: 'addr-2', address: 'beam-address-2' },
        ],
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeAddressOperations.call(mockExecuteFunctions, items);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 },
      }]);
    });
  });

  describe('updateAddress operation', () => {
    it('should update address successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('updateAddress')
        .mockReturnValueOnce('addr-123')
        .mockReturnValueOnce('Updated Label')
        .mockReturnValueOnce(7200);

      const mockResponse = {
        addressId: 'addr-123',
        label: 'Updated Label',
        expiration: 7200,
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeAddressOperations.call(mockExecuteFunctions, items);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 },
      }]);
    });
  });

  describe('expireAddress operation', () => {
    it('should expire address successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('expireAddress')
        .mockReturnValueOnce('addr-123');

      const mockResponse = {
        success: true,
        message: 'Address expired successfully',
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeAddressOperations.call(mockExecuteFunctions, items);

      expect(result).toEqual([{
        json: mockResponse,
        pairedItem: { item: 0 },
      }]);
    });
  });
});

describe('Asset Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-key',
        baseUrl: 'https://api.beam.mw/v1',
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

  it('should create asset successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('createAsset')
      .mockReturnValueOnce('wallet123')
      .mockReturnValueOnce('{"name":"TestAsset"}')
      .mockReturnValueOnce(1000);

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      assetId: 'asset123',
      status: 'created',
    });

    const result = await executeAssetOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://api.beam.mw/v1/asset/create',
      headers: {
        'Authorization': 'Bearer test-key',
        'Content-Type': 'application/json',
      },
      body: {
        walletId: 'wallet123',
        metadata: '{"name":"TestAsset"}',
        amount: 1000,
      },
      json: true,
    });

    expect(result).toEqual([
      {
        json: { assetId: 'asset123', status: 'created' },
        pairedItem: { item: 0 },
      },
    ]);
  });

  it('should get asset successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getAsset')
      .mockReturnValueOnce('asset123');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      assetId: 'asset123',
      metadata: '{"name":"TestAsset"}',
      totalSupply: 1000,
    });

    const result = await executeAssetOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.beam.mw/v1/asset/asset123',
      headers: {
        'Authorization': 'Bearer test-key',
      },
      json: true,
    });

    expect(result).toEqual([
      {
        json: {
          assetId: 'asset123',
          metadata: '{"name":"TestAsset"}',
          totalSupply: 1000,
        },
        pairedItem: { item: 0 },
      },
    ]);
  });

  it('should handle errors when continuing on fail', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('createAsset');
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

    const result = await executeAssetOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([
      {
        json: { error: 'API Error' },
        pairedItem: { item: 0 },
      },
    ]);
  });

  it('should mint asset tokens successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('mintAsset')
      .mockReturnValueOnce('asset123')
      .mockReturnValueOnce(500);

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      transactionId: 'tx123',
      status: 'pending',
    });

    const result = await executeAssetOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://api.beam.mw/v1/asset/mint',
      headers: {
        'Authorization': 'Bearer test-key',
        'Content-Type': 'application/json',
      },
      body: {
        assetId: 'asset123',
        amount: 500,
      },
      json: true,
    });

    expect(result).toEqual([
      {
        json: { transactionId: 'tx123', status: 'pending' },
        pairedItem: { item: 0 },
      },
    ]);
  });

  it('should burn asset tokens successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('burnAsset')
      .mockReturnValueOnce('asset123')
      .mockReturnValueOnce(200);

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      transactionId: 'tx456',
      status: 'pending',
    });

    const result = await executeAssetOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://api.beam.mw/v1/asset/burn',
      headers: {
        'Authorization': 'Bearer test-key',
        'Content-Type': 'application/json',
      },
      body: {
        assetId: 'asset123',
        amount: 200,
      },
      json: true,
    });

    expect(result).toEqual([
      {
        json: { transactionId: 'tx456', status: 'pending' },
        pairedItem: { item: 0 },
      },
    ]);
  });
});

describe('Node Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-key',
				baseUrl: 'https://api.beam.mw/v1',
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

	describe('getNodeStatus', () => {
		it('should get node status successfully', async () => {
			const mockResponse = { status: 'synced', height: 12345 };
			mockExecuteFunctions.getNodeParameter.mockReturnValue('getNodeStatus');
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeNodeOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{
				json: mockResponse,
				pairedItem: { item: 0 },
			}]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://api.beam.mw/v1/node/status',
				headers: {
					'Authorization': 'Bearer test-key',
					'Content-Type': 'application/json',
				},
				json: true,
			});
		});

		it('should handle errors when getting node status', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('getNodeStatus');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeNodeOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{
				json: { error: 'API Error' },
				pairedItem: { item: 0 },
			}]);
		});
	});

	describe('getNodePeers', () => {
		it('should get node peers successfully', async () => {
			const mockResponse = { peers: [{ id: '1', address: '192.168.1.1' }] };
			mockExecuteFunctions.getNodeParameter.mockReturnValue('getNodePeers');
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeNodeOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{
				json: mockResponse,
				pairedItem: { item: 0 },
			}]);
		});
	});

	describe('getBlocks', () => {
		it('should get blocks with parameters successfully', async () => {
			const mockResponse = { blocks: [{ height: 123, hash: 'abc' }] };
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getBlocks')
				.mockReturnValueOnce(10)
				.mockReturnValueOnce(100);
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeNodeOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{
				json: mockResponse,
				pairedItem: { item: 0 },
			}]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://api.beam.mw/v1/node/blocks?limit=10&height=100',
				headers: {
					'Authorization': 'Bearer test-key',
					'Content-Type': 'application/json',
				},
				json: true,
			});
		});
	});

	describe('getBlock', () => {
		it('should get specific block successfully', async () => {
			const mockResponse = { height: 123, hash: 'abc123' };
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getBlock')
				.mockReturnValueOnce(123);
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeNodeOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{
				json: mockResponse,
				pairedItem: { item: 0 },
			}]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://api.beam.mw/v1/node/block/123',
				headers: {
					'Authorization': 'Bearer test-key',
					'Content-Type': 'application/json',
				},
				json: true,
			});
		});
	});

	describe('getMiningInfo', () => {
		it('should get mining info successfully', async () => {
			const mockResponse = { difficulty: 1000, hashrate: 500 };
			mockExecuteFunctions.getNodeParameter.mockReturnValue('getMiningInfo');
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeNodeOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{
				json: mockResponse,
				pairedItem: { item: 0 },
			}]);
		});
	});
});
});
