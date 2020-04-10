const express = require('express');
const controller = require('./organization.controller');
const { create, update, organizationIdParam, search } = require('./validator');
const validator = require('app/middleware/validator.middleware');
const appAuth = require('app/middleware/authenticate.middleware');
const verifySignature = require('app/middleware/verify-signature.middleware');

const route = express.Router();

/* #region Create a new organization */
/**
 * @swagger
 * /api/v1/organizations:
 *   post:
 *     summary: Create a new organization
 *     tags:
 *       - Organization
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

route.post('/organizations',
  validator(create),
  appAuth({ isIgnoredAffiliateTypeId: true }),
  verifySignature,
  controller.create,
);
/* #endregion */

/* #region Get organization details */
/**
 * @swagger
 * /api/v1/organizations/:organizationId:
 *   get:
 *     summary: Get organization details
 *     tags:
 *       - Organization
 *     description:
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         type: string
 *         required: true
 *         description: Bearer {token}
 *       - in: params
 *         name: organizationId
 *         required: true
 *         description: Organization Id
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
 *             message: Organization is not found.
 *             error: error
 *             code: ORGANIZATION_IS_NOT_FOUND
 *             fields: ['organizationId']
 *
 *       500:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/500'
 */

route.get('/organizations/:organizationId',
  validator(organizationIdParam, 'params'),
  appAuth({ isIgnoredAffiliateTypeId: true }),
  verifySignature,
  controller.getById,
);
/* #endregion */

/* #region Search organizations */
/**
 * @swagger
 * /api/v1/organizations:
 *   get:
 *     summary: Search organizations
 *     tags:
 *       - Organization
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

route.get('/organizations',
  validator(search, 'query'),
  appAuth({ isIgnoredAffiliateTypeId: true }),
  verifySignature,
  controller.search,
);
/* #endregion */

/* #region Update a organization */
/**
 * @swagger
 * /api/v1/organizations/:organizationId:
 *   put:
 *     summary: Update a organization
 *     tags:
 *       - Organization
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
 *             message: Organization is not found.
 *             error: error
 *             code: ORGANIZATION_IS_NOT_FOUND
 *             fields: ['organizationId']
 *
 *       500:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/500'
 */

route.put('/organizations/:organizationId',
  validator(organizationIdParam, 'params'),
  validator(update),
  appAuth({ isIgnoredAffiliateTypeId: true }),
  verifySignature,
  controller.update,
);
/* #endregion */

/* #region Delete a organization */
/**
 * @swagger
 * /api/v1/organizations/:organizationId:
 *   delete:
 *     summary: Delete a organization
 *     tags:
 *       - Organization
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
 *       - in: params
 *         name: organizationId
 *         required: true
 *         description: Organization Id
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
 *             message: Organization is not found.
 *             error: error
 *             code: ORGANIZATION_IS_NOT_FOUND
 *             fields: ['organizationId']
 *
 *       500:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/500'
 */

route.delete('/organizations/:organizationId',
  validator(organizationIdParam, 'params'),
  appAuth({ isIgnoredAffiliateTypeId: true }),
  verifySignature,
  controller.delete,
);
/* #endregion */

module.exports = route;

