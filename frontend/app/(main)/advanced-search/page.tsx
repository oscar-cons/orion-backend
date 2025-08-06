"use client"
import React from "react"
import ResultsTable from "./results_table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FilterBuilder } from "@/components/ui/filter-builder"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { dataService } from "@/lib/dataService"

const fieldsByEntity: Record<string, { value: string; label: string; type?: string }[]> = {
  "forum-posts": [
    { value: "title", label: "Título" },
    { value: "author_username", label: "Autor" },
    { value: "content", label: "Contenido" },
    { value: "category", label: "Categoría" },
    { value: "url", label: "URL" },
    { value: "date", label: "Fecha", type: "date" },
  ],
  "ransomware": [
    { value: "BreachName", label: "Breach Name" },
    { value: "Domain", label: "Dominio" },
    { value: "Category", label: "Categoría" },
    { value: "Country", label: "País" },
    { value: "Group", label: "Grupo" },
    { value: "DetectionDate", label: "Fecha de Detección", type: "date" },
  ],
  "telegram": [
    { value: "name", label: "Nombre" },
    { value: "author", label: "Autor" },
    { value: "country", label: "País" },
    { value: "language", label: "Idioma" },
    { value: "channel_username", label: "Usuario del Canal" },
  ]
};

const allFilterableFields = Object.values(fieldsByEntity).flat().reduce((acc, field) => {
  if (!acc.some(f => f.value === field.value)) {
    acc.push(field);
  }
  return acc;
}, [] as { value: string; label: string; type?: string }[]);

const searchScopes = [
  { id: "forum-posts", label: "Posts de Foros" },
  { id: "ransomware", label: "Ransomware" },
  { id: "telegram", label: "Telegram" },
];

export default function AdvancedSearchPage() {
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [suggestion, setSuggestion] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [filters, setFilters] = React.useState<any[]>([])
  const [selectedScopes, setSelectedScopes] = React.useState<string[]>([]);

  const handleApplyFilters = (newFilters: any[]) => {
    setFilters(newFilters);
  };
  
  const currentFields = selectedScopes.length === 0 
    ? allFilterableFields 
    : selectedScopes.flatMap(scope => fieldsByEntity[scope] || []).reduce((acc, field) => {
      if (!acc.some(f => f.value === field.value)) {
        acc.push(field);
      }
      return acc;
    }, [] as { value: string; label: string }[]);

  // Buscar sugerencias al escribir
  React.useEffect(() => {
    let ignore = false
    const fetchSuggestions = async () => {
      if (!query) {
        setSuggestion("")
        return
      }
      try {
        const data = await dataService.search(query) as any
        // Buscar la mejor sugerencia que empiece con el query
        const allFields: string[] = []
        Object.values(data).forEach((items: any) => {
          items.forEach((item: any) => {
            ;[
              item.title,
              item.name,
              item.BreachName,
              item.author_username,
              item.author,
              item.description,
              item.category,
              item.url,
              item.Domain,
              item.Group,
              item.channel_username,
            ].forEach((f) => {
              if (f && typeof f === "string") allFields.push(f)
            })
          })
        })
        // Buscar sugerencia que empiece con el query y no sea igual
        const lowerQuery = query.toLowerCase()
        const match = allFields.find((f) => f.toLowerCase().startsWith(lowerQuery) && f.toLowerCase() !== lowerQuery)
        if (!ignore) setSuggestion(match || "")
      } catch {
        if (!ignore) setSuggestion("")
      }
    }
    fetchSuggestions()
    return () => {
      ignore = true
    }
  }, [query])

  // Autocompletar con Tab
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab" && suggestion) {
      e.preventDefault()
      setQuery(suggestion)
      setSuggestion("")
      // Opcional: disparar búsqueda automática
      // handleSubmit(undefined, suggestion);
    }
  }

  const handleSubmit = async (e?: React.FormEvent, customQuery?: string, customFilters?: any[]) => {
    if (e) e.preventDefault()
    setLoading(true)
    setError(null)
    setResults(null)
    setSuggestion("") // Ocultar sugerencia tras buscar
    const searchValue = customQuery !== undefined ? customQuery : query
    const activeFilters = customFilters || filters;

    // Prepare filters for dataService
    const searchFilters: any = {};
    
    if (selectedScopes.length > 0) {
      searchFilters.entity = selectedScopes.join(',');
    }

    if (activeFilters.length > 0) {
      const filterParams = activeFilters
        .filter(f => f.field && f.value)
        .map(f => {
          let value = f.value;
          const fieldType = allFilterableFields.find(field => field.value === f.field)?.type;
          if (fieldType === 'date' && value instanceof Date) {
            value = format(value, "yyyy-MM-dd");
          }
          return `${encodeURIComponent(f.field)}:${encodeURIComponent(f.operator)}:${encodeURIComponent(value)}`
        })
        .join("&filter=");
      if (filterParams) {
        searchFilters.filter = filterParams;
      }
    }

    try {
      const data = await dataService.search(searchValue, searchFilters) as any
      setResults(data)
    } catch (err: any) {
      setError(err.message || "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-full overflow-hidden">
      <div className="space-y-6">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Búsqueda avanzada</h1>

          <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
            <div className="relative w-full max-w-2xl">
              {/* Input principal */}
              <Input
                ref={inputRef}
                type="text"
                placeholder="Buscar en todos los campos..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pr-2 bg-transparent relative z-10"
                autoComplete="off"
                spellCheck={false}
              />
              {/* Ghost text */}
              {suggestion && suggestion.toLowerCase().startsWith(query.toLowerCase()) && (
                <div
                  className="absolute left-0 top-0 h-full flex items-center pointer-events-none select-none text-muted-foreground"
                  style={{
                    paddingLeft: "0.75rem", // igual que px-3
                    fontSize: inputRef.current ? window.getComputedStyle(inputRef.current).fontSize : undefined,
                    fontFamily: inputRef.current ? window.getComputedStyle(inputRef.current).fontFamily : undefined,
                    width: "100%",
                    zIndex: 1,
                    userSelect: "none",
                  }}
                >
                  <span style={{ opacity: 0 }}>{query}</span>
                  <span>{suggestion.slice(query.length)}</span>
                </div>
              )}
            </div>

            {/* Selector de ámbito */}
            <div className="space-y-3">
              <label className="block font-semibold text-sm text-foreground">Buscar en:</label>
              <div className="flex flex-wrap items-center gap-4">
                {searchScopes.map(scope => (
                  <div key={scope.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={scope.id}
                      checked={selectedScopes.includes(scope.id)}
                      onCheckedChange={(checked) => {
                        setSelectedScopes(prev => 
                          checked 
                            ? [...prev, scope.id] 
                            : prev.filter(s => s !== scope.id)
                        );
                      }}
                    />
                    <Label htmlFor={scope.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {scope.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Filtros avanzados */}
            <div className="space-y-3">
              <label className="block font-semibold text-sm text-foreground">Filtros avanzados:</label>
              <FilterBuilder fields={currentFields} onApply={handleApplyFilters} />
            </div>

            <Button type="submit" disabled={loading || (!query && filters.length === 0)} className="w-full sm:w-auto">
              {loading ? "Buscando..." : "Buscar"}
            </Button>
          </form>
        </div>

        {error && (
          <div className="text-destructive p-3 bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>
        )}

        <div className="w-full max-w-full overflow-hidden">
          <ResultsTable results={results || {}} searchTerm={query} filters={filters} fields={allFilterableFields} />
        </div>
      </div>
    </div>
  )
}
