const express = require('express');
const router = express.Router();
const { toggleLike, getLikeCount } = require('../controllers/likesController');

router.post('/:postId', toggleLike);           // Toggle like
router.get('/count/:postId', getLikeCount);    // Get like count

module.exports = router;
