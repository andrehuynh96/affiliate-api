const express = require('express');
const controller = require('./affiliate-code.controller');
const validator = require('app/middleware/validator.middleware');
const appAuth = require('app/middleware/authenticate.middleware');
const verifySignature = require('app/middleware/verify-signature.middleware');
const { affiliateCodeIdParam, search, update } = require('./validator');

const route = express.Router();

/* #region Search affiliate codes */
/**
 * @swagger
 * /api/v1/affiliate-codes:
 *   get:
 *     summary: Search affiliate codes
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

route.get('/affiliate-codes',
  validator(search, 'query'),
  appAuth(),
  controller.search,
);
/* #endregion */

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
                      "max_references": 0,
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

/* #region Update affiliate code */
/**
 * @swagger
 * /api/v1/affiliate-codes/:code:
 *   put:
 *     summary: Update affiliate code
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
 *       - in: body
 *         name: data
 *         description:
 *         schema:
 *            type: object
 *            required:
 *            - name
 *            example:
 *              {
                  "max_references": 10
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
                        "num_of_clicks": 1118
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

route.put('/affiliate-codes/:code',
  validator(affiliateCodeIdParam, 'params'),
  validator(update, 'body'),
  appAuth(),
  verifySignature,
  controller.updateReferenceCode,
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
                        isValid: true
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

/* #region Update statatics when client click on refferal url */
/**
 * @swagger
 * /api/v1/affiliate-codes/:code/click:
 *   post:
 *     summary: Update statatics when client click on refferal url
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
                        "num_of_clicks": 1118
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

route.post('/affiliate-codes/:code/click',
  validator(affiliateCodeIdParam, 'params'),
  appAuth(),
  verifySignature,
  controller.clickReferalCode,
);
/* #endregion */

module.exports = route;

