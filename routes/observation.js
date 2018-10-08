const express = require('express');

const { create } = require('../controllers/observation-controller');

const router = express.Router();

router.post('/', create);

module.exports = router;
