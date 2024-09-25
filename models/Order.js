const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    items: { type: Array, required: true },
    address: { type: String, required: true }, 
    orderStatus: { type: String, default: 'Order Placed' },
    amount: { type: Number, required: true }, 
    paymentId: { type: String, default: null },
    payment: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', OrderSchema);
