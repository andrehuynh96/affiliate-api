const express = require('express');
const router = express.Router();

router.use(require('./client/client.route'));
router.use(require('./reward/reward.route'));

module.exports = router;
