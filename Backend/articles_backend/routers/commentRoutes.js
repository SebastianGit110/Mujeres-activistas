const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Article = require('../models/Article');

// Obtener comentarios de un artículo
router.get('/:articleId', async (req, res) => {
  const comments = await Comment.find({ article: req.params.articleId }).sort({ createdAt: -1 });
  res.json(comments);
});

// Crear un comentario
router.post('/', async (req, res) => {
  const { articleId, author, content } = req.body;

  const comment = new Comment({ article: articleId, author, content });
  await comment.save();

  // 👇 Actualiza el contador de comentarios en el artículo
  await Article.findByIdAndUpdate(articleId, {
    $inc: { commentCount: 1 }
  });

  res.status(201).json(comment);
});


module.exports = router;
