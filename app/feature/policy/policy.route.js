const express = require('express');
const controller = require('./policy.controller');
const { create, update, policyIdParam, search } = require('./validator');
const validator = require('app/middleware/validator.middleware');
const appAuth = require('app/middleware/authenticate.middleware');
const userIdAppAuth = require('app/middleware/plutx-userid-app-auth.middleware');
const verifySignature = require('app/middleware/verify-signature.middleware');

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
 *         name: Authorization
 *         type: string
 *         required: true
 *         description: Bearer {token}
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
 *            - name
 *            example:
 *              {
                  "name": "AffiliateSystem - Membership Policy #01",
                  "description": "",
                  "type": "MEMBERSHIP_AFFILIATE",
                  "proportion_share": 11.11,
                  "rates": [
                      50.11,
                      30,
                      11,
                      9
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
                      "id": 71,
                      "name": "AffiliateSystem - Membership Policy #01",
                      "description": "",
                      "type": "MEMBERSHIP_AFFILIATE",
                      "proportion_share": "11.11000",
                      "rates": [
                          "50.11",
                          "30",
                          "11",
                          "9"
                      ],
                      "created_at": "2020-03-31T04:29:32.564Z",
                      "updated_at": "2020-03-31T04:29:32.564Z"
                    }
 *             }
 *       400:
 *         description: Bad request
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
  userIdAppAuth({
    isIgnoredAffiliateTypeId: true,
    scopes: ['affiliate', 'system_admin'],
    checkAllScopes: true,
  }),
  verifySignature,
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
 *       - Backend
 *     description:
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         type: string
 *         required: true
 *         description: Bearer {token}
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
                          "DIAMOND": 10
                      },
                      "created_at": "2020-03-25T03:59:59.881Z",
                      "updated_at": "2020-03-25T03:59:59.881Z"
                    }
 *             }
 *       400:
 *         description: Bad request
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
  appAuth(),
  verifySignature,
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
                          "id": 2,
                          "name": "AffiliateSystem - Membership Affiliate Policy",
                          "description": "",
                          "type": "MEMBERSHIP_AFFILIATE",
                          "proportion_share": "20.00000",
                          "max_levels": 4,
                          "rates": [
                              "50",
                              "30",
                              "15",
                              "5"
                          ],
                          "created_at": "2020-03-25T03:59:59.881Z",
                          "updated_at": "2020-03-25T03:59:59.881Z"
                      },
                      {
                          "id": 1,
                          "name": "AffiliateSystem - Membership Policy",
                          "description": "",
                          "type": "MEMBERSHIP",
                          "proportion_share": "10.00000",
                          "max_levels": 4,
                          "membership_rate": {
                              "SILVER": 2,
                              "GOLD": 5,
                              "DIAMOND": 10
                          },
                          "created_at": "2020-03-25T03:59:59.881Z",
                          "updated_at": "2020-03-25T03:59:59.881Z"
                      },
                      {
                          "id": 4,
                          "name": "MembershipSystem - Affiliate Policy",
                          "description": "",
                          "type": "AFFILIATE",
                          "proportion_share": "20.00000",
                          "max_levels": 5,
                          "rates": [
                              "50",
                              "30",
                              "15",
                              "5"
                          ],
                          "created_at": "2020-03-25T03:59:59.881Z",
                          "updated_at": "2020-03-25T03:59:59.881Z"
                      },
                      {
                          "id": 3,
                          "name": "AffiliateSystem - Membership Policy #01",
                          "description": "",
                          "type": "AFFILIATE",
                          "proportion_share": "10.11100",
                          "max_levels": 4,
                          "rates": [
                              "50",
                              "35",
                              "10",
                              "5"
                          ],
                          "created_at": "2020-03-25T03:59:59.881Z",
                          "updated_at": "2020-03-31T04:37:04.801Z"
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

route.get('/policies',
  validator(search, 'query'),
  appAuth(),
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
  *       - Backend
 *     description:
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         type: string
 *         required: true
 *         description: Bearer {token}
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
  *       - in: header
 *         name: x-affiliate-type-id
 *         type: number
 *         required: true
 *         description: Affiliate type id
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
                  "name": "Membership system - Affiliate Policy",
                  "description": "",
                  "proportion_share": 10,
                  "max_levels": 5,
                  "rates": [
                      "50",
                      "30",
                      "10",
                      "7",
                      "3"
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
                      "id": 40,
                      "name": "AffiliateSystem - AFFILIATE Policy #011",
                      "description": "",
                      "type": "AFFILIATE",
                      "proportion_share": "10.12300",
                      "rates": [
                          "50.11",
                          "30",
                          "11",
                          "9"
                      ],
                      "created_at": "2020-03-31T04:20:53.641Z",
                      "updated_at": "2020-03-31T04:41:17.687Z"
                    }
 *             }
 *       400:
 *         description: Bad request
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
  appAuth(),
  verifySignature,
  controller.update,
);
/* #endregion */

// /* #region Delete a policy */
// /**
//  * @swagger
//  * /api/v1/policies/:policyId:
//  *   delete:
//  *     summary: Delete a policy
//  *     tags:
//  *       - Policy
//  *     description:
//  *     parameters:
//  *       - in: header
//  *         name: Authorization
//  *         type: string
//  *         required: true
//  *         description: Bearer {token}
//  *       - in: header
//  *         name: x-time
//  *         type: string
//  *         required: true
//  *         description: Unix Time
//  *       - in: header
//  *         name: x-checksum
//  *         type: string
//  *         required: true
//  *         description: Checksum
//  *       - in: params
//  *         name: policyId
//  *         required: true
//  *         description: Policy Id
//  *     produces:
//  *       - application/json
//  *     responses:
//  *       200:
//  *         description: Ok
//  *         examples:
//  *           application/json:
//  *             {
//  *                 "data":{
//                         "deleted": true
//                     }
//  *             }
//  *       400:
//  *         description: Bad request
//  *         schema:
//  *           $ref: '#/definitions/400'
//  *
//  *       401:
//  *         description: Error
//  *         schema:
//  *           $ref: '#/definitions/401'
//  *
//  *       404:
//  *         description: Not found
//  *         schema:
//  *           properties:
//  *             message:
//  *              type: string
//  *             error:
//  *              type: string
//  *             code:
//  *              type: string
//  *             fields:
//  *              type: object
//  *           example:
//  *             message: Policy is not found.
//  *             error: error
//  *             code: POLICY_IS_NOT_FOUND
//  *             fields: ['policyId']
//  *
//  *       500:
//  *         description: Error
//  *         schema:
//  *           $ref: '#/definitions/500'
//  */

// route.delete('/policies/:policyId',
//   validator(policyIdParam, 'params'),
//   userIdAppAuth({
//     isIgnoredAffiliateTypeId: true,
//     scopes: ['affiliate', 'system_admin'],
//     checkAllScopes: true,
//   }),
//   verifySignature,
//   controller.delete,
// );
// /* #endregion */

module.exports = route;

