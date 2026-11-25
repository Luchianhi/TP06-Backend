const express = require('express');
const router = express.Router();
const controller = require('../controllers/productController');
const {productRules, validate} = require('../middlewares/validation');

router.get('/', controller.getAll);
router.get('/search', controller.search);
router.get('/:id', controller.getOne);
router.post('/', productRules, validate, controller.create);
router.put('/:id', productRules, validate, controller.update);
router.delete('/:id', controller.remove);
router.post('/with-category', controller.createWithCategory);

module.exports = router;
