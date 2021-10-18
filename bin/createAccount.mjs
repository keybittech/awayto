import { CognitoIdentityProviderClient, SignUpCommand, AdminConfirmSignUpCommand, AddCustomAttributesCommand } from '@aws-sdk/client-cognito-identity-provider';
import { ask } from './tool.mjs'


const cipClient = new CognitoIdentityProviderClient();

export default async function(props = {}) {
  
  let install = !!Object.keys(props).length;
  
  if (!install) {
    props = {
      clientId: await ask('Client Id:\n> '),
      poolId: await ask('Pool Id:\n> '),
      username: await ask('Username:\n> '),
      password: await ask('Password:\n> '),
      email: await ask('Email:\n> ')
    }
  }

  try {

    await cipClient.send(new SignUpCommand({
      ClientId: props.clientId,
      Username: props.username,
      Password: props.password,
      UserAttributes: [
        {
          Name: 'email',
          Value: props.email
        },
        {
          Name: 'custom:admin',
          Value: 'public:guest'
        }
      ]
    }));
    
    await cipClient.send(new AdminConfirmSignUpCommand({
      UserPoolId: props.poolId,
      Username: props.username
    }));

  } catch (error) {
    console.log(error);
  }

  if (!install) {
    process.exit();
  }
}