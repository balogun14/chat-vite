// src/lib/signalR.ts
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { create } from 'zustand';


export interface UserDto{
    id:string;
    name:string;
}


export interface MessageDto {
  id: string;
  channelId: string;
  content: string;
  timestamp: Date;
  user: UserDto;
  lastEdited?: Date | null;
  lastEditedbY?: UserDto | null;
}

interface ChatStore {
  connection: HubConnection | null;
  messages: MessageDto[];
  connect: (channelId: string, token: string) => Promise<void>;
  disconnect: () => Promise<void>;
  sendMessage: (channelId: string, content: string) => Promise<string>;
  addMessage: (message: MessageDto) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  connection: null,
  messages: [],
  
  connect: async (channelId: string, token: string) => {
    try {
        const connection = new HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_API_URL}/hubs/chat?channelId=${channelId}`, {
            accessTokenFactory: () => token,
            headers: {
                Authorization: `Bearer ${token}`  
            }
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      // Set up message received handler
      connection.on('MessagePosted', (message: MessageDto) => {
        get().addMessage(message);
      });

      await connection.start();
      set({ connection });
      
      console.log('Connected to SignalR hub');
    } catch (error) {
      console.error('SignalR connection error:', error);
      throw error;
    }
  },

  disconnect: async () => {
    const { connection } = get();
    if (connection) {
      await connection.stop();
      set({ connection: null });
    }
  },

  sendMessage: async (channelId: string, content: string) => {
    const { connection } = get();
    if (!connection) {
      throw new Error('No SignalR connection');
    }
    return await connection.invoke('PostMessage', channelId, content);
  },

  addMessage: (message: MessageDto) => {
    set(state => ({
      messages: [...state.messages, message]
    }));
  },
}));