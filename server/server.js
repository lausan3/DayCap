const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(cors());

app.use(express.json());

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION;
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;

// Configure AWS SDK
AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION
});

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
	cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
	cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Endpoint to handle uploading files to an AWS S3 bucket and returning a download link
app.post('/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    // Convert Blob to file buffer
    const fileContent = fs.readFileSync(req.file.path);
    
    const s3 = new AWS.S3();

    const fileName = `audio-${Date.now()}.wav`;

    // Create S3 upload parameters
    const params = {
      Bucket: AWS_BUCKET_NAME,
      Key: fileName,
      Body: fileContent,
      ContentType: 'audio/wav',
      ContentDisposition: 'attachment'
    };

    // Upload to AWS S3 
    s3.putObject(params, (err, data) => {
      if (err) {
        console.error('Error uploading file:', err);
        return;
      }

      // Get a public download link from the bucket
      const signedUrlParams = {
        Bucket: AWS_BUCKET_NAME,
        Key: fileName,
        Expires: 60 * 60, // URL expiration time in seconds
        ResponseContentDisposition: 'attachment' // Force download
      };

      const publicURL = s3.getSignedUrl('getObject', signedUrlParams);
      console.log('File uploaded successfully:', publicURL);

      // Return url in JSON format
      res.json({ url: publicURL });
    })

  } else {
	  res.status(400).send('File upload failed');
  }
});

// Endpoint to store text in uploads directory
app.post('/uploadTranscribed', upload.none(), (req, res) => {
  let { text, fileName } = req.body;

  if (!fileName) {
    return res.status(400).send('fileName is required');
  }

  if (!text) {
    text = "No transcription was made";
  }

  const filePath = path.join(__dirname, 'uploads', `${fileName}.txt`);

  fs.writeFile(filePath, text, (err) => {
    if (err) {
      console.error('Error writing text file:', err);
      return res.status(500).send('Error writing text file');
    }

    console.log('Text file saved successfully to /uploads/' + fileName);

    res.json({ msg: 'Text file saved successfully to /uploads/' + fileName });
  });
})

// Serve static files from the uploads directory
app.use('/uploads', express.static(uploadDir));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});