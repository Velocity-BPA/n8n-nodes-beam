import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

/**
 * Sphere Marketplace Credentials
 * 
 * Sphere is the official NFT marketplace for the Beam ecosystem.
 * Used for listing, buying, selling NFTs and managing marketplace operations.
 */
export class SphereMarketplace implements ICredentialType {
	name = 'sphereMarketplace';
	displayName = 'Sphere Marketplace';
	documentationUrl = 'https://docs.sphere.market';
	
	properties: INodeProperties[] = [
		{
			displayName: 'API Endpoint',
			name: 'apiEndpoint',
			type: 'options',
			options: [
				{
					name: 'Production',
					value: 'https://api.sphere.market',
				},
				{
					name: 'Testnet',
					value: 'https://api.testnet.sphere.market',
				},
				{
					name: 'Custom',
					value: 'custom',
				},
			],
			default: 'https://api.sphere.market',
			description: 'Sphere API endpoint',
		},
		{
			displayName: 'Custom API URL',
			name: 'customApiUrl',
			type: 'string',
			default: '',
			placeholder: 'https://your-sphere-api.com',
			displayOptions: {
				show: {
					apiEndpoint: ['custom'],
				},
			},
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Your Sphere marketplace API key',
			required: true,
		},
		{
			displayName: 'Publisher ID',
			name: 'publisherId',
			type: 'string',
			default: '',
			description: 'Your Sphere publisher/seller ID',
		},
		{
			displayName: 'Webhook Secret',
			name: 'webhookSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Secret for verifying webhook payloads from Sphere',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
				'X-Publisher-Id': '={{$credentials.publisherId}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.apiEndpoint === "custom" ? $credentials.customApiUrl : $credentials.apiEndpoint}}',
			url: '/v1/status',
			method: 'GET',
		},
	};
}
