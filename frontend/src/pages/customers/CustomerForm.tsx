import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useCustomers } from "../../hooks/useCustomers";

export function CustomerFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add, update, getById } = useCustomers();
  const isEditing = !!id;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [instagram, setInstagram] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing) {
      getById(id).then((customer) => {
        if (customer) {
          setName(customer.name);
          setPhone(customer.phone ?? "");
          setAddress(customer.address ?? "");
          setInstagram(customer.instagram ?? "");
          setNotes(customer.notes ?? "");
        }
      });
    }
  }, [id, isEditing, getById]);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const data = { name: name.trim(), phone: phone || undefined, address: address || undefined, instagram: instagram || undefined, notes: notes || undefined };
      if (isEditing) {
        await update(id, data);
      } else {
        await add(data);
      }
      navigate("/clientes");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/clientes")} className="p-2 rounded-lg hover:bg-secondary">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">{isEditing ? "Editar Cliente" : "Novo Cliente"}</h1>
      </div>

      <div className="space-y-4 bg-card border border-border rounded-lg p-6">
        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input w-full" placeholder="Nome do cliente" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Telefone</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input w-full" placeholder="(00) 00000-0000" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Endereço</label>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="input w-full" placeholder="Endereço de entrega" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Instagram</label>
          <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} className="input w-full" placeholder="@perfil" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Observações</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input w-full" rows={3} placeholder="Observações sobre o cliente..." />
        </div>

        <button onClick={handleSave} disabled={saving || !name.trim()} className="btn btn-primary w-full flex items-center justify-center gap-2">
          <Save size={16} /> {saving ? "Salvando..." : isEditing ? "Salvar" : "Cadastrar cliente"}
        </button>
      </div>
    </div>
  );
}
