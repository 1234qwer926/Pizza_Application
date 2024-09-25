const Razorpay = require('razorpay');
require('dotenv').config();  

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_ID_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY
});

const renderProductPage = async (req, res) => {
    try {
        res.render('details', { cartItems: req.session.cart || [] });
    } catch (error) {
        console.log(error.message);
    }
};

const createOrder = async (req, res) => {
    try {
        const amount = req.body.amount;
        const options = {
            amount: amount, // in paisa
            currency: 'INR',
            receipt: 'receipt#1'
        };

        razorpayInstance.orders.create(options, (err, order) => {
            if (!err) {
                res.status(200).send({
                    success: true,
                    msg: 'Order Created',
                    order_id: order.id,
                    amount: order.amount,
                    key_id: process.env.RAZORPAY_KEY_ID
                });
            } else {
                res.status(400).send({ success: false, msg: 'Something went wrong!' });
            }
        });
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    renderProductPage,
    createOrder
};
