require('dotenv').config();
const Hapi = require('@hapi/hapi');
const routes = require('../server/routes');
const loadModel = require('../services/loadModel');
const InputError = require('../exceptions/InputError');

(async () => {
    const server = Hapi.server({
        port: 3000,
        host: '0.0.0.0',
        routes: {
            cors: {
              origin: ['*'],
            },
        },
    });

    const model = await loadModel();
    server.app.model = model;
    server.route(routes);

    server.ext('onPreResponse', function (request, h) {
        const response = request.response;

        console.log('Response:', response);

        if (response instanceof InputError) {
            const newResponse = h.response({
                status: 'fail',
                message: response.message
            });
            const statusCode = parseInt(response.statusCode, 10);
            if (isNaN(statusCode)) {
                console.error('Invalid status code for InputError:', response.statusCode);
                newResponse.code(400);
            } else {
                newResponse.code(statusCode);
            }
            return newResponse;
        }

        if (response.isBoom) {
            const newResponse = h.response({
                status: 'fail',
                message: response.message
            });
            const statusCode = parseInt(response.output.statusCode, 10);
            if (isNaN(statusCode)) {
                console.error('Invalid status code for Boom error:', response.output.statusCode);
                newResponse.code(500);
            } else {
                newResponse.code(statusCode);
            }
            return newResponse;
        }

        return h.continue;
    });

    await server.start();
    console.log(`Server started at: ${server.info.uri}`);
})();