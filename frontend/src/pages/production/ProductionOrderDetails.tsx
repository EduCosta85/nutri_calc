import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Play, Pause, SkipForward, XCircle, CheckCircle } from "lucide-react";
import { useProductionOrders } from "../../hooks/useProductionOrders";
import { formatTime, getElapsedSeconds, isTimerRunning, isTimerPaused } from "../../services/production-timer";
import { getNextPhase, canCancel, canAdvance } from "../../services/production-order";
import type { ProductionOrder } from "../../types/production";

const STATUS_LABELS: Record<string, string> = {
  NEW: "Nova", SEPARATING: "Separando", PRODUCING: "Produzindo",
  FINISHING: "Finalizando", COMPLETED: "Concluída", CANCELLED: "Cancelada",
};

export function ProductionOrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById, updateStatus, startTimer, pauseTimer, resumeTimer, update } = useProductionOrders();

  const [order, setOrder] = useState<ProductionOrder | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [actualQuantity, setActualQuantity] = useState(0);

  useEffect(() => {
    if (id) getById(id).then(setOrder);
  }, [id, getById]);

  // Live timer update
  useEffect(() => {
    if (!order) return;
    setElapsed(getElapsedSeconds(order));
    const interval = setInterval(() => {
      setElapsed(getElapsedSeconds(order));
    }, 1000);
    return () => clearInterval(interval);
  }, [order]);

  if (!order) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" /></div>;
  }

  const running = isTimerRunning(order);
  const paused = isTimerPaused(order);
  const nextPhase = getNextPhase(order.status);

  async function handleAdvance() {
    if (!id || !nextPhase) return;
    await updateStatus(id, nextPhase);
    if (nextPhase === "PRODUCING" && !order?.timerStartedAt) {
      await startTimer(id);
    }
    const updated = await getById(id);
    setOrder(updated);
  }

  async function handleToggleTimer() {
    if (!id) return;
    if (running) await pauseTimer(id);
    else if (paused) await resumeTimer(id);
    else await startTimer(id);
    const updated = await getById(id);
    setOrder(updated);
  }

  async function handleComplete() {
    if (!id || actualQuantity <= 0) return;
    await update(id, { actualQuantity, status: "COMPLETED", completedAt: new Date().toISOString() });
    const updated = await getById(id);
    setOrder(updated);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/producao")} className="p-2 rounded-lg hover:bg-secondary">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">Status: {STATUS_LABELS[order.status]}</p>
        </div>
      </div>

      {/* Timer */}
      <div className="bg-card border border-border rounded-lg p-6 text-center space-y-4">
        <p className="text-5xl font-mono font-bold tabular-nums">{formatTime(elapsed)}</p>
        <div className="flex justify-center gap-3">
          {order.status === "PRODUCING" && (
            <button onClick={handleToggleTimer} className="btn btn-primary flex items-center gap-2">
              {running ? <><Pause size={16} /> Pausar</> : <><Play size={16} /> Retomar</>}
            </button>
          )}
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground">Quantidade Alvo</p>
          <p className="text-xl font-bold">{order.targetQuantity}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground">Quantidade Real</p>
          <p className="text-xl font-bold">{order.actualQuantity ?? "—"}</p>
        </div>
      </div>

      {/* Finishing — set actual quantity */}
      {order.status === "FINISHING" && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <h3 className="font-medium">Finalização</h3>
          <div>
            <label className="block text-sm mb-1">Quantidade produzida</label>
            <input type="number" value={actualQuantity} onChange={(e) => setActualQuantity(Number(e.target.value))} className="input w-full" min={0} step="0.1" />
          </div>
          <button onClick={handleComplete} disabled={actualQuantity <= 0} className="btn btn-primary w-full flex items-center justify-center gap-2">
            <CheckCircle size={16} /> Concluir OP
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {canAdvance(order.status) && (
          <button onClick={handleAdvance} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
            <SkipForward size={16} /> Avançar para {STATUS_LABELS[nextPhase!]}
          </button>
        )}
        {canCancel(order.status) && (
          <button onClick={() => navigate(`/producao/${id}/cancelamento`)} className="btn btn-secondary flex items-center gap-2 text-red-600">
            <XCircle size={16} /> Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
