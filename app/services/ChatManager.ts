// Importing necessary modules
import {
  prepareUploadFile,
  initializeAssistant,
  createChatThread,
  runChatAssistant
} from '../modules/assistantModules';

import {
  submitUserMessage,
  fetchAssistantResponse,
  updateChatState
} from '../modules/chatModules';

/**
 * Interface for the state of the chat
 */
interface ChatState {
  assistantId: string | null; // ID of the assistant
  threadId: string | null; // ID of the chat thread
  messages: any[]; // Array of messages
  isLoading: boolean; // Loading state
  error: Error | null; // Any error that occurred
  runId: string | null; // ID of the assistant run
  assistantResponseReceived: boolean; // Whether the assistant's response has been received
  isSending: boolean; // Whether a message is being sent
  setChatMessages: (messages: any[]) => void; // Function to set the chat messages
  setStatusMessage: (message: string) => void; // Function to set the status message
  statusMessage:string; // Status message
  setProgress: (progress: number) => void; // Function to set the progress
  setIsLoadingFirstMessage: (isLoading: boolean) => void;
}

/**
 * Class to manage the state and operations of the chat
 */
class ChatManager {

  private state: ChatState; // State of the chat
  private static instance: ChatManager | null = null; // Singleton instance of the ChatManager

  // Private constructor for singleton pattern
  private constructor(setChatMessages: (messages: any[]) => void, setStatusMessage: (message: string) => void, setProgress: (progress: number) => void, setIsLoadingFirstMessage: (isLoading: boolean) => void) {
    // Initialize the state
    this.state = {
      assistantId: null,
      threadId: null,
      messages: [],
      isLoading: false,
      error: null,
      runId: null,
      assistantResponseReceived: false,
      isSending: false,
      setChatMessages: setChatMessages,
      setStatusMessage: setStatusMessage,
      statusMessage: '',
      setProgress: setProgress,
      setIsLoadingFirstMessage: setIsLoadingFirstMessage,
    };
    console.log('ChatManager initialized');
  }
  
  // Method to get the current messages
  public getCurrentMessages(): any[] {
    return this.state.messages;
  }

  private updateLocalStorage(threadId: string, messages: any[]): void {
    // Get existing chatThreads from localStorage
    const chatThreads = JSON.parse(localStorage.getItem('chatThreads') || '[]');
    
    // Find the thread by id in the chatThreads
    const threadIndex = chatThreads.findIndex((thread: any) => thread.id === threadId);
  
    if (threadIndex !== -1) {
      // If thread exists, add or update the messages key
      chatThreads[threadIndex].messages = messages;
    } else {
      // If thread does not exist, add a new thread with the id and messages
      chatThreads.push({ id: threadId, messages: messages });
    }
  
    // Store the updated chatThreads back to localStorage
    localStorage.setItem('chatThreads', JSON.stringify(chatThreads));
    
  }
  

  // Method to get the singleton instance of the ChatManager
  public static getInstance(setChatMessages: (messages: any[]) => void, setStatusMessage: (message: string) => void, setProgress: (progress: number) => void, setIsLoadingFirstMessage: (isLoading: boolean) => void): ChatManager { // Add setIsLoadingFirstMessage here
    if (this.instance === null) {
      this.instance = new ChatManager(setChatMessages, setStatusMessage, setProgress, setIsLoadingFirstMessage); // And here
    }
    return this.instance;
  }

  // Method to start the assistant
  async startAssistant(assistantDetails: any, fileIds: string[], initialMessage: string): Promise<void> {
    console.log('Starting assistant...');
    
    this.state.setStatusMessage('Initializing chat assistant...');
    this.state.isLoading = true;
    
    try {

    
      // Initialize the assistant
      this.state.setStatusMessage('Create Assistant...');
      const assistantId = await initializeAssistant(assistantDetails, fileIds);
      if (assistantId === null) {
        throw new Error('AssistantId is null');
      }
      this.state.setStatusMessage('Assistant created...');
  
      // Create the chat thread
      this.state.setStatusMessage('Creating thread...');
      this.state.assistantId = assistantId;
      const threadId = await createChatThread(initialMessage);
      if (threadId === null) {
        throw new Error('ThreadId is null');
      }
      this.state.setStatusMessage('Received thread_ID...');
  
      // Run the assistant
      this.state.setStatusMessage('Running assistant...');
      this.state.threadId = threadId;
      const runId = await runChatAssistant(this.state.assistantId, this.state.threadId);
      if (runId === null) {
        throw new Error('RunId is null');
      }
      
      // Store the run ID
      this.state.runId = runId; 
      this.state.setStatusMessage('Received Run_ID..');
  
      // Fetch the assistant's response
      if (this.state.runId && this.state.threadId) {
        const runId = this.state.runId as string;
        const threadId = this.state.threadId as string;
        this.state.setStatusMessage('checking status...');
        const response = await fetchAssistantResponse(
          this.state.runId as string, 
          this.state.threadId as string, 
          this.state.setStatusMessage, 
          this.state.setProgress,
          40 // initialProgress
        );        
        this.state.setStatusMessage('Run complete...');
        this.state.assistantResponseReceived = true;
        this.state.setStatusMessage('Received messages...');
        
        // Add the assistant's response to the messages
        const newMessage = { role: 'assistant', content: response.message };
        this.state.setStatusMessage('Adding messages to chat...');

        // Update the localStorage with the new messages
        this.updateLocalStorage(this.state.threadId as string, this.state.messages);
        
        this.state.messages = [...this.state.messages, newMessage];
        this.state.setChatMessages(this.state.messages);

      } else {
        console.error('RunId or ThreadId is null. Current state:', this.state);
      }
  
    } catch (error) {
      // Handle any errors
      this.state.error = error as Error;
      this.state.setStatusMessage(`Error: ${this.state.error.message}`);
      console.error('Error in starting assistant:', error);
    } finally {
      // Finalize the operation
      this.state.setStatusMessage('Done');
      this.state.isLoading = false;
    }
  }

// Method to start the assistant with a given ID
async startAssistantWithId(assistantId: string, initialMessage: string, initialThreadId?: string): Promise<void> {
  try {

    this.state.setIsLoadingFirstMessage(true);
    // Create the chat thread
    this.state.setStatusMessage('Creating thread...');
    this.state.setProgress(10); // Set progress to 10%
    this.state.assistantId = assistantId;
    let threadId = initialThreadId;
    if(!threadId) threadId = await createChatThread(initialMessage)

    if (threadId === null) {
      throw new Error('ThreadId is null');
    }
    this.state.setStatusMessage('Received thread_ID...');
    this.state.setProgress(20); // Set progress to 20%

    // Run the assistant
    this.state.setStatusMessage('Running assistant...');
    this.state.setProgress(30); // Set progress to 30%
    this.state.threadId = threadId;

    if(!initialThreadId){
      const runId = await runChatAssistant(this.state.assistantId, this.state.threadId);
      if (runId === null) {
        throw new Error('RunId is null');
      }
  
      this.state.runId = runId; 
    }
    this.state.setStatusMessage('Received Run_ID..');
    this.state.setProgress(40); // Set progress to 40%

    // Fetch the assistant's response
    if (initialThreadId || this.state.threadId) {
      const runId = this.state.runId as string;
      const threadId = (initialThreadId || this.state.threadId) as string;
      this.state.setStatusMessage('checking status...');
      const assistantResponse = await fetchAssistantResponse(initialThreadId ? "" : runId, threadId, this.state.setStatusMessage, this.state.setProgress, 10);
      console.log("RESPUESTA ASSISTANT", assistantResponse)
      this.state.setStatusMessage('Run complete...');
      this.state.assistantResponseReceived = true;
      this.state.setStatusMessage('Received messages...');
      
      // Add the assistant's response to the messages
      const newMessage = { role: 'assistant', content: assistantResponse.message };
      this.state.setStatusMessage('Adding messages to chat...');
      

      let messages = initialThreadId 
        ? assistantResponse.history.map(message => ({
            role: message.role, 
            content: message.content[0].text.value
          }))
        : [...this.state.messages, newMessage];

      // Si es necesario, invierte los mensajes
      if (initialThreadId) {
        messages = messages.reverse(); 
        messages = messages.slice(1)
      }

      this.state.messages = messages;
      this.state.setChatMessages(this.state.messages);
      this.state.setIsLoadingFirstMessage(false);
      //this.state.setProgress(0);

      // Update the localStorage with the new messages
      this.updateLocalStorage(this.state.threadId as string, this.state.messages);

    } else {
      console.error('RunId or ThreadId is null. Current state:', this.state);
    }
  } catch (error) {
    // Handle any errors
    this.state.setStatusMessage('Error!');
    this.state.error = error as Error;
    console.error('Error in starting assistant:', error);
  } finally {
    // Finalize the operation
    this.state.setStatusMessage('Done');
    this.state.setProgress(0);
    this.state.isLoading = false;
  }
}

// Method to send a message
async sendMessage(input: string, files: File[], fileDetails: any[]): Promise<void> { // Add a new parameter for the files
  console.log('Sending message...');
  this.state.setProgress(0);
  this.state.isSending = true; 
  const newUserMessage = { role: 'user', content: input, fileDetails: fileDetails };
  this.state.messages = [...this.state.messages, newUserMessage];
  this.state.setChatMessages(this.state.messages);

  try {
    if (this.state.threadId && this.state.assistantId) { 
      
      // Upload the files if there are any
      let ChatFileIds: string[] = [];
      if (files.length > 0) {
        this.state.setStatusMessage('Starting upload...');
        console.log('Files in Chat:', files);
        ChatFileIds = await Promise.all(files.map(file => prepareUploadFile(file, this.state.setStatusMessage)));
        console.log('File IDs during Chat:', ChatFileIds);
        if (ChatFileIds.map(String).includes('null')) {
          throw new Error('One or more file IDs are null');
        }
        this.state.setStatusMessage('Upload complete..');
      }
      console.log('File IDs during Chat:', ChatFileIds);
      // Submit the user's message
      await submitUserMessage(input, this.state.threadId, this.state.setStatusMessage, ChatFileIds); // Pass the file IDs here
      console.log('User message submitted. Running assistant...');
      
      // Run the assistant
      this.state.runId = await runChatAssistant(this.state.assistantId as string, this.state.threadId as string);
      console.log('Assistant run successfully. Fetching assistant response...');
      
      // Fetch the assistant's response
      const response = await fetchAssistantResponse(this.state.runId as string, this.state.threadId as string, this.state.setStatusMessage, this.state.setProgress,0);
      console.log('Assistant response fetched. Adding to chat state...');
      
      
      // Add the assistant's response to the messages
      const newAssistantMessage = { role: 'assistant', content: response.message };
      this.state.messages = [...this.state.messages, newAssistantMessage];
      this.state.setChatMessages(this.state.messages);

      // Update the localStorage with the new messages
      this.updateLocalStorage(this.state.threadId as string, this.state.messages);
      
    } else {
      console.error('ThreadId or AssistantId is null');
    }
  } catch (error) {
    // Handle any errors
    this.state.error = error as Error;
    console.error('Error in sending message:', error);
  } finally {
    // Finalize the operation
    this.state.setProgress(0);
    this.state.isSending = false; 
  }
}

  // Method to get the current chat state
  getChatState(): ChatState {
    console.log('Getting chat state');
    return this.state;
  }
}


export default ChatManager;