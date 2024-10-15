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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      };

      useEffect(() => {
        scrollToBottom();
      }, [messagesArray]);

    const handleSendMessage = () => {
        if (!message.trim() || !remoteSocketId) return;
        setMessagesArray((prev) => [...prev, {sender: 'You', message}]);
        setMessage('');
        socket?.emit("send:message", {message, to: remoteSocketId});
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          handleSendMessage();
        }
    };

    const handleMessageRecieved = useCallback(({message, from}: RecievedMessageProps) => {
        console.log("Message Recieved : ", message);
        setMessagesArray((prev) => [...prev, {sender: 'Stranger', message}])
        console.log(from);
    }, [setMessagesArray]);

    useEffect(() => {
        socket?.on("message:recieved", handleMessageRecieved);

        return () => {
            socket?.off("message:recieved", handleMessageRecieved);
        }
    }, [handleMessageRecieved, socket]);

    return (
        <div className="flex flex-1 flex-col h-full">

            <div className="h-full overflow-y-auto p-4 bg-gray-200 dark:bg-gray-900 scrollbar-hide">
                {messagesArray.map((msg, ind) => (
                    <div key={ind} className="mb-2">
                        <strong className={`${msg.sender === 'You' ? 'text-green-600' : 'text-red-500'}`}>{msg.sender}:</strong> {msg.message}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>


            <div className="sticky bottom-0 left-0 w-full flex gap-2 border-t border-gray-200 dark:border-gray-700 p-4">
                <Input 
                    placeholder="Type a message..." 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} 
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-gray-200 dark:bg-gray-900"
                />
                <Button className="gap-2" onClick={handleSendMessage} disabled={remoteSocketId === null}><Send size={18} /> Send</Button>
            </div>
        </div>
    );
}
