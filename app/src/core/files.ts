export interface FileStoreStrategy {
  post(file: File): Promise<string>;
  put(file: File): Promise<string>;
  get(id: string): Promise<string>;
  delete(id: string): Promise<string>;
}

export enum FileStoreStrategies {
  FILE_SYSTEM = "fs",
  AWS_S3 = "aws"
}

export class FileStoreContext {

  private strategy: FileStoreStrategy;

  constructor(strategy: FileStoreStrategy) {
    this.strategy = strategy;
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