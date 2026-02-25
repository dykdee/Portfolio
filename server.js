const express = require('express');
const cors = require('cors');
const multer = require('multer');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

console.log('Looking for service account at:', serviceAccountPath);
console.log('File exists:', fs.existsSync(serviceAccountPath));

try {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'dee-s-site.firebasestorage.app'
  });
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error.message);
  console.log('Make sure serviceAccountKey.json exists in the project root.');
  process.exit(1);
}

const bucket = admin.storage().bucket();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('File:', req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'MISSING');
    console.log('User ID:', req.headers['x-user-id']);

    if (!req.file) {
      console.log('ERROR: No file provided');
      return res.status(400).json({ error: 'No file provided' });
    }

    const userId = req.headers['x-user-id'];
    if (!userId) {
      console.log('ERROR: No user ID header');
      return res.status(401).json({ error: 'User ID required in x-user-id header' });
    }

    const fileName = `${Date.now()}-${req.file.originalname}`;
    const filePath = `post-images/${userId}/${fileName}`;
    const file = bucket.file(filePath);

    console.log(`Uploading to: ${filePath}`);

    await file.save(req.file.buffer, {
      metadata: {
        contentType: req.file.mimetype,
        metadata: {
          uploadedBy: userId,
          uploadedAt: new Date().toISOString()
        }
      }
    });

    console.log(`Upload complete: ${filePath}`);

    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/dee-s-site.firebasestorage.app/o/${encodeURIComponent(filePath)}?alt=media`;

    res.json({
      success: true,
      url: publicUrl,
      path: filePath,
      mimeType: req.file.mimetype
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Upload server running on http://localhost:${PORT}`);
});
