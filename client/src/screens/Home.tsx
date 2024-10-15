import { useCallback } from "react";
import { Button } from "../components/ui/button";
import { useSocket } from "../context/SocketProvider";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import LogoContent from "../components/LogoContent";
import { Github } from "lucide-react";

export default function Home(){
    const {socket, setSocket} = useSocket();
    const navigate = useNavigate();
    
    const handleStartCall = useCallback((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        navigate('/chat');

        if(!socket){
            const newSocket = io(import.meta.env.VITE_API_SERVER_URL);
            setSocket(newSocket);
        }
        
    }, [setSocket, socket, navigate]);

    return (
        <div className="flex flex-col items-center justify-center w-full h-full px-16 py-4 max-md:px-8">
            <div className="flex items-end gap-4">
                <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                    width="1508.204676pt" height="836.077412pt" viewBox="0 0 1508.204676 836.077412"
                    preserveAspectRatio="xMidYMid meet" className="h-auto w-[350px] max-lg:w-[200px] max-md:w-[100px] text-black dark:text-white">
                    <LogoContent/>
                </svg>
                <div className="text-[100px] max-lg:text-[60px] max-md:text-[30px] font-bold mb-[-39px] max-lg:mb-[-24px] max-md:mb-[-12px] font-serif">RhinoMeet</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 shadow-lg flex flex-col items-center justify-center text-center gap-8 p-8 md:p-12  border rounded-2xl">
                <div className="text-gray-900 dark:text-gray-100 leading-relaxed space-y-4 font-serif">
                RhinoMeet is an innovative video chat application designed to connect users from all around the world for spontaneous and engaging conversations. Built with a focus on ease of use and seamless interaction, RhinoMeet allows users to effortlessly start video calls, share screens, and exchange messages in real-time. Whether you're seeking to meet new people, collaborate on projects, or simply enjoy face-to-face interactions, RhinoMeet delivers a smooth experience with user-friendly features. It prioritizes privacy, utilizing encrypted connections to ensure that all communications are secure. The platform's sleek and modern design, combined with features like quick user pairing, screen sharing, and integrated messaging, makes RhinoMeet a go-to choice for both casual and professional video chatting.
                </div>
                <div className="flex gap-2 items-center font-bold text-xl max-lg:flex-col font-serif">Any contribution to the community is highly appreciated. 
                    <a href="https://github.com/Shobhit2205/RhinoMeet" target="_blank" rel="noopener noreferrer"
                    >
                        <Button className="flex gap-2 font-bold tracking-widest" ><Github size={18}/>Github</Button>
                    </a>
                </div>
                <Button className="w-full max-w-xs py-3 text-lg font-semibold font-serif  tracking-widest shadow-md" onClick={(e) => handleStartCall(e)}>START</Button>
            </div>
        </div>
    );
}
