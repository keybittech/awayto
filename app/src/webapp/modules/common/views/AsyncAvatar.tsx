import React, { useState, useEffect } from 'react';
import { Avatar } from '@material-ui/core';
import { useFileStore } from 'awayto-hooks';

declare global {
  interface IProps {
    image?: string;
  }
}

export function AsyncAvatar ({ image }: IProps): JSX.Element {
  const [url, setUrl] = useState('');
  const fileStore = useFileStore();
  
  useEffect(() => {
    async function getImage() {
      if (fileStore && image) {
        setUrl(await fileStore?.get(image));
      }
    }
    void getImage();
  }, [fileStore, image])

  return url.length ? <Avatar src={url || ''} /> : <></>
}

export default AsyncAvatar;
