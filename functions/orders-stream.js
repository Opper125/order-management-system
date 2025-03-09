const EventEmitter = require('events');
const orderEmitter = new EventEmitter();
let orders = [];

exports.handler = async (event, context) => {
    // Set headers for Server-Sent Events
    const headers = {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    };

    // Prevent Netlify from closing the connection prematurely
    context.callbackWaitsForEmptyEventLoop = false;

    // Create a readable stream for SSE
    const stream = new (require('stream').Readable)({
        read() {}
    });

    // Initial data push
    stream.push(`data: ${JSON.stringify(orders)}\n\n`);

    // Listen for order updates and push to the stream
    const orderListener = (updatedOrders) => {
        stream.push(`data: ${JSON.stringify(updatedOrders)}\n\n`);
    };
    orderEmitter.on('orderUpdate', orderListener);

    // Keep the connection alive with a heartbeat
    const keepAlive = setInterval(() => {
        stream.push(': keep-alive\n\n');
    }, 3000);

    // Clean up when the function is about to terminate
    const timeout = setTimeout(() => {
        clearInterval(keepAlive);
        orderEmitter.removeListener('orderUpdate', orderListener);
        stream.push(null); // End the stream
    }, 1000 * 60 * 5); // 5 minutes timeout (adjust as needed)

    return {
        statusCode: 200,
        headers,
        body: stream,
        isBase64Encoded: false
    };
};
