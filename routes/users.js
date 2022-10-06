const router = require('express').Router();
const { Joi, celebrate } = require('celebrate');
const {
  findUser, findByIdUser, findByUsersMe, updateInfoByIdUser, updateAvatarByIdUser,
} = require('../controllers/users');

router.get('/', findUser);

router.get('/me', findByUsersMe);

router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().required().hex(),
  }),
}), findByIdUser);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), updateInfoByIdUser);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().pattern(/^http(s)?:\/\/(www.)?([0-9A-Za-z.@:%_/+-~#=]+)+(.[a-zA-Z]{2,3})(\/[0-9A-Za-z.@:%_/+-~#=]+)*$/),
  }),
}), updateAvatarByIdUser);

module.exports = router;
