import { createContext, ReactNode, useContext, useState } from "react";
import { Socket } from 'socket.io-client'

interface ISocketContext {
    socket: Socket | null;
    setSocket: (socket: Socket | null) => void;
}

const SocketContext = createContext<ISocketContext | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => {
    const context = useContext(SocketContext);
    if(!context){
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
}

export const SocketProvider = ({children} : {children: ReactNode}) => {
    // const socket = useMemo(() => io('http://localhost:8000'), []);
    const [socket, setSocket] = useState<Socket | null>(null);

    return (
        <SocketContext.Provider value={{socket, setSocket}}>
            {children}
        </SocketContext.Provider>
    )
}