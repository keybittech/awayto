import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

import { CognitoUser, FileStoreStrategy } from 'awayto';

const {
  REACT_APP_AWAYTO_ID: AwaytoId,
  REACT_APP_AWS_REGION: Region,
  REACT_APP_COGNITO_USER_POOL_ID: UserPoolId,
  REACT_APP_COGNITO_IDENTITY_POOL_ID: IdentityPoolId
} = process.env as { [prop: string]: string };

export class AWSS3FileStoreStrategy implements FileStoreStrategy {

  private cognitoUser: CognitoUser;
  private client: S3Client;
  private bucket: string;

  constructor(cognitoUser: CognitoUser) {
    this.cognitoUser = cognitoUser;
    this.bucket = `${AwaytoId}-files`;
    this.client = new S3Client({ 
      region: Region,
      apiVersion: '2006-03-01',
      credentials: cognitoUser.credentials
    });;
  }

  public async postFile(file: File, name: string) {
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: `cognito/${AwaytoId}/${this.cognitoUser.credentials.identityId}/${name}`,
      Body: file,
      
    }));
    return 'saved';
  }
  public async putFile(file: File, name: string) {
    const session = await this.cognitoUser.getSession()
    return '';
  }
  public async getFile(id: string) {
    const session = await this.cognitoUser.getSession()
    // const data = await this.client.send(new GetObjectCommand({
    //   Bucket: this.bucket,
    //   Key: id
    // }));
    return '';
  }
  public async deleteFile(id: string) {
    const session = await this.cognitoUser.getSession()
    return ''
  }
}

// export const downloadFile = async (Key: string, fileName: string) => {

//   const data = await client.send(new GetObjectCommand({
//     Bucket: fileBucket,
//     Key
//   }));

//   if (data.Body) {
//     const link = document.createElement('a');
//     link.href = window.URL.createObjectURL(data.Body);
//     link.download = fileName;
//     link.click();
//     window.URL.revokeObjectURL(link.href);
//   }
// }

// export const uploadFile = async (Key: string, file: File) => {
//   try {
//     await client.send(new PutObjectCommand({
//       Bucket: fileBucket,
//       Key,
//       Body: file
//     }));
//   } catch (error) {
//     console.error(error);
//   }
// }


// export const getObjectData = async (Key: string) => {
//   const data = await client.send(new GetObjectCommand({
//     Bucket: fileBucket,
//     Key
//   }));

//   return data;
// }