const { Storage } = require('@google-cloud/storage');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// GCS init

const storage = new Storage({
    keyFilename: './service-account.json', 
});
const bucketName = 'linkster-media';
const bucket = storage.bucket(bucketName);

const uploadFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        const fileName = `posts/${uuidv4()}${path.extname(req.file.originalname)}`;
        const file = bucket.file(fileName);

        const stream = file.createWriteStream({
            metadata: {
                contentType: req.file.mimetype,
            }
        });

        stream.on('error', (err) => {
            console.error('Upload error:', err);
            res.status(500).send('Upload error');
        });

        stream.on('finish', async () => {

            const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
            res.json({ url: publicUrl });
        });

        stream.end(req.file.buffer);
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).send('Server error');
    }
};

module.exports = { uploadFile };
