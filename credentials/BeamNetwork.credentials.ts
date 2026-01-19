import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

/**
 * Beam Network Credentials
 * 
 * Supports Beam Mainnet, Testnet, and custom endpoints.
 * Beam is an Avalanche subnet focused on gaming.
 * 
 * Chain IDs:
 * - Mainnet: 4337
 * - Testnet: 13337
 */
export class BeamNetwork implements ICredentialType {
	name = 'beamNetwork';
	displayName = 'Beam Network';
	documentationUrl = 'https://docs.onbeam.com';
	
	properties: INodeProperties[] = [
		{
			displayName: 'Network',
			name: 'network',
			type: 'options',
			options: [
				{
					name: 'Beam Mainnet',
					value: 'mainnet',
				},
				{
					name: 'Beam Testnet',
					value: 'testnet',
				},
				{
					name: 'Custom Endpoint',
					value: 'custom',
				},
			],
			default: 'mainnet',
			description: 'Select the Beam network to connect to',
		},
		{
			displayName: 'RPC URL',
			name: 'rpcUrl',
			type: 'string',
			default: '',
			placeholder: 'https://build.onbeam.com/rpc',
			description: 'Custom RPC endpoint URL. Leave empty to use default for selected network.',
			displayOptions: {
				show: {
					network: ['custom'],
				},
			},
		},
		{
			displayName: 'Chain ID',
			name: 'chainId',
			type: 'number',
			default: 4337,
			description: 'Chain ID (4337 for mainnet, 13337 for testnet). Auto-populated based on network selection.',
			hint: 'Mainnet: 4337, Testnet: 13337',
		},
		{
			displayName: 'Private Key',
			name: 'privateKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Private key for signing transactions. Never share this key.',
			placeholder: '0x...',
		},
		{
			displayName: 'Beam SDK API Key',
			name: 'beamApiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Optional Beam SDK API key for enhanced features',
			placeholder: 'Your Beam API Key',
		},
		{
			displayName: 'WebSocket URL',
			name: 'wsUrl',
			type: 'string',
			default: '',
			placeholder: 'wss://build.onbeam.com/ws',
			description: 'WebSocket URL for real-time subscriptions. Leave empty to use default.',
		},
	];

	// Test the connection by checking chain ID
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.network === "mainnet" ? "https://build.onbeam.com/rpc" : $credentials.network === "testnet" ? "https://build.onbeam.com/rpc/testnet" : $credentials.rpcUrl}}',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				jsonrpc: '2.0',
				method: 'eth_chainId',
				params: [],
				id: 1,
			}),
		},
	};
}
