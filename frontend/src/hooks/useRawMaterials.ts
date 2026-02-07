import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import type { RawMaterial } from "../types";

export function useRawMaterials() {
  const materials = useLiveQuery(() => db.rawMaterials.toArray()) ?? [];

  async function add(material: Omit<RawMaterial, "id">) {
    return db.rawMaterials.add(material as RawMaterial);
  }

  async function update(id: number, material: Omit<RawMaterial, "id">) {
    return db.rawMaterials.update(id, material);
  }

  async function remove(id: number) {
    return db.rawMaterials.delete(id);
  }

  async function getById(id: number) {
    return db.rawMaterials.get(id);
  }

  return { materials, add, update, remove, getById };
}
