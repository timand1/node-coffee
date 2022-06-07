const nedb = require('nedb-promise');
const database = new nedb({ filename: 'order.db', autoload: true });

async function placeOrder(order) {
    const result = await database.insert(order)
    return result
};

async function findOrder(username) {
    const result = await database.find({ user: username })
    return result
};

module.exports = { placeOrder, findOrder }