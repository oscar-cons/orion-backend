import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface ReloadButtonProps {
    onClick: () => void;
    isLoading: boolean;
}

export function ReloadButton({ onClick, isLoading }: ReloadButtonProps) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={onClick}
                        disabled={isLoading}
                        className="h-8 w-8"
                    >
                        <RotateCw
                            className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                        />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Recargar</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
} 