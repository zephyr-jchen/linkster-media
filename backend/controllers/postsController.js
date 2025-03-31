const pool = require('../db');

const getAllPosts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT posts.*, users.username, users.avatar 
       FROM posts 
       JOIN users ON posts.user_id = users.id 
       ORDER BY posts.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).send('Server error');
  }
};

const getPostsByUser = async (req, res) => {
  const { userId } = req.params;
  try {
      const result = await pool.query(
          `SELECT posts.*, users.username, users.avatar 
           FROM posts 
           JOIN users ON posts.user_id = users.id 
           WHERE posts.user_id = $1
           ORDER BY posts.created_at DESC`,
          [userId]
      );
      res.json(result.rows);
  } catch (err) {
      console.error('Error fetching posts by user:', err);
      res.status(500).send('Server error');
  }
};


const createPost = async (req, res) => {
  const { content, image_url, user_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO posts (content, image_url, user_id) VALUES ($1, $2, $3) RETURNING *',
      [content, image_url, user_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).send('Server error');
  }
};

const { Storage } = require('@google-cloud/storage');
const pool = require('../db');

const storage = new Storage({
  keyFilename: './service-account.json', 
});
const bucketName = 'linkster-media';
const bucket = storage.bucket(bucketName);
const deletePost = async (req, res) => {
    const postId = req.params.id;

    try {
        const result = await pool.query('SELECT * FROM posts WHERE id = $1', [postId]);
        if (result.rows.length === 0) {
            return res.status(404).send('Post not found');
        }

        const post = result.rows[0];

        await pool.query('DELETE FROM posts WHERE id = $1', [postId]);

        if (post.image_url) {
            const imagePath = post.image_url.split(`/${bucketName}/`)[1];
            if (imagePath) {
                await bucket.file(imagePath).delete();
                console.log('Deleted image from GCS:', imagePath);
            }
        }

        res.status(204).send();

    } catch (err) {
        console.error('Error deleting post:', err);
        res.status(500).send('Server error');
    }
};

module.exports = { deletePost };


module.exports = { getAllPosts, createPost, getPostsByUser, deletePost };
