import React, { useState } from 'react';
import { Avatar } from '@material-ui/core';

// import { getObjectData } from '../../../lib/s3';

// Type whatever you expect in 'this.props.match.params.*'
// type PathParamsType = {
//   param1: string,
// }

// // Your component own properties
// type PropsType = RouteComponentProps<PathParamsType> & {
//   someString: string,
// }

export function AsyncAvatar (): JSX.Element {
  const [url, setUrl] = useState('');
  setUrl('')
  // TODO Fix
  // useEffect(() => {
  //   (async () => {
  //     if (props.image) {
  //       const imageData = await getObjectData(props.image);
  //       if (imageData.Body) {
  //         const newUrl = window.URL.createObjectURL(new Blob([imageData.Body as Blob]));
  //         setUrl(newUrl);
  //       }
  //     }
  //   })().catch(console.log);
  //   return() => {
  //     window.URL.revokeObjectURL(url);
  //   }
  // }, [props.image, url])

  return <Avatar src={url} />
}

export default AsyncAvatar;
