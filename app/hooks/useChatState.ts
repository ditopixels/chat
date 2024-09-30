// useChatState.ts
import { useState, useRef, useEffect } from 'react';
import ChatManager from '../services/ChatManager';

type FileDetail = {
  name: string;
  type: string;
  size: number;
};

type ThreadHistory = {
  threadId: string;
  messages: { role: string; content: string }[];
};

export const useChatState = () => {
  const [assistantName, setAssistantName] = useState('');
  const [assistantModel, setAssistantModel] = useState('gpt-3.5-turbo-1106');
  const [assistantDescription, setAssistantDescription] = useState('');
  const [inputmessage, setInputmessage] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: string; content: any }[]>([]);
  const [chatStarted, setChatStarted] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isStartLoading, setStartLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [initialThreadMessage, setInitialThreadMessage] = useState('Presentate');
  const [statusMessage, setStatusMessage] = useState('');
  const counter = useRef(0);
  const inputRef = useRef(null);
  const formRef = useRef(null);
  const [chatManager, setChatManager] = useState<ChatManager | null>(null);
  const [assistantId, setAssistantId] = useState<string | null>(process.env.REACT_APP_ASSISTANT_ID || '');
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoadingFirstMessage, setIsLoadingFirstMessage] = useState(false);
  const [chatUploadedFiles, setChatUploadedFiles] = useState<File[]>([]);
  const [chatFileDetails, setChatFileDetails] = useState<FileDetail[]>([]);
  const [fileIds, setFileIds] = useState<string[]>([]);

  // Estado para manejar el historial de hilos
  const [threadHistory, setThreadHistory] = useState<ThreadHistory[]>([]);
  
  // Función para cargar hilos desde localStorage solo si tienen mensajes
  const loadThreadsFromLocalStorage = () => {
    // Obtiene los hilos almacenados en el localStorage
    const storedThreads = JSON.parse(localStorage.getItem('chatThreads') || '[]');
  
    // Filtra los hilos que tengan al menos un mensaje con role 'user'
    const validThreads = storedThreads.filter((thread: ThreadHistory) => 
      thread.messages && thread.messages.some((message: any) => message.role === 'user')
    );
  
    // Actualiza el estado con los hilos válidos
    setThreadHistory(validThreads);
  
  };

  // Efecto para cargar los hilos desde localStorage al inicializar
  useEffect(() => {
    loadThreadsFromLocalStorage();
  }, [chatMessages]);


  return {
    assistantName, setAssistantName,
    assistantModel, setAssistantModel,
    assistantDescription, setAssistantDescription,
    inputmessage, setInputmessage,
    chatMessages, setChatMessages,
    chatStarted, setChatStarted,
    isButtonDisabled, setIsButtonDisabled,
    files, setFiles,
    assistantId, setAssistantId,
    threadId, setThreadId,
    isStartLoading, setStartLoading,
    isSending, setIsSending,
    statusMessage, setStatusMessage,
    counter,
    inputRef,
    formRef,
    initialThreadMessage, setInitialThreadMessage,
    chatManager, setChatManager,
    isMessageLoading, setIsMessageLoading,
    progress, setProgress,
    isLoadingFirstMessage, setIsLoadingFirstMessage,
    chatUploadedFiles, setChatUploadedFiles,
    chatFileDetails, setChatFileDetails,
    fileIds, setFileIds,
    threadHistory, setThreadHistory,
  };
};
