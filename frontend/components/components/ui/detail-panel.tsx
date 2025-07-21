import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "./card";
import { Button } from "./button";

interface DetailPanelProps {
  open: boolean;
  onClose: () => void;
  data?: Record<string, any> | null;
  title?: string;
  highlightTerm?: string;
  highlightFields?: string[];
  fieldMap?: Record<string, string>; // para renombrar campos
  children?: React.ReactNode;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({
  open,
  onClose,
  data,
  title = "Detalle",
  highlightTerm,
  highlightFields = [],
  fieldMap = {},
  children,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="detail-panel"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="w-full max-w-md flex flex-col mb-6 h-full flex-1"
          style={{ minHeight: 0 }}
        >
          <Card className="flex-1 flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">{title}</CardTitle>
              <Button size="sm" variant="ghost" onClick={onClose}>Cerrar</Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
              {children ? (
                children
              ) : data ? (
                <div className="space-y-2">
                  {Object.keys(data)
                    .filter(key => typeof data[key] === 'string' && data[key])
                    .map(key => (
                      <div key={key}>
                        <span className="font-semibold text-xs mr-2">{fieldMap[key] || key}:</span>
                        <span
                          className={
                            (highlightTerm && typeof data[key] === 'string' && data[key].toLowerCase().includes(highlightTerm.toLowerCase())) ||
                            highlightFields.includes(key)
                              ? "bg-primary text-primary-foreground font-semibold px-1 rounded shadow-sm transition-colors duration-200"
                              : ""
                          }
                        >
                          {data[key]}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-muted-foreground text-center py-8">No hay entrada seleccionada.</div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 