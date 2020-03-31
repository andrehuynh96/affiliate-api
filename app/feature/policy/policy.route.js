const express = require('express');
const controller = require('./policy.controller');
const { create, update, policyIdParam, search } = require('./validator');
const validator = require('app/middleware/validator.middleware');
const appAuth = require('app/middleware/app-auth.middleware');
const route = express.Router();

/* #region Create a new policy */
/**
 * @swagger
 * /api/v1/policies:
 *   post:
 *     summary: Create a new policy
 *     tags:
 *       - Policy
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
 *       - in: body
 *         name: data
 *         description:
 *         schema:
 *            type: object
 *            required:
 *            - name
 *            example:
 *              {
                  "name": "Org 01"
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
                      "id": "50799f56-9ad2-4605-8376-c8e6db186431",
                      "name": "org 01",
                      "created_at": "2020-03-30T04:30:15.166Z",
                      "updated_at": "2020-03-30T04:30:15.166Z"
                    }
 *             }
 *       400:
 *         description: Baq request
 *         schema:
 *           $ref: '#/definitions/400'
 *
 *       401:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/401'
 *
 *       404:
 *         description: Not found
 *         schema:
 *           $ref: '#/definitions/404'
 *
 *       500:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/500'
 */

route.post('/policies',
  validator(create),
  appAuth({ isIgnoredAffiliateTypeId: true }),
  controller.create,
);
/* #endregion */

/* #region Get policy details */
/**
 * @swagger
 * /api/v1/policies/:policyId:
 *   get:
 *     summary: Get policy details
 *     tags:
 *       - Policy
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
  *       - in: params
 *         name: policyId
 *         required: true
 *         description: Policy Id
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Ok
 *         examples:
 *           application/json:
 *             {
 *                 "data":{
                      "id": 1,
                      "name": "AffiliateSystem - Membership Policy",
                      "description": "",
                      "type": "MEMBERSHIP",
                      "proportion_share": 10,
                      "max_levels": 4,
                      "membership_rate": {
                          "SILVER": 2,
                          "GOLD": 5,
                          "DIAMIAD": 10
                      },
                      "created_at": "2020-03-25T03:59:59.881Z",
                      "updated_at": "2020-03-25T03:59:59.881Z"
                    }
 *             }
 *       400:
 *         description: Baq request
 *         schema:
 *           $ref: '#/definitions/400'
 *
 *       401:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/401'
 *
 *       404:
 *         description: Not found
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
 *             message: Policy is not found.
 *             error: error
 *             code: POLICY_IS_NOT_FOUND
 *             fields: ['policyId']
 *
 *       500:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/500'
 */

route.get('/policies/:policyId',
  validator(policyIdParam, 'params'),
  appAuth({ isIgnoredAffiliateTypeId: true }),
  controller.getById,
);
/* #endregion */

/* #region Search policies */
/**
 * @swagger
 * /api/v1/policies:
 *   get:
 *     summary: Search policies
 *     tags:
 *       - Policy
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

route.get('/policies',
  validator(search, 'query'),
  appAuth({ isIgnoredAffiliateTypeId: true }),
  controller.search,
);
/* #endregion */

/* #region Update a policy */
/**
 * @swagger
 * /api/v1/policies/:policyId:
 *   put:
 *     summary: Update a policy
 *     tags:
 *       - Policy
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
  *       - in: params
 *         name: policyId
 *         required: true
 *         description: Policy Id
 *       - in: body
 *         name: data
 *         description:
 *         schema:
 *            type: object
 *            required:
 *            - name
 *            example:
 *              {
                  "name": "Org 01"
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
                      "id": "50799f56-9ad2-4605-8376-c8e6db186431",
                      "name": "org 01",
                      "created_at": "2020-03-30T04:30:15.166Z",
                      "updated_at": "2020-03-30T04:30:15.166Z"
                    }
 *             }
 *       400:
 *         description: Baq request
 *         schema:
 *           $ref: '#/definitions/400'
 *
 *       401:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/401'
 *
 *       404:
 *         description: Not found
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
 *             message: Policy is not found.
 *             error: error
 *             code: POLICY_IS_NOT_FOUND
 *             fields: ['policyId']
 *
 *       500:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/500'
 */

route.put('/policies/:policyId',
  validator(policyIdParam, 'params'),
  validator(update),
  appAuth({ isIgnoredAffiliateTypeId: true }),
  controller.update,
);
/* #endregion */

/* #region Delete a policy */
/**
 * @swagger
 * /api/v1/policies/:policyId:
 *   delete:
 *     summary: Delete a policy
 *     tags:
 *       - Policy
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
 *       - in: params
 *         name: policyId
 *         required: true
 *         description: Policy Id
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Ok
 *         examples:
 *           application/json:
 *             {
 *                 "data":{
                        "deleted": true
                    }
 *             }
 *       400:
 *         description: Baq request
 *         schema:
 *           $ref: '#/definitions/400'
 *
 *       401:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/401'
 *
 *       404:
 *         description: Not found
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
 *             message: Policy is not found.
 *             error: error
 *             code: POLICY_IS_NOT_FOUND
 *             fields: ['policyId']
 *
 *       500:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/500'
 */

route.delete('/policies/:policyId',
  validator(policyIdParam, 'params'),
  appAuth({ isIgnoredAffiliateTypeId: true }),
  controller.delete,
);
/* #endregion */

module.exports = route;

