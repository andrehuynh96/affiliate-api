const express = require('express');
const controller = require('./membership-type.controller');
const validator = require('app/middleware/validator.middleware');
const appAuth = require('app/middleware/authenticate.middleware');
const verifySignature = require('app/middleware/verify-signature.middleware');

const route = express.Router();

/* #region Update claims reward status */
/**
 * @swagger
 * /api/v1/claim-rewards/:
 *   put:
 *     summary: Update claims reward status
 *     tags:
 *       - ClaimReward
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
                  "id_list": [
                    "ddd4517b-44ff-4d94-ae16-5465a681a260",
                    "65560ce4-ba58-4b99-a537-366c5a27a200"
                  ],
                  "status": "Approved",
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

route.put('/membership-types',
//   validator(update, 'body'),
  appAuth(),
  verifySignature,
  controller.updateMembershipType,
);
/* #endregion */

module.exports = route;