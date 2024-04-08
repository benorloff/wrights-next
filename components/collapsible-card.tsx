"use client"

import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";

export const CollapsibleCard = ({ 
    title, 
    className,
    children,
}: {
    title: string;
    className?: string;
    children: React.ReactNode;
}) => {
    const [isOpen, setIsOpen] = useState(true);
    
    return (
        <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="w-full space-y-2 border rounded-lg p-4"
        >
            <div className="flex items-center justify-between">
                <div className="text-lg">
                    {title}
                </div>
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-9 p-0">
                        <ChevronsUpDown className="h-4 w-4" />
                        <span className="sr-only">Toggle</span>
                    </Button>
                </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
                {children}
            </CollapsibleContent>
        </Collapsible>
    );
}