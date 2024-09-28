import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { validarCPF, validarEmail } from './utils/validation';
import {
    AdminCreateUserCommand,
    AdminSetUserPasswordCommand,
    CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';

const USER_POOL_ID = process.env.USER_POOL_ID;

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Body is required' }),
        };
    }

    const body = JSON.parse(event.body);

    console.log('body', body);

    const { cpf, email, name, password } = body;

    console.log('cpf', cpf);
    console.log('email', email);
    console.log('name', name);
    console.log('password', password);
    const invalidFields = [];

    if (!validarEmail(email)) {
        invalidFields.push('email');
    }

    if (!validarCPF(cpf)) {
        invalidFields.push('cpf');
    }

    console.log('invalidFields', invalidFields);

    if (!validarEmail(email) || !validarCPF(cpf)) {
        console.log('Found invalidFields', invalidFields);
        return {
            statusCode: 400,
            body: JSON.stringify({ message: `Invalid fields: ${invalidFields.join(', ')}` }),
        };
    }

    try {
        console.log('Creating user');
        const client = new CognitoIdentityProviderClient({ region: 'us-east-1' });

        console.log('client', client);

        const command = new AdminCreateUserCommand({
            UserPoolId: USER_POOL_ID,
            Username: cpf,
            DesiredDeliveryMediums: ['EMAIL'],
            UserAttributes: [
                {
                    Name: 'email',
                    Value: email,
                },
                {
                    Name: 'custom:name',
                    Value: name,
                },
                {
                    Name: 'custom:cpf',
                    Value: cpf,
                },
            ],
            TemporaryPassword: `${email}AND${cpf}`,
        });

        console.log('command', command);

        const createUserResponse = await client.send(command);

        console.log('response', createUserResponse);

        if (createUserResponse.$metadata.httpStatusCode !== 200) {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Create user failed' }),
            };
        }

        const setPasswordCommand = new AdminSetUserPasswordCommand({
            UserPoolId: USER_POOL_ID,
            Username: cpf,
            Password: password,
            Permanent: true,
        });

        const setPasswordResponse = await client.send(setPasswordCommand);

        console.log('setPasswordResponse', setPasswordResponse);

        if (setPasswordResponse.$metadata.httpStatusCode !== 200) {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Set password failed' }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'User created' }),
        };
    } catch (error) {
        console.log('error', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Signup server error' }),
        };
    }
};
