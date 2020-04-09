const express = require('express');
const controller = require('./app.controller');
const { create, update, organizationId, appIdParam, search } = require('./validator');
const validator = require('app/middleware/validator.middleware');
const appAuth = require('app/middleware/authenticate.middleware');
const route = express.Router();

/* #region Create a new app */
/**
 * @swagger
 * /api/v1/organizations/:organizationId/apps:
 *   post:
 *     summary: Create a new app
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
 *       - in: body
 *         name: data
 *         description:
 *         schema:
 *            type: object
 *            required:
 *            - name
 *            example:
 *              {
                  "name": "App 01",
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
                      "id": "81e300c6-8e61-48fb-8c25-f4e05a7629eb",
                      "name": "App 01",
                      "organization_id": "bfcf2f7a-c3d3-4160-9cb2-38827b940cfb",
                      "api_key": "5401b4c2-876c-4786-92eb-aaf7968348f3",
                      "secret_key": "c9d7f8e6056f4009aef11d6c6e28439e06ef618d89e344558266b9cdaad25919",
                      "actived_flg": true,
                      "created_at": "2020-03-30T07:54:25.975Z",
                      "updated_at": "2020-03-30T07:54:25.975Z"
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

route.post('/organizations/:organizationId/apps',
  validator(organizationId, 'params'),
  validator(create),
  appAuth({ isIgnoredAffiliateTypeId: true }),
  controller.create,
);
/* #endregion */

/* #region Get app details */
/**
 * @swagger
 * /api/v1/organizations/:organizationId/apps/:appId:
 *   get:
 *     summary: Get app details
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
 *         name: appId
 *         required: true
 *         description: App Id
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
 *             message: App is not found.
 *             error: error
 *             code: APP_IS_NOT_FOUND
 *             fields: ['appId']
 *
 *       500:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/500'
 */

route.get('/organizations/:organizationId/apps/:appId',
  validator(appIdParam, 'params'),
  appAuth({ isIgnoredAffiliateTypeId: true }),
  controller.getById,
);
/* #endregion */

/* #region Search apps */
/**
 * @swagger
 * /api/v1/organizations/:organizationId/apps:
 *   get:
 *     summary: Search apps
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
                          "id": "8d609d94-9554-4c52-a1a2-700b245a2602",
                          "organization_id": "69366383-b9c2-497c-1111-391b017772ba",
                          "name": "Org 01",
                          "api_key": "93ea37ca-24ce-4405-af5d-fc009164c9a8",
                          "secret_key": "e48709739002489d86dfac6f3516350f87442362dc994b428735a6e94fe6aba2",
                          "actived_flg": true,
                          "created_at": "2020-03-30T08:02:20.047Z",
                          "updated_at": "2020-03-30T08:02:20.047Z"
                      },
                      {
                          "id": "87dc99bd-347b-46fa-87f1-08f3bb484444",
                          "organization_id": "69366383-b9c2-497c-1111-391b017772ba",
                          "name": "MoonStake",
                          "api_key": "DEV-487e21ca-9c95-46c0-9c24-bd86a8b38e4b",
                          "secret_key": "dee2cdcc-49be-4455-9ca0-56393aee14d6",
                          "actived_flg": true,
                          "created_at": "2020-03-25T03:59:59.895Z",
                          "updated_at": "2020-03-25T03:59:59.895Z"
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

route.get('/organizations/:organizationId/apps',
  validator(organizationId, 'params'),
  validator(search, 'query'),
  appAuth({ isIgnoredAffiliateTypeId: true }),
  controller.search,
);
/* #endregion */

/* #region Update a app */
/**
 * @swagger
 * /api/v1/organizations/:organizationId/apps/:appId:
 *   put:
 *     summary: Update a app
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
 *         name: appId
 *         required: true
 *         description: App Id
 *       - in: body
 *         name: data
 *         description:
 *         schema:
 *            type: object
 *            required:
 *            - name
 *            example:
 *              {
                  "name": "APP #01 UPDATED 01",
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
                      "id": "23d59b67-1791-4b78-9902-8e17cdc4135c",
                      "name": "APP #01 UPDATED 01",
                      "api_key": "8e24942c-9b1f-43da-8e94-e1c3a75143d1",
                      "secret_key": "fb9cca666ca24e6bbf37ca43b9e6e52702aecaf1ea5e4aa8aa4f4e1d3e6acdb9",
                      "actived_flg": true,
                      "created_at": "2020-03-30T08:02:32.109Z",
                      "updated_at": "2020-03-30T08:08:04.415Z"
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
 *             message: App is not found.
 *             error: error
 *             code: APP_IS_NOT_FOUND
 *             fields: ['appId']
 *
 *       500:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/500'
 */

route.put('/organizations/:organizationId/apps/:appId',
  validator(appIdParam, 'params'),
  validator(update),
  appAuth({ isIgnoredAffiliateTypeId: true }),
  controller.update,
);
/* #endregion */

/* #region Delete a app */
/**
 * @swagger
 * /api/v1/organizations/:organizationId/apps/:appId:
 *   delete:
 *     summary: Delete a app
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
 *         name: appId
 *         required: true
 *         description: App Id
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
 *             message: App is not found.
 *             error: error
 *             code: APP_IS_NOT_FOUND
 *             fields: ['appId']
 *
 *       500:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/500'
 */

route.delete('/organizations/:organizationId/apps/:appId',
  validator(appIdParam, 'params'),
  appAuth({ isIgnoredAffiliateTypeId: true }),
  controller.delete,
);
/* #endregion */

module.exports = route;

