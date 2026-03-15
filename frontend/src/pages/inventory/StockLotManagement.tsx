import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Package } from "lucide-react";
import { useInventoryItems } from "../../hooks/useInventoryItems";
import { useStockLots } from "../../hooks/useStockLots";
import { useStockMovements } from "../../hooks/useStockMovements";
import { calcWeightedAverageCost, calcTotalStock, sortLotsFIFO } from "../../services/stock";
import { nextLotNumber } from "../../services/auto-numbering";
import { convertUnit, getConversionOptions } from "../../services/unit-conversion";
import type { InventoryItem } from "../../types/inventory";

export function StockLotManagementPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById: getItemById, update: updateItem } = useInventoryItems();
  const { lots, add: addLot, remove: removeLot } = useStockLots(id);

  const [item, setItem] = useState<InventoryItem | null>(null);
  const { record: recordMovement } = useStockMovements(id);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuantity, setNewQuantity] = useState(0);
  const [newUnitCost, setNewUnitCost] = useState(0);
  const [newExpiryDate, setNewExpiryDate] = useState("");
  const [entryUnit, setEntryUnit] = useState("");

  useEffect(() => {
    if (id) {
      getItemById(id).then(setItem);
    }
  }, [id, getItemById]);

  // Recalculate average cost when lots change
  useEffect(() => {
    if (id && lots.length > 0) {
      const avgCost = calcWeightedAverageCost(lots);
      updateItem(id, { averageCost: avgCost });
    }
  }, [lots, id, updateItem]);

  const sortedLots = sortLotsFIFO(lots);
  const totalStock = calcTotalStock(lots);
  const avgCost = calcWeightedAverageCost(lots);

  async function handleAddLot() {
    if (!id || !item || newQuantity <= 0) return;
    const unit = entryUnit || item.unit;
    // Convert to base unit if different
    const baseQuantity = convertUnit(newQuantity, unit, item.unit);
    const baseCost = unit !== item.unit ? convertUnit(newUnitCost, item.unit, unit) : newUnitCost;

    const lotId = await addLot({
      itemId: id,
      lotNumber: nextLotNumber(lots.length),
      quantity: baseQuantity,
      unitCost: baseCost,
      expiryDate: newExpiryDate || null,
      entryDate: new Date().toISOString(),
    });

    // Record stock movement
    await recordMovement({
      itemId: id,
      lotId,
      quantity: baseQuantity,
      direction: "entry",
      source: "manual",
      createdAt: new Date().toISOString(),
    });

    setShowAddForm(false);
    setNewQuantity(0);
    setNewUnitCost(0);
    setNewExpiryDate("");
    setEntryUnit("");
  }

  if (!item) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/estoque")} className="p-2 rounded-lg hover:bg-secondary">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{item.name}</h1>
            <p className="text-sm text-muted-foreground">Gestão de Lotes</p>
          </div>
        </div>
        <button onClick={() => navigate(`/estoque/${id}/movimentacoes`)} className="btn btn-secondary text-xs">
          Movimentações
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold tabular-nums">{totalStock.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">Estoque Total ({item.unit})</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold tabular-nums">R$ {avgCost.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Custo Médio</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold tabular-nums">{lots.length}</p>
          <p className="text-xs text-muted-foreground">Lotes</p>
        </div>
      </div>

      {/* Add lot button */}
      <button onClick={() => setShowAddForm(true)} className="btn btn-primary text-sm flex items-center gap-2">
        <Plus size={16} /> Adicionar lote
      </button>

      {/* Add lot form */}
      {showAddForm && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <h3 className="font-medium">Novo Lote</h3>
          {/* Unit conversion hint */}
          {entryUnit && entryUnit !== item.unit && (
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Estoque em {item.unit} — Entrada em {entryUnit} (será convertido automaticamente)
            </p>
          )}
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-0.5">Quantidade</label>
              <input type="number" value={newQuantity} onChange={(e) => setNewQuantity(Number(e.target.value))} className="input w-full text-sm" min={0} step="0.1" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-0.5">Unidade</label>
              <select value={entryUnit || item.unit} onChange={(e) => setEntryUnit(e.target.value)} className="input w-full text-sm">
                {getConversionOptions(item.unit).map((opt) => (
                  <option key={opt.abbreviation} value={opt.abbreviation}>{opt.abbreviation}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-0.5">Custo unitário (R$)</label>
              <input type="number" value={newUnitCost} onChange={(e) => setNewUnitCost(Number(e.target.value))} className="input w-full text-sm" min={0} step="0.01" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-0.5">Validade</label>
              <input type="date" value={newExpiryDate} onChange={(e) => setNewExpiryDate(e.target.value)} className="input w-full text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddLot} disabled={newQuantity <= 0} className="btn btn-primary text-sm">Salvar</button>
            <button onClick={() => setShowAddForm(false)} className="btn btn-secondary text-sm">Cancelar</button>
          </div>
        </div>
      )}

      {/* Lot list */}
      {sortedLots.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Package size={40} className="mx-auto mb-2 opacity-50" />
          <p>Nenhum lote cadastrado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedLots.map((lot, i) => (
            <div key={lot.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground font-mono">{i === 0 ? "FIFO →" : ""}</span>
                <div>
                  <p className="font-medium text-sm">{lot.lotNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    Entrada: {new Date(lot.entryDate).toLocaleDateString("pt-BR")}
                    {lot.expiryDate && ` · Val: ${new Date(lot.expiryDate).toLocaleDateString("pt-BR")}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold tabular-nums">{lot.quantity.toFixed(1)} {item.unit}</p>
                  <p className="text-xs text-muted-foreground">R$ {lot.unitCost.toFixed(2)}/{item.unit}</p>
                </div>
                <button onClick={() => lot.id && removeLot(lot.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
