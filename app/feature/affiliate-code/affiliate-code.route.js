const express = require('express');
const controller = require('./affiliate-code.controller');
const { affiliateCodeIdParam } = require('./validator');
const validator = require('app/middleware/validator.middleware');
const appAuth = require('app/middleware/authenticate.middleware');
const verifySignature = require('app/middleware/verify-signature.middleware');

const route = express.Router();

/* #region Get affiliate code details */
/**
 * @swagger
 * /api/v1/affiliate-codes/:code:
 *   get:
 *     summary: Get affiliate code details
 *     tags:
 *       - AffiliateCode
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
 *
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Ok
 *         examples:
 *           application/json:
 *             {
 *                 "data":{
                      "code": "9spWYOh6J",
                      "ext_client_id": "binhnguyen13@gmail.com",
                      "created_at": "2020-03-31T06:35:05.765Z",
                      "updated_at": "2020-03-31T06:35:05.765Z"
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
 *             message: Affiliate code is not found.
 *             error: error
 *             code: NOT_FOUND_AFFILIATE_CODE
 *
 *       500:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/500'
 */

route.get('/affiliate-codes/:code',
  validator(affiliateCodeIdParam, 'params'),
  appAuth(),
  verifySignature,
  controller.getById,
);
/* #endregion */

/* #region Validate a reference code which can reffer new member */
/**
 * @swagger
 * /api/v1/affiliate-codes/:code/can-referer:
 *   get:
 *     summary: Validate a reference code which can reffer new member
 *     tags:
 *       - AffiliateCode
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
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Ok
 *         examples:
 *           application/json:
 *             {
 *                 "data":{
                        "data": true
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
 *             message: Affiliate code is not found.
 *             error: error
 *             code: NOT_FOUND_AFFILIATE_CODE
 *
 *       500:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/500'
 */

route.get('/affiliate-codes/:code/can-referer',
  validator(affiliateCodeIdParam, 'params'),
  appAuth(),
  verifySignature,
  controller.checkReferenceCode,
);
/* #endregion */


module.exports = route;

