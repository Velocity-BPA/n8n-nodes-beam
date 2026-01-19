import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

/**
 * Beam API Credentials
 * 
 * Used for accessing Beam's REST API services including
 * player profiles, game integrations, and asset management.
 */
export class BeamApi implements ICredentialType {
	name = 'beamApi';
	displayName = 'Beam API';
	documentationUrl = 'https://docs.onbeam.com/api';
	
	properties: INodeProperties[] = [
		{
			displayName: 'API Endpoint',
			name: 'apiEndpoint',
			type: 'options',
			options: [
				{
					name: 'Production',
					value: 'https://api.onbeam.com',
				},
				{
					name: 'Testnet',
					value: 'https://api.testnet.onbeam.com',
				},
				{
					name: 'Custom',
					value: 'custom',
				},
			],
			default: 'https://api.onbeam.com',
			description: 'Beam API endpoint',
		},
		{
			displayName: 'Custom API URL',
			name: 'customApiUrl',
			type: 'string',
			default: '',
			placeholder: 'https://your-api.onbeam.com',
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
			description: 'Your Beam API key',
			required: true,
		},
		{
			displayName: 'Project ID',
			name: 'projectId',
			type: 'string',
			default: '',
			description: 'Your Beam project ID',
			required: true,
		},
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{
					name: 'Production',
					value: 'production',
				},
				{
					name: 'Development',
					value: 'development',
				},
			],
			default: 'production',
			description: 'API environment',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'x-api-key': '={{$credentials.apiKey}}',
				'x-project-id': '={{$credentials.projectId}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.apiEndpoint === "custom" ? $credentials.customApiUrl : $credentials.apiEndpoint}}',
			url: '/v1/health',
			method: 'GET',
		},
	};
}
