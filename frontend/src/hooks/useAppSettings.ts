import { useEffect, useState } from "react";
import {
  doc,
  setDoc,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import type { AppSettings, AppSettingsInput } from "../types/settings";
import { DEFAULT_APP_SETTINGS } from "../types/settings";

/** Singleton settings document — one per user */
export function useAppSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AppSettings>({
    ...DEFAULT_APP_SETTINGS,
    createdAt: "",
    updatedAt: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSettings({ ...DEFAULT_APP_SETTINGS, createdAt: "", updatedAt: "" });
      setLoading(false);
      return;
    }

    const settingsRef = doc(db, `users/${user.uid}/appSettings`, "config");

    const unsubscribe: Unsubscribe = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings({ id: docSnap.id, ...docSnap.data() } as AppSettings);
      } else {
        // Initialize default settings on first load
        const now = new Date().toISOString();
        const defaults = { ...DEFAULT_APP_SETTINGS, createdAt: now, updatedAt: now };
        setDoc(settingsRef, defaults).catch(() => {});
        setSettings({ id: "config", ...defaults });
      }
      setLoading(false);
    }, (error) => {
      console.error("useAppSettings onSnapshot error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  async function updateSettings(data: Partial<AppSettingsInput>) {
    if (!user) throw new Error("Must be authenticated");
    const settingsRef = doc(db, `users/${user.uid}/appSettings`, "config");
    await setDoc(settingsRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
  }

  return { settings, loading, update: updateSettings };
}
