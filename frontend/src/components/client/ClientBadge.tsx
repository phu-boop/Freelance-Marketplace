import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Crown, ShieldCheck } from "lucide-react";

interface ClientBadgeProps {
    tier: 'NONE' | 'GOLD' | 'PLATINUM' | 'ENTERPRISE';
}

const ClientBadge = ({ tier }: ClientBadgeProps) => {
    if (tier === 'NONE') return null;

    const badgeConfig = {
        GOLD: { color: "bg-yellow-500 hover:bg-yellow-600", icon: <ShieldCheck className="w-3 h-3 mr-1" />, label: "Gold Client" },
        PLATINUM: { color: "bg-slate-300 hover:bg-slate-400 text-slate-900", icon: <ShieldCheck className="w-3 h-3 mr-1" />, label: "Platinum Client" },
        ENTERPRISE: { color: "bg-blue-600 hover:bg-blue-700", icon: <Crown className="w-3 h-3 mr-1" />, label: "Enterprise" }
    };

    const config = badgeConfig[tier];

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <Badge className={`${config.color} text-white border-0`}>
                        {config.icon}
                        {tier}
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{config.label} - Verified High Spender</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default ClientBadge;
