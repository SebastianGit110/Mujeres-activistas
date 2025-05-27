const Article = require('../models/article');

// @desc    Obtener todos los artículos con filtros opcionales
// @route   GET /api/articles
// @access  Public
const getArticles = async (req, res) => {
  try {
    const { category, sort, search, tab } = req.query;
    const query = {};
    
    // Aplicar filtro por categoría
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Aplicar búsqueda
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Filtrar por tab (pestañas)
    if (tab === 'trending') {
      query.viewCount = { $gt: 10 }; // Ejemplo: artículos con más de 10 vistas
    } else if (tab === 'following') {
      // Aquí necesitarías implementar lógica de "following" con autenticación
      // Por ahora, devolvemos un subconjunto para simular esta funcionalidad
      query.isFeatured = true;
    }
    
    // Configurar orden
    let sortOption = { createdAt: -1 }; // Por defecto, ordenar por más recientes
    if (sort === 'popular') {
      sortOption = { viewCount: -1 };
    } else if (sort === 'comments') {
      sortOption = { commentCount: -1 };
    }
    
    // Ejecutar la consulta paginada
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;
    
    const articles = await Article.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);
    
    // Contar total de documentos para paginación
    const total = await Article.countDocuments(query);
    
    res.json({
      success: true,
      count: articles.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      articles,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// @desc    Obtener un artículo por slug
// @route   GET /api/articles/:slug
// @access  Public
const getArticleBySlug = async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });
    
    if (!article) {
      return res.status(404).json({ success: false, message: 'Artículo no encontrado' });
    }
    
    // Incrementar contador de vistas
    article.viewCount += 1;
    await article.save();
    
    res.json({ success: true, article });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// @desc    Crear un nuevo artículo
// @route   POST /api/articles
// @access  Private (requeriría autenticación)
const createArticle = async (req, res) => {
  try {
    const { title, excerpt, content, category, imageUrl, author } = req.body;
    
    // Generar slug a partir del título
    const slug = title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
    
    // Crear el artículo
    const article = await Article.create({
      title,
      excerpt,
      content,
      category,
      imageUrl: imageUrl || '/placeholder.svg?height=200&width=300',
      author,
      slug,
      // Si implementas autenticación, agregarías:
      // user: req.user.id,
    });
    
    res.status(201).json({ success: true, article });
  } catch (error) {
    console.error(error);
    
    // Manejar error de duplicación de slug
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ya existe un artículo con un título similar' 
      });
    }
    
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// @desc    Actualizar un artículo
// @route   PUT /api/articles/:id
// @access  Private (requeriría autenticación)
const updateArticle = async (req, res) => {
  try {
    let article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ success: false, message: 'Artículo no encontrado' });
    }
    
    // Verificar si el usuario es el autor (si implementas autenticación)
    // if (article.user.toString() !== req.user.id) {
    //   return res.status(401).json({ success: false, message: 'No autorizado' });
    // }
    
    // Si el título cambió, actualizar el slug
    if (req.body.title && req.body.title !== article.title) {
      req.body.slug = req.body.title
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
    }
    
    article = await Article.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    
    res.json({ success: true, article });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// @desc    Eliminar un artículo
// @route   DELETE /api/articles/:id
// @access  Private (requeriría autenticación)
const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ success: false, message: 'Artículo no encontrado' });
    }
    
    // Verificar si el usuario es el autor (si implementas autenticación)
    // if (article.user.toString() !== req.user.id) {
    //   return res.status(401).json({ success: false, message: 'No autorizado' });
    // }
    
    await article.deleteOne();
    
    res.json({ success: true, message: 'Artículo eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// @desc    Obtener categorías disponibles
// @route   GET /api/articles/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Article.distinct('category');
    res.json({ success: true, categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

module.exports = {
  getArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  getCategories,
};