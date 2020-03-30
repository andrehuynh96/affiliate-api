const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

module.exports = function (app, prefix) {
  prefix = prefix || '';
  const swaggerOptions = {
    swaggerDefinition: {
      info: {
        title: 'Affiliate API',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'https://affiliate.infinito.io',
        },
      ],
    },
    apis: [path.resolve(__dirname, '../../feature/**/*.js')],
  };

  const swaggerSpec = swaggerJSDoc(swaggerOptions);
  swaggerSpec.securityDefinitions = {
    apiKey: {
      type: 'apiKey',
      in: 'header',
      name: 'x-api-key',
    },
    secretKey: {
      type: 'secretKey',
      in: 'header',
      name: 'x-secret-key',
    },
    affiliateTypeId: {
      type: 'affiliateTypeId',
      in: 'header',
      name: 'x-affiliate-type-id',
    },
  };
  swaggerSpec.security = [
    {
      apiKey: [],
      secretKey: [],
      affiliateTypeId: [],
    },
  ];

  app.get(prefix + '/api-docs.json', function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    res.send(swaggerSpec);
  });

  const swaggerUIOptions = {
    swaggerUrl: prefix + '/api-docs.json',
    showExplorer: true,
  };

  app.use(
    prefix + '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(null, swaggerUIOptions)
  );
};
