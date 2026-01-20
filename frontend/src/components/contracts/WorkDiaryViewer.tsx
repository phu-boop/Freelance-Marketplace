import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Clock, Monitor, Keyboard, MousePointer } from "lucide-react";

interface WorkDiarySegment {
    id: string;
    timestamp: string;
    screenshotUrl: string;
    activityScore: number;
    memo: string;
    keystrokes: number;
    mouseClicks: number;
    status: 'PENDING' | 'APPROVED' | 'DISPUTED';
}

const WorkDiaryViewer = ({ contractId }: { contractId: string }) => {
    const [segments, setSegments] = useState<WorkDiarySegment[]>([]);
    const [selectedSegment, setSelectedSegment] = useState<WorkDiarySegment | null>(null);

    useEffect(() => {
        // Mock data fetch
        const mockSegments: WorkDiarySegment[] = Array.from({ length: 6 }).map((_, i) => ({
            id: `seg-${i}`,
            timestamp: new Date(Date.now() - i * 600000).toISOString(),
            screenshotUrl: 'https://via.placeholder.com/400x300',
            activityScore: Math.floor(Math.random() * 100),
            memo: 'Implementing frontend components',
            keystrokes: 450,
            mouseClicks: 120,
            status: 'PENDING'
        }));
        setSegments(mockSegments);
    }, [contractId]);

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <Clock className="w-6 h-6" /> Work Diary
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {segments.map(segment => (
                    <Card
                        key={segment.id}
                        className="cursor-pointer hover:ring-2 ring-primary transition-all overflow-hidden"
                        onClick={() => setSelectedSegment(segment)}
                    >
                        <div className="relative aspect-video bg-muted">
                            <img src={segment.screenshotUrl} alt="Screenshot" className="object-cover w-full h-full opacity-80 hover:opacity-100" />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center">
                                {formatTime(segment.timestamp)}
                            </div>
                        </div>
                        <CardContent className="p-2 space-y-2">
                            <Progress value={segment.activityScore} className={`h-1.5 ${segment.activityScore < 30 ? 'bg-red-200' : 'bg-green-200'}`} />
                            <p className="text-xs truncate text-muted-foreground">{segment.memo}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={!!selectedSegment} onOpenChange={() => setSelectedSegment(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Segment Details - {selectedSegment && formatTime(selectedSegment.timestamp)}</DialogTitle>
                    </DialogHeader>
                    {selectedSegment && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <img src={selectedSegment.screenshotUrl} alt="Full Screenshot" className="rounded-lg border shadow-sm w-full" />
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Activity Level</h4>
                                    <div className="flex items-center gap-2">
                                        <Progress value={selectedSegment.activityScore} className="h-4 flex-1" />
                                        <span className="font-bold">{selectedSegment.activityScore}%</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <Keyboard className="w-4 h-4 text-muted-foreground" />
                                        <span>{selectedSegment.keystrokes} Keys</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MousePointer className="w-4 h-4 text-muted-foreground" />
                                        <span>{selectedSegment.mouseClicks} Clicks</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-muted rounded-md text-sm">
                                    <span className="font-semibold block mb-1">Memo:</span>
                                    {selectedSegment.memo}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default WorkDiaryViewer;
