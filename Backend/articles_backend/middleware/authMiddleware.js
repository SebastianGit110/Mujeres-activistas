const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Necesitarás crear este modelo

// Middleware para proteger rutas que requieren autenticación
const protect = async (req, res, next) => {
  try {
    let token;

    // Verificar si hay token en el header de autorización
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      try {
        // Obtener token del header
        token = req.headers.authorization.split(' ')[1];

        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Obtener el usuario del token (sin la contraseña)
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'No autorizado, usuario no encontrado',
          });
        }

        next();
      } catch (error) {
        console.error(error);
        res.status(401).json({
          success: false,
          message: 'No autorizado, token inválido',
        });
      }
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'No autorizado, no hay token',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
    });
  }
};

// Middleware para verificar roles (administrador, editor, etc.)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: no tienes permisos para esta acción',
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `El rol ${req.user.role} no tiene permiso para esta acción`,
      });
    }
    
    next();
  };
};

module.exports = { protect, authorize };