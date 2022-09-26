const router = require('express').Router();
const { findUser, createUser, findByIdUser, updateInfoByIdUser, updateAvatarByIdUser } = require('../controllers/users');

router.get('/', findUser);

router.post('/', createUser);

router.get('/:userId', findByIdUser);

router.patch('/me', updateInfoByIdUser);

router.patch('/me/avatar', updateAvatarByIdUser);

module.exports = router;
