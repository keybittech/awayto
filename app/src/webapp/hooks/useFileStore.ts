import { useState, useEffect } from 'react';
import { AWSS3FileStoreStrategy, FileSystemFileStoreStrategy, FileStoreStrategy, FileStoreStrategies, FileStoreContext } from "awayto";
import { useCognitoUser } from './useCognitoUser';


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

  useEffect(() => {
    if (cognitoUser.signInUserSession) {
      let strategy: FileStoreStrategy;

      switch (strategyName) {
        case FileStoreStrategies.AWS_S3:
          strategy = new AWSS3FileStoreStrategy(cognitoUser);
          break;
        default:
          strategy = new FileSystemFileStoreStrategy()
          break;
      }

      setFileStore(new FileStoreContext(strategy));
    }
  }, [cognitoUser.signInUserSession])  

  return fileStore;
}