'use client';

import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { useKeycloak } from '@/components/KeycloakProvider';
import { Users, Wifi, WifiOff, Sparkles } from 'lucide-react';
import AiWorkspaceAssistant from './AiWorkspaceAssistant';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface CollaborativeEditorProps {
    contractId: string;
}

interface ActiveUser {
    userId: string;
    userName: string;
}

export default function CollaborativeEditor({ contractId }: CollaborativeEditorProps) {
    const { authenticated, token, userId, username } = useKeycloak();
    const [content, setContent] = useState('');
    const [version, setVersion] = useState(0);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
    const isRemoteChange = useRef(false);

    useEffect(() => {
        if (!authenticated || !token) return;

        // Connect to WebSocket
        const socketUrl = process.env.NEXT_PUBLIC_CONTRACT_SERVICE_URL || 'http://localhost:3004';
        const newSocket = io(`${socketUrl}/workspace`, {
            auth: { token },
            transports: ['websocket', 'polling'],
        });

        newSocket.on('connect', () => {
            console.log('Connected to workspace');
            setConnected(true);

            // Join workspace
            newSocket.emit('join-workspace', {
                contractId,
                userId: userId,
                userName: username || 'Anonymous',
            });
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from workspace');
            setConnected(false);
        });

        newSocket.on('workspace-state', (workspace: any) => {
            console.log('Received workspace state', workspace);
            isRemoteChange.current = true;
            setContent(workspace.content?.ops ? JSON.stringify(workspace.content) : '');
            setVersion(workspace.version);
        });

        newSocket.on('document-update', (data: { content: any; version: number; userId: string }) => {
            console.log('Received document update', data);
            if (data.userId !== userId) {
                isRemoteChange.current = true;
                setContent(data.content?.ops ? JSON.stringify(data.content) : '');
                setVersion(data.version);
            }
        });

        newSocket.on('document-saved', (data: { version: number }) => {
            console.log('Document saved', data);
            setVersion(data.version);
        });

        newSocket.on('document-error', (data: { message: string }) => {
            console.error('Document error', data.message);
            alert(`Error: ${data.message}`);
        });

        newSocket.on('presence-update', (data: { users: ActiveUser[] }) => {
            console.log('Presence update', data.users);
            setActiveUsers(data.users.filter(u => u.userId !== userId));
        });

        setSocket(newSocket);

        return () => {
            newSocket.emit('leave-workspace', { contractId });
            newSocket.disconnect();
        };
    }, [authenticated, token, contractId]);

    const handleChange = (value: string, delta: any, source: any, editor: any) => {
        if (isRemoteChange.current) {
            isRemoteChange.current = false;
            return;
        }

        if (source === 'user' && socket && connected) {
            const quillDelta = editor.getContents();
            setContent(value);

            socket.emit('document-change', {
                contractId,
                content: quillDelta,
                version,
            });
        }
    };

    const modules = {
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ indent: '-1' }, { indent: '+1' }],
            ['link', 'image'],
            ['clean'],
        ],
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                    {connected ? (
                        <div className="flex items-center gap-2 text-emerald-400">
                            <Wifi className="w-4 h-4" />
                            <span className="text-sm font-medium">Connected</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-red-400">
                            <WifiOff className="w-4 h-4" />
                            <span className="text-sm font-medium">Disconnected</span>
                        </div>
                    )}
                    <div className="h-4 w-px bg-slate-700" />
                    <div className="flex items-center gap-2 text-slate-400">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{activeUsers.length} collaborator(s) online</span>
                    </div>
                </div>
                {activeUsers.length > 0 && (
                    <div className="flex -space-x-2">
                        {activeUsers.map((user, idx) => (
                            <div
                                key={idx}
                                className="w-8 h-8 rounded-full bg-blue-600 border-2 border-slate-900 flex items-center justify-center text-xs text-white font-bold"
                                title={user.userName}
                            >
                                {user.userName.charAt(0).toUpperCase()}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-4">
                    <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
                        <ReactQuill
                            theme="snow"
                            value={content}
                            onChange={handleChange}
                            modules={modules}
                            placeholder="Start collaborating on project requirements..."
                            className="h-[500px]"
                        />
                    </div>
                    <div className="text-xs text-slate-500 text-center">
                        Document version: {version} • Changes are saved automatically
                    </div>
                </div>

                <div className="lg:col-span-1 h-[540px]">
                    <AiWorkspaceAssistant
                        contractId={contractId}
                        content={content}
                        onApplySuggestion={(newContent) => setContent(newContent)}
                    />
                </div>
            </div>
        </div>
    );
}
