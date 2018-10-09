const express = require('express');

const { create, findAll, findOne } = require('../controllers/observation-controller');

const router = express.Router();

router.post('/', create);
router.get('/', findAll);
router.get('/:id', findOne);

module.exports = router;
