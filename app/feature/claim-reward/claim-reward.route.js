const express = require('express');
const controller = require('./claim-reward.controller');
const { create, search } = require('./validator');
const validator = require('app/middleware/validator.middleware');
const appAuth = require('app/middleware/authenticate.middleware');
const route = express.Router();

/* #region User claims reward */
/**
 * @swagger
 * /api/v1/claim-rewards:
 *   post:
 *     summary: User claims reward
 *     tags:
 *       - ClaimReward
 *     description: User claims reward
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         type: string
 *         required: true
 *         description: App API key
 *       - in: header
 *         name: x-secret-key
 *         type: string
 *         required: true
 *         description: App secret key
 *       - in: header
 *         name: x-affiliate-type-id
 *         type: number
 *         required: true
 *         description: Affiliate type id
 *       - in: body
 *         name: data
 *         description:
 *         schema:
 *            type: object
 *            required:
 *            - currency_symbol
 *            - ext_client_id
 *            - amount
 *            example:
 *              {
                  "currency_symbol": "ETH",
                  "ext_client_id": "stakerd@blockchainlabs.asia",
                  "amount": 1.1
                }
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Ok
 *         examples:
 *           application/json:
 *             {
 *                 "data":{
                      "id": "d6bcb267-f09c-4ead-b3dc-875d32ab8a9d",
                      "client_affiliate_id": "67",
                      "currency_symbol": "ETH",
                      "amount": "1.1",
                      "status": "PENDING",
                      "updated_at": "2020-03-30T03:21:09.206Z",
                      "created_at": "2020-03-30T03:21:09.206Z"
                    }
 *             }
 *       400:
 *         description: Baq request
 *         schema:
 *           $ref: '#/definitions/400'
 *       401:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/401'
 *       404:
 *         description: Not found
 *         schema:
 *           $ref: '#/definitions/404'
 *       500:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/500'
 */

route.post('/claim-rewards',
  validator(create),
  appAuth(),
  controller.calculateRewards,
);
/* #endregion */

/* #region View claim reward history */
/**
 * @swagger
 * /api/v1/claim-rewards:
 *   get:
 *     summary: View claim reward history
 *     tags:
 *       - ClaimReward
 *     description:
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         type: string
 *         required: true
 *         description: App API key
 *       - in: header
 *         name: x-secret-key
 *         type: string
 *         required: true
 *         description: App secret key
 *       - in: header
 *         name: x-affiliate-type-id
 *         type: number
 *         required: true
 *         description: Affiliate type id
 *       - name: currency_symbol
 *         in: query
 *         type: string
 *         required: true
 *       - name: ext_client_id
 *         in: query
 *         type: string
 *         required: true
 *       - name: offset
 *         in: query
 *         type: integer
 *         format: int32
 *         required: true
 *       - name: limit
 *         in: query
 *         type: integer
 *         format: int32
 *         required: true
 *
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Ok
 *         examples:
 *           application/json:
 *             { data:
 *                {
                    items: [
                      {
                          "id": "d6bcb267-f09c-4ead-b3dc-875d32ab8a9d",
                          "currency_symbol": "ETH",
                          "amount": "1.1",
                          "status": "PENDING",
                          "created_at": "2020-03-30T03:21:09.206Z",
                          "updated_at": "2020-03-30T03:21:09.206Z"
                      },
                      {
                          "id": "d68728cc-4553-4b95-bf4f-5eb070a1591c",
                          "currency_symbol": "ETH",
                          "amount": "1.1",
                          "status": "PENDING",
                          "created_at": "2020-03-27T08:36:56.308Z",
                          "updated_at": "2020-03-27T08:36:56.308Z"
                      },
                      {
                          "id": "2af6896f-7388-4aca-b912-7f9f7934514d",
                          "currency_symbol": "ETH",
                          "amount": "1.1",
                          "status": "PENDING",
                          "created_at": "2020-03-27T08:36:29.641Z",
                          "updated_at": "2020-03-27T08:36:29.641Z"
                      },
                    ],
                    "offset": 0,
                    "limit": 10,
                    "total": 3
                  }
                }
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

route.get('/claim-rewards',
  validator(search, 'query'),
  appAuth(),
  controller.search,
);
/* #endregion */

module.exports = route;

