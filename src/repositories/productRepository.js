const pool = require('../config/db');

async function getAll() {
  const [rows] = await pool.query('SELECT * FROM products');
  return rows;
}

async function getById(id) {
  const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
  return rows[0];
}

async function create(product) {
  const {name, price, category_id} = product;
  const [result] = await pool.execute(
    'INSERT INTO products (name,price,category_id) VALUES (?,?,?)',
    [name, price, category_id]
  );
  return {id: result.insertId, ...product};
}

async function update(id, product) {
  const {name, price, category_id} = product;
  await pool.execute(
    'UPDATE products SET name = ?, price = ?, category_id = ? WHERE id = ?',
    [name, price, category_id, id]
  );
  return {id, ...product};
}

async function remove(id) {
  await pool.execute('DELETE FROM products WHERE id = ?', [id]);
}

module.exports = {getAll, getById, create, update, remove};
