const express = require('express');
const router = express.Router();

router.use(require('./affiliate-code/affiliate-code.route'));

module.exports = router;
