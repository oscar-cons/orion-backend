"use client"

import React, { useEffect, useState } from "react"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { DetailPanel } from "@/components/ui/detail-panel"
import { ReloadButton } from "@/components/ui/reload-button"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { ExternalLink } from "lucide-react"
import { dataService } from "@/lib/dataService"
interface ResultsTableProps {
  results: {
    [entity: string]: any[]
  }
  searchTerm?: string
  filters: any[]
  fields: { value: string; label: string; type?: string }[]
}

const PAGE_SIZES = [5, 10, 20, 50]

// Scrollbar styles (Tailwind + custom)
const scrollStyles =
  "scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-primary/40 scrollbar-track-muted/30 hover:scrollbar-thumb-primary/60"

function getSourceTypeLabel(entity: string) {
  if (entity === "forum-posts") return "Forum Post"
  if (entity === "ransomware") return "Ransomware"
  if (entity === "telegram") return "Telegram"
  if (entity === "sources") return "Source"
  return entity
}

function getPreviewValue(item: any): string {
  const previewFields = ["title", "name", "BreachName", "author_username", "description"]
  for (const field of previewFields) {
    if (item[field] && typeof item[field] === "string") {
      return item[field]
    }
  }
  for (const key of Object.keys(item)) {
    if (typeof item[key] === "string" && item[key]) {
      return item[key]
    }
  }
  return "No preview available"
}

function formatFieldName(field: string) {
  // Convierte snake_case o camelCase a Capitalized Words
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

// Columnas importantes por tipo de entidad
const DEFAULT_IMPORTANT_COLUMNS: Record<string, string[]> = {
  "forum-posts": ["title", "author_username", "date", "category", "url"],
  ransomware: ["BreachName", "Domain", "Category", "Country", "Group"],
  sources: ["name", "type", "author", "country", "language"],
  telegram: ["name", "author", "country", "language", "channel_username"],
}

// Componente reutilizable para el botón de abrir detalle
const OpenDetailButton = ({ onClick, hidden }: { onClick: () => void; hidden?: boolean }) =>
  !hidden ? (
    <Button size="sm" variant="outline" onClick={onClick}>
      Abrir detalle
    </Button>
  ) : null

// Helper para determinar coincidencias
const getMatchingFields = (item: any, searchTerm: string | undefined, filters: any[], fields: { value: string; label: string; type?: string }[]): string[] => {
  const matches: string[] = [];
  
  if (searchTerm) {
    matches.push(...Object.keys(item).filter(
      (key) => typeof item[key] === "string" && item[key].toLowerCase().includes(searchTerm.toLowerCase()),
    ));
  }

  if (filters && filters.length > 0) {
    filters.forEach(filter => {
      if (!filter.field || !filter.value) return;

      const fieldDef = fields.find(f => f.value === filter.field);
      const itemValue = item[filter.field];
      if (!itemValue) return;

      let match = false;
      if (fieldDef?.type === 'date') {
        const filterDate = new Date(filter.value).setHours(0, 0, 0, 0);
        const itemDate = new Date(itemValue).setHours(0, 0, 0, 0);
        switch (filter.operator) {
          case 'on': match = (itemDate === filterDate); break;
          case 'before': match = (itemDate < filterDate); break;
          case 'after': match = (itemDate > filterDate); break;
        }
      } else if (typeof itemValue === 'string') {
        const filterValue = filter.value.toLowerCase();
        const lowerItemValue = itemValue.toLowerCase();
        switch (filter.operator) {
          case 'contains': match = lowerItemValue.includes(filterValue); break;
          case 'equals': match = (lowerItemValue === filterValue); break;
          case 'startsWith': match = lowerItemValue.startsWith(filterValue); break;
          case 'endsWith': match = lowerItemValue.endsWith(filterValue); break;
        }
      }

      if (match && !matches.includes(filter.field)) {
        matches.push(filter.field);
      }
    });
  }
  
  return matches;
};

export default function ResultsTable({ results, searchTerm = "", filters, fields }: ResultsTableProps) {
  // Todos los hooks deben ir al principio
  const [pageSizes, setPageSizes] = React.useState<{ [entity: string]: number }>({})
  const [activeTab, setActiveTab] = React.useState<string>("all")
  const [selectedRow, setSelectedRow] = React.useState<any | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [allSourcesPage, setAllSourcesPage] = React.useState(1)
  const [allSourcesPageSize, setAllSourcesPageSize] = React.useState(10)
  const [forumsMap, setForumsMap] = useState<Record<string, string>>({})
  const [currentPages, setCurrentPages] = useState<Record<string, number>>({})
  // Estado global para panel de detalle de pestañas
  const [tabDetail, setTabDetail] = React.useState<{ open: boolean; entity: string | null; row: any }>({
    open: false,
    entity: null,
    row: null,
  })
  // Estado de columnas visibles por entidad
  const [visibleColumns, setVisibleColumns] = useState<Record<string, string[]>>({})
  const [showColumnsMenu, setShowColumnsMenu] = useState<Record<string, boolean>>({})
  const [reloading, setReloading] = useState(false)

  const handleReload = () => {
    setReloading(true)
    // Aquí iría la lógica para recargar los datos.
    // Por ahora, simularemos una recarga de 2 segundos.
    setTimeout(() => {
      setReloading(false)
    }, 2000)
  }

  const checkFilterMatch = (item: any) => {
    if (!filters || filters.length === 0) return false;
    return filters.some(filter => {
      if (!filter.field || !filter.value) return false;
      const itemValue = item[filter.field];
      if (typeof itemValue !== 'string') return false;
      
      switch (filter.operator) {
        case 'contains':
          return itemValue.toLowerCase().includes(filter.value.toLowerCase());
        case 'equals':
          return itemValue.toLowerCase() === filter.value.toLowerCase();
        case 'startsWith':
          return itemValue.toLowerCase().startsWith(filter.value.toLowerCase());
        case 'endsWith':
          return itemValue.toLowerCase().endsWith(filter.value.toLowerCase());
        default:
          return false;
      }
    });
  };

  useEffect(() => {
    // Fetch forums al montar
    dataService.getForums()
      .then((data: any) => {
        const map: Record<string, string> = {}
        if (Array.isArray(data)) {
          data.forEach((forum: any) => {
            map[forum.id] = forum.name
          })
        }
        setForumsMap(map)
      })
      .catch(() => {})
  }, [])

  React.useEffect(() => {
    if (results) {
      const newSizes: { [entity: string]: number } = {}
      const newPages: { [entity: string]: number } = {}
      Object.keys(results).forEach((entity) => {
        if (!(entity in pageSizes)) newSizes[entity] = 10
        if (!(entity in currentPages)) newPages[entity] = 1
      })
      if (Object.keys(newSizes).length > 0) setPageSizes((prev) => ({ ...newSizes, ...prev }))
      if (Object.keys(newPages).length > 0) setCurrentPages((prev) => ({ ...newPages, ...prev }))
    }
    // eslint-disable-next-line
  }, [results])

  React.useEffect(() => {
    // Resetear página si cambia el tamaño o los datos
    setAllSourcesPage(1)
  }, [allSourcesPageSize, results])

  React.useEffect(() => {
    // Resetear páginas de pestañas si cambia el tamaño
    const newPages: { [entity: string]: number } = {}
    Object.keys(pageSizes).forEach((entity) => {
      newPages[entity] = 1
    })
    setCurrentPages(newPages)
  }, [pageSizes])

  const entitiesWithResults = Object.keys(results);
  const entities = entitiesWithResults.filter(entity => entity !== 'sources');
  const allSourcesRows: { type: string; preview: string; matches: string[]; item: any }[] = []
  const entityCounts: { [entity: string]: number } = {}

  if (!results || Object.keys(results).length === 0) {
    return <div className="text-muted-foreground">No hay resultados.</div>
  }

  // Construir datos para All Sources (tabla expandible)
  entities.forEach((entity) => {
    const items = results[entity]
    
    items.forEach((item) => {
      const matches = getMatchingFields(item, searchTerm, filters, fields);
      if (matches.length > 0) {
        allSourcesRows.push({
          type: getSourceTypeLabel(entity),
          preview: getPreviewValue(item),
          matches,
          item,
        });
      }
    });

    // Contar resultados por entidad
    if (searchTerm || (filters && filters.length > 0)) {
      entityCounts[entity] = items.filter(item => getMatchingFields(item, searchTerm, filters, fields).length > 0).length;
    } else {
      entityCounts[entity] = items.length
    }
  })

  const allCount = allSourcesRows.length

  // Paginación para All Sources
  const totalAllSourcesPages = Math.ceil(allSourcesRows.length / allSourcesPageSize) || 1
  const paginatedAllSourcesRows = allSourcesRows.slice(
    (allSourcesPage - 1) * allSourcesPageSize,
    allSourcesPage * allSourcesPageSize,
  )

  // Inicializar columnas visibles para cada entidad
  entities.forEach((entity) => {
    if (!visibleColumns[entity]) {
      setVisibleColumns((prev) => ({ ...prev, [entity]: DEFAULT_IMPORTANT_COLUMNS[entity] || [] }))
    }
  })

  return (
    <div className="w-full max-w-full overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 flex items-center justify-between w-full">
          <div className="flex flex-wrap gap-1">
            <TabsTrigger value="all">
              All Sources <span className="ml-1 text-xs text-muted-foreground">({allCount})</span>
            </TabsTrigger>
            {entities.map((entity) => (
              <TabsTrigger key={entity} value={entity}>
                {getSourceTypeLabel(entity)}{" "}
                <span className="ml-1 text-xs text-muted-foreground">({entityCounts[entity]})</span>
              </TabsTrigger>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <ReloadButton onClick={handleReload} isLoading={reloading} />
            <OpenDetailButton
              onClick={() => {
                if (activeTab === "all") {
                  setDetailOpen(true)
                } else {
                  setTabDetail({ open: true, entity: activeTab, row: null })
                }
              }}
              hidden={
                (activeTab === "all" && detailOpen) ||
                (activeTab !== "all" && tabDetail.open && tabDetail.entity === activeTab)
              }
            />
          </div>
        </TabsList>

        <TabsContent value="all" className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-full">
            {/* Main content area - takes up remaining space when detail panel is closed */}
            <div className={`${detailOpen ? "lg:col-span-8" : "lg:col-span-12"} min-w-0`}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>
                    All Sources <span className="ml-2 text-base text-muted-foreground font-normal">({allCount})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <div className={`max-h-96 overflow-y-auto ${scrollStyles}`}>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[120px]">Source Type</TableHead>
                            <TableHead className="min-w-[200px]">Preview</TableHead>
                            <TableHead className="min-w-[150px]">Matching Fields</TableHead>
                            <TableHead className="min-w-[100px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedAllSourcesRows.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                No results matching for this search
                              </TableCell>
                            </TableRow>
                          ) : (
                            paginatedAllSourcesRows.map((row, idx) => {
                              const matchingFields = Array.isArray(row.matches) ? row.matches : []
                              return (
                                <TableRow
                                  key={idx}
                                  className={
                                    (selectedRow === row ? "bg-muted/30 " : "") +
                                    "cursor-pointer hover:bg-primary/10 transition-colors"
                                  }
                                  onClick={() => {
                                    setSelectedRow(row)
                                    setDetailOpen(true)
                                  }}
                                >
                                  <TableCell className="font-medium">{row.type}</TableCell>
                                  <TableCell className="max-w-[300px] truncate">{row.preview}</TableCell>
                                  <TableCell className="max-w-[200px] truncate">
                                    {row.matches.length > 0 ? row.matches.map(formatFieldName).join(", ") : "-"}
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedRow(row)
                                        setDetailOpen(true)
                                      }}
                                    >
                                      View
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(`/sources/forum/${row.item.forum_id}/post/${row.item.id}`, "_blank");
                                      }}
                                      aria-label="Open in New Tab"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              )
                            })
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  {/* Paginación */}
                  <PaginationControls
                    currentPage={allSourcesPage}
                    totalPages={totalAllSourcesPages}
                    onPageChange={setAllSourcesPage}
                    totalRows={allSourcesRows.length}
                    rowsPerPage={allSourcesPageSize}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Detail Panel - fixed width when open */}
            {detailOpen && (
              <div className="lg:col-span-4 min-w-0">
                <DetailPanel
                  open={detailOpen}
                  onClose={() => setDetailOpen(false)}
                  data={
                    selectedRow
                      ? {
                          ...selectedRow.item,
                          ...(selectedRow.type === "Forum Post" && selectedRow.item.forum_id
                            ? { forum_id: forumsMap[selectedRow.item.forum_id] || selectedRow.item.forum_id }
                            : {}),
                        }
                      : null
                  }
                  title="Detalle"
                  highlightTerm={searchTerm}
                  highlightFields={selectedRow ? selectedRow.matches : []}
                  fieldMap={selectedRow && selectedRow.type === "Forum Post" ? { forum_id: "Forum" } : {}}
                />
              </div>
            )}
          </div>
        </TabsContent>

        {entities.map((entity) => {
          const items = results[entity]
          const pageSize = pageSizes[entity] || 10
          const currentPage = currentPages[entity] || 1
          const totalPages = Math.ceil(items.length / pageSize) || 1
          const paginatedItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize)
          const hasResults = (searchTerm ? entityCounts[entity] : items.length) > 0
          const allColumns = items.length > 0 ? Object.keys(items[0]) : []
          const defaultCols = DEFAULT_IMPORTANT_COLUMNS[entity] || allColumns.slice(0, 5)
          const entityVisibleCols = visibleColumns[entity] || defaultCols
          const isDetailOpen = tabDetail.open && tabDetail.entity === entity

          return (
            <TabsContent key={entity} value={entity} className="w-full">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-full">
                {/* Main content area */}
                <div className={`${isDetailOpen ? "lg:col-span-8" : "lg:col-span-12"} min-w-0`}>
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>
                        {getSourceTypeLabel(entity)}{" "}
                        <span className="ml-2 text-base text-muted-foreground font-normal">
                          ({entityCounts[entity]})
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {/* Column selector */}
                      <div className="p-4 border-b">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowColumnsMenu((prev) => ({ ...prev, [entity]: !prev[entity] }))}
                            >
                              Columnas
                            </Button>
                            {showColumnsMenu[entity] && (
                              <div className="absolute z-20 mt-2 bg-card border rounded shadow-lg p-3 min-w-[180px] max-h-64 overflow-y-auto">
                                {allColumns.map((col) => (
                                  <label key={col} className="flex items-center gap-2 py-1 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={entityVisibleCols.includes(col)}
                                      onChange={(e) => {
                                        setVisibleColumns((prev) => ({
                                          ...prev,
                                          [entity]: e.target.checked
                                            ? [...(prev[entity] || defaultCols), col]
                                            : (prev[entity] || defaultCols).filter((c) => c !== col),
                                        }))
                                      }}
                                    />
                                    <span className="text-xs">{formatFieldName(col)}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">Selecciona las columnas a mostrar</span>
                        </div>
                      </div>

                      {/* Table */}
                      <div className="overflow-x-auto">
                        <div className={`max-h-80 overflow-y-auto ${scrollStyles}`}>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                {entityVisibleCols.map((key) => (
                                  <TableHead key={key} className="min-w-[120px]">
                                    {formatFieldName(key)}
                                  </TableHead>
                                ))}
                                {hasResults && <TableHead className="min-w-[100px]">Acciones</TableHead>}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {hasResults ? (
                                paginatedItems.map((item, idx) => (
                                  <TableRow
                                    key={idx}
                                    className="hover:bg-primary/10 cursor-pointer transition-colors"
                                    onClick={() => setTabDetail({ open: true, entity, row: item })}
                                  >
                                    {entityVisibleCols.map((key) => (
                                      <TableCell key={key} className="max-w-[200px] truncate">
                                        {String(item[key] || "-")}
                                      </TableCell>
                                    ))}
                                    <TableCell>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setTabDetail({ open: true, entity, row: item })
                                        }}
                                      >
                                        Ver
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell
                                    colSpan={entityVisibleCols.length + 1}
                                    className="text-center text-muted-foreground py-8"
                                  >
                                    No results matching for this search
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>

                      {/* Paginación */}
                      <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setCurrentPages((prev) => ({ ...prev, [entity]: page }))}
                        totalRows={items.length}
                        rowsPerPage={pageSize}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Detail Panel */}
                {isDetailOpen && (
                  <div className="lg:col-span-4 min-w-0">
                    <DetailPanel
                      open={isDetailOpen}
                      onClose={() => setTabDetail({ open: false, entity: null, row: null })}
                      data={
                        tabDetail.row
                          ? {
                              ...tabDetail.row,
                              ...(entity === "forum-posts" && tabDetail.row.forum_id
                                ? { forum_id: forumsMap[tabDetail.row.forum_id] || tabDetail.row.forum_id }
                                : {}),
                            }
                          : null
                      }
                      title="Detalle"
                      highlightTerm={searchTerm}
                      highlightFields={tabDetail.row ? getMatchingFields(tabDetail.row, searchTerm, filters, fields) : []}
                      fieldMap={entity === "forum-posts" ? { forum_id: "Forum" } : {}}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
