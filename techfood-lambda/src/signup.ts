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
    const invalidFields = [];
    const { cpf, email, name, password } = body;

    console.log(`cpf: ${cpf} | email: ${email} | name: ${name} | password: ${password}`);

    if (!validarEmail(email)) {
        invalidFields.push('email');
    }

    if (!validarCPF(cpf)) {
        invalidFields.push('cpf');
    }

    if (!validarEmail(email) || !validarCPF(cpf)) {
        console.log('Found invalidFields', invalidFields);
        return {
            statusCode: 400,
            body: JSON.stringify({ message: `Invalid fields: ${invalidFields.join(', ')}` }),
        };
    }

    try {
        const client = new CognitoIdentityProviderClient({ region: 'us-east-1' });
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
        const createUserResponse = await client.send(command);

        console.log('createUserResponse', createUserResponse);

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
