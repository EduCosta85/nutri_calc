import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, MapPin, Trash2 } from "lucide-react";
import { useEffect } from "react";
import {
  collection, addDoc, deleteDoc, doc, onSnapshot, type Unsubscribe,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../contexts/AuthContext";
import type { PickupPoint } from "../../types/customers";

export function PickupPointListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [points, setPoints] = useState<PickupPoint[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!user) return;
    const ref = collection(db, `users/${user.uid}/pickupPoints`);
    const unsub: Unsubscribe = onSnapshot(ref, (snap) => {
      const data: PickupPoint[] = [];
      snap.forEach((d) => data.push({ id: d.id, ...d.data() } as PickupPoint));
      setPoints(data);
    });
    return () => unsub();
  }, [user]);

  async function handleCreate() {
    if (!user || !name.trim() || !address.trim()) return;
    const ref = collection(db, `users/${user.uid}/pickupPoints`);
    const now = new Date().toISOString();
    await addDoc(ref, { name: name.trim(), address: address.trim(), active: true, createdAt: now, updatedAt: now });
    setShowForm(false);
    setName("");
    setAddress("");
  }

  async function handleDelete(id: string) {
    if (!user || !confirm("Remover ponto de retirada?")) return;
    await deleteDoc(doc(db, `users/${user.uid}/pickupPoints`, id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/clientes")} className="p-2 rounded-lg hover:bg-secondary">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Pontos de Retirada</h1>
        <button onClick={() => setShowForm(true)} className="btn btn-primary text-sm ml-auto flex items-center gap-2">
          <Plus size={16} /> Novo
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input w-full" placeholder="Nome do ponto" />
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="input w-full" placeholder="Endereço" />
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={!name.trim() || !address.trim()} className="btn btn-primary text-sm">Criar</button>
            <button onClick={() => setShowForm(false)} className="btn btn-secondary text-sm">Cancelar</button>
          </div>
        </div>
      )}

      {points.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <MapPin size={48} className="mx-auto mb-3 opacity-50" />
          <p>Nenhum ponto de retirada</p>
        </div>
      ) : (
        <div className="space-y-2">
          {points.map((point) => (
            <div key={point.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-primary" />
                <div>
                  <p className="font-medium">{point.name}</p>
                  <p className="text-xs text-muted-foreground">{point.address}</p>
                </div>
              </div>
              <button onClick={() => point.id && handleDelete(point.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
