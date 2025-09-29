import * as Minio from 'minio';

// MinIO client configuration
const minioClient = new Minio.Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'root',
  secretKey: 'P#ssw0rd',
});

// Bucket name for record files
const BUCKET_NAME = 'dental-clinic';

// Initialize bucket if it doesn't exist
export async function initializeMinio() {
  try {
    const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
    if (!bucketExists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`Bucket '${BUCKET_NAME}' created successfully`);
    } else {
      console.log(`Bucket '${BUCKET_NAME}' already exists`);
    }
  } catch (error) {
    console.error('Error initializing MinIO bucket:', error);
    throw error; // Re-throw to handle in calling function
  }
}

// Upload file to MinIO
export async function uploadFile(
  file: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  try {
    // Ensure bucket exists before uploading
    await initializeMinio();
    
    const objectName = `records/${Date.now()}-${fileName}`;
    
    await minioClient.putObject(
      BUCKET_NAME,
      objectName,
      file,
      file.length,
      {
        'Content-Type': mimeType,
      }
    );

    // Return the file URL
    return `http://localhost:9000/${BUCKET_NAME}/${objectName}`;
  } catch (error) {
    console.error('Error uploading file to MinIO:', error);
    throw new Error('Failed to upload file');
  }
}

// Delete file from MinIO
export async function deleteFile(fileUrl: string): Promise<void> {
  try {
    // Extract object name from URL
    const urlParts = fileUrl.split('/');
    const objectName = urlParts.slice(-2).join('/'); // records/filename
    
    await minioClient.removeObject(BUCKET_NAME, objectName);
  } catch (error) {
    console.error('Error deleting file from MinIO:', error);
    throw new Error('Failed to delete file');
  }
}

// Get file info
export async function getFileInfo(fileUrl: string) {
  try {
    const urlParts = fileUrl.split('/');
    const objectName = urlParts.slice(-2).join('/');
    
    const stat = await minioClient.statObject(BUCKET_NAME, objectName);
    return stat;
  } catch (error) {
    console.error('Error getting file info:', error);
    return null;
  }
}

export { minioClient, BUCKET_NAME };
