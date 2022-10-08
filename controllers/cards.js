const Card = require('../models/card');

const InputError = require('../errors/InputError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

module.exports.findCard = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const ownerId = req.user._id;

  Card.create({ name, link, owner: ownerId }) // создадим документ
    // вернём записанные в базу данные
    .then((card) => res.send({ data: card }))
    // данные не записались, вернём ошибку
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new InputError('Переданы некорректные данные при создании карточки'));
      } else next(err);
    });
};

module.exports.findByIdCard = (req, res, next) => {
  const { cardId } = req.params;
  Card.findById(cardId)
    .orFail(() => {
      next(new NotFoundError(`Карточка с указанным идентификатором ${cardId} не найдена.`));
    })
    .then((card) => {
      if (card.owner.toString() !== req.user._id) {
        next(new ForbiddenError('Нельзя удалить чужую карточку'));
      }
      Card.findByIdAndRemove(req.params.cardId)
        .then(() => res.status(200).send({ message: 'Карточка удалена' }))
        .catch((err) => next(err));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new InputError('Некорректные данные'));
      } else {
        next(err);
      }
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .orFail(() => {
      next(new NotFoundError(`Передан несуществующий идентификатор (${req.params.cardId}) карточки.`));
    })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.statusCode === 404) {
        next(new NotFoundError(`Передан несуществующий идентификатор (${req.params.cardId}) карточки.`));
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new InputError('Переданы некорректные данные для постановки лайка.'));
      } else next(err);
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .orFail(() => {
      next(new NotFoundError(`Передан несуществующий идентификатор (${req.params.cardId}) карточки.`));
    })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.statusCode === 404) {
        next(new NotFoundError(`Передан несуществующий идентификатор (${req.params.cardId}) карточки.`));
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new InputError('Переданы некорректные данные для снятия лайка.'));
      } else next(err);
    });
};
