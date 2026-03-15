import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, XCircle, Undo2, AlertTriangle, Info } from "lucide-react";
import { useProductionOrders } from "../../hooks/useProductionOrders";
import type { ProductionOrder } from "../../types/production";
import { wasSeparated } from "../../services/production-order";

interface MaterialDisposition {
  ingredientName: string;
  actualQuantity: number;
  returnedQuantity: number;
  lossQuantity: number;
}

export function ProductionOrderCancellationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById, updateStatus } = useProductionOrders();

  const [order, setOrder] = useState<ProductionOrder | null>(null);
  const [dispositions, setDispositions] = useState<MaterialDisposition[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getById(id).then((o) => {
        setOrder(o);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [id, getById]);

  function updateDisposition(index: number, field: "returnedQuantity" | "lossQuantity", value: number) {
    setDispositions((prev) => prev.map((d, i) => i === index ? { ...d, [field]: value } : d));
  }

  async function handleCancel() {
    if (!id || !order) return;

    // Validate dispositions if materials were separated
    if (wasSeparated(order.status)) {
      for (const disp of dispositions) {
        if (disp.returnedQuantity + disp.lossQuantity > disp.actualQuantity) {
          alert(`Devolução + perda não pode ser maior que a quantidade separada para ${disp.ingredientName}`);
          return;
        }
      }
    }

    if (!confirm("Confirma o cancelamento desta ordem de produção?")) return;

    setSaving(true);
    try {
      await updateStatus(id, "CANCELLED");
      // In a full implementation, we would also:
      // - Return stock to lots (based on returnedQuantity)
      // - Record loss movements (based on lossQuantity)
      // - Record stock movements for each
      navigate(`/producao/${id}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" /></div>;
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft size={16} /> Voltar</button>
        <p className="text-center py-12 text-muted-foreground">Ordem não encontrada</p>
      </div>
    );
  }

  const hasMaterials = wasSeparated(order.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(`/producao/${id}`)} className="p-2 rounded-lg hover:bg-secondary">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Cancelar Ordem</h1>
          <p className="text-sm text-muted-foreground">{order.orderNumber}</p>
        </div>
      </div>

      {!hasMaterials ? (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
          <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Esta ordem ainda não teve materiais separados. O cancelamento não afetará o estoque.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle size={20} className="text-yellow-600 shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Informe o que fazer com os materiais que foram separados para esta ordem.
              Distribua entre <strong>devolver ao estoque</strong> ou <strong>registrar como perda</strong>.
            </p>
          </div>

          {dispositions.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Undo2 size={18} className="text-blue-600" /> Disposição de Materiais
              </h3>
              {dispositions.map((disp, i) => {
                const remaining = disp.actualQuantity - disp.returnedQuantity - disp.lossQuantity;
                return (
                  <div key={i} className="bg-card border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{disp.ingredientName}</p>
                      <p className="text-xs text-muted-foreground">Separado: {disp.actualQuantity.toFixed(2)}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-muted-foreground mb-0.5">Devolver</label>
                        <input
                          type="number"
                          value={disp.returnedQuantity || ""}
                          onChange={(e) => updateDisposition(i, "returnedQuantity", Number(e.target.value))}
                          className="input w-full text-sm"
                          min={0}
                          max={disp.actualQuantity}
                          step="0.1"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-0.5">Perda</label>
                        <input
                          type="number"
                          value={disp.lossQuantity || ""}
                          onChange={(e) => updateDisposition(i, "lossQuantity", Number(e.target.value))}
                          className="input w-full text-sm"
                          min={0}
                          max={disp.actualQuantity}
                          step="0.1"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-0.5">Restante</label>
                        <p className={`text-sm font-bold py-2 ${remaining > 0.01 ? "text-yellow-600" : remaining < -0.01 ? "text-red-600" : "text-green-600"}`}>
                          {remaining.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <div className="flex gap-3">
        <button onClick={() => navigate(`/producao/${id}`)} className="btn btn-secondary flex-1">
          Voltar
        </button>
        <button
          onClick={handleCancel}
          disabled={saving}
          className="btn bg-red-600 hover:bg-red-700 text-white flex-[2] flex items-center justify-center gap-2"
        >
          <XCircle size={16} />
          {saving ? "Cancelando..." : "Confirmar Cancelamento"}
        </button>
      </div>
    </div>
  );
}
