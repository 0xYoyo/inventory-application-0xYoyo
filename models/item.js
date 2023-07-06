const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  name: { type: String, required: true, minLength: 2, maxLength: 20 },
  description: { type: String, maxLength: 100 },
  price: { type: Number, required: true, min: 1 },
  numberInStock: { type: Number, required: true },
  category: [{ type: Schema.Types.ObjectId, ref: "Category", required: true }],
});

ItemSchema.virtual("url").get(function () {
  return `/catalog/item/${this._id}`;
});

module.exports = mongoose.model("Item", ItemSchema);
