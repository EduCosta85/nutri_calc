import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";

interface Option {
  id: string | number;
  name: string;
}

interface Props {
  options: Option[];
  value: string | number | "";
  onChange: (id: string | number | "") => void;
  placeholder?: string;
}

export function IngredientSearch({ options, value, onChange, placeholder = "Buscar..." }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => String(o.id) === String(value));

  const filtered = options.filter((o) =>
    o.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 20);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        if (!selected) setQuery("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [selected]);

  function handleSelect(opt: Option) {
    onChange(opt.id);
    setQuery(opt.name);
    setOpen(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    onChange("");
    setOpen(true);
  }

  function handleFocus() {
    setQuery("");
    setOpen(true);
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          className="input !pl-8"
          placeholder={selected ? selected.name : placeholder}
          value={open ? query : (selected?.name ?? "")}
          onChange={handleInputChange}
          onFocus={handleFocus}
        />
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground px-3 py-2">Nenhum resultado</p>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onMouseDown={() => handleSelect(opt)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                {opt.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
