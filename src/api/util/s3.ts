// import AWS from 'aws-sdk';

// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import { S3Client, UploadPartCommand } from "@aws-sdk/client-s3";

export const getS3PresignedObject= async (Bucket: string, Key: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      // let s3 = new AWS.S3({
      //   region: 'us-east-1'
      // });

      // const location =  await s3.getSignedUrlPromise('getObject', { Bucket, Key });
      // console.log('serving back ', location);
      // resolve(location);
  
    } catch (error) {
      reject(new Error(error));
    }
  })
}

export const saveObject = async (bucket: string, type: string, id: string, body: Buffer) => {
  return new Promise(async (resolve, reject) => {

    try {
      // let s3 = new AWS.S3({
      //   region: 'us-east-1'
      // });

      // const location =  await s3.getSignedUrlPromise('putObject', {
      //   Body: body,
      //   Bucket: bucket,
      //   Key: `${type}/${id}`
      // });

      // resolve(location);
  
    } catch (error) {
      reject(new Error(error));
    }
  })

}

export const deleteObject = async (bucket: string, type: string, id: string) => {

  try {
    // let s3 = new AWS.S3({
    //   region: 'us-east-1'
    // });

    // await s3.deleteObject({
    //   Bucket: bucket,
    //   Key: `${type}/${id}`
    // }).promise();
    
  } catch (error) {
    throw new Error(error);
  }

}