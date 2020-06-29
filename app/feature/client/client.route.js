const express = require('express');
const controller = require('./client.controller');
const validator = require('app/middleware/validator.middleware');
const appAuth = require('app/middleware/authenticate.middleware');
const verifySignature = require('app/middleware/verify-signature.middleware');
const {
  create,
  registerMembership,
  setPolicies,
  updateAffiliateCode,
  getAffiliateCodes,
  getInvitees,
  updateMembershipType,
  getTreeChart,
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

route.post('/membership-clients',
  validator(registerMembership),
  appAuth(),
  verifySignature,
  controller.registerMembership
);
/* #endregion */

/* #region  */
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
  controller.updateAffiliateCode
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
                    "ext_client_id":"binh.nt@blockchainlabs.asia",
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

route.get('/clients/tree-chart',
  validator(getTreeChart, 'query'),
  appAuth(),
  verifySignature,
  controller.getTreeChart
);
/* #endregion */

module.exports = route;

