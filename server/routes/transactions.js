import express from 'express';
import { Transaction } from '../models/Transaction.js';

const router = express.Router();

// Validation middleware
const validateTransaction = (req, res, next) => {
  const { payer, amount, description } = req.body;
  
  if (!payer || !amount || !description) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'payer, amount and description are required'
    });
  }
  
  if (!['Amina', 'Nanou'].includes(payer)) {
    return res.status(400).json({
      error: 'Invalid payer',
      message: 'payer must be either "Amina" or "Nanou"'
    });
  }
  
  if (isNaN(amount) || parseFloat(amount) <= 0) {
    return res.status(400).json({
      error: 'Invalid amount',
      message: 'amount must be a positive number'
    });
  }
  
  if (typeof description !== 'string' || description.trim().length === 0) {
    return res.status(400).json({
      error: 'Invalid description',
      message: 'description must be a non-empty string'
    });
  }
  
  next();
};

// GET /api/transactions - Récupérer toutes les transactions
router.get('/', async (req, res, next) => {
  try {
    const transactions = await Transaction.findAll();
    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/transactions - Créer une nouvelle transaction
router.post('/', validateTransaction, async (req, res, next) => {
  try {
    const { payer, amount, description } = req.body;
    
    const transaction = await Transaction.create({
      payer,
      amount: parseFloat(amount),
      description: description.trim()
    });
    
    res.status(201).json({
      success: true,
      data: transaction,
      message: 'Transaction created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/transactions/:id/pay - Marquer une transaction comme payée
router.put('/:id/pay', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (isNaN(id)) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Transaction ID must be a number'
      });
    }
    
    const transaction = await Transaction.markAsPaid(parseInt(id));
    
    if (!transaction) {
      return res.status(404).json({
        error: 'Transaction not found',
        message: 'Transaction not found or already paid'
      });
    }
    
    res.json({
      success: true,
      data: transaction,
      message: 'Transaction marked as paid'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/transactions/debts - Calculer les dettes
router.get('/debts', async (req, res, next) => {
  try {
    const debts = await Transaction.getDebts();
    res.json({
      success: true,
      data: debts
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/transactions/:id - Supprimer une transaction
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (isNaN(id)) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Transaction ID must be a number'
      });
    }
    
    const deleted = await Transaction.delete(parseInt(id));
    
    if (!deleted) {
      return res.status(404).json({
        error: 'Transaction not found',
        message: 'Transaction with this ID does not exist'
      });
    }
    
    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;