import React, {useEffect, useState, useRef, useCallback} from 'react';
import {useSearchParams, Link, useNavigate} from 'react-router-dom';
import apiClient from '../api';
import {Send, MessageSquare, User, Trash2} from 'lucide-react';
import axios from 'axios';

interface Dialogue {
    id: number;
    productId: number;
    productName: string;
    productImage: string;
    interlocutorName: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
}

interface Message {
    id: number;
    text: string;
    senderId: number;
    senderName: string;
    isMine: boolean;
    isRead: boolean;
    createdAt: string;
}

export const ChatPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const activeDialogueId = searchParams.get('dialogue');

    const draftProductId = searchParams.get('product');
    const draftRecipientId = searchParams.get('recipient');
    const draftName = searchParams.get('name');

    const [dialogues, setDialogues] = useState<Dialogue[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');

    // Состояние для хранения полной инфы о товаре (для карточки)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [productDetails, setProductDetails] = useState<any>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchDialogues = useCallback(async () => {
        try {
            const res = await apiClient.get<Dialogue[]>('/chat');
            setDialogues(res.data);
        } catch (error) {
            console.error(error);
        }
    }, []);

    const fetchMessages = useCallback(async () => {
        if (!activeDialogueId) {
            setMessages([]);
            return;
        }
        try {
            const res = await apiClient.get<Message[]>(`/chat/${activeDialogueId}/messages`);
            setMessages(res.data);
        } catch (error) {
            console.error(error);
        }
    }, [activeDialogueId]);

    // Загружаем инфо о товаре для красивой шапки
    const fetchProductDetails = useCallback(async (productId: string | number) => {
        try {
            const res = await apiClient.get(`/products/${productId}`);
            setProductDetails(res.data);
        } catch (error) {
            console.error('Ошибка загрузки товара для чата', error);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void fetchDialogues();
        void fetchMessages();

        // Подгружаем товар для активного диалога или черновика
        const activeDiag = dialogues.find(d => d.id.toString() === activeDialogueId);
        if (activeDiag) {
            fetchProductDetails(activeDiag.productId);
        } else if (draftProductId) {
            fetchProductDetails(draftProductId);
        }

        const interval = setInterval(() => {
            void fetchDialogues();
            void fetchMessages();
        }, 2000);
        return () => clearInterval(interval);
    }, [fetchDialogues, fetchMessages, activeDialogueId, draftProductId, dialogues, fetchProductDetails]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const res = await apiClient.post('/chat/send', {
                text: newMessage,
                dialogueId: activeDialogueId || null,
                productId: draftProductId || null,
                recipientId: draftRecipientId || null
            });

            setNewMessage('');
            if (!activeDialogueId && res.data) {
                setSearchParams({dialogue: res.data.toString()});
            } else {
                void fetchMessages();
                void fetchDialogues();
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                alert(error.response?.data?.message || 'Ошибка при отправке');
            }
        }
    };

    const handleDeleteDialogue = async (e: React.MouseEvent, dialogueId: number) => {
        e.stopPropagation();
        if (!window.confirm('Вы уверены, что хотите навсегда удалить этот диалог?')) return;

        try {
            await apiClient.delete(`/chat/${dialogueId}`);
            if (activeDialogueId === dialogueId.toString()) {
                navigate('/chat');
                setProductDetails(null);
            }
            void fetchDialogues();
        } catch (error) {
            console.error(error);
            alert('Не удалось удалить диалог');
        }
    };

    const activeDialogue = dialogues.find(d => d.id.toString() === activeDialogueId);
    const isDraftMode = !activeDialogueId && draftProductId;

    // Находим главное фото для карточки товара
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mainImage = productDetails?.images?.find((img: any) => img.isMain)?.imageUrl || productDetails?.images?.[0]?.imageUrl || '';

    return (
        <div className="container mx-auto mt-4 px-4 h-[85vh] flex gap-6 pb-4">

            {/* ЛЕВАЯ ПАНЕЛЬ: Только существующие диалоги */}
            <div className="w-1/3 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                    <h2 className="text-xl font-black text-slate-800 flex items-center">
                        <MessageSquare className="mr-2 text-indigo-500"/> Диалоги
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {dialogues.length === 0 ? (
                        <div className="text-center p-10 text-slate-400 text-sm italic">История сообщений пуста</div>
                    ) : (
                        dialogues.map(d => (
                            <div
                                key={d.id}
                                onClick={() => setSearchParams({ dialogue: d.id.toString() })}
                                className={`p-4 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50 group ${activeDialogueId === d.id.toString() ? 'bg-indigo-50/50 border-l-4 border-indigo-500' : 'border-l-4 border-l-transparent'}`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-slate-800 text-sm">{d.interlocutorName}</span>
                                    <div className="flex items-center gap-2">
                                        {d.unreadCount > 0 && (
                                            <span
                                                className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">НОВОЕ</span>
                                        )}
                                        <button
                                            onClick={(e) => handleDeleteDialogue(e, d.id)}
                                            className="text-slate-300 hover:text-red-500 p-1 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div
                                    className="text-[9px] text-indigo-500 font-bold uppercase truncate">{d.productName}</div>
                                <p className="text-xs text-slate-400 truncate mt-1">{d.lastMessage}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ПРАВАЯ ПАНЕЛЬ */}
            <div className="w-2/3 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                {(!activeDialogueId && !isDraftMode) ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <MessageSquare size={64} className="mb-4 text-slate-100"/>
                        <p className="font-bold uppercase tracking-widest text-xs">Выберите диалог для общения</p>
                    </div>
                ) : (
                    <>
                        {/* ШАПКА ЧАТА */}
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center">
                                <div
                                    className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center mr-3 font-black shadow-lg shadow-indigo-100 shrink-0">
                                    {(activeDialogue?.interlocutorName || draftName || "?")[0]}
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-800">
                                        {activeDialogue ? activeDialogue.interlocutorName : draftName}
                                    </h3>
                                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-0.5">
                                        {isDraftMode ? 'Связь по товару' : 'Собеседник'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {productDetails && (
                                    <Link to={`/product/${productDetails.id}`}
                                          className="flex items-center bg-white p-2 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all shadow-sm max-w-[220px] group">
                                        <div className="h-10 w-10 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                                            <img
                                                src={`http://localhost:8080/uploads/${mainImage}`}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                alt=""
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://placehold.co/100x100?text=No+Img';
                                                }}
                                            />
                                        </div>
                                        <div className="ml-3 flex flex-col justify-center overflow-hidden pr-2">
                        <span className="text-xs font-bold text-slate-800 truncate leading-tight">
                            {productDetails.name}
                        </span>
                                            <span className="text-[10px] font-black text-indigo-600 mt-0.5">
                            {productDetails.price} BYN
                        </span>
                                        </div>
                                    </Link>
                                )}

                            </div>
                        </div>

                        {/* ИСТОРИЯ СООБЩЕНИЙ */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full opacity-30 grayscale">
                                    <User size={48} className="mb-2"/>
                                    <p className="text-xs font-bold uppercase tracking-[0.2em]">Начните диалог
                                        первым</p>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div key={msg.id}
                                         className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
                                        <div
                                            className={`max-w-[75%] p-4 rounded-2xl shadow-sm ${msg.isMine ? 'bg-slate-900 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'}`}>
                                            <p className="text-sm leading-relaxed">{msg.text}</p>
                                            <p className={`text-[8px] mt-2 font-bold uppercase ${msg.isMine ? 'text-slate-400' : 'text-slate-300'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef}/>
                        </div>

                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-50 flex gap-3">
                            <input
                                type="text"
                                placeholder="Ваше сообщение..."
                                className="flex-1 bg-slate-100 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button type="submit" disabled={!newMessage.trim()}
                                    className="bg-indigo-600 text-white w-14 h-14 flex items-center justify-center rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-90 disabled:bg-slate-200 disabled:shadow-none">
                                <Send size={20}/>
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};