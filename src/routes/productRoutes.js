const express = require('express');
const router = express.Router();
const controller = require('../controllers/productController');
const {productRules, validate} = require('../middlewares/validation');

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', productRules, validate, controller.create);
router.put('/:id', productRules, validate, controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
