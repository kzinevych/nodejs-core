const swaggerJSDoc = require('swagger-jsdoc');
const fs = require('fs');

/** swagger all documentation * */
// eslint-disable-next-line no-use-before-define
generateDocumentation('docs', './server/routes/*.js');

function generateDocumentation(routeName, docsPath) {
  // eslint-disable-next-line global-require
  const packageJson = require('./package.json');
  const swaggerSpecDocs = swaggerJSDoc({
    swaggerDefinition: {
      info: {
        termsOfServiceUrl: '',
        contact: '',
        version: packageJson.version,
        license: '',
        licenseUrl: '',
      },
      basePath: '/api/v1',
    },
    // Path to the API docs
    apis: [docsPath],
  });

  // eslint-disable-next-line no-unused-vars
  fs.open(`./swagger/api-${routeName}.json`, 'wx', (err, fd) => {
    if (err) {
      if (err.code === 'EEXIST') {
        console.error(`api-${routeName}.json already exists`);
        // eslint-disable-next-line no-shadow,no-unused-vars
        fs.writeFile(`./swagger/api-${routeName}.json`, JSON.stringify(swaggerSpecDocs), 'utf8', (err, fd) => {
          console.error(`api-${routeName}.json rewrited`);
        });
      } else {
        // eslint-disable-next-line no-shadow,no-unused-vars
        fs.writeFile(`./swagger/api-${routeName}.json`, JSON.stringify(swaggerSpecDocs), 'utf8', (err, fd) => {
          console.error(`api-${routeName}.json created`);
        });
      }
    } else {
      console.log(`api-${routeName}.json documentation had been created!`);
    }
  });
}
