// app/(main)/messaging/MessagingClient.tsx

"use client";

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface Conversation {
    id: string;
    participants: string[];
    participantDetails: { [uid: string]: { fullName: string } };
    lastMessage?: string;
    lastUpdatedAt?: any;
    unreadBy?: { [uid: string]: boolean };
}

interface Message {
    id: string;
    text: string;
    senderId: string;
    createdAt: any;
}

// The function name is changed here
export default function MessagingClient() {
    const { userProfile } = useAuth();
    const searchParams = useSearchParams();
    const chatEndRef = useRef<HTMLDivElement>(null);

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);

    // Effect to fetch all conversations the user is a part of
    useEffect(() => {
        if (!userProfile) return;

        const convRef = collection(firestore, 'conversations');
        const q = query(convRef, where('participants', 'array-contains', userProfile.uid), orderBy('lastUpdatedAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const convs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
            setConversations(convs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userProfile]);
    
    // Effect to handle starting a new conversation from a profile page
    useEffect(() => {
        const newChatUserId = searchParams.get('new');
        if (newChatUserId && userProfile) {
            const conversationId = [userProfile.uid, newChatUserId].sort().join('_');
            handleSelectConversation(conversationId, newChatUserId);
        }
    }, [searchParams, userProfile]);

    // Effect to fetch messages for the currently selected conversation
    useEffect(() => {
        if (!selectedConversationId || !userProfile?.uid) {
            setMessages([]);
            return;
        }

        const msgRef = collection(firestore, 'conversations', selectedConversationId, 'messages');
        const q = query(msgRef, orderBy('createdAt', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
            setMessages(msgs);

            // Mark messages as read by updating the parent conversation doc
            const convRef = doc(firestore, 'conversations', selectedConversationId);
            updateDoc(convRef, { [`unreadBy.${userProfile.uid}`]: false }).catch(err => console.error("Could not mark as read:", err));
        });

        return () => unsubscribe();
    }, [selectedConversationId, userProfile?.uid]);
    
    // Auto-scroll to the latest message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSelectConversation = async (conversationId: string, otherUserId: string) => {
        setSelectedConversationId(conversationId);
        // If the conversation doesn't exist yet, create it
        const convRef = doc(firestore, 'conversations', conversationId);
        const convSnap = await getDoc(convRef);

        if (!convSnap.exists() && userProfile) {
            const otherUserDoc = await getDoc(doc(firestore, 'users', otherUserId));
            if (!otherUserDoc.exists()) return;

            const newConversationData = {
                participants: [userProfile.uid, otherUserId],
                participantDetails: {
                    [userProfile.uid]: { fullName: userProfile.fullName },
                    [otherUserId]: { fullName: otherUserDoc.data().fullName },
                },
                lastUpdatedAt: serverTimestamp(),
                unreadBy: { [userProfile.uid]: false, [otherUserId]: false }
            };
            await setDoc(convRef, newConversationData);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversationId || !userProfile) return;

        const currentConversation = conversations.find(c => c.id === selectedConversationId);
        let otherParticipantId = currentConversation?.participants.find(p => p !== userProfile.uid);
        
        if(!otherParticipantId) {
            const convDoc = await getDoc(doc(firestore, 'conversations', selectedConversationId));
            const participants = convDoc.data()?.participants;
            const otherId = participants.find((p: string) => p !== userProfile.uid);
            if (!otherId) return;
            otherParticipantId = otherId;
        }

        const msgRef = collection(firestore, 'conversations', selectedConversationId, 'messages');
        await addDoc(msgRef, { text: newMessage, senderId: userProfile.uid, createdAt: serverTimestamp() });
        
        const convRef = doc(firestore, 'conversations', selectedConversationId);
        await updateDoc(convRef, { lastMessage: newMessage, lastUpdatedAt: serverTimestamp(), [`unreadBy.${otherParticipantId}`]: true });

        setNewMessage("");
    };

    if (loading) return <div>Loading conversations...</div>;

    return (
        <div className="flex h-[calc(100vh-120px)] w-full max-w-6xl mx-auto bg-zinc-900 rounded-lg border border-zinc-800">
            {/* Left Panel: Conversation List */}
            <div className="w-1/3 border-r border-zinc-800 flex flex-col">
                <div className="p-4 border-b border-zinc-800">
                    <h2 className="text-xl font-bold text-white">Chats</h2>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {conversations.map(conv => {
                        const otherUserId = conv.participants.find(p => p !== userProfile?.uid);
                        if (!otherUserId) return null;
                        const otherUserDetails = conv.participantDetails[otherUserId];
                        const isUnread = conv.unreadBy?.[userProfile?.uid ?? ''] === true;

                        return (
                            <div key={conv.id} onClick={() => setSelectedConversationId(conv.id)}
                                className={`p-4 cursor-pointer border-b border-zinc-800 hover:bg-zinc-700 transition-colors ${selectedConversationId === conv.id ? 'bg-zinc-800' : ''}`}>
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold text-white">{otherUserDetails.fullName}</p>
                                    {isUnread && <div className="w-2.5 h-2.5 bg-sky-500 rounded-full"></div>}
                                </div>
                                <p className="text-sm text-gray-400 truncate">{conv.lastMessage || "No messages yet"}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right Panel: Chat Window */}
            <div className="w-2/3 flex flex-col">
                {selectedConversationId ? (
                    <>
                        <div className="flex-grow p-4 overflow-y-auto space-y-4">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.senderId === userProfile?.uid ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`p-3 rounded-lg max-w-lg ${msg.senderId === userProfile?.uid ? 'bg-sky-700 text-white' : 'bg-zinc-700 text-white'}`}>
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="p-4 border-t border-zinc-800 flex gap-2">
                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                rows={1}
                                className="flex-grow bg-zinc-800 border-zinc-700 rounded-lg p-2 text-sm focus:ring-sky-500 focus:border-sky-500 resize-none"
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                            />
                            <Button onClick={handleSendMessage} disabled={!newMessage.trim()}><Send size={16} /></Button>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Select a conversation to start chatting.</p>
                    </div>
                )}
            </div>
        </div>
    );
}