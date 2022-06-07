const { Router } = require('express');
const router = Router();

const { checkIfAccountExist, createAccount, compareCredentials } = require('../model/accountdb')

router.post('/signup', async (req, res) => {
    const credentials = req.body;
    const checkIfExist = await checkIfAccountExist(credentials)

    const resObj = {
        success: false
    }
    if (credentials.hasOwnProperty('username') && credentials.hasOwnProperty('email') && credentials.hasOwnProperty('password')) {
        if (checkIfExist.length > 0) {
            resObj.message = 'Account already exist.'
        } else {
            credentials.accountId = credentials.username + credentials.username.length
            const result = await createAccount(credentials)

            if (result) {
                resObj.success = true;
                resObj.message = `Account ${credentials.username} created.`;
            }
        }
    } else {
        resObj.message = 'Error reading credentials. Make sure you have \'username\', \'email\' and \'password\'.'
    }

    res.json(resObj)
});

router.post('/login', async (req, res) => {
    const credentials = req.body;
    const result = await compareCredentials(credentials)
    const resObj = {
        success: false
    }
    if (credentials.hasOwnProperty('username') && credentials.hasOwnProperty('password')) {
        if (result.length === 1) {
            resObj.success = true
            resObj.message = `Logged in as ${credentials.username}`
        } else {
            resObj.message = 'Error. Wrong username and/or password'
        }
    } else {
        resObj.message = 'Wrong input'
    }

    res.json(resObj)
});

module.exports = router;