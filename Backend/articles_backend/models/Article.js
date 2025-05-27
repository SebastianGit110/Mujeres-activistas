const mongoose = require('mongoose');

const articleSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Por favor añade un título'],
      trim: true,
    },
    excerpt: {
      type: String,
      required: [true, 'Por favor añade un resumen'],
    },
    content: {
      type: String,
      required: [true, 'Por favor añade el contenido del artículo'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    author: {
      type: String,
      required: [true, 'Por favor añade un autor'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Cambia a true si implementas autenticación
    },
    imageUrl: {
      type: String,
      default: '/placeholder.svg?height=200&width=300',
    },
    category: {
      type: String,
      required: [true, 'Por favor selecciona una categoría'],
      enum: ['Activism', 'Technology', 'Arts', 'Health', 'Economics', 'Leadership', 'Other'],
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    tags: [String],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
    },
  },
  {
    timestamps: true,
  }
);

// Middleware para asegurarse de que el slug sea único
articleSchema.pre('save', async function (next) {
  if (this.isModified('slug')) {
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const articlesWithSlug = await this.constructor.find({ slug: slugRegEx });
    
    if (articlesWithSlug.length > 0) {
      this.slug = `${this.slug}-${articlesWithSlug.length + 1}`;
    }
  }
  next();
});

module.exports = mongoose.models.Article || mongoose.model('Article', articleSchema);