import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, CreditCard, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useAppSettings } from "../../hooks/useAppSettings";
import { validateAccessToken } from "../../services/mercadopago";

export function PaymentSettingsPage() {
  const navigate = useNavigate();
  const { settings, update } = useAppSettings();

  const [enabled, setEnabled] = useState(settings.mercadopagoEnabled);
  const [accessToken, setAccessToken] = useState(settings.mercadopagoAccessToken ?? "");
  const [document, setDocument] = useState(settings.establishmentDocument ?? "");
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  async function handleValidateToken() {
    if (!accessToken.trim()) return;
    setValidating(true);
    setTokenValid(null);
    try {
      const valid = await validateAccessToken(accessToken);
      setTokenValid(valid);
    } finally {
      setValidating(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await update({
        mercadopagoEnabled: enabled,
        mercadopagoAccessToken: accessToken || undefined,
        establishmentDocument: document || undefined,
      });
      navigate("/configuracoes");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/configuracoes")} className="p-2 rounded-lg hover:bg-secondary">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Pagamentos</h1>
      </div>

      <div className="space-y-4 bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard size={24} className="text-primary" />
          <div>
            <p className="font-medium">Mercado Pago PIX</p>
            <p className="text-xs text-muted-foreground">Receba pagamentos via PIX</p>
          </div>
        </div>

        {/* Enable/disable */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="rounded" />
          <span className="text-sm font-medium">Habilitar Mercado Pago</span>
        </label>

        {enabled && (
          <>
            {/* Access Token */}
            <div>
              <label className="block text-sm font-medium mb-1">Access Token</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={accessToken}
                  onChange={(e) => { setAccessToken(e.target.value); setTokenValid(null); }}
                  className="input flex-1"
                  placeholder="APP_USR-..."
                />
                <button
                  onClick={handleValidateToken}
                  disabled={validating || !accessToken.trim()}
                  className="btn btn-secondary text-sm flex items-center gap-1"
                >
                  {validating ? <Loader2 size={14} className="animate-spin" /> : "Validar"}
                </button>
              </div>
              {tokenValid === true && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle size={12} /> Token válido</p>
              )}
              {tokenValid === false && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><XCircle size={12} /> Token inválido</p>
              )}
            </div>

            {/* Establishment Document */}
            <div>
              <label className="block text-sm font-medium mb-1">CPF/CNPJ do Estabelecimento</label>
              <input
                type="text"
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                className="input w-full"
                placeholder="00.000.000/0001-00"
              />
            </div>
          </>
        )}

        <button onClick={handleSave} disabled={saving} className="btn btn-primary w-full flex items-center justify-center gap-2">
          <Save size={16} /> {saving ? "Salvando..." : "Salvar Configurações"}
        </button>
      </div>
    </div>
  );
}
