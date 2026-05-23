import Category from "../models/category.model.js";
import { nextCode } from "../helpers/id.helper.js";

export async function listCategories(req, res) {
  const filter = req.query.includeInactive === "true" ? {} : { status: 1 };
  const rows = await Category.find(filter).sort({ categoryId: -1 }).lean();
  res.json(rows);
}

export async function createCategory(req, res) {
  const categoryId = await nextCode(Category, "categoryId", "DM");
  const category = await Category.create({
    categoryId,
    name: req.body.name,
    description: req.body.description || null,
    status: 1
  });

  res.status(201).json({ categoryId: category.categoryId });
}

export async function updateCategory(req, res) {
  await Category.updateOne(
    { categoryId: req.params.id },
    {
      $set: {
        name: req.body.name,
        description: req.body.description || null
      }
    }
  );

  res.json({ message: "Category updated" });
}

export async function deleteCategory(req, res) {
  await Category.updateOne(
    { categoryId: req.params.id },
    { $set: { status: 0 } }
  );

  res.json({ message: "Category hidden" });
}
