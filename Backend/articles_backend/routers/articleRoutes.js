const express = require('express');
const router = express.Router();
const Article = require('../models/Article'); // ✅ Asegúrate de importar el modelo correcto

const {
  getArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  getCategories,
} = require('../controllers/articleController');

// Rutas públicas
router.get('/', getArticles);
router.get('/categories', getCategories);
router.get('/:slug', getArticleBySlug);

// Rutas protegidas (puedes agregar auth si lo deseas)
router.post('/', createArticle);
router.put('/:id', updateArticle);
router.delete('/:id', deleteArticle);

// Ruta para incrementar visualizaciones
router.patch('/:slug/view', async (req, res) => {
  try {
    const article = await Article.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!article) {
      return res.status(404).json({ message: 'Artículo no encontrado' });
    }

    res.json({ message: 'Vista incrementada', viewCount: article.viewCount });
  } catch (err) {
    console.error('Error al incrementar vistas:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
