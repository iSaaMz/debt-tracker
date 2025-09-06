import { pool } from '../config/database.js';

export class Transaction {
  constructor(id, payer, amount, description, status, createdAt, paidAt) {
    this.id = id;
    this.payer = payer;
    this.amount = amount;
    this.description = description;
    this.status = status;
    this.createdAt = createdAt;
    this.paidAt = paidAt;
  }

  // Créer une nouvelle transaction
  static async create({ payer, amount, description }) {
    const query = `
      INSERT INTO transactions (payer, amount, description)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    
    const values = [payer, amount, description];
    const result = await pool.query(query, values);
    
    return new Transaction(
      result.rows[0].id,
      result.rows[0].payer,
      parseFloat(result.rows[0].amount),
      result.rows[0].description,
      result.rows[0].status,
      result.rows[0].created_at,
      result.rows[0].paid_at
    );
  }

  // Récupérer toutes les transactions
  static async findAll() {
    const query = 'SELECT * FROM transactions ORDER BY created_at DESC';
    const result = await pool.query(query);
    
    return result.rows.map(row => new Transaction(
      row.id,
      row.payer,
      parseFloat(row.amount),
      row.description,
      row.status,
      row.created_at,
      row.paid_at
    ));
  }

  // Marquer une transaction comme payée
  static async markAsPaid(id) {
    const query = `
      UPDATE transactions 
      SET status = 'paid', paid_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND status = 'unpaid'
      RETURNING *;
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return new Transaction(
      result.rows[0].id,
      result.rows[0].payer,
      parseFloat(result.rows[0].amount),
      result.rows[0].description,
      result.rows[0].status,
      result.rows[0].created_at,
      result.rows[0].paid_at
    );
  }

  // Calculer les dettes
  static async getDebts() {
    const query = `
      SELECT 
        payer,
        SUM(amount) as total_paid
      FROM transactions 
      WHERE status = 'unpaid'
      GROUP BY payer;
    `;
    
    const result = await pool.query(query);
    
    let aminaPaid = 0;
    let nanouPaid = 0;
    
    result.rows.forEach(row => {
      if (row.payer === 'Amina') {
        aminaPaid = parseFloat(row.total_paid);
      } else if (row.payer === 'Nanou') {
        nanouPaid = parseFloat(row.total_paid);
      }
    });

    // Logique corrigée : chaque personne doit rembourser ce que l'autre a payé
    // Le net final détermine qui doit rembourser combien à l'autre
    const netDifference = aminaPaid - nanouPaid;
    
    if (netDifference > 0) {
      // Amina a plus payé, donc Nanou lui doit la différence nette
      return {
        nanouOwesAmina: netDifference,
        aminaOwesNanou: 0
      };
    } else if (netDifference < 0) {
      // Nanou a plus payé, donc Amina lui doit la différence nette
      return {
        nanouOwesAmina: 0,
        aminaOwesNanou: Math.abs(netDifference)
      };
    } else {
      // Elles ont payé la même chose, aucune dette
      return {
        nanouOwesAmina: 0,
        aminaOwesNanou: 0
      };
    }
  }

  // Supprimer une transaction
  static async delete(id) {
    const query = 'DELETE FROM transactions WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    
    return result.rows.length > 0;
  }
}