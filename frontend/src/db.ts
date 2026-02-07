import Dexie, { type EntityTable } from "dexie";
import type { RawMaterial, Recipe } from "./types";

const db = new Dexie("NutriCalcDB") as Dexie & {
  rawMaterials: EntityTable<RawMaterial, "id">;
  recipes: EntityTable<Recipe, "id">;
};

db.version(2).stores({
  rawMaterials: "++id, name",
  recipes: "++id, name",
});

db.version(3).stores({
  rawMaterials: "++id, name",
  recipes: "++id, name",
}).upgrade((tx) => {
  return tx.table("recipes").toCollection().modify((recipe) => {
    if (recipe.servingSize === undefined) recipe.servingSize = 0;
    if (recipe.servingName === undefined) recipe.servingName = "";
  });
});

db.version(4).stores({
  rawMaterials: "++id, name, *tags",
  recipes: "++id, name, *tags",
}).upgrade((tx) => {
  tx.table("rawMaterials").toCollection().modify((m) => {
    if (m.tags === undefined) m.tags = [];
    if (m.pricePer100g === undefined) m.pricePer100g = 0;
  });
  tx.table("recipes").toCollection().modify((r) => {
    if (r.tags === undefined) r.tags = [];
    if (r.steps === undefined) r.steps = [];
    if (r.prepTimeMin === undefined) r.prepTimeMin = 0;
  });
});

export { db };
