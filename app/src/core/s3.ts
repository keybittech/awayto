import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
    });
  }

  public async post(file: File) {
    const location = `cognito/${AwaytoId}/${this.cognitoUser.credentials.identityId}/${file.name}`;
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: location,
      Body: file,
      
    }));
    return location;
  }

  public async put(file: File) {
    const location = `cognito/${AwaytoId}/${this.cognitoUser.credentials.identityId}/${file.name}`;
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: location,
      Body: file
    }));
    return location;
  }

  public async get(location: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: location
    });

    const url = await getSignedUrl(this.client, command, { expiresIn: 3600 });

    return url;
  }

  public async delete(location: string) {
    await this.client.send(new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: location
    }));
    return location;
  }
}