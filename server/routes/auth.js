import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';

const router = express.Router();

// JWT secret (should be in environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Tous les champs sont requis' 
      });
    }

    if (!['Amina', 'Nanou'].includes(name)) {
      return res.status(400).json({ 
        error: 'Le nom doit être "Amina" ou "Nanou"' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Le mot de passe doit contenir au moins 6 caractères' 
      });
    }

    // Check if a user with this name already exists (ultra limited registration)
    const existingUserByName = await pool.query(
      'SELECT * FROM users WHERE name = $1',
      [name]
    );

    if (existingUserByName.rows.length > 0) {
      return res.status(409).json({ 
        error: `Un compte pour ${name} existe déjà. L'inscription est limitée à 1 compte par personne.` 
      });
    }

    // Check if email is already used
    const existingUserByEmail = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUserByEmail.rows.length > 0) {
      return res.status(409).json({ 
        error: 'Cet email est déjà utilisé' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, hashedPassword]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email et mot de passe requis' 
      });
    }

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Email ou mot de passe incorrect' 
      });
    }

    const user = result.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Email ou mot de passe incorrect' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Check available names for registration
router.get('/available-names', async (req, res) => {
  try {
    const result = await pool.query('SELECT name FROM users WHERE name IN ($1, $2)', ['Amina', 'Nanou']);
    const takenNames = result.rows.map(row => row.name);
    const availableNames = ['Amina', 'Nanou'].filter(name => !takenNames.includes(name));
    
    res.json({
      success: true,
      availableNames,
      takenNames
    });
  } catch (error) {
    console.error('Error checking available names:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Get current user (protected route)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ user: result.rows[0] });

  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Middleware to authenticate JWT token
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token d\'accès requis' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
}

export default router;