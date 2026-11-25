const express = require('express');
const router = express.Router();
const controller = require('../controllers/categoryController');
const {categoryRules, validate} = require('../middlewares/validation');

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', categoryRules, validate, controller.create);
router.put('/:id', categoryRules, validate, controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
