#! /usr/bin/env node

console.log(
  'This script populates some test categories and items to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const Item = require("./models/item");
const Category = require("./models/category");

const categories = [];
const items = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false); // Prepare for Mongoose 7

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Should be connected?");
  await createCategories();
  await createItems();
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}

// We pass the index to the ...Create functions so that, for example,
// genre[0] will always be the Fantasy genre, regardless of the order
// in which the elements of promise.all's argument complete.

async function categoryCreate(index, name, description) {
  const categoryDetail = { name: name };
  if (description != false) categoryDetail.description = description;

  const category = new Category(categoryDetail);

  await category.save();
  categories[index] = category;
  console.log(`Added category: ${name}`);
}

async function itemCreate(
  index,
  name,
  description,
  price,
  numberInStock,
  category
) {
  const itemDetail = {
    name: name,
    price: price,
    numberInStock: numberInStock,
    category: category,
  };
  if (description != false) itemDetail.description = description;

  const item = new Item(itemDetail);
  await item.save();
  items[index] = item;
  console.log(`Added item: ${name}`);
}

async function createCategories() {
  console.log("Adding categories");
  await Promise.all([
    categoryCreate(
      0,
      "Winter",
      "Cosy and warm fitting clothes for the cold winter"
    ),
    categoryCreate(1, "Headwear", false),
    categoryCreate(2, "Summer", "Light breathing clothes to you cool"),
    categoryCreate(3, "Men", "Shop men clothing"),
    categoryCreate(4, "Women", "Shop women clothing"),
  ]);
}

async function createItems() {
  console.log("Adding Items");
  await Promise.all([
    itemCreate(
      0,
      "Red Hoodie",
      "Crimson like hoodie designed in 1994 from the best materials in the market",
      24.99,
      7,
      [categories[0], categories[3]]
    ),
    itemCreate(1, "Yellow Hat", false, 9.99, 18, [categories[1]]),
    itemCreate(
      2,
      "Silk Dress",
      "Beautiful silky White dress perfect for all seasons",
      79.99,
      11,
      [categories[0], categories[2], categories[4]]
    ),
    itemCreate(
      3,
      "Slim fit Jeans",
      "Light Jean low fitted slim Jeans for Women",
      54.99,
      4,
      [categories[0], categories[4]]
    ),
    itemCreate(
      4,
      "Black night Blouse",
      "Starry nights Blouse 100% cotton",
      47.99,
      6,
      [categories[0], categories[3]]
    ),
    itemCreate(5, "Graphic T-shirt", "80's vintage tee for men", 32.99, 2, [
      categories[2],
      categories[3],
    ]),
    itemCreate(6, "Sunglasses", "Hipster multi-color sunglasses", 19.99, [
      categories[1],
    ]),
  ]);
}
