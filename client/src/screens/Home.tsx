import { useCallback, useEffect } from "react";
import { Button } from "../components/ui/button";
import { useSocket } from "../context/SocketProvider";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import LogoContent from "../components/LogoContent";
import { Github } from "lucide-react";
import { Helmet } from "react-helmet-async";
import "./Home.css"; // Import the new CSS file

export default function Home() {
  const { socket, setSocket } = useSocket();
  const navigate = useNavigate();

  // Handle the Start button click with transition effect
  const handleStartCall = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();

      // Trigger animation before navigating
      document.body.classList.add("page-leave-animation");

      // Delay navigation to allow the animation to play
      setTimeout(() => {
        navigate("/chat");
      }, 500); // Adjust this to match the animation duration

      if (!socket) {
        const newSocket = io(import.meta.env.VITE_API_SERVER_URL);
        setSocket(newSocket);
      }
    },
    [setSocket, socket, navigate]
  );

  useEffect(() => {
    // Optionally trigger other actions when the component mounts
    document.body.classList.remove("page-leave-animation"); // Remove animation class after mount
  }, []);

  return (
    <>
      <Helmet>
        <title>RhinoMeet</title>
        <meta
          name="description"
          content="RhinoMeet is an innovative video chat application designed to connect users from all around the world for spontaneous and engaging conversations. Built with a focus on ease of use and seamless interaction, RhinoMeet allows users to effortlessly start video calls, share screens, and exchange messages in real-time. Whether you're seeking to meet new people, collaborate on projects, or simply enjoy face-to-face interactions, RhinoMeet delivers a smooth experience with user-friendly features. It prioritizes privacy, utilizing encrypted connections to ensure that all communications are secure. The platform's sleek and modern design, combined with features like quick user pairing, screen sharing, and integrated messaging, makes RhinoMeet a go-to choice for both casual and professional video chatting."
        />
        <meta
          name="keywords"
          content="omegle, Random Video chat, Random call, Video call, omegle clone, omegle type apps, Rhinomeet, rhinomeet.com, meet, random chat, messages, video chat, screen sharing, real-time messaging, secure video calls"
        />
      </Helmet>

      {/* Background Video */}
      <div className="video-background-container">
        <video
          className="background-video"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="https://your-video-url.com/sample-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Overlay Content */}
      <div className="flex flex-col items-center justify-center w-full h-full px-16 py-4 max-md:px-8 home-container">
        <div className="flex items-end gap-4">
          {/* Add the class for animation */}
          <svg
            version="1.0"
            xmlns="http://www.w3.org/2000/svg"
            width="1508.204676pt"
            height="836.077412pt"
            viewBox="0 0 1508.204676 836.077412"
            preserveAspectRatio="xMidYMid meet"
            className="h-auto w-[350px] max-lg:w-[200px] max-md:w-[100px] text-black dark:text-white running-rhino"
          >
            <LogoContent />
          </svg>
          <div className="text-[100px] max-lg:text-[60px] max-md:text-[30px] font-bold mb-[-39px] max-lg:mb-[-24px] max-md:mb-[-12px] font-serif">
            RhinoMeet
          </div>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 shadow-lg flex flex-col items-center justify-center text-center gap-8 p-8 md:p-12 border rounded-2xl backdrop-blur-md">
          <div className="text-gray-900 dark:text-gray-100 leading-relaxed space-y-4 font-serif">
            RhinoMeet is an innovative video chat application designed to connect
            users from all around the world for spontaneous and engaging
            conversations. Built with a focus on ease of use and seamless
            interaction, RhinoMeet allows users to effortlessly start video
            calls, share screens, and exchange messages in real-time. Whether
            you're seeking to meet new people, collaborate on projects, or
            simply enjoy face-to-face interactions, RhinoMeet delivers a smooth
            experience with user-friendly features. It prioritizes privacy,
            utilizing encrypted connections to ensure that all communications
            are secure. The platform's sleek and modern design, combined with
            features like quick user pairing, screen sharing, and integrated
            messaging, makes RhinoMeet a go-to choice for both casual and
            professional video chatting.
          </div>
          <div className="flex gap-2 items-center font-bold text-xl max-lg:flex-col font-serif">
            Any contribution to the community is highly appreciated.
            <a
              href="https://github.com/Shobhit2205/RhinoMeet"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="flex gap-2 font-bold tracking-widest">
                <Github size={18} />
                Github
              </Button>
            </a>
          </div>
          <Button
            className="w-full max-w-xs py-3 text-lg font-semibold font-serif tracking-widest shadow-md start-btn"
            onClick={(e) => handleStartCall(e)}
          >
            START
          </Button>
        </div>
      </div>
    </>
  );
}
