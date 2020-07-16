const express = require('express');
const controller = require('./membership-type.controller');
const validator = require('app/middleware/validator.middleware');
const { update } = require('./validator');
const appAuth = require('app/middleware/authenticate.middleware');
const verifySignature = require('app/middleware/verify-signature.middleware');

const route = express.Router();

/* #region Update claims reward status */
/**
 * @swagger
 * /api/v1/membership-type-config/:
 *   put:
 *     summary: Update membership type
 *     tags:
 *       - MembershipType
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
 *            - status
 *            example:
 *              {
                  "membershipTypes": [{
                        "id": "88fda933-0658-49c4-a9c7-4c0021e9a071",
                        "name": "Gold",
                        "price": 500,
                        "is_enabled": true
                      },
                      {
                        "id": "d146bc01-9e56-4664-9788-79e518877f0b",
                        "name": "Silver",
                        "price": 0,
                        "is_enabled": true
                      }]
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
 *       400:
 *         description: Bad request
 *         schema:
 *           $ref: '#/definitions/400'
 *       401:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/401'
 *       404:
 *         description: Not found
 *         schema:
 *           $ref: '#/definitions/404'
 *       500:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/500'
 */

route.put('/membership-type-config',
  validator(update, 'body'),
  appAuth(),
  verifySignature,
  controller.updateMembershipTypeConfig,
);
/* #endregion */

module.exports = route;