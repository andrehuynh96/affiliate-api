const express = require('express');
const controller = require('./client.controller');
const validator = require('app/middleware/validator.middleware');
const appAuth = require('app/middleware/authenticate.middleware');
const verifySignature = require('app/middleware/verify-signature.middleware');
const {
  create,
  unregister,
  registerMembership,
  setPolicies,
  updateAffiliateCode,
  getAffiliateCodes,
  getInvitees,
  updateMembershipType,
  getTreeChart,
  extClientId,
  getRefferalStructure,
} = require('./validator');

const route = express.Router();

/* #region Get invitees */
/**
 * @swagger
 * /api/v1/clients/invitees:
 *   get:
 *     summary: Get invitees
 *     tags:
 *       - Client
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
 *             {
 *                 "data":[
                      "items": [
                          {
                              "ext_client_id": "no-code24@blockchainlabs.asia",
                              "created_at": "2020-05-08T08:24:27.829Z",
                              "updated_at": "2020-05-11T02:45:24.908Z"
                          },
                          {
                              "ext_client_id": "no-code23@blockchainlabs.asia",
                              "created_at": "2020-05-08T08:24:19.666Z",
                              "updated_at": "2020-05-11T02:45:24.907Z"
                          }
                      ],
                      "offset": 0,
                      "limit": 2,
                      "total": 4
                    ]
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

route.get('/clients',
  validator(getInvitees, 'query'),
  appAuth(),
  verifySignature,
  controller.search
);
/* #endregion */

/* #region Generate a affiliate code */
/**
 * @swagger
 * /api/v1/clients:
 *   post:
 *     summary: Generate an affiliate code
 *     tags:
 *       - Client
 *       - Backend
 *     description: Register a user and generate a affiliate code
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
 *            - ext_client_id
 *            - affiliate_code
 *            example:
 *               {
                    "ext_client_id":"binh.nt@blockchainlabs.asia",
                    "affiliate_code": "",
                    "membership_type_id": "f2db7def-62a2-45e9-bf87-bbe89a3dff17"
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
                      "code": "3N521HPSL",
                      "client_id": "75",
                      "updatedAt": "2020-03-19T05:45:36.129Z",
                      "createdAt": "2020-03-19T05:45:36.129Z"
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
 *             message: Duplicate ext_client_id
 *             error: error
 *             code: REGISTER_CLIENT_DUPLICATE_EXT_CLIENT_ID
 *             fields: ['client_id']
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

route.post('/clients',
  validator(create),
  appAuth(),
  verifySignature,
  controller.create
);
/* #endregion */

/* #region Unregister new client */
/**
 * @swagger
 * /api/v1/clients:
 *   post:
 *     summary: Unregister new client
 *     tags:
 *       - Client
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
 *            - ext_client_id
 *            - affiliate_code
 *            example:
 *               {
                    "ext_client_id":"binh.nt@blockchainlabs.asia",
                  }
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Ok
 *         examples:
 *           application/json:
 *             {
 *                 "data": true
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
 *             message: Duplicate ext_client_id
 *             error: error
 *             code: REGISTER_CLIENT_DUPLICATE_EXT_CLIENT_ID
 *             fields: ['client_id']
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

route.post('/clients/unregister',
  validator(unregister),
  appAuth(),
  verifySignature,
  controller.unregister
);
/* #endregion */

/* #region Register membership */
/**
 * @swagger
 * /api/v1/membership-clients:
 *   post:
 *     summary: Register membership
 *     tags:
 *       - Client
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
 *            - ext_client_id
 *            - affiliate_code
 *            - membership_order_id
 *            - membership_type_id
 *            - currency_symbol
 *            - amount
 *            example:
 *               {
                    "ext_client_id": "myhn+110127@blockchainlabs.asia",
                    "membership_order_id": "1",
                    "affiliate_code": "NFRWKSETK",
                    "membership_type_id": "f2db7def-62a2-45e9-bf87-bbe89a3dff17",
                    "currency_symbol": "USDT",
                    "amount": 100
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
                      "rewards": [
                          {
                              "id": "60",
                              "client_affiliate_id": "215",
                              "referrer_client_affiliate_id": null,
                              "affiliate_request_detail_id": null,
                              "from_client_affiliate_id": "220",
                              "amount": "15",
                              "policy_id": 4,
                              "currency_symbol": "USD",
                              "commisson_type": "Direct",
                              "membership_order_id": "6",
                              "createdAt": "2020-07-03T02:30:13.263Z",
                              "updatedAt": "2020-07-03T02:30:13.263Z",
                              "clientAffiliateId": "215",
                              "affiliateRequestDetailId": null,
                              "policyId": 4,
                              "ext_client_id": "myhn+110127@blockchainlabs.asia",
                              "introduced_by_ext_client_id": null
                          },
                          {
                              "id": "61",
                              "client_affiliate_id": "179",
                              "referrer_client_affiliate_id": "215",
                              "affiliate_request_detail_id": null,
                              "from_client_affiliate_id": "220",
                              "amount": "5",
                              "policy_id": 4,
                              "currency_symbol": "USD",
                              "commisson_type": "Indirect",
                              "membership_order_id": "6",
                              "createdAt": "2020-07-03T02:30:13.263Z",
                              "updatedAt": "2020-07-03T02:30:13.263Z",
                              "clientAffiliateId": "179",
                              "affiliateRequestDetailId": null,
                              "policyId": 4,
                              "ext_client_id": "hungtv+5000@blockchainlabs.asia",
                              "introduced_by_ext_client_id": "myhn+110127@blockchainlabs.asia"
                          }
                      ],
                      "affiliate_code": {
                          "code": "B0SJVRIGJ",
                          "client_affiliate_id": "220",
                          "deleted_flg": false,
                          "createdAt": "2020-07-02T11:45:57.952Z",
                          "updatedAt": "2020-07-02T11:45:57.952Z"
                      }
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
 *             message: Duplicate ext_client_id
 *             error: error
 *             code: REGISTER_CLIENT_DUPLICATE_EXT_CLIENT_ID
 *             fields: ['client_id']
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

route.post('/membership-clients',
  validator(registerMembership),
  appAuth(),
  verifySignature,
  controller.registerMembership
);
/* #endregion */

/* #region Set policies for client */
/**
 * @swagger
 * /api/v1/clients/set-policies:
 *   post:
 *     summary: Set policies for client
 *     tags:
 *       - Client
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
 *            - ext_client_id
 *            - affiliate_code
 *            example:
 *               {
                    "ext_client_id":"binh.nt@blockchainlabs.asia",
                    "affiliate_code": ""
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
                      "code": "3n521hPsL",
                      "client_id": "75",
                      "updatedAt": "2020-03-19T05:45:36.129Z",
                      "createdAt": "2020-03-19T05:45:36.129Z"
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
 *             message: Duplicate ext_client_id
 *             error: error
 *             code: REGISTER_CLIENT_DUPLICATE_EXT_CLIENT_ID
 *             fields: ['client_id']
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

route.post('/clients/set-policies',
  validator(setPolicies),
  appAuth(),
  verifySignature,
  controller.setPolicies
);
/* #endregion */

/* #region Update affiliate code for client */
/**
 * @swagger
 * /api/v1/clients/affiliate-codes:
 *   put:
 *     summary: Update affiliate code for client
 *     tags:
 *       - Client
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
 *            - ext_client_id
 *            - affiliate_code
 *            example:
 *               {
                    "ext_client_id":"binh.nt@blockchainlabs.asia",
                    "affiliate_code": "CODE6789"
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
                      "isSuccess": true
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

route.put('/clients/affiliate-codes',
  validator(updateAffiliateCode),
  appAuth(),
  verifySignature,
  controller.updateAffiliateCodeForAllAffiliateTypes
);
/* #endregion */

/* #region Update membership type for client */
/**
 * @swagger
 * /api/v1/clients/membership-type:
 *   put:
 *     summary: Update membership type for client
 *     tags:
 *       - Client
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
 *            - ext_client_id
 *            - membership_type_id
 *            example:
 *               {
                    "ext_client_id":"binh.nt110000@blockchainlabs.asia",
                    "membership_type_id": "8600c494-91f4-4186-abd8-4197c72c0f43",
                    "affiliate_code": "I6NNK6M6P"
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
                      "isSuccess": true
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

route.put('/clients/membership-type',
  validator(updateMembershipType),
  appAuth(),
  verifySignature,
  controller.updateMembershipType,
);
/* #endregion */

/* #region Get affiliate codes */
/**
 * @swagger
 * /api/v1/clients/affiliate-codes:
 *   get:
 *     summary: Get affiliate codes
 *     tags:
 *       - Client
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

 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Ok
 *         examples:
 *           application/json:
 *             {
 *                 "data":[
                        "VERYGOOD"
                    ]
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

route.get('/clients/affiliate-codes',
  validator(getAffiliateCodes, 'query'),
  appAuth(),
  verifySignature,
  controller.getAffiliateCodes
);
/* #endregion */

/* #region Get invitees */
/**
 * @swagger
 * /api/v1/clients/invitees:
 *   get:
 *     summary: Get invitees
 *     tags:
 *       - Client
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
 *             {
 *                 "data":[
                      "items": [
                          {
                              "ext_client_id": "no-code24@blockchainlabs.asia",
                              "created_at": "2020-05-08T08:24:27.829Z",
                              "updated_at": "2020-05-11T02:45:24.908Z"
                          },
                          {
                              "ext_client_id": "no-code23@blockchainlabs.asia",
                              "created_at": "2020-05-08T08:24:19.666Z",
                              "updated_at": "2020-05-11T02:45:24.907Z"
                          }
                      ],
                      "offset": 0,
                      "limit": 2,
                      "total": 4
                    ]
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

route.get('/clients/invitees',
  validator(getInvitees, 'query'),
  appAuth(),
  verifySignature,
  controller.getInvitees
);
/* #endregion */

/* #region Get tree chart */
/**
 * @swagger
 * /api/v1/clients/tree-chart:
 *   get:
 *     summary: Get tree chart
 *     tags:
 *       - Client
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
 *             {
 *                 "data": {
                      "ext_client_id": "huy.pq+37@blockchainlabs.asia",
                      "created_at": "2020-07-01T09:58:18.214Z",
                      "updated_at": "2020-07-01T09:58:18.214Z",
                      "referrer_client_affiliate_id": null,
                      "id": "198",
                      "children": [
                          {
                              "ext_client_id": "myhn+110120@blockchainlabs.asia",
                              "created_at": "2020-07-02T10:21:30.524Z",
                              "updated_at": "2020-07-02T10:21:30.524Z",
                              "referrer_client_affiliate_id": "198",
                              "id": "208",
                              "children": [],
                              "parent": null
                          },
                          {
                              "ext_client_id": "myhn+110121@blockchainlabs.asia",
                              "created_at": "2020-07-02T10:22:34.210Z",
                              "updated_at": "2020-07-02T10:22:34.210Z",
                              "referrer_client_affiliate_id": "198",
                              "id": "209",
                              "children": [],
                              "parent": null
                          },
                          {
                              "ext_client_id": "huy.pq+38@blockchainlabs.asia",
                              "created_at": "2020-07-03T03:54:20.221Z",
                              "updated_at": "2020-07-03T03:54:20.221Z",
                              "referrer_client_affiliate_id": "198",
                              "id": "222",
                              "children": [],
                              "parent": null
                          }
                      ],
                      "parent": null,
                      "affiliate_type_name": "Membership System"
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

route.get('/clients/tree-chart',
  validator(getTreeChart, 'query'),
  appAuth(),
  verifySignature,
  controller.getTreeChart
);
/* #endregion */

/* #region Get referral structure */
/**
 * @swagger
 * /api/v1/clients/referral-structure:
 *   get:
 *     summary: Get referral structure
 *     tags:
 *       - Client
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
 *             {
 *                 "data":[
                      {
                          "num_of_level_1_affiliates": 7,
                          "total": 25,
                          "num_of_level_2_affiliates": 4,
                          "num_of_level_3_affiliates": 20,
                          "num_of_level_4_affiliates": 1
                      },
                      {
                          "id": "41",
                          "client_id": "90",
                          "level": 2,
                          "ext_client_id": "myhn@blockchainlabs.asia",
                          "num_of_level_2_affiliates": 0,
                          "num_of_level_3_affiliates": 0,
                          "num_of_level_4_affiliates": 0
                      },
                      {
                          "id": "151",
                          "client_id": "192",
                          "level": 2,
                          "ext_client_id": "ducblc_@yopmail.com",
                          "num_of_level_2_affiliates": 0,
                          "num_of_level_3_affiliates": 0,
                          "num_of_level_4_affiliates": 0
                      },
                      {
                          "id": "161",
                          "client_id": "198",
                          "level": 2,
                          "ext_client_id": "ancd@blockchainlabs.asia",
                          "num_of_level_2_affiliates": 0,
                          "num_of_level_3_affiliates": 0,
                          "num_of_level_4_affiliates": 0
                      },
                      {
                          "id": "165",
                          "client_id": "202",
                          "level": 2,
                          "ext_client_id": "ducblc_2@yopmail.com",
                          "num_of_level_2_affiliates": 0,
                          "num_of_level_3_affiliates": 0,
                          "num_of_level_4_affiliates": 0
                      },
                      {
                          "id": "150",
                          "client_id": "191",
                          "level": 2,
                          "ext_client_id": "huyht+906@blockchainlabs.asia",
                          "num_of_level_2_affiliates": 0,
                          "num_of_level_3_affiliates": 0,
                          "num_of_level_4_affiliates": 0
                      },
                      {
                          "id": "154",
                          "client_id": "195",
                          "level": 2,
                          "ext_client_id": "trunglk+3333@blockchainlabs.asia",
                          "num_of_level_2_affiliates": 2,
                          "num_of_level_3_affiliates": 2,
                          "num_of_level_4_affiliates": 0
                      },
                      {
                          "id": "185",
                          "client_id": "46",
                          "level": 2,
                          "ext_client_id": "binhnt+3@blockchainlabs.asia",
                          "num_of_level_2_affiliates": 2,
                          "num_of_level_3_affiliates": 18,
                          "num_of_level_4_affiliates": 1
                      }
                    ]
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

route.get('/clients/referral-structure',
  validator(getRefferalStructure, 'query'),
  appAuth(),
  verifySignature,
  controller.getReferralStructure,
);
/* #endregion */

/* #region Deactive a user */
/**
 * @swagger
 * /api/v1/clients/deactivate:
 *   put:
 *     summary: Deactive a user
 *     tags:
 *       - Client
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
 *       - name: ext_client_id
 *         in: query
 *         type: string
 *         required: true
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Ok
 *         examples:
 *           application/json:
 *             {
 *                 "data":{
                      "isSuccess": true
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

route.put('/clients/deactivate',
  validator(extClientId, 'query'),
  appAuth(),
  verifySignature,
  controller.deactivate,
);
/* #endregion */

/* #region Active a user */
/**
 * @swagger
 * /api/v1/clients/activate:
 *   put:
 *     summary: Deactive a user
 *     tags:
 *       - Client
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
 *       - name: ext_client_id
 *         in: query
 *         type: string
 *         required: true
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Ok
 *         examples:
 *           application/json:
 *             {
 *                 "data":{
                      "isSuccess": true
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

route.put('/clients/activate',
  validator(extClientId, 'query'),
  appAuth(),
  verifySignature,
  controller.activate,
);
/* #endregion */

module.exports = route;

