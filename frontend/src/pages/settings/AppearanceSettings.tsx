import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Palette, Upload } from "lucide-react";
import { useAppSettings } from "../../hooks/useAppSettings";

export function AppearanceSettingsPage() {
  const navigate = useNavigate();
  const { settings, update } = useAppSettings();

  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(settings.secondaryColor);
  const [accentColor, setAccentColor] = useState(settings.accentColor);
  const [logoUri, setLogoUri] = useState(settings.companyLogoUri ?? "");
  const [saving, setSaving] = useState(false);

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === "string") {
        setLogoUri(ev.target.result);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await update({
        primaryColor,
        secondaryColor,
        accentColor,
        companyLogoUri: logoUri || null,
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
        <h1 className="text-2xl font-bold">Aparência</h1>
      </div>

      <div className="space-y-4 bg-card border border-border rounded-lg p-6">
        {/* Logo */}
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Upload size={16} /> Logo da Empresa
          </label>
          <div className="flex items-center gap-4">
            {logoUri ? (
              <img src={logoUri} alt="Logo" className="w-20 h-20 rounded-lg object-cover border border-border" />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground border border-border">
                <Upload size={24} />
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-sm" />
          </div>
        </div>

        {/* Colors */}
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Palette size={16} /> Cores
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Primária</label>
              <div className="flex items-center gap-2">
                <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="input text-xs flex-1" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Secundária</label>
              <div className="flex items-center gap-2">
                <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                <input type="text" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="input text-xs flex-1" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Destaque</label>
              <div className="flex items-center gap-2">
                <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                <input type="text" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="input text-xs flex-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-2">Preview</p>
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: primaryColor }} />
            <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: secondaryColor }} />
            <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: accentColor }} />
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn btn-primary w-full flex items-center justify-center gap-2">
          <Save size={16} /> {saving ? "Salvando..." : "Salvar Aparência"}
        </button>
      </div>
    </div>
  );
}
