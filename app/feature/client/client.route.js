const express = require('express');
const controller = require('./client.controller');
const validator = require('app/middleware/validator.middleware');
const appAuth = require('app/middleware/authenticate.middleware');
const verifySignature = require('app/middleware/verify-signature.middleware');
const {
  create,
  setPolicies,
  updateAffiliateCode,
  getAffiliateCodes,
} = require('./validator');

const route = express.Router();

/* #region Generate a affiliate code */
/**
 * @swagger
 * /api/v1/clients:
 *   post:
 *     summary: Generate a affiliate code
 *     tags:
 *       - Client
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

/* #region  Update affiliate code for client */
/**
 * @swagger
 * /api/v1/clients/affiliate-codes:
 *   put:
 *     summary: Update affiliate code for client
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
                    "affiliate_code": "OGWWDGD1I"
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

/* #region Get affiliate codes */
/**
 * @swagger
 * /api/v1/clients/affiliate-codes:
 *   get:
 *     summary: Get affiliate codes
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
                        "VSRC6PXRK"
                    ]
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


module.exports = route;

