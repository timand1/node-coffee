const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const router = Router();

const { placeOrder, findOrder } = require('../model/orderdb');

router.post('/', async (req, res) => {
    const cartArr = req.body.cart;
    const cartItemHasAllProperties = (cartItem) => ['id', 'title', 'amount', 'price'].reduce((acc, key) => acc && cartItem.hasOwnProperty(key), true)
    const resObj = {
        success: false
    };
    if (cartArr.length > 0 && cartItemHasAllProperties(cartArr[0])) {
        let accountId = req.headers.accountid;
        if (!accountId) {
            accountId = 'Guest'
        };
        let totalPrice = 0
        for (const item of cartArr) {
            totalPrice = totalPrice + (item.price * item.amount)
        }
        const order = {
            cart: cartArr,
            user: accountId,
            datePlaced: new Date().toLocaleTimeString(),
            ETA: `${Math.ceil(Math.random() * 10)} minutes`,
            orderNumber: uuidv4(),
            totalPrice: totalPrice
        };


        const findUsername = accountId.search(/\d/);
        let user = accountId.slice(0, findUsername)
        if (accountId === 'Guest') {
            user = 'Guest'
        }
        const orderResult = await placeOrder(order);

        if (orderResult) {
            resObj.success = true;
            resObj.message = `Order placed by ${user}`;
            resObj.orderNr = order.orderNumber,
                resObj.eta = order.ETA
        };
    } else {

        resObj.message = 'Wrong input'
    }
    res.json(resObj);

});

router.get('/:id', async (req, res) => {
    const accountid = req.params.id;
    let allOrders = []
    let totalCost = 0;
    const resObj = {
        success: false
    };

    if (!accountid) {
        resObj.message = 'Cannot find orders without logging in.';
    } else {
        const accountOrders = await findOrder(accountid);
        if (accountOrders.length === 0) {
            resObj.success = true;
            resObj.message = 'No orders found';
        } else {
            const searchDate = new Date().toLocaleTimeString();
            const searchMinute = Number(searchDate.slice(3, 5));
            const searchHour = Number(searchDate.slice(0, 2));

            for (const order of accountOrders) {
                const orderHistory = {
                    orderId: order.orderNumber,
                    totalPrice: `${order.totalPrice} kr`,
                    delivered: true
                }
                allOrders.push(orderHistory)

                totalCost = totalCost + order.totalPrice

                const dateOrderMinute = Number(order.datePlaced.slice(3, 5));
                const dateOrderHour = Number(order.datePlaced.slice(0, 2));
                const findNum = order.ETA.indexOf(' ');
                const dateETA = Number(order.ETA.slice(0, findNum));

                if (searchHour - dateOrderHour === 0) {
                    if (((dateOrderMinute + dateETA) - searchMinute) > 0) {
                        orderHistory.delivered = false
                    }
                } else if (searchHour - dateOrderHour === 1) {
                    if ((((dateOrderMinute + dateETA) - 59) - searchMinute) > 0) {
                        orderHistory.delivered = false
                    }
                }
            }

            resObj.dateSearch = searchDate;
            resObj.success = true;
            resObj.orders = allOrders.sort((a, b) => (a.delivered > b.delivered) ? 1 : -1);
            resObj.totalCost = `Total spent ${totalCost} kr`;
        }
    }

    res.json(resObj);
});

module.exports = router;