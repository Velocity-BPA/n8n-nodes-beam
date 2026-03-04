import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class BeamApi implements ICredentialType {
	name = 'beamApi';
	displayName = 'Beam API';
	documentationUrl = 'https://docs.beam.eco';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your Beam API key obtained from the developer portal',
		},
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.beam.eco/v1',
			required: true,
			description: 'Base URL for the Beam API',
		},
	];
}