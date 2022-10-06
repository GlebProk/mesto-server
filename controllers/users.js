const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const AuthError = require('../errors/AuthError');
const ConflictError = require('../errors/ConflictError');
const InputError = require('../errors/InputError');
const NotFoundError = require('../errors/NotFoundError');

module.exports.findUser = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create(
      {
        name, about, avatar, email, password: hash,
      },
    ))
    // вернём записанные в базу данные
    .then((user) => {
      res.status(201).send(
        {
          _id: user._id,
          email: user.email,
          name: user.name,
          about: user.about,
          avatar: user.avatar,
        },
      );
    })
    // данные не записались, вернём ошибку
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new InputError('Переданы некорректные данные при создании пользователя.'));
        return;
      }
      if (err.name === 'MongoServerError') {
        next(new ConflictError('Пользователь с таким email уже существует'));
        return;
      }
      next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      // создадим токен
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
      // вернём токен
      res.send({ token });
    })
    .catch(() => {
      next(new AuthError('Неверно введены почта или пароль'));
    });
};

module.exports.findByIdUser = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(() => {
      next(new NotFoundError(`Пользователь по указанному идентификатору ${req.params.userId} не найден.`));
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.statusCode === 404) {
        next(new NotFoundError(`Пользователь по указанному идентификатору ${req.params.userId} не найден.`));
      } else if (err.name === 'CastError') {
        next(new InputError('Передан некорректный _id профиля'));
      } else next(err);
    });
};

module.exports.findByUsersMe = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => {
      next(new AuthError('Необходимо выполнить вход'));
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.statusCode === 404) {
        next(new NotFoundError(`Пользователь по указанному идентификатору ${req.user._id} не найден.`));
      } else if (err.name === 'CastError') {
        next(new InputError('Передан некорректный _id профиля'));
      } else next(err);
    });
};

module.exports.updateInfoByIdUser = (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .orFail(() => {
      next(new NotFoundError(`Пользователь с указанным идентификатором ${req.user._id} не найден.`));
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.statusCode === 404) {
        next(new NotFoundError('Пользователь c указанным _id не найден'));
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new InputError('Переданы некорректные данные при обновлении профиля'));
      } else next(err);
    });
};

module.exports.updateAvatarByIdUser = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .orFail(() => {
      next(new NotFoundError(`Пользователь с указанным идентификатором ${req.user._id} не найден.`));
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.statusCode === 404) {
        next(new NotFoundError('Пользователь c указанным _id не найден'));
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new InputError('Переданы некорректные данные при обновлении профиля'));
      } else next(err);
    });
};
