const express = require('express');
const controller = require('./claim-reward.controller');
const { create, search } = require('./validator');
const validator = require('app/middleware/validator.middleware');
const appAuth = require('app/middleware/app-auth.middleware');
const route = express.Router();

route.post('/claim-rewards',
  validator(create),
  appAuth,
  controller.calculateRewards,
);

route.get('/claim-rewards',
  validator(search, 'query'),
  appAuth,
  controller.search,
);

module.exports = route;

/** *******************************************************************/
/**
 * @swagger
 * /api/v1/rewards:
 *   post:
 *     summary: Generate a affiliate code
 *     tags:
 *       - AffiliateCode
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
 *       - in: body
 *         name: data
 *         description:
 *         schema:
 *            type: object
 *            required:
 *            - user_id
 *            example:
 *               {
                        "user_id":"1003",
                        "affiliate_code": "EbFWOuig2"
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
 *       400:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/400'
 *
 *
 *
 *       401:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/401'
 *       404:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/404'
 *       500:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/500'
 */

