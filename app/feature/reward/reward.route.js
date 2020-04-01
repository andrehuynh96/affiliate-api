const express = require('express');
const controller = require('./reward.controller');
const { create, search } = require('./validator');
const validator = require('app/middleware/validator.middleware');
const appAuth = require('app/middleware/app-auth.middleware');
const route = express.Router();

/* #region Calculate rewards for clients */
/**
 * @swagger
 * /api/v1/rewards:
 *   post:
 *     summary: Calculate rewards
 *     tags:
 *       - Reward
 *     description: Calculate rewards for clients
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
 *            - from_date
 *            - to_date
 *            - details
 *            example:
 *               {
                    "currency_symbol": "ETH",
                    "from_date": "2020-03-02T00:00:02.000Z",
                    "to_date": "2020-03-03T00:00:01.000Z",
                    "details": [
                        {
                            "ext_client_id": "stakere@blockchainlabs.asia",
                            "amount": 20
                        },
                        {
                            "ext_client_id": "stakerc@blockchainlabs.asia",
                            "amount": 50
                        },
                        {
                            "ext_client_id": "stakerb@blockchainlabs.asia",
                            "amount": 50
                        },
                          {
                            "ext_client_id": "eve2@blockchainlabs.asia",
                            "amount": 0.01
                        }
                    ]
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
                      "id": "87c44daf-50d4-4489-8e51-4e8d1cf10fc4",
                      "status": "PENDING",
                      "currency_symbol": "ETH",
                      "from_date": "2020-04-02T00:00:02.000Z",
                      "to_date": "2020-04-03T00:00:01.000Z",
                      "affiliate_type_id": 2,
                      "updatedAt": "2020-03-30T03:55:35.986Z",
                      "createdAt": "2020-03-30T03:55:35.986Z",
                    }
 *             }
 *
 *       400:
 *         description: Baq request
 *         schema:
 *           properties:
 *             message:
 *              type: string
 *             error:
 *              type: string
 *             code:
 *              type: string
 *             fields:
 *              type: object
 *           example:
 *             message: Duplicate data
 *             error: error
 *             code: CALCULATE_REWARDS_DUPLICATE_DATA
 *             fields: ['from_date', 'to_date']
 *
 *       401:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/401'
 *
 *       404:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/404'
 *
 *       500:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/500'
 */

route.post('/rewards',
  validator(create),
  appAuth(),
  controller.calculateRewards
);
/* #endregion */


/* #region View affiliate requests */
/**
 * @swagger
 * /api/v1/affiliate-requests:
 *   get:
 *     summary: View affiliate requests
 *     tags:
 *       - AffiliateRequest
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
 *       - name: keyword
 *         in: query
 *         type: string
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
                          "id": "8b4909ee-504a-422e-962b-165307a6d918",
                          "status": "COMPLETED",
                          "currency_symbol": "ETH",
                          "from_date": "2020-03-11T00:00:01.000Z",
                          "to_date": "2020-03-12T00:00:00.000Z",
                          "created_at": "2020-03-31T06:46:45.576Z",
                          "updated_at": "2020-03-31T06:46:55.638Z"
                      },
                      {
                          "id": "9b4a02fc-7607-45a9-8ac1-a52acde17d1b",
                          "status": "COMPLETED",
                          "currency_symbol": "ETH",
                          "from_date": "2020-03-10T00:00:00.000Z",
                          "to_date": "2020-03-11T00:00:00.000Z",
                          "created_at": "2020-03-31T06:46:26.558Z",
                          "updated_at": "2020-03-31T06:46:36.692Z"
                      },
                      {
                          "id": "7ce5b316-7ae8-493a-992c-93092439fbf3",
                          "status": "COMPLETED",
                          "currency_symbol": "ETH",
                          "from_date": "2020-03-04T00:00:00.000Z",
                          "to_date": "2020-03-05T00:00:01.000Z",
                          "created_at": "2020-03-31T06:45:17.790Z",
                          "updated_at": "2020-03-31T06:45:28.088Z"
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
 *
 *       401:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/401'
 *
 *       404:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/404'
 *
 *       500:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/500'
 */

route.get('/affiliate-requests',
  validator(search, 'query'),
  appAuth(),
  controller.search,
);
/* #endregion */


module.exports = route;

