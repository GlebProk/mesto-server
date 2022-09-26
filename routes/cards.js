const router = require('express').Router();
const { findCard, createCard, findByIdCard, likeCard, dislikeCard } = require('../controllers/cards');

router.get('/', findCard);

router.post('/', createCard);

router.delete('/:cardId', findByIdCard);

router.put('/:cardId/likes', likeCard);

router.delete('/:cardId/likes', dislikeCard);

module.exports = router;