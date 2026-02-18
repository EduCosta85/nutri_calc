import { useRef, useState } from "react";
import { Download, Upload, Trash2, AlertTriangle, LogOut, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useRecipes } from "../hooks/useRecipes";
import { useRawMaterials } from "../hooks/useRawMaterials";
import type { RawMaterial, Recipe } from "../types";

interface ExportData {
  version: number;
  exportedAt: string;
  rawMaterials: RawMaterial[];
  recipes: Recipe[];
}

const EXPORT_VERSION = 1;

function downloadJson(data: ExportData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `nutricalc-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

type FeedbackState =
  | { type: "idle" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const { recipes } = useRecipes();
  const { materials } = useRawMaterials();
  const [feedback, setFeedback] = useState<FeedbackState>({ type: "idle" });
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function showFeedback(state: FeedbackState) {
    setFeedback(state);
    if (state.type !== "idle") {
      setTimeout(() => setFeedback({ type: "idle" }), 4000);
    }
  }

  function handleExport() {
    try {
      const data: ExportData = {
        version: EXPORT_VERSION,
        exportedAt: new Date().toISOString(),
        rawMaterials: materials,
        recipes: recipes,
      };
      downloadJson(data);
      showFeedback({ type: "success", message: "Backup exportado com sucesso!" });
    } catch {
      showFeedback({ type: "error", message: "Erro ao exportar dados." });
    }
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    showFeedback({ type: "error", message: "A importacao de dados do backup antigo ainda nao foi implementada. Os dados estao sincronizados na nuvem." });
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    showFeedback({ type: "error", message: "A funcao de reset ainda nao foi implementada." });
    setConfirmReset(false);
  }

  async function handleSignOut() {
    try {
      await signOut();
    } catch {
      showFeedback({ type: "error", message: "Erro ao fazer logout." });
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Configuracoes</h1>

      {/* Feedback toast */}
      {feedback.type !== "idle" && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
            feedback.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="max-w-xl mx-auto space-y-6">
        {/* Account */}
        <div className="card">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-blue-10 text-blue-600">
              <User size={20} />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold mb-1">Conta</h2>
              <p className="text-sm text-muted-foreground mb-3">
                {user?.email}
              </p>
              <button onClick={handleSignOut} className="btn btn-secondary text-sm">
                <LogOut size={16} />
                Sair da conta
              </button>
            </div>
          </div>
        </div>

        {/* Export */}
        <div className="card">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Download size={20} />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold mb-1">Exportar dados</h2>
              <p className="text-sm text-muted-foreground mb-3">
                Baixe um arquivo JSON com todas as materias primas e receitas.
              </p>
              <button onClick={handleExport} className="btn btn-secondary text-sm">
                <Download size={16} />
                Exportar backup
              </button>
            </div>
          </div>
        </div>

        {/* Import */}
        <div className="card">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-accent/10 text-accent">
              <Upload size={20} />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold mb-1">Importar dados</h2>
              <p className="text-sm text-muted-foreground mb-3">
                Carregue um arquivo JSON exportado anteriormente.
                Os dados atuais serao substituidos.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button onClick={handleImportClick} className="btn btn-secondary text-sm">
                <Upload size={16} />
                Importar arquivo
              </button>
            </div>
          </div>
        </div>

        {/* Reset */}
        <div className="card border-destructive/30">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive">
              <Trash2 size={20} />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold mb-1">Resetar banco de dados</h2>
              <p className="text-sm text-muted-foreground mb-3">
                Remove todas as materias primas e receitas. Esta acao nao pode ser desfeita.
              </p>
              {confirmReset && (
                <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                  <AlertTriangle size={16} />
                  Tem certeza? Clique novamente para confirmar.
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className={`btn text-sm ${confirmReset ? "btn-danger" : "btn-secondary"}`}
                >
                  <Trash2 size={16} />
                  {confirmReset ? "Confirmar reset" : "Resetar tudo"}
                </button>
                {confirmReset && (
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="btn btn-secondary text-sm"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
