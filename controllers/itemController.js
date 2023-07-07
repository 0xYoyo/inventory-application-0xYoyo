const Item = require("../models/item");
const Category = require("../models/category");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all items.
exports.item_list = asyncHandler(async (req, res, next) => {
  const allItems = await Item.find().sort({ name: 1 });

  res.render("item_list", {
    title: "Item List",
    item_list: allItems,
  });
});

// Display detail page for a specific item.
exports.item_detail = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).populate("category").exec();

  if (item === null) {
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }

  res.render("item_detail", {
    title: "Item Detail",
    item: item,
  });
});

// Display item create form on GET.
exports.item_create_get = asyncHandler(async (req, res, next) => {
  const categories = await Category.find();
  res.render("item_form", { title: "Create item", categories: categories });
});

// Handle item create on POST.
exports.item_create_post = [
  // Convert the categories to an array.
  (req, res, next) => {
    if (!(req.body.category instanceof Array)) {
      if (typeof req.body.category === "undefined") req.body.category = [];
      else req.body.category = new Array(req.body.category);
    }
    next();
  },

  // Validate and Sanitize
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .escape()
    .withMessage("Name must be between 2-100 characters"),
  body("description")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 100 })
    .escape()
    .withMessage("Description must be less than 100 characters"),
  body("price")
    .trim()
    .isFloat({ min: 1 })
    .escape()
    .withMessage("Price must be higher than 1"),
  body("numberInStock")
    .trim()
    .isInt()
    .escape()
    .withMessage("Number in stock must be a round number"),
  body("category.*").escape(),

  asyncHandler(async (req, res, next) => {
    // Extract errors
    const errors = validationResult(req);
    // Create item
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      numberInStock: req.body.numberInStock,
      category: req.body.category,
    });

    if (!errors.isEmpty()) {
      const categories = await Category.find();
      for (const category of categories) {
        if (item.category.indexOf(category._id) > -1) {
          category.checked = "true";
        }
      }
      res.render("item_form", {
        title: "Create item",
        item: item,
        categories: categories,
        errors: errors.array(),
      });
      return;
    } else {
      await item.save();
      res.redirect(item.url);
    }
  }),
];

// Display item delete form on GET.
exports.item_delete_get = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id);

  if (item === null) {
    res.redirect("/catalog/items");
  }

  res.render("item_delete", {
    title: "Delete item",
    item: item,
  });
});

// Handle item delete on POST.
exports.item_delete_post = asyncHandler(async (req, res, next) => {
  await Item.findByIdAndDelete(req.body.itemid);
  res.redirect("/catalog/items");
});

// Display item update form on GET.
exports.item_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Item update GET");
});

// Handle item update on POST.
exports.item_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Item update POST");
});
