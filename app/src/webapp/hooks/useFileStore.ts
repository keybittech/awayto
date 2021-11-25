import { useState, useEffect } from 'react';
import { create } from 'ipfs-core';
import { AWSS3FileStoreStrategy, IPFSFileStoreStrategy, FileSystemFileStoreStrategy, FileStoreStrategy, FileStoreStrategies, FileStoreContext } from 'awayto';
import { useCognitoUser } from './useCognitoUser';
import { S3Client } from '@aws-sdk/client-s3';

const {
  REACT_APP_AWS_REGION: Region,
  REACT_APP_AWAYTO_ID: AwaytoId
} = process.env as { [prop: string]: string };

/**
 * `useFileStore` is used to access various types of pre-determined file stores. All stores allow CRUD operations for user-bound files. Internally default instantiates {@link AWSS3FileStoreStrategy}, but you can also pass a {@link FileStoreStrategies} to `useFileStore` for other supported stores.
 * 
 * ```
 * import { useFileStore } from 'awayto';
 * 
 * const files = useFileStore();
 * 
 * const file: File = ....
 * const fileName: string = '...';
 * 
 * // Make sure the filestore has connected
 * if (files)
 *  await files.post(file, fileName)
 * 
 * ```
 * 
 * @category Hooks
 */
export const useFileStore = (strategyName: FileStoreStrategies | void): FileStoreContext | undefined => {

  if (!strategyName)
    strategyName = FileStoreStrategies.AWS_S3;

  const [fileStore, setFileStore] = useState<FileStoreContext>();
  const cognitoUser = useCognitoUser();

  let strategy: FileStoreStrategy;

  useEffect(() => {
    async function setup() {
      if (!strategy) {
        switch (strategyName) {
          case FileStoreStrategies.AWS_S3: {
            if (!cognitoUser.signInUserSession) {
              throw 'No cognito user.';
            }
            const client = new S3Client({ 
              region: Region,
              apiVersion: '2006-03-01',
              credentials: cognitoUser.credentials
            })
            strategy = new AWSS3FileStoreStrategy(AwaytoId, cognitoUser.credentials.identityId, client);
            break;
          }
          case FileStoreStrategies.IPFS: {
            const client = await create();
            strategy = new IPFSFileStoreStrategy(client);
            break;
          }
          default:
            strategy = new FileSystemFileStoreStrategy();
            break;
        }

        setFileStore(new FileStoreContext(strategy));
      }
    }
    void setup();
  }, [strategyName == FileStoreStrategies.AWS_S3 && cognitoUser.signInUserSession])  

  return fileStore;
}