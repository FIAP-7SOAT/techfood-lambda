import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const authorization = event.headers.Authorization;
        const token = authorization?.split(' ')[1];

        if (!token) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'No token provided' }),
            };
        }

        console.log('token', token);

        const client = new CognitoIdentityProviderClient({ region: 'us-east-1' });
        const command = new GetUserCommand({
            AccessToken: token,
        });
        const response = await client.send(command);

        console.log('response', response);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'User is authorized',
                username: response.Username,
            }),
        };
    } catch (error) {
        console.error('Error:', error);

        if (error instanceof Error && error.name === 'NotAuthorizedException') {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Invalid or expired token' }),
            };
        }

        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
        };
    }
};
