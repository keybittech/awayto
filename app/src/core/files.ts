import fs from 'fs';

export interface FileStoreStrategy {
  postFile(file: File, name: string): Promise<string>;
  putFile(file: File, name: string): Promise<string>;
  getFile(id: string): Promise<string>;
  deleteFile(id: string): Promise<string>;
}

export enum FileStoreStrategies {
  FILE_SYSTEM = "file_system",
  AWS_S3 = "aws_s3"
}

export class FileStoreContext {

  private strategy: FileStoreStrategy;

  constructor(strategy: FileStoreStrategy) {
    this.strategy = strategy;
  }

  public async postFile(file: File, name: string) {
    return await this.strategy.postFile(file, name);
  }

  public async putFile(file: File, name: string) {
    return await this.strategy.putFile(file, name);
  }

  public async getFile(id: string) {
    return await this.strategy.getFile(id);
  }

  public async deleteFile(id: string) {
    return await this.strategy.deleteFile(id);
  }
}

export class FileSystemFileStoreStrategy implements FileStoreStrategy {
  public async postFile(file: File, name: string) {
    await new Promise(() => { return 'stub' });
    return '';
  }
  public async putFile(file: File, name: string) {
    await new Promise(() => { return 'stub' });
    return '';
  }
  public async getFile(id: string) {
    await new Promise(() => { return 'stub' });
    return '';
  }
  public async deleteFile(id: string) {
    await new Promise(() => { return 'stub' });
    return '';
  }
}