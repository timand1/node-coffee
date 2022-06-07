const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const router = Router();

const { placeOrder, findOrder } = require('../model/orderdb')

router.post('/', async (req, res) => {
    const cartArr = req.body
    let accountId = req.headers.accountid
    if (!accountId) {
        accountId = 'Guest'
    }
    const order = {
        cart: cartArr.cart,
        user: accountId,
        datePlaced: new Date().toLocaleTimeString(),
        ETA: `${Math.ceil(Math.random() * 10)} minutes`,
        orderNumber: uuidv4()
    }

    const resObj = {
        success: false
    }

    const findUsername = accountId.search(/\d/)
    const orderResult = await placeOrder(order)

    if (orderResult) {
        resObj.success = true
        resObj.message = `Order placed by ${accountId.slice(0, findUsername)}`
    }

    res.json(resObj)

});

router.get('/:id', async (req, res) => {
    const accountid = req.params.id
    let activeOrder = []
    const resObj = {
        success: false
    }
    if (!accountid) {
        resObj.message = 'Cannot find orders without logging in.'
    } else {
        const accountOrders = await findOrder(accountid)
        if (accountOrders.length === 0) {
            resObj.success = true
            resObj.message = 'No orders found'
        } else {
            const searchDate = new Date().toLocaleTimeString()
            const searchMinute = Number(searchDate.slice(3, 5))
            const searchHour = Number(searchDate.slice(0, 2))

            for (const order of accountOrders) {
                const dateOrderMinute = Number(order.datePlaced.slice(3, 5))
                const dateOrderHour = Number(order.datePlaced.slice(0, 2))
                const findNum = order.ETA.indexOf(' ')
                const dateETA = Number(order.ETA.slice(0, findNum))

                if (searchHour - dateOrderHour === 0) {
                    if (((dateOrderMinute + dateETA) - searchMinute) > 0) {
                        activeOrder.push(order)
                    }
                } else if (searchHour - dateOrderHour === 1) {
                    if ((((dateOrderMinute + dateETA) - 59) - searchMinute) > 0) {
                        activeOrder.push(order)
                    }
                }
            }

            resObj.success = true
            resObj.orders = accountOrders
            resObj.dateSearch = searchDate

            if (activeOrder.length > 0) {
                resObj.activeOrders = activeOrder
            } else {
                resObj.accountOrders = 'No active orders'
            }
        }
    }

    res.json(resObj)
});

module.exports = router;