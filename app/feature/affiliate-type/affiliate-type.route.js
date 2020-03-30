const express = require('express');
const controller = require('./affiliate-type.controller');
const { create, update, organizationId, affiliateTypeId, search } = require('./validator');
const validator = require('app/middleware/validator.middleware');
const appAuth = require('app/middleware/app-auth.middleware');
const route = express.Router();

/* #region Create a new affiliate type */
/**
 * @swagger
 * /api/v1/organizations/:organizationId/affiliate-types:
 *   post:
 *     summary: Create a new affiliate type
 *     tags:
 *       - AffiliateType
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
 *         name: organizationId
 *         required: true
 *         description: Organization Id
 *       - in: body
 *         name: data
 *         description:
 *         schema:
 *            type: object
 *            required:
 *            - name
 *            example:
 *              {
                  "name": "Affiliate System #01",
                  "description": ""
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
                      "id": 9,
                      "name": "Affiliate System #01",
                      "organization_id": "69366383-b9c2-497c-1111-391b017772ba",
                      "description": "",
                      "created_at": "2020-03-30T08:52:40.765Z",
                      "updated_at": "2020-03-30T08:52:40.765Z"
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

route.post('/organizations/:organizationId/affiliate-types',
  validator(organizationId, 'params'),
  validator(create),
  appAuth({ isIgnoredAffiliateTypeId: true }),
  controller.create,
);
/* #endregion */

/* #region Get affiliate type details */
/**
 * @swagger
 * /api/v1/organizations/:organizationId/affiliate-types/:affiliateTypeId:
 *   get:
 *     summary: Get affiliate type  details
 *     tags:
 *       - AffiliateType
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
 *         name: organizationId
 *         required: true
 *         description: Organization Id
 *       - in: params
 *         name: affiliateTypeId
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
                      "id": "23d59b67-1791-4b78-9902-8e17cdc4135c",
                      "name": "App #01",
                      "organization_id": "69366383-b9c2-497c-1111-391b017772ba",
                      "api_key": "8e24942c-9b1f-43da-8e94-e1c3a75143d1",
                      "secret_key": "fb9cca666ca24e6bbf37ca43b9e6e52702aecaf1ea5e4aa8aa4f4e1d3e6acdb9",
                      "actived_flg": true,
                      "created_at": "2020-03-30T08:02:32.109Z",
                      "updated_at": "2020-03-30T08:02:32.109Z"
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
 *             message: Affiliate type is not found.
 *             error: error
 *             code: AFFILIATE_IS_NOT_FOUND
 *             fields: ['affiliateTypeId']
 *
 *       500:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/500'
 */

route.get('/organizations/:organizationId/affiliate-types/:affiliateTypeId',
  validator(affiliateTypeId, 'params'),
  appAuth({ isIgnoredAffiliateTypeId: true }),
  controller.getById,
);
/* #endregion */

/* #region Search affiliate types */
/**
 * @swagger
 * /api/v1/organizations/:organizationId/affiliate-types:
 *   get:
 *     summary: Search affiliate types
 *     tags:
 *       - AffiliateType
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
 *         name: organizationId
 *         required: true
 *         description: Organization Id
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
                            "id": 1,
                            "organization_id": "69366383-b9c2-497c-1111-391b017772ba",
                            "name": "Membership System",
                            "created_at": "2020-03-25T03:59:59.889Z",
                            "updated_at": "2020-03-25T03:59:59.889Z"
                        },
                        {
                            "id": 2,
                            "organization_id": "69366383-b9c2-497c-1111-391b017772ba",
                            "name": "Affiliate System",
                            "created_at": "2020-03-25T03:59:59.889Z",
                            "updated_at": "2020-03-25T03:59:59.889Z"
                        }
                    ],
                    "offset": 0,
                    "limit": 10,
                    "total": 2
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

route.get('/organizations/:organizationId/affiliate-types',
  validator(organizationId, 'params'),
  validator(search, 'query'),
  appAuth({ isIgnoredAffiliateTypeId: true }),
  controller.search,
);
/* #endregion */

/* #region Update a app */
/**
 * @swagger
 * /api/v1/organizations/:organizationId/affiliate-types/:affiliateTypeId:
 *   put:
 *     summary: Update a affiliate type
 *     tags:
 *       - AffiliateType
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
 *         name: organizationId
 *         required: true
 *         description: Organization Id
 *       - in: params
 *         name: affiliateTypeId
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
                  "name": "Affiliate System #01 UPDATE",
                  "description": "Affiliate: user introduces his friend to staking system. When his friend stakes..."
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
                      "id": 13,
                      "name": "Affiliate System #01 UPDATE",
                      "description": "Affiliate: user introduces his friend to staking system. When his friend stakes...",
                      "created_at": "2020-03-30T08:58:13.740Z",
                      "updated_at": "2020-03-30T09:06:06.367Z"
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
 *             message: Affiliate type is not found.
 *             error: error
 *             code: AFFILIATE_IS_NOT_FOUND
 *             fields: ['affiliateTypeId']
 *
 *       500:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/500'
 */

route.put('/organizations/:organizationId/affiliate-types/:affiliateTypeId',
  validator(affiliateTypeId, 'params'),
  validator(update),
  appAuth({ isIgnoredAffiliateTypeId: true }),
  controller.update,
);
/* #endregion */

/* #region Delete a affiliate type */
/**
 * @swagger
 * /api/v1/organizations/:organizationId/affiliate-types/:affiliateTypeId:
 *   delete:
 *     summary: Delete a affiliate type
 *     tags:
 *       - App
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
 *         name: organizationId
 *         required: true
 *         description: Organization Id
 *       - in: params
 *         name: affiliateTypeId
 *         required: true
 *         description: Affiliate type Id
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
 *             message: Affiliate type is not found.
 *             error: error
 *             code: AFFILIATE_IS_NOT_FOUND
 *             fields: ['affiliateTypeId']
 *
 *       500:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/500'
 */

route.delete('/organizations/:organizationId/affiliate-types/:affiliateTypeId',
  validator(affiliateTypeId, 'params'),
  appAuth({ isIgnoredAffiliateTypeId: true }),
  controller.delete,
);
/* #endregion */

module.exports = route;

