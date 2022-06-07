const express = require('express')
const app = express();
const PORT = 8000;
app.use(express.json());

const accountRouter = require('./routes/account');
const orderRouter = require('./routes/order');
const menuRouter = require('./routes/menu');
app.use('/api/account', accountRouter);
app.use('/api/order', orderRouter);
app.use('/api/menu', menuRouter);

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});