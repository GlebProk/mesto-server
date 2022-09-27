const Card = require('../models/card');

const {
  INPUT_ERROR,
  NOT_FOUND_ERROR,
  DEFAULT_ERROR,
} = require('../error/errorStatus');

module.exports.findCard = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch((err) => {
      res.status(DEFAULT_ERROR).send({ message: err.message });
    });
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const ownerId = req.user._id;

  Card.create({ name, link, owner: ownerId }) // создадим документ
    // вернём записанные в базу данные
    .then((card) => res.send({ data: card }))
    // данные не записались, вернём ошибку
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(INPUT_ERROR).send({ message: 'Переданы некорректные данные при создании карточки.' });
      } else res.status(DEFAULT_ERROR).send({ message: err.message });
    });
};

module.exports.findByIdCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail(() => {
      const error = new Error(`Карточка с указанным идентификатором ${req.params.id} не найдена.`);
      error.statusCode = 404;
      throw error;
    })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.statusCode === 404) {
        res.status(NOT_FOUND_ERROR).send({ message: err.message });
      } else if (err.name === 'CastError') {
        res.status(INPUT_ERROR).send({ message: 'Передан некорректный _id карточки' });
      } else res.status(NOT_FOUND_ERROR).send({ message: err.message });
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .orFail(() => {
      const error = new Error(`Передан несуществующий идентификатор (${req.params.cardId}) карточки.`);
      error.statusCode = 404;
      throw error;
    })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.statusCode === 404) {
        res.status(NOT_FOUND_ERROR).send({ message: err.message });
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        res.status(INPUT_ERROR).send({ message: 'Переданы некорректные данные для постановки лайка.' });
      } else res.status(DEFAULT_ERROR).send({ message: err.message });
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .orFail(() => {
      const error = new Error(`Передан несуществующий идентификатор (${req.params.cardId}) карточки.`);
      error.statusCode = 404;
      throw error;
    })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.statusCode === 404) {
        res.status(NOT_FOUND_ERROR).send({ message: err.message });
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        res.status(INPUT_ERROR).send({ message: 'Переданы некорректные данные для снятия лайка.' });
      } else res.status(DEFAULT_ERROR).send({ message: err.message });
    });
};
