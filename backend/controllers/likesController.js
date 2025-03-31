const pool = require('../db');

const toggleLike = async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;

  try {
    const existing = await pool.query(
      'SELECT * FROM likes WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    );

    if (existing.rows.length > 0) {
      // Unlike
      await pool.query(
        'DELETE FROM likes WHERE post_id = $1 AND user_id = $2',
        [postId, userId]
      );
      res.json({ message: 'Like removed' });
    } else {
      // Like
      await pool.query(
        'INSERT INTO likes (post_id, user_id) VALUES ($1, $2)',
        [postId, userId]
      );
      res.json({ message: 'Post liked' });
    }
  } catch (err) {
    console.error('Error toggling like:', err);
    res.status(500).send('Server error');
  }
};

const getLikeCount = async (req, res) => {
  const { postId } = req.params;
  try {
    const result = await pool.query(
      'SELECT COUNT(*) FROM likes WHERE post_id = $1',
      [postId]
    );
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    console.error('Error getting like count:', err);
    res.status(500).send('Server error');
  }
};

module.exports = {
  toggleLike,
  getLikeCount
};
