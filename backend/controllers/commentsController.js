const pool = require('../db');

const getCommentsByPost = async (req, res) => {
  const postId = req.params.postId;
  try {
    const result = await pool.query(
      `SELECT comments.*, users.username, users.avatar 
       FROM comments 
       JOIN users ON comments.user_id = users.id 
       WHERE post_id = $1 
       ORDER BY comments.created_at ASC`,
      [postId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).send('Server error');
  }
};

const addComment = async (req, res) => {
  const postId = req.params.postId;
  const { content, user_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO comments (content, post_id, user_id) VALUES ($1, $2, $3) RETURNING *',
      [content, postId, user_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).send('Server error');
  }
};

module.exports = { getCommentsByPost, addComment };
