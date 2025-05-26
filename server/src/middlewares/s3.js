import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Function to upload an image to S3
export const uploadToS3 = async (imagePath, user_id) => {
  const fileContent = fs.readFileSync(imagePath); // Read image from file path
  const fileName = `${user_id}-${Date.now()}-${path.basename(imagePath)}`; // Create a unique file name

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Body: fileContent,
    ContentType: 'image/jpeg', // Adjust for the image type as needed
  };

  try {
    const data = await s3.send(new PutObjectCommand(params));
    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  } catch (error) {
    throw new Error(`Error uploading file to S3: ${error.message}`);
  }
};
