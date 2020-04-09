const express = require('express');
const controller = require('./authentication.controller');
const requestSchema = require('./authentication.request-schema');
const validator = require('app/middleware/validator.middleware');
const route = express.Router();

route.post('/auth/token',
  validator(requestSchema),
  controller
);

/* #region Get toekn */
/**
 * @swagger
 * /api/v1/auth/token:
 *   post:
 *     summary: Get token
 *     tags:
 *       - Auth
 *     description: Get token
 *     parameters:
 *       - in: body
 *         name: data
 *         description:
 *         schema:
 *            type: object
 *            required:
 *            - api_key
 *            - secret_key
 *            - grant_type
 *            example:
 *               {
                        "api_key":"3f76680510bcca07e7e011dcc1effb079d1d0a34",
                        "secret_key":"MWViNjVmOTMtMzU2NS00OTBiLWE3NzgtZjlhMzIzNTg0YjMw",
                        "grant_type":"client_credentials"
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
                      "access_token":"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRfaWQiOiJiNThkZTJmNS02MDVkLTQ5NGMtYmI0Mi1iNjAyYmMxZWMwNWMiLCJ1c2VyX2lkIjoiN2ZhYmE3NmUtZDYwYS0xMWU5LTlkNmUtZjIzYzkxYTAzMTM5IiwidXNlcm5hbWUiOiJodXlodEBibG9ja2NoYWlubGFicy5hc2lhIiwiaWF0IjoxNTY4ODczMTU2LCJleHAiOjE1Njg5NTc3NTYsImF1ZCI6Imh0dHBzOi8vd3d3LmluZmluaXRvLmlvLyIsImlzcyI6ImluZmluaXRvIiwic3ViIjoiaW5mb0BpbmZpbml0by5pbyJ9.Zby6YAlKKK8xJLOFTsQjmQb8BPfduhWwqpil6rCZEiD3O3MQoFKPbK-71xBqdznd4R6ss0-nki4uGb5yLN6mKoMwS2Q2CqNKVsDY93zIUVrMAJ4pRFfGhsX0Pf-oVEZQTlu56J5eLfTsFJn8tTZfDM8KEn-9yBZNzCCSv1OoXdXNe8qkd5KeEoDxeak_OHCtv1CXdhhww3F7I2-zCUgIWVfnHBKeYzaclhFq-VZRZqwGzM1lFJ3JLNQsEs_U1Xj0r3H5_osxJE8uZmySkLcM5m9MgdWentxLwVUehLTuaWZZRf951AzW90ZA4Tvu3gzvD2yibHV3iSVe18S_mm3asA",
                      "token_type":"Bearer",
                      "expires_in":84599
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

/* #endregion */

module.exports = route;
