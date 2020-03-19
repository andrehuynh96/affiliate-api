const express = require('express');
const router = express.Router();

router.use(require('./affiliate-code/affiliate-code.route'));
router.use(require('./reward/reward.route'));

module.exports = router;
