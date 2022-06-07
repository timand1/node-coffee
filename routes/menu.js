const { Router } = require('express');
const router = Router();
const { getMenu } = require('../model/menudb')

router.get('/', async (req, res) => {
    const menu = await getMenu()
    const resObj = {
        success: false
    }
    if (menu) {
        resObj.success = true
        resObj.menu = menu
    } else {
        resObj.message = 'ErrorErrorError'
    }

    res.json(resObj)
})

module.exports = router