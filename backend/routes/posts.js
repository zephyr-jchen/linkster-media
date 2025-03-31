const express = require('express');
const router = express.Router();
const { getAllPosts, createPost, deletePost,getPostsByUser } = require('../controllers/postsController.js');

router.get('/', getAllPosts);
router.get('/user/:userId', getPostsByUser); 
router.post('/', createPost);
router.delete('/:id', deletePost);

module.exports = router;
