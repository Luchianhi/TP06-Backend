const productRepo = require('../repositories/productRepository');
const categoryRepo = require('../repositories/categoryRepository');

async function listProducts() {
  return await productRepo.getAll();
}

async function getProduct(id) {
  const product = await productRepo.getById(id);
  if (!product) throw new Error('Product not found');
  return product;
}

async function createProduct(data) {
  // Vérifier que la catégorie existe
  if (data.category_id) {
    const cat = await categoryRepo.getById(data.category_id);
    if (!cat) throw new Error('Invalid category_id');
  }
  return await productRepo.create(data);
}

async function updateProduct(id, data) {
  const existing = await productRepo.getById(id);
  if (!existing) throw new Error('Product not found');
  if (data.category_id) {
    const cat = await categoryRepo.getById(data.category_id);
    if (!cat) throw new Error('Invalid category_id');
  }
  return await productRepo.update(id, data);
}

async function deleteProduct(id) {
  const existing = await productRepo.getById(id);
  if (!existing) throw new Error('Product not found');
  await productRepo.remove(id);
}

module.exports = {listProducts, getProduct, createProduct, updateProduct, deleteProduct};
