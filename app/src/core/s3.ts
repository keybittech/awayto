import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { FileStoreStrategy } from 'awayto';

export class AWSS3FileStoreStrategy implements FileStoreStrategy {
  private identityId: string;
  private awaytoId: string;
  private client: S3Client;
  private bucket: string;
  private ready: boolean;
  
  public shouldDelete: boolean;

  constructor(awaytoId: string, identityId: string, client: S3Client) {
    this.identityId = identityId;
    this.awaytoId = awaytoId;
    this.bucket = `${this.awaytoId}-files`;
    this.client = client;
    this.ready = true;
    this.shouldDelete = true;
  }

  public loaded() {
    return this.ready;
  }

  public async post(file: File) {
    const location = `cognito/${this.awaytoId}/${this.identityId}/${file.name}`;
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: location,
      Body: file,
      
    }));
    return location;
  }

  public async put(file: File) {
    const location = `cognito/${this.awaytoId}/${this.identityId}/${file.name}`;
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