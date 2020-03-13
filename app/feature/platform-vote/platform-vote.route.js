const express = require("express");
const controller = require("./platform-vote.controller");
const authenticate = require('app/middleware/authenticate.middleware');
const route = express.Router();

route.get("/platform-votes",
  authenticate,
  controller
)

/*********************************************************************/

/**
 * @swagger
 * /api/v1/platform-votes:
 *   get:
 *     summary: platform voting
 *     tags:
 *       - Platform Voting
 *     description: Platform Voting
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         type: string
 *         required: true
 *         description: Bearer {token}  
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
                          "id":"3f76680510bcca07e7e011dcc1effb079d1d0a34",
                          "name":"Cosmos",
                          "symbol":"ATOM",
                          "icon":"https://static.chainservices.info/staking/platforms/cosmos.png",
                          "description":"The best platform for staking",
                          "order_index":1,
                          "estimate_earn_per_year":10.3,
                          "lockup_unvote":21,
                          "lockup_unvote_unit":"DAY",
                          "payout_reward":2,
                          "payout_reward_unit":"HOUR|DAY|MONTH|YEAR",
                          "status":"0|1"
                        }
 *                   ]
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


module.exports = route;