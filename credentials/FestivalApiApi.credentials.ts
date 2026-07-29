import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class FestivalApiApi implements ICredentialType {
	name = 'festivalApiApi';

	displayName = 'Festival API';

	icon = 'file:festival.svg' as 'file:festival.svg';

	documentationUrl = 'https://festivalapi.com/docs';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your Festival API key from the dashboard at festivalapi.com',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://festivalapi.com',
			url: '/v1/countries/',
			method: 'GET',
		},
	};
}
