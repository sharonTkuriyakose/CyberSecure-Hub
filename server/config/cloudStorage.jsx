const { Storage } = require('@google-cloud/storage');
const path = require('path');

// Initialize storage with your service account key
const storage = new Storage({
  keyFilename: path.join(__dirname, '../../service-account-key.json'),
  projectId: process.env.GCS_PROJECT_ID,
});

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

module.exports = bucket;