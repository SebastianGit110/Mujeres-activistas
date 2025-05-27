import { useState, useEffect } from 'react';
import { Clock, User, Eye, MessageCircle, Plus, Search, Filter, Heart, Share2, Bookmark } from 'lucide-react';

interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  createdAt: string;
  viewCount: number;
  commentCount: number;
  isFeatured: boolean;
  status: 'published' | 'draft';
}

const API_BASE_URL = 'http://localhost:5000/api'; // Cambia esto por tu URL del backend

export const ArticlesSocialApp = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newArticle, setNewArticle] = useState({
    title: '',
    excerpt: '',
    content: '',
    author: '',
    category: 'Activism',
    tags: '',
    imageUrl: '',
    isFeatured: false
  });

  const categories = ['Activism', 'Technology', 'Arts', 'Health', 'Economics', 'Leadership', 'Other'];

  // Función para obtener todos los artículos
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/articles`);
      if (response.ok) {
        const data = await response.json();
        // Validar que data sea un array
        if (Array.isArray(data.articles)) {
          setArticles(data.articles);
        } else {
          console.error('La respuesta no es un array:', data);
          setArticles([]);
        }
      } else {
        console.error('Error al obtener artículos:', response.status);
        setArticles([]);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener un artículo específico
  const fetchArticleBySlug = async (slug) => {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedArticle(data);
      } else {
        console.error('Error al obtener el artículo');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    }
  };

  // Función para crear un nuevo artículo
  const createArticle = async () => {
    if (!newArticle.title || !newArticle.excerpt || !newArticle.content || !newArticle.author) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      const articleData = {
        ...newArticle,
        slug: newArticle.title.toLowerCase()
          .replace(/[^a-z0-9 -]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-'),
        tags: newArticle.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      const response = await fetch(`${API_BASE_URL}/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData)
      });

      if (response.ok) {
        const createdArticle = await response.json();
        await fetchArticles();

        setNewArticle({
          title: '',
          excerpt: '',
          content: '',
          author: '',
          category: 'Activism',
          tags: '',
          imageUrl: '',
          isFeatured: false
        });
        setShowCreateForm(false);
        alert('¡Artículo creado exitosamente!');
        window.location.reload();
      } else {
        const error = await response.json();
        alert('Error al crear el artículo: ' + (error.message || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('Error de conexión al crear el artículo');
    }
  };

  // Función para incrementar el contador de visualizaciones
  const incrementViewCount = async (slug: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/${slug}/view`, {
        method: 'PATCH'
      });
      if (!response.ok) {
        console.warn(`No se pudo incrementar el contador de vistas para el artículo ${slug}`);
      }
    } catch (error) {
      console.warn('Error al incrementar visualizaciones:', error);
      // No lanzamos el error para evitar que la aplicación se rompa
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // Filtrar artículos por búsqueda y categoría
  const filteredArticles = Array.isArray(articles) ? articles.filter(article => {
    const matchesSearch = article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory && article.status === 'published';
  }) : [];

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
    incrementViewCount(article.slug);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-4">
          {/* Header del artículo */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <button 
              onClick={() => setSelectedArticle(null)}
              className="text-blue-500 hover:text-blue-700 mb-4 flex items-center gap-2"
            >
              Volver a la lista
            </button>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{selectedArticle.author}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDate(selectedArticle.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {selectedArticle.viewCount} vistas
                  </span>
                </div>
              </div>
            </div>

            {selectedArticle.isFeatured && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                <span className="text-yellow-800 text-sm font-medium">⭐ Artículo Destacado</span>
              </div>
            )}

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{selectedArticle.title}</h1>
            
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                {selectedArticle.category}
              </span>
              {selectedArticle.tags.map((tag, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>

            {selectedArticle.imageUrl && selectedArticle.imageUrl !== '/placeholder.svg?height=200&width=300' && (
              <img 
                src={selectedArticle.imageUrl} 
                alt={selectedArticle.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}

            <div className="prose max-w-none">
              <p className="text-xl text-gray-700 mb-6 leading-relaxed">{selectedArticle.excerpt}</p>
              <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {selectedArticle.content}
              </div>
            </div>

            {/* Acciones del artículo */}
            <div className="flex items-center gap-6 mt-8 pt-6 border-t">
              <button className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors">
                <Heart className="w-5 h-5" />
                <span>Me gusta</span>
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span>Comentar ({selectedArticle.commentCount})</span>
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-green-500 transition-colors">
                <Share2 className="w-5 h-5" />
                <span>Compartir</span>
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-yellow-500 transition-colors">
                <Bookmark className="w-5 h-5" />
                <span>Guardar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Mujeres Activistas</h1>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Crear Artículo
            </button>
          </div>

          {/* Barra de búsqueda y filtros */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar artículos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Modal para crear artículo */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Crear Nuevo Artículo</h2>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                    <input
                      type="text"
                      value={newArticle.title}
                      onChange={(e) => setNewArticle({...newArticle, title: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Autor</label>
                    <input
                      type="text"
                      value={newArticle.author}
                      onChange={(e) => setNewArticle({...newArticle, author: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                    <select
                      value={newArticle.category}
                      onChange={(e) => setNewArticle({...newArticle, category: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Resumen</label>
                    <textarea
                      value={newArticle.excerpt}
                      onChange={(e) => setNewArticle({...newArticle, excerpt: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows="3"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contenido</label>
                    <textarea
                      value={newArticle.content}
                      onChange={(e) => setNewArticle({...newArticle, content: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows="8"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL de imagen (opcional)</label>
                    <input
                      type="url"
                      value={newArticle.imageUrl}
                      onChange={(e) => setNewArticle({...newArticle, imageUrl: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags (separados por comas)</label>
                    <input
                      type="text"
                      value={newArticle.tags}
                      onChange={(e) => setNewArticle({...newArticle, tags: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="feminismo, activismo, derechos"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={newArticle.isFeatured}
                      onChange={(e) => setNewArticle({...newArticle, isFeatured: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                      Marcar como artículo destacado
                    </label>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={createArticle}
                      className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Crear Artículo
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de artículos */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Cargando artículos...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <p className="text-gray-500">No se encontraron artículos.</p>
            </div>
          ) : (
            filteredArticles.map((article) => (
              <div key={article._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-purple-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{article.author}</h3>
                        <span className="text-gray-500">·</span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDate(article.createdAt)}
                        </span>
                      </div>

                      {article.isFeatured && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-3">
                          <span className="text-yellow-800 text-sm font-medium">⭐ Destacado</span>
                        </div>
                      )}

                      {article.imageUrl && article.imageUrl !== '/placeholder.svg?height=200&width=300' && (
                          <img 
                            src={article.imageUrl} 
                            alt={article.title}
                            className="w-full h-64 object-cover rounded-lg mb-6"
                          />
                      )}
                      
                      <h2 
                        className="text-xl font-bold text-gray-900 mb-3 cursor-pointer hover:text-purple-600 transition-colors"
                        onClick={() => handleArticleClick(article)}
                      >
                        {article.title}
                      </h2>

                      <p className="text-gray-700 mb-4 leading-relaxed">{article.excerpt}</p>

                      <div className="flex items-center gap-2 mb-4">
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                          {article.category}
                        </span>
                        {article.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {article.viewCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {article.commentCount}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => handleArticleClick(article)}
                          className="text-purple-600 hover:text-purple-800 font-medium"
                        >
                          Leer más →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};