// routes/users.js
const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();
const { getUser, createUser, loginUser,uploadAvatar,updateUser } = require('../controllers/usersController');

router.get('/:id', getUser);
router.post('/', createUser);
router.post('/login', loginUser);
router.put('/:id', updateUser);
router.post('/:id/avatar', upload.single('avatar'), uploadAvatar);

module.exports = router;
