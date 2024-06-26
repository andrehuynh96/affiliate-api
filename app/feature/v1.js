const express = require('express');
const router = express.Router();

router.use(require('./authentication/authentication.route'));
router.use(require('./client/client.route'));
router.use(require('./reward/reward.route'));
router.use(require('./claim-reward/claim-reward.route'));
router.use(require('./organization/organization.route'));
router.use(require('./app/app.route'));
router.use(require('./affiliate-type/affiliate-type.route'));
router.use(require('./policy/policy.route'));
router.use(require('./affiliate-code/affiliate-code.route'));
router.use(require('./membership-type/membership-type.route'));

module.exports = router;
