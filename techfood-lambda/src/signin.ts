import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { validarCPF } from './utils/validation';
import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';

const CLIENT_ID = process.env.CLIENT_ID;

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Body is required' }),
        };
    }

    const body = JSON.parse(event.body);
    const { cpf, password } = body;

    if (!cpf || !password) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'CPF and password are required' }),
        };
    }

    console.log(`cpf: ${cpf} | password: ${password}`);

    if (!validarCPF(cpf)) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Insira um CPF válido' }),
        };
    }

    try {
        const client = new CognitoIdentityProviderClient({ region: 'us-east-1' });
        const command = new InitiateAuthCommand({
            ClientId: CLIENT_ID,
            AuthFlow: 'USER_PASSWORD_AUTH',
            AuthParameters: {
                USERNAME: cpf,
                PASSWORD: password,
            },
        });
        const response = await client.send(command);

        console.log('response', response);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'User signed in' }),
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'SignIn Internal server error' }),
        };
    }
};
