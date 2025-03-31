const express = require('express');
const router = express.Router();
const { getCommentsByPost, addComment } = require('../controllers/commentsController');

router.get('/:postId', getCommentsByPost);
router.post('/:postId', addComment);

module.exports = router;
