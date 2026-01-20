import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Star } from "lucide-react";
import ClientBadge from './ClientBadge';

interface ClientStatsProps {
    stats: {
        totalSpend: number;
        hiringRate: number;
        avgHourlyRate: number;
        reviewsCount: number;
        avgRating: number;
        spendTier: 'NONE' | 'GOLD' | 'PLATINUM' | 'ENTERPRISE';
    }
}

const ClientStatsCard = ({ stats }: ClientStatsProps) => {
    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Client Reputation</CardTitle>
                    <ClientBadge tier={stats.spendTier} />
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-semibold">{stats.avgRating}</span>
                    <span className="text-muted-foreground">({stats.reviewsCount} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span>{stats.hiringRate}% Hire Rate</span>
                </div>
                <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span>${stats.totalSpend.toLocaleString()} Total Spend</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Avg Rate:</span>
                    <span>${stats.avgHourlyRate.toFixed(2)}/hr</span>
                </div>
            </CardContent>
        </Card>
    );
};

export default ClientStatsCard;
