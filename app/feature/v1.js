const express = require('express');
const router = express.Router();

router.use(require("./authentication/authentication.route"));
router.use(require("./tracking-voting/tracking-voting.route"));
router.use(require("./platform-vote/platform-vote.route"));
router.use(require("./grandchild/grandchild.route"));

module.exports = router;
