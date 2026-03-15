import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2, MapPin, Star } from "lucide-react";
import { useCustomers } from "../../hooks/useCustomers";
import { useCustomerAddresses } from "../../hooks/useCustomerAddresses";

interface LocalAddress {
  id?: string;
  address: string;
  deliveryFee: number;
  isDefault: boolean;
}

export function CustomerFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add, update, getById } = useCustomers();
  const { addresses: existingAddresses, add: addAddress, update: updateAddress, remove: removeAddress } = useCustomerAddresses(id);
  const isEditing = !!id;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Local addresses (for new customer, or editing)
  const [addresses, setAddresses] = useState<LocalAddress[]>([]);
  const [addressesLoaded, setAddressesLoaded] = useState(false);

  useEffect(() => {
    if (isEditing) {
      getById(id).then((customer) => {
        if (customer) {
          setName(customer.name);
          setPhone(customer.phone ?? "");
          setInstagram(customer.instagram ?? "");
          setNotes(customer.notes ?? "");
        }
      });
    }
  }, [id, isEditing, getById]);

  // Load existing addresses on edit
  useEffect(() => {
    if (isEditing && existingAddresses.length > 0 && !addressesLoaded) {
      setAddresses(existingAddresses.map((a) => ({
        id: a.id,
        address: a.address,
        deliveryFee: a.deliveryFee,
        isDefault: a.isDefault,
      })));
      setAddressesLoaded(true);
    }
  }, [isEditing, existingAddresses, addressesLoaded]);

  function addLocalAddress() {
    setAddresses((prev) => [...prev, { address: "", deliveryFee: 0, isDefault: prev.length === 0 }]);
  }

  function updateLocalAddress(index: number, field: keyof LocalAddress, value: string | number | boolean) {
    setAddresses((prev) => prev.map((a, i) => {
      if (i !== index) return field === "isDefault" && value === true ? { ...a, isDefault: false } : a;
      return { ...a, [field]: value };
    }));
  }

  function removeLocalAddress(index: number) {
    setAddresses((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const data = { name: name.trim(), phone: phone || undefined, instagram: instagram || undefined, notes: notes || undefined };

      let customerId = id;
      if (isEditing) {
        await update(id, data);
      } else {
        customerId = await add(data);
      }

      // Save addresses
      if (customerId) {
        // Delete removed addresses
        for (const existing of existingAddresses) {
          if (!addresses.find((a) => a.id === existing.id)) {
            await removeAddress(existing.id!);
          }
        }

        for (const addr of addresses) {
          if (!addr.address.trim()) continue;
          if (addr.id) {
            // Update existing
            await updateAddress(addr.id, { address: addr.address, deliveryFee: addr.deliveryFee, isDefault: addr.isDefault });
          } else {
            // Create new
            await addAddress({ customerId, address: addr.address, deliveryFee: addr.deliveryFee, isDefault: addr.isDefault });
          }
        }
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
          <label className="block text-sm font-medium mb-1">Nome *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input w-full" placeholder="Nome do cliente" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Telefone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input w-full" placeholder="(00) 00000-0000" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Instagram</label>
            <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} className="input w-full" placeholder="@perfil" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Observações</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input w-full" rows={2} placeholder="Observações..." />
        </div>
      </div>

      {/* Delivery Addresses */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2"><MapPin size={18} /> Endereços de Entrega</h3>
          <button onClick={addLocalAddress} className="text-xs text-primary flex items-center gap-1">
            <Plus size={14} /> Adicionar
          </button>
        </div>

        {addresses.length === 0 && (
          <p className="text-xs text-muted-foreground py-2">Nenhum endereço cadastrado.</p>
        )}

        {addresses.map((addr, i) => (
          <div key={i} className="border border-border rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <input
                type="text"
                value={addr.address}
                onChange={(e) => updateLocalAddress(i, "address", e.target.value)}
                className="input flex-1 text-sm"
                placeholder="Endereço completo"
              />
              <button onClick={() => removeLocalAddress(i)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded">
                <Trash2 size={14} />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Taxa (R$)</label>
                <input
                  type="number"
                  value={addr.deliveryFee}
                  onChange={(e) => updateLocalAddress(i, "deliveryFee", Number(e.target.value))}
                  className="input w-24 text-sm"
                  min={0}
                  step="0.5"
                />
              </div>
              <button
                onClick={() => updateLocalAddress(i, "isDefault", true)}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${addr.isDefault ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Star size={12} fill={addr.isDefault ? "currentColor" : "none"} />
                {addr.isDefault ? "Padrão" : "Definir padrão"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={handleSave} disabled={saving || !name.trim()} className="btn btn-primary w-full flex items-center justify-center gap-2">
        <Save size={16} /> {saving ? "Salvando..." : isEditing ? "Salvar" : "Cadastrar cliente"}
      </button>
    </div>
  );
}
