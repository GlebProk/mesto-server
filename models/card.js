const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  link: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  likes: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'user',
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    // в ТЗ к проекту было так прописано, не совсем понимаю, что нужно изменить
    // "createdAt — дата создания, тип Date, значение по умолчанию Date.now"
  },
});

// создаём модель и экспортируем её
module.exports = mongoose.model('card', cardSchema);
