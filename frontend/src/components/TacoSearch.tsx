import { useState } from "react";
import { Search } from "lucide-react";
import { TACO_DATA, type TacoItem } from "../data/taco";

interface TacoSearchProps {
  onSelect: (item: TacoItem) => void;
}

function searchTaco(query: string): TacoItem[] {
  if (!query.trim()) return [];
  const terms = query.toLowerCase().split(/\s+/);
  return TACO_DATA.filter((item) =>
    terms.every((t) => item.name.toLowerCase().includes(t)),
  ).slice(0, 8);
}

export function TacoSearch({ onSelect }: TacoSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const results = searchTaco(query);

  function handleSelect(item: TacoItem) {
    onSelect(item);
    setQuery("");
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Search size={16} className="text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar na tabela TACO (ex: farinha, ovo, leite...)"
          className="input"
        />
      </div>
      {isOpen && results.length > 0 && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {results.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full text-left px-4 py-2.5 hover:bg-secondary transition-colors text-sm border-b border-border last:border-b-0"
            >
              <span className="font-medium">{item.name}</span>
              <span className="text-xs text-muted-foreground ml-2">
                {item.cal} kcal · {item.prot}g prot · {item.carb}g carb · {item.fatT}g gord
              </span>
            </button>
          ))}
        </div>
      )}
      {isOpen && query.trim() && results.length === 0 && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg px-4 py-3 text-sm text-muted-foreground">
          Nenhum resultado para &quot;{query}&quot;
        </div>
      )}
    </div>
  );
}
