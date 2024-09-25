const express = require('express');
const payment_route = express.Router();
const bodyParser = require('body-parser');
const paymentController = require('../controllers/paymentController');


payment_route.use(bodyParser.json());
payment_route.use(bodyParser.urlencoded({ extended: false }));


payment_route.get('/details', paymentController.renderProductPage);
payment_route.post('/createOrder', paymentController.createOrder);

module.exports = payment_route;
