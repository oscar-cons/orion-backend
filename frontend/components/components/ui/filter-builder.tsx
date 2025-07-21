import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface Filter {
  id: number;
  field: string;
  operator: string;
  value: any;
}

interface FilterBuilderProps {
  fields: { value: string; label: string; type?: string }[];
  onApply: (filters: Filter[]) => void;
}

const textOperators = [
  { value: "contains", label: "Contiene" },
  { value: "equals", label: "Es igual a" },
  { value: "startsWith", label: "Empieza por" },
  { value: "endsWith", label: "Termina por" },
];

const dateOperators = [
  { value: "on", label: "En la fecha" },
  { value: "before", label: "Antes de" },
  { value: "after", label: "Después de" },
];

export function FilterBuilder({ fields, onApply }: FilterBuilderProps) {
  const [filters, setFilters] = useState<Filter[]>([]);

  const addFilter = () => {
    setFilters([...filters, { id: Date.now(), field: "", operator: "contains", value: "" }]);
  };

  const updateFilter = (id: number, newFilter: Partial<Filter>) => {
    setFilters(filters.map(f => (f.id === id ? { ...f, ...newFilter } : f)));
  };

  const removeFilter = (id: number) => {
    setFilters(filters.filter(f => f.id !== id));
  };

  return (
    <div className="p-4 border rounded-md bg-card">
      <div className="space-y-2">
        {filters.map(filter => {
          const selectedField = fields.find(f => f.value === filter.field);
          const isDateField = selectedField?.type === "date";
          const operators = isDateField ? dateOperators : textOperators;

          return (
            <div key={filter.id} className="flex items-center gap-2">
              <Select
                value={filter.field}
                onValueChange={field => updateFilter(filter.id, { field, operator: isDateField ? 'on' : 'contains', value: '' })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Campo" />
                </SelectTrigger>
                <SelectContent>
                  {fields.map(f => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filter.operator}
                onValueChange={operator => updateFilter(filter.id, { operator })}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Operador" />
                </SelectTrigger>
                <SelectContent>
                  {operators.map(op => (
                    <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isDateField ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filter.value ? format(filter.value, "PPP") : <span>Selecciona una fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filter.value}
                      onSelect={date => updateFilter(filter.id, { value: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              ) : (
                <Input
                  value={filter.value}
                  onChange={e => updateFilter(filter.id, { value: e.target.value })}
                  placeholder="Valor"
                  className="flex-1"
                />
              )}
              <Button variant="ghost" size="icon" onClick={() => removeFilter(filter.id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex justify-between">
        <Button variant="outline" onClick={addFilter}>
          <Plus className="h-4 w-4 mr-2" />
          Añadir filtro
        </Button>
        <Button onClick={() => onApply(filters)}>Aplicar filtros</Button>
      </div>
    </div>
  );
} 