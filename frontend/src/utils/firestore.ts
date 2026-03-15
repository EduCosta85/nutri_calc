import { addDoc, updateDoc, setDoc, type DocumentReference, type CollectionReference, type SetOptions } from "firebase/firestore";

/** Remove all undefined values from an object before sending to Firestore. */
function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const cleaned = {} as Record<string, unknown>;
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned as T;
}

/** addDoc wrapper that strips undefined values */
export async function safeAddDoc<T extends Record<string, unknown>>(ref: CollectionReference, data: T) {
  return addDoc(ref, stripUndefined(data));
}

/** updateDoc wrapper that strips undefined values */
export async function safeUpdateDoc<T extends Record<string, unknown>>(ref: DocumentReference, data: T) {
  return updateDoc(ref, stripUndefined(data));
}

/** setDoc wrapper that strips undefined values */
export async function safeSetDoc<T extends Record<string, unknown>>(ref: DocumentReference, data: T, options?: SetOptions) {
  return options ? setDoc(ref, stripUndefined(data), options) : setDoc(ref, stripUndefined(data));
}
