const express = require('express');
const controller = require('./client.controller');
const { create } = require('./validator');
const validator = require('app/middleware/validator.middleware');
const appAuth = require('app/middleware/app-auth.middleware');
const route = express.Router();

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
 *         name: x-api-key
 *         type: string
 *         required: true
 *         description: App API key
 *       - in: header
 *         name: x-secret-key
 *         type: string
 *         required: true
 *         description: App secret key
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
  appAuth,
  controller.create
);

module.exports = route;

