const EventEmitter = require('events');
const orderEmitter = new EventEmitter();
let orders = [];

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method not allowed' };
    return { statusCode: 200, body: JSON.stringify(orders) };
};
