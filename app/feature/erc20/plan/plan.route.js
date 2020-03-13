const express = require("express");
const controller = require("./plan.controller");
const authenticate = require('app/middleware/authenticate.middleware');
const route = express.Router();
const validatingSchema = require('./plan.request-schema');
const validatorQuery = require("app/middleware/validator.query.middleware");

route.get("/erc20/plans",
  authenticate,
  validatorQuery(validatingSchema.allPlans),
  controller.getAllPlans
);


module.exports = route;


/*********************************************************************/

/**
 * @swagger
 * /api/v1/erc20/plans:
 *   get:
 *     summary: Get all plans
 *     tags:
 *       - erc20
 *     description: Get all plans of erc20 staking
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         type: string
 *         required: true
 *         description: Bearer {token}
 *       - in: query
 *         name: status
 *         type: string
 *         description: Status of plans, it is `all`, `active` or `deactive` (ommit is all).
 *       - in: query
 *         name: staking_platform_id
 *         description: Staking platform id.
 *         type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Ok 
 *         examples:
 *           application/json:
 *             {
 *                 "data": [
                    {
                        "id": "0e37df36-f698-11e6-8dd4-cb9ced3df976",
                        "name": "plan-001",
                        "duration": 10,
                        "duration_type": "YEAR",
                        "reward_percentage": "9.100",
                        "status": 1,
                        "reward_diff_token_flg": false,
                        "diff_token_rate": 0,
                        "tx_id": "",
                        "wait_blockchain_confirm_status_flg": false,
                        "staking_platform_id": "36b7f440-1a3b-11ea-978f-2e728ce88125",
                        "created_at": ""
                    },
                    {
                        "id": "0e37df36-f698-11e6-8dd4-cb9ced3df976",
                        "name": "plan-003",
                        "duration": 10,
                        "duration_type": "YEAR",
                        "reward_percentage": "9.100",
                        "status": 1,
                        "reward_diff_token_flg": false,
                        "diff_token_rate": 0,
                        "tx_id": "",
                        "wait_blockchain_confirm_status_flg": false,
                        "staking_platform_id": "36b7f440-1a3b-11ea-978f-2e728ce88125",
                        "created_at": ""
                    }
                  ]
 *             }
 *       400:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/400'
 *       401:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/401'
 *       404:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/404'
 *       500:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/500'
 */
