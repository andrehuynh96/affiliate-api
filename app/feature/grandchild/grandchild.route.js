const express = require("express");
const controller = require("./grandchild.controller");
const { create } = require("./validator");
const validator = require("app/middleware/validator.middleware");
const authenticate = require('app/middleware/authenticate.middleware');
const route = express.Router();

route.post("/grandchild",
  validator(create),
  authenticate,
  controller.create
);

route.get("/grandchild",
  authenticate,
  controller.getAll
);

module.exports = route;

/*********************************************************************/

/**
 * @swagger
 * /api/v1/grandchild:
 *   post:
 *     summary: create a new grandchild
 *     tags:
 *       - Grandchild
 *     description: create a new grandchild
 *     parameters:
 *       - in: body
 *         name: data
 *         description: Info of new grandchild
 *         schema:
 *            type: object
 *            required:
 *            - name
 *            - partner_type
 *            - email
 *            - created_by
 *            example:
 *               {
                        "name":"Trinh` pro vip",
                        "partner_type":"CHILD",
                        "email":"trinhdn@blockchainlabs.asia",
                        "created_by":3
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
                      "id": "e208c8e9-67b7-40aa-8d8a-076b133375fe",
                      "email": "trinhdn@blockchainlabs.asia",
                      "name": "Trinh` pro vip",
                      "parent_id": "ed483de6-2d14-11ea-978f-2e728ce88125",
                      "partner_type": "CHILD",
                      "actived_flg": true,
                      "deleted_flg": false,
                      "created_by": 3,
                      "updated_by": 0,
                      "updatedAt": "2020-03-04T09:20:57.633Z",
                      "createdAt": "2020-03-04T09:20:57.633Z"
                    }
 *             }
 *       400:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/400'
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

/**
 * @swagger
 * /api/v1/grandchild:
 *   get:
 *     summary: get list of all grandchilds
 *     tags:
 *       - Grandchild
 *     description: get list of all grandchilds
 *     parameters:
 *       - name: offset
 *         in: query
 *         type: integer
 *         format: int32
 *       - name: limit
 *         in: query
 *         type: integer
 *         format: int32
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Ok
 *         examples:
 *           application/json:
 *             {
 *                 "data":{
                      "items": [
                        {
                            "id": "e208c8e9-67b7-40aa-8d8a-076b133375fe",
                            "email": "trinhdn@blockchainlabs.asia",
                            "name": "Trinh` pro vip",
                            "parent_id": "ed483de6-2d14-11ea-978f-2e728ce88125",
                            "partner_type": "CHILD",
                            "actived_flg": true,
                            "deleted_flg": false,
                            "created_by": 3,
                            "updated_by": 0,
                            "createdAt": "2020-03-04T09:20:57.633Z",
                            "updatedAt": "2020-03-04T09:20:57.633Z"
                        },
                        {
                            "id": "41009e9d-e3ea-41c5-b88f-77d87a348a0e",
                            "email": "trinhdn@blockchainlabs.asia",
                            "name": "Trinh` pro vip",
                            "parent_id": "ed483de6-2d14-11ea-978f-2e728ce88125",
                            "partner_type": "CHILD",
                            "actived_flg": true,
                            "deleted_flg": false,
                            "created_by": 3,
                            "updated_by": 0,
                            "createdAt": "2020-03-04T09:13:27.749Z",
                            "updatedAt": "2020-03-04T09:13:27.749Z"
                        },
                        {
                            "id": "ed483de6-2d14-11ea-978f-2e728ce88125",
                            "email": "phith1@blockchainlabs.asia",
                            "name": "Infinito",
                            "parent_id": "ed483de6-2d14-11ea-978f-2e728ce88125",
                            "partner_type": "CHILD",
                            "actived_flg": true,
                            "deleted_flg": false,
                            "created_by": 0,
                            "updated_by": 42,
                            "createdAt": "2020-01-07T11:22:04.602Z",
                            "updatedAt": "2020-02-18T06:37:12.185Z"
                        }
                    ],
                    "offset": 0,
                    "limit": 5,
                    "total": 3
                    }
 *             }
 *       400:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/400'
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