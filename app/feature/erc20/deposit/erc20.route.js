const express = require("express");
const controller = require("./erc20.controller");
const authenticate = require('app/middleware/authenticate.middleware');
const route = express.Router();
const validatingSchema = require('./erc20.request-schema');
const validatorQuery = require("app/middleware/validator.query.middleware");

route.get("/erc20/deposits",
  authenticate,
  validatorQuery(validatingSchema.checkGetDeposit),
  controller.getDeposit
);
route.get("/erc20/history",
  authenticate,
  validatorQuery(validatingSchema.checkGetDeposit),
  controller.getHistoryOfAddress
);
route.get("/erc20/aggregation",
  authenticate,
  validatorQuery(validatingSchema.checkGetAggregation),
  controller.getAggregationInfoOfAddr
);

module.exports = route;


/*********************************************************************/

/**
 * @swagger
 * /api/v1/erc20/deposits:
 *   get:
 *     summary: Get deposits of a depositor
 *     tags:
 *       - erc20
 *     description: Get deposits of a depositor
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         type: string
 *         required: true
 *         description: Bearer {token}
 *       - in: query
 *         name: deposit_id
 *         description: Id of a deposit.
 *         type: string
 *       - in: query
 *         name: depositor_address
 *         description: Address of a depositor.
 *         type: string
 *       - in: query
 *         name: token_address
 *         description: Address of a token.
 *       - in: query
 *         name: offset
 *         description: Offset of data for pagination.
 *         type: integer
 *       - in: query
 *         name: limit
 *         description: Limit of data for pagination.
 *         type: integer
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Ok 
 *         examples:
 *           application/json:
 *             {
                  "data": [
                    {
                        "block_time": 1577430776,
                        "block_number": "7039071",
                        "block_hash": "0x514b22f8ffcb7e39bb86cd0efe5f5735ecc9e09d34066fcb41c03e7c50118ab4",
                        "transaction_index": "0",
                        "deposit_id": "5",
                        "token_addr": "0x90A537b2904f47d958f8340B128c06b3768153BC",
                        "depositor": "0x2F0036792DF25362a2DE0Bab82B4798657B4BC36",
                        "token_amount": "1000",
                        "duration": "300",
                        "withdraw": null
                    },
                    {
                        "block_number": "7039055",
                        "block_hash": "0xa54727ba8fe5d052cdd1be29a160735cc30451cb6c1dcb5f0259a300c886b3b6",
                        "transaction_index": "10",
                        "deposit_id": "0",
                        "token_addr": "0x90A537b2904f47d958f8340B128c06b3768153BC",
                        "depositor": "0x2F0036792DF25362a2DE0Bab82B4798657B4BC36",
                        "token_amount": "1000",
                        "duration": "900",
                        "memo": "plan1-10",
                        "withdraw": {
                            "block_time": 1577430776,
                            "block_number": "7039768",
                            "blockHash": "0x16f3fd2bc9022886f281e59b0c0cee9d47dc21749ef0f80eb99a7b1493d3b3a3",
                            "transactionIndex": "99",
                            "transactionHash": "0x360f30ccb991021aef7bb88684172c7fb5229b17d02c65be6eead85e7bda3311",
                            "logIndex": "19",
                            "depositId": "0",
                            "token_addr": "0x90A537b2904f47d958f8340B128c06b3768153BC",
                            "depositor_addr": "0x2F0036792DF25362a2DE0Bab82B4798657B4BC36",
                            "recipient_addr": "0x2F0036792DF25362a2DE0Bab82B4798657B4BC36",
                            "amount": "1000"
                        }
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

/**
 * @swagger
 * /api/v1/erc20/history:
 *   get:
 *     summary: Get history of a depositor that includes deposit and withdraw information.
 *     tags:
 *       - erc20
 *     description: Get history of a depositor that includes deposit and withdraw information.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         type: string
 *         required: true
 *         description: Bearer {token}
 *       - in: query
 *         name: depositor_address
 *         description: Address of a depositor.
 *         type: string
 *       - in: query
 *         name: token_address
 *         description: Address of a token.
 *         type: string
 *       - in: query
 *         name: offset
 *         description: Offset of data for pagination.
 *         type: integer
 *       - in: query
 *         name: limit
 *         description: Limit of data for pagination.
 *         type: integer
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Ok 
 *         examples:
 *           application/json:
 *             {
                  "data": [
                    {
                      "block_time": 1577430776,
                      "block_number": "7039768",
                      "block_hash": "0x16f3fd2bc9022886f281e59b0c0cee9d47dc21749ef0f80eb99a7b1493d3b3a3",
                      "transaction_hash": "0x360f30ccb991021aef7bb88684172c7fb5229b17d02c65be6eead85e7bda3311",
                      "transaction_index": "99",
                      "log_index": "19",
                      "deposit_id": "0",
                      "token_addr": "0x90A537b2904f47d958f8340B128c06b3768153BC",
                      "depositor_addr": "0x2F0036792DF25362a2DE0Bab82B4798657B4BC36",
                      "recipient_addr": "0x2F0036792DF25362a2DE0Bab82B4798657B4BC36",
                      "amount": "1000",
                      "type": "withdraw"
                    },
                    {
                      "block_time": 1577430776,
                      "block_number": "7039071",
                      "block_hash": "0x514b22f8ffcb7e39bb86cd0efe5f5735ecc9e09d34066fcb41c03e7c50118ab4",
                      "transaction_hash": "0xc2643cb1e646283151875ed21d6db42ba109f9c71e040a77e2515e807727c193",
                      "transaction_index": "0",
                      "log_index": "2",
                      "deposit_id": "5",
                      "token_addr": "0x90A537b2904f47d958f8340B128c06b3768153BC",
                      "depositor_addr": "0x2F0036792DF25362a2DE0Bab82B4798657B4BC36",
                      "recipient_addr": "",
                      "amount": "1000",
                      "type": "deposit"
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


/*********************************************************************/

/**
 * @swagger
 * /api/v1/erc20/aggregation:
 *   get:
 *     summary: Get total deposit, withdraw, reward info of an address.
 *     tags:
 *       - erc20
 *     description: Get total deposit, withdraw, reward info of an address.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         type: string
 *         required: true
 *         description: Bearer {token}
 *       - in: query
 *         name: depositor_address
 *         description: Address of a depositor.
 *         required: true
 *         type: string
 *       - in: query
 *         name: token_address
 *         description: Address of a token.
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Ok 
 *         examples:
 *           application/json:
 *             {
                  "data": [
                    {
                      "token_addr": "0x3A610F3B1cCc2087Ca4917098929dBB87e1Eff7b",
                      "total_deposit": "2000",
                      "total_withdraw": "2000",
                      "total_reward": "54.400000000000000000"
                    },
                    {
                      "token_addr": "0x423822d571bb697ddd993c04b507dd40e754cf05",
                      "total_deposit": "2000",
                      "total_withdraw": "2000",
                      "total_reward": "86.800000000000000000"
                    },
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