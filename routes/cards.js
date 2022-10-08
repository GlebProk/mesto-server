const router = require('express').Router();
const { Joi, celebrate } = require('celebrate');
const {
  findCard, createCard, findByIdCard, likeCard, dislikeCard,
} = require('../controllers/cards');

router.get('/', findCard);

router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().pattern(/^http(s)?:\/\/(www.)?([0-9A-Za-z.@:%_/+-~#=]+)+(.[a-zA-Z]{2,3})(\/[0-9A-Za-z.@:%_/+-~#=]+)*$/),
  }),
}), createCard);

router.delete('/:cardId', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(24).required(),
  }),
}), findByIdCard);

router.put('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(24).required(),
  }),
}), likeCard);

router.delete('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(24).required(),
  }),
}), dislikeCard);

module.exports = router;
