export interface FileStoreStrategy {
  shouldDelete: boolean;
  loaded(): boolean;
  post(file: File): Promise<string>;
  put(file: File): Promise<string>;
  get(id: string): Promise<string>;
  delete(id: string): Promise<string>;
}

export enum FileStoreStrategies {
  FILE_SYSTEM = "fs",
  IPFS = "ipfs",
  AWS_S3 = "aws"
}

export class FileStoreContext {

  private strategy: FileStoreStrategy;

  shouldDelete: boolean;

  constructor(strategy: FileStoreStrategy) {
    this.strategy = strategy;
    this.shouldDelete = this.strategy.shouldDelete;
  }

  public loaded() {
    return this.strategy.loaded();
  }

  public async post(file: File) {
    return await this.strategy.post(file);
  }

  public async put(file: File) {
    return await this.strategy.put(file);
  }

  public async get(id: string) {
    return await this.strategy.get(id);
  }

  public async delete(id: string) {
    return await this.strategy.delete(id);
  }
}

export class FileSystemFileStoreStrategy implements FileStoreStrategy {

  ready = true;
  shouldDelete = true;

  public loaded() {
    return this.ready;
  }
  
  public async post(file: File) {
    await new Promise(() => { return 'stub' });
    return '';
  }

  public async put(file: File) {
    await new Promise(() => { return 'stub' });
    return '';
  }

  public async get(id: string) {
    await new Promise(() => { return 'stub' });
    return '';
  }

  public async delete(id: string) {
    await new Promise(() => { return 'stub' });
    return '';
  }
}