import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, MonitorOff } from 'lucide-react';
import { Socket } from 'socket.io-client';

interface CallModalProps {
    isOpen: boolean;
    onClose: () => void;
    socket: Socket | null;
    myId: string;
    otherId: string;
    isIncoming?: boolean;
    offer?: any; // If accepting a call
    callerName?: string;
    isVideo?: boolean; // If audio-only or video
}

const CallModal: React.FC<CallModalProps> = ({ isOpen, onClose, socket, myId, otherId, isIncoming, offer, callerName, isVideo = true }) => {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [callStatus, setCallStatus] = useState<'calling' | 'ringing' | 'connected' | 'ended'>('calling');
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(isVideo);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const screenStreamRef = useRef<MediaStream | null>(null);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

    const iceServers = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
        ]
    };

    useEffect(() => {
        if (!isOpen) return;

        const startCall = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: isVideo, audio: true });
                setLocalStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                const pc = new RTCPeerConnection(iceServers);
                peerConnectionRef.current = pc;

                stream.getTracks().forEach(track => pc.addTrack(track, stream));

                pc.ontrack = (event) => {
                    setRemoteStream(event.streams[0]);
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = event.streams[0];
                    }
                };

                pc.onicecandidate = (event) => {
                    if (event.candidate && socket) {
                        socket.emit('ice_candidate', {
                            senderId: myId,
                            receiverId: otherId,
                            candidate: event.candidate
                        });
                    }
                };

                if (socket) {
                    socket.on('ice_candidate', async (data) => {
                        if (pc) {
                            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                        }
                    });

                    socket.on('call_answered', async (data) => {
                        if (pc) {
                            await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                            setCallStatus('connected');
                        }
                    });

                    socket.on('call_ended', () => {
                        handleEndCall();
                    });
                }


                if (isIncoming && offer) {
                    setCallStatus('connected'); // Or connecting?
                    await pc.setRemoteDescription(new RTCSessionDescription(offer));
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    socket?.emit('answer_call', {
                        senderId: myId,
                        receiverId: otherId,
                        answer
                    });
                } else {
                    // Outgoing
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    socket?.emit('call_user', {
                        senderId: myId,
                        receiverId: otherId,
                        offer,
                        isVideo
                    });
                }

            } catch (err) {
                console.error('Error starting call:', err);
                onClose();
            }
        };

        startCall();

        return () => {
            // Cleanup
            handleCleanup();
        };
    }, [isOpen]); // Run once on open

    const handleCleanup = () => {
        localStream?.getTracks().forEach(track => track.stop());
        peerConnectionRef.current?.close();
        if (socket) {
            socket.off('ice_candidate');
            socket.off('call_answered');
            socket.off('call_ended');
        }
    };

    const handleEndCall = () => {
        socket?.emit('end_call', { senderId: myId, receiverId: otherId });
        handleCleanup();
        onClose();
    };

    const toggleMic = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => track.enabled = !isMicOn);
            setIsMicOn(!isMicOn);
        }
    }

    const toggleCamera = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => track.enabled = !isCameraOn);
            setIsCameraOn(!isCameraOn);
        }
    }

    const toggleScreenSharing = async () => {
        if (!peerConnectionRef.current || !localStream) return;

        if (!isScreenSharing) {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                screenStreamRef.current = screenStream;
                const screenTrack = screenStream.getVideoTracks()[0];

                // Replace the video track in all senders
                const senders = peerConnectionRef.current.getSenders();
                const videoSender = senders.find(sender => sender.track?.kind === 'video');
                if (videoSender) {
                    await videoSender.replaceTrack(screenTrack);
                }

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = screenStream;
                }

                screenTrack.onended = () => {
                    stopScreenSharing();
                };

                setIsScreenSharing(true);
            } catch (err) {
                console.error('Error sharing screen:', err);
            }
        } else {
            await stopScreenSharing();
        }
    }

    const stopScreenSharing = async () => {
        if (!peerConnectionRef.current || !localStream) return;

        const screenStream = screenStreamRef.current;
        if (screenStream) {
            screenStream.getTracks().forEach(track => track.stop());
            screenStreamRef.current = null;
        }

        const videoTrack = localStream.getVideoTracks()[0];
        const senders = peerConnectionRef.current.getSenders();
        const videoSender = senders.find(sender => sender.track?.kind === 'video');
        if (videoSender) {
            await videoSender.replaceTrack(videoTrack);
        }

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }

        setIsScreenSharing(false);
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center">
            {/* Header */}
            <div className="absolute top-6 left-6 text-white text-xl font-semibold">
                {isIncoming ? 'Incoming Call from' : 'Calling'} {callerName || 'User'}...
            </div>

            {/* Main Video Area */}
            <div className="relative w-full max-w-4xl aspect-video bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
                {/* Remote Video */}
                {remoteStream ? (
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center flex-col gap-4">
                        <div className="w-24 h-24 rounded-full bg-slate-700 animate-pulse flex items-center justify-center text-4xl">
                            {callerName?.[0]}
                        </div>
                        <p className="text-slate-400 animate-pulse">{isIncoming ? 'Connecting...' : 'Ringing...'}</p>
                    </div>
                )}

                {/* Local Video (PiP) */}
                <div className="absolute bottom-4 right-4 w-48 aspect-video bg-slate-900 rounded-lg overflow-hidden border border-slate-600 shadow-lg">
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    {!isCameraOn && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-slate-500 text-xs">
                            Camera Off
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="mt-8 flex gap-6">
                <button
                    onClick={toggleMic}
                    className={`p-4 rounded-full transition-all ${isMicOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white chat-shadow'}`}
                >
                    {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </button>
                <button
                    onClick={toggleCamera}
                    className={`p-4 rounded-full transition-all ${isCameraOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white chat-shadow'}`}
                    disabled={isScreenSharing}
                >
                    {isCameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </button>
                <button
                    onClick={toggleScreenSharing}
                    className={`p-4 rounded-full transition-all ${isScreenSharing ? 'bg-blue-600 hover:bg-blue-700 text-white chat-shadow' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                >
                    {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
                </button>
                <button
                    onClick={handleEndCall}
                    className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg scale-110"
                >
                    <PhoneOff className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default CallModal;
