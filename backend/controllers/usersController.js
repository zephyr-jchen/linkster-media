// controllers/usersController.js
const pool = require('../db');
const bcrypt = require('bcrypt');

// Get user by ID
const getUser = async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).send('Server error');
  }
};

// Register new user
const createUser = async (req, res) => {
  const { user_name, email, password, first_name, last_name, birthdate, gender } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (username, email, password, first_name, last_name, birthdate, gender)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, username, email, first_name, last_name`,
      [user_name, email, hashedPassword, first_name, last_name, birthdate, gender]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).send('Server error');
  }
};

// Login
const loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      `SELECT * FROM users WHERE username = $1 OR email = $1`,
      [username]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).send('Invalid credentials');

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).send('Invalid credentials');

    const { id, username: uname, first_name, last_name } = user;
    res.json({ id, username: uname, firstName: first_name, lastName: last_name });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).send('Server error');
  }
};



const { Storage } = require('@google-cloud/storage');
const multer = require('multer');

const storage = new Storage({
  keyFilename: './service-account.json', 
});
const bucketName = 'linkster-media';
const bucket = storage.bucket(bucketName);

const uploadAvatar = async (req, res) => {
    const userId = req.params.id;

    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const blob = bucket.file(`avatars/${Date.now()}_${req.file.originalname}`);
    const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: req.file.mimetype,
    });

    blobStream.on('error', (err) => {
        console.error('GCS upload error:', err);
        res.status(500).send('Upload error');
    });

    blobStream.on('finish', async () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

        try {
            await pool.query('UPDATE users SET avatar = $1 WHERE id = $2', [publicUrl, userId]);
            res.status(200).json({ avatar: publicUrl });
        } catch (err) {
            console.error('DB error:', err);
            res.status(500).send('Database error');
        }
    });

    blobStream.end(req.file.buffer);
};


const updateUser = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, birthdate, gender, email } = req.body;

  try {
      await pool.query(
          'UPDATE users SET first_name=$1, last_name=$2, birthdate=$3, gender=$4, email=$5 WHERE id=$6',
          [first_name, last_name, birthdate, gender, email, id]
      );
      res.sendStatus(200);
  } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
  }
};

module.exports = { getUser, createUser, loginUser,uploadAvatar ,updateUser};
