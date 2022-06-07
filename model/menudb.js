const nedb = require('nedb-promise');
const database = new nedb({ filename: 'menu.db', autoload: true });

async function getMenu() {
    let result = await database.find({});
    if (result.length === 0) {
        result = await database.insert((require('../menu.json')))
    }
    return result;
};

module.exports = { getMenu }