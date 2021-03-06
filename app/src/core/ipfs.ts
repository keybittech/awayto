import { IPFS } from 'ipfs-core-types';
import { pipe } from 'it-pipe';
import all from 'it-all';
import toBuffer from 'it-to-buffer';
import map from 'it-map';
import { extract } from 'it-tar';

import { FileStoreStrategy } from 'awayto';

export class IPFSFileStoreStrategy implements FileStoreStrategy {
  private client: IPFS;

  private ready: boolean;
  shouldDelete: boolean;

  constructor(client: IPFS) {
    this.client = client;
    this.ready = true;
    this.shouldDelete = false;
  }

  public loaded() {
    return this.ready;
  }

  public async post(file: File) {
    if (!this.client) {
      throw 'No IPFS client loaded.'
    }

    const { cid: location } = await this.client?.add(await file.arrayBuffer());

    return location.toString()
  }

  public async put(file: File) {
    if (!this.client) {
      throw 'No IPFS client loaded.'
    }

    const { cid: location } = await this.client?.add(await file.arrayBuffer());

    return location.toString()
  }

  public async get(location: string) {
    if (!this.client) {
      throw 'No IPFS client loaded.'
    }

    const source = this.client.get(location);
    const file = await pipe(source, this.tarballed, i =>{ return all(i) });
    const url = URL.createObjectURL(new Blob([file[0].body], { type: 'image/png' }));

    return url;
  }

  public async delete(location: string) {
    await new Promise((r) => r);
    return '';
  }

  private async * tarballed (source: AsyncIterable<Uint8Array>) {
    yield * pipe(
      source,
      extract(),
      async function * (source) {
        for await (const entry of source) {
          yield {
            ...entry,
            body: await toBuffer(map(entry.body, (buf) => buf.slice()))
          }
        }
      }
    )
  }
}