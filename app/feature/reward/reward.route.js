const express = require('express');
const controller = require('./reward.controller');
const validator = require('app/middleware/validator.middleware');
const appAuth = require('app/middleware/authenticate.middleware');
const verifySignature = require('app/middleware/verify-signature.middleware');
const {
  create,
  search,
  viewRewards,
  getAvailableRewards,
  requestIdParam,
} = require('./validator');

const route = express.Router();

/* #region Calculate rewards for clients */
/**
 * @swagger
 * /api/v1/rewards:
 *   post:
 *     summary: Calculate rewards
 *     tags:
 *       - Reward
 *       - Backend
 *     description: Calculate rewards for clients
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         type: string
 *         required: true
 *         description: Bearer {token}
 *       - in: header
 *         name: x-affiliate-type-id
 *         type: number
 *         required: true
 *         description: Affiliate type id
 *       - in: header
 *         name: x-time
 *         type: string
 *         required: true
 *         description: Unix Time
 *       - in: header
 *         name: x-checksum
 *         type: string
 *         required: true
 *         description: Checksum
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
 *         description: Bad request
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
  verifySignature,
  controller.calculateRewards,
);
/* #endregion */

/* #region View user's reward histories */
/**
 * @swagger
 * /api/v1/rewards:
 *   get:
 *     summary: View user's reward histories
 *     tags:
 *       - Reward
 *       - Backend
 *     description:
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         type: string
 *         required: true
 *         description: Bearer {token}
 *       - in: header
 *         name: x-affiliate-type-id
 *         type: number
 *         required: true
 *         description: Affiliate type id
 *       - name: ext_client_id
 *         in: query
 *         type: string
 *         required: true
 *         description: Member's email
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
                            "id": "7",
                            "currency_symbol": "ETH",
                            "amount": "0.00001",
                            "created_at": "2020-06-05T08:06:11.177Z",
                            "updated_at": "2020-06-05T08:06:11.177Z"
                        },
                        {
                            "id": "6",
                            "currency_symbol": "ETH",
                            "amount": "5",
                            "created_at": "2020-06-05T08:06:04.310Z",
                            "updated_at": "2020-06-05T08:06:04.310Z"
                        },
                        {
                            "id": "5",
                            "currency_symbol": "ETH",
                            "amount": "50.12",
                            "created_at": "2020-06-05T08:05:49.590Z",
                            "updated_at": "2020-06-05T08:05:49.590Z"
                        },
                        {
                            "id": "2",
                            "currency_symbol": "ETH",
                            "amount": "0.6",
                            "created_at": "2020-06-05T08:05:49.552Z",
                            "updated_at": "2020-06-05T08:05:49.552Z"
                        }
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

route.get('/rewards',
  validator(viewRewards, 'query'),
  appAuth(),
  verifySignature,
  controller.viewRewardHistories,
);
/* #endregion */

/* #region Get Available Rewards */
/**
 * @swagger
 * /api/v1/available-rewards:
 *   get:
 *     summary: Get Available Rewards
 *     tags:
 *       - Reward
 *       - Backend
 *     description:
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         type: string
 *         required: true
 *         description: Bearer {token}
 *       - in: header
 *         name: x-affiliate-type-id
 *         type: number
 *         required: true
 *         description: Affiliate type id
 *       - name: ext_client_id
 *         in: query
 *         type: string
 *         required: true
 *         description: Member's email
 *
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Ok
 *         examples:
 *           application/json:
 *             { data:
                  [
                      {
                          "currency": "ETH",
                          "amount": "250.8"
                      },
                      {
                          "currency": "USD",
                          "amount": "1323364"
                      }
                  ]
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

route.get('/available-rewards',
  validator(getAvailableRewards, 'query'),
  appAuth(),
  verifySignature,
  controller.getAvailableRewards,
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
 *         name: Authorization
 *         type: string
 *         required: true
 *         description: Bearer {token}
 *       - name: from_date
 *         in: query
 *         type: string
 *       - name: to_date
 *         in: query
 *         type: string
 *       - name: status
 *         in: query
 *         type: string
 *       - name: currency
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
                            "id": "7a5f1990-7b3d-4b6b-9329-8949acce2d7f",
                            "status": "COMPLETED",
                            "currency_symbol": "ETH",
                            "from_date": "2020-03-02T00:00:02.000Z",
                            "to_date": "2020-03-03T00:00:01.000Z",
                            "affiliate_type": "Membership System",
                            "created_at": "2020-06-15T08:43:53.713Z",
                            "updated_at": "2020-06-15T08:43:57.277Z"
                        },
                        {
                            "id": "ed8e290d-9b7e-4833-800a-a785987bd747",
                            "status": "COMPLETED",
                            "currency_symbol": "ETH",
                            "from_date": "2020-03-03T00:00:02.000Z",
                            "to_date": "2020-03-04T00:00:01.000Z",
                            "affiliate_type": "Membership System",
                            "created_at": "2020-06-11T10:09:12.623Z",
                            "updated_at": "2020-06-11T10:09:15.109Z"
                        }
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
  appAuth({ isIgnoredAffiliateTypeId: true }),
  verifySignature,
  controller.searchAffiliateRequests,
);
/* #endregion */

/* #region Get affiliate request details */
/**
 * @swagger
 * /api/v1/affiliate-requests/:requestId:
 *   get:
 *     summary: Get affiliate request details
 *     tags:
 *       - AffiliateRequest
 *     description:
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
 *                data:
 *                {
                    "id": "7a5f1990-7b3d-4b6b-9329-8949acce2d7f",
                    "status": "COMPLETED",
                    "currency_symbol": "ETH",
                    "from_date": "2020-03-02T00:00:02.000Z",
                    "to_date": "2020-03-03T00:00:01.000Z",
                    "created_at": "2020-06-15T08:43:53.713Z",
                    "updated_at": "2020-06-15T08:43:57.277Z"
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

route.get('/affiliate-requests/:requestId',
  validator(requestIdParam, 'params'),
  appAuth({ isIgnoredAffiliateTypeId: true }),
  verifySignature,
  controller.getAffiliateRequestDetails,
);
/* #endregion */





module.exports = route;

