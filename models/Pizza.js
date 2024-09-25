const mongoose = require('mongoose');

const pizzaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  url:{ type:String},
  type: { type: String, default:"recommended" },
  Count: { type: Number, default:25 },
});

module.exports = mongoose.model('Pizza', pizzaSchema);
