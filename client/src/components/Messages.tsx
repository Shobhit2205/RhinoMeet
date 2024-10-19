import { useCallback, useEffect, useRef, useState } from "react"
import { useSocket } from "../context/SocketProvider"
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send } from "lucide-react";

interface MessageProps{
    remoteSocketId: string | null;
    messagesArray: Array<{ sender: string; message: string; }>;
    setMessagesArray: React.Dispatch<React.SetStateAction<Array<{ sender: string; message: string }>>>;
}

interface RecievedMessageProps {
    message: string;
    from: string;
}

export default function Messages({remoteSocketId, messagesArray, setMessagesArray}: MessageProps) {
    const {socket} = useSocket();
    const [message, setMessage] = useState<string>('');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null); // Ref for input to set focus

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messagesArray]);

    const handleSendMessage = () => {
        // Prevent sending empty messages or if remoteSocketId is null
        if (!message.trim() || !remoteSocketId) return;

        // Add message to the messagesArray state with 'You' as the sender
        setMessagesArray((prev) => [...prev, {sender: 'You', message: message.trim()}]);

        // Clear message input after sending
        setMessage('');
        
        // Emit the message to the socket
        socket?.emit("send:message", {message: message.trim(), to: remoteSocketId});

        // Set focus back to the input field for easier typing (FIX #1)
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Send message when "Enter" key is pressed
        if (e.key === "Enter") {
          handleSendMessage();
        }
    };

    const handleMessageRecieved = useCallback(({message}: RecievedMessageProps) => {
        // Add received message to the state array with 'Stranger' as the sender
        setMessagesArray((prev) => [...prev, {sender: 'Stranger', message}])
    }, [setMessagesArray]);

    useEffect(() => {
        socket?.on("message:recieved", handleMessageRecieved);

        return () => {
            socket?.off("message:recieved", handleMessageRecieved);
        }
    }, [handleMessageRecieved, socket]);

    return (
        <div className="flex flex-1 flex-col h-full">

            {/* Messages Area */}
            <div className="h-full overflow-y-auto p-4 bg-gray-200 dark:bg-gray-900 scrollbar-hide">
                {messagesArray.map((msg, ind) => (
                    <div key={ind} className="mb-2">
                        <strong className={`${msg.sender === 'You' ? 'text-green-600' : 'text-red-500'}`}>{msg.sender}:</strong> {msg.message}
                    </div>
                ))}
                {/* Invisible div to scroll into view when new messages are added */}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="sticky bottom-0 left-0 w-full flex gap-2 border-t border-gray-200 dark:border-gray-700 p-4">
                <Input 
                    ref={inputRef} // Assign input ref to control focus (FIX #1)
                    placeholder="Type a message..." 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} 
                    onKeyDown={handleKeyDown}
                    aria-label="Message input" // Add aria-label for accessibility (FIX #3)
                    disabled={!remoteSocketId} // Disable input when no remoteSocketId (FIX #4)
                    className="flex-1 bg-gray-200 dark:bg-gray-900"
                />
                <Button 
                    className="gap-2" 
                    onClick={handleSendMessage} 
                    disabled={!remoteSocketId || !message.trim()} // Disable if no message or no connection
                    aria-label="Send message" // Add aria-label for accessibility (FIX #3)
                >
                    <Send size={18} /> Send
                </Button>
            </div>
        </div>
    );
}
