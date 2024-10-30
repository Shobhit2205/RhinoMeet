import { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import peerservice from "../service/peer";
import ReactPlayer from "react-player";
import { Button } from "../components/ui/button";
import Messages from "../components/Messages";
import { ScreenShare, StepBack, StepForward } from "lucide-react";
import { ClipLoader } from "react-spinners"; // Import the spinner
import { useTheme } from "../components/theme-provider";
import { useNavigate } from "react-router-dom";
import "../css/VideoChat.css";

interface Offer {
  offer: RTCSessionDescriptionInit;
  from: string;
}

interface Answer {
  answer: RTCSessionDescriptionInit;
  from: string;
}

interface NegotiationDone {
  answer: RTCSessionDescriptionInit;
  to: string;
}

const MicIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    className={isActive ? "fill-red-500" : "fill-white"}
  >
    <path d="M24 28c3.31 0 5.98-2.69 5.98-6L30 10c0-3.32-2.68-6-6-6-3.31 0-6 2.68-6 6v12c0 3.31 2.69 6 6 6zm10.6-6c0 6-5.07 10.2-10.6 10.2-5.52 0-10.6-4.2-10.6-10.2H10c0 6.83 5.44 12.47 12 13.44V42h4v-6.56c6.56-.97 12-6.61 12-13.44h-3.4z" />
  </svg>
);

const VideoIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 100 100"
    className={isActive ? "fill-red-500" : "fill-white"}
  >
    <path d="M84.9 26.4L68 37.3V34c0-4.4-3.6-8-8-8H20c-4.4 0-8 3.6-8 8v32c0 4.4 3.6 8 8 8h40c4.4 0 8-3.6 8-8v-3.3l16.9 10.9c1.9 1 3.1-.7 3.1-1.7V28c0-1-1.1-2.8-3.1-1.6zM64 66c0 2.2-1.8 4-4 4H20c-2.2 0-4-1.8-4-4V34c0-2.2 1.8-4 4-4h40c2.2 0 4 1.8 4 4v32zm20 2.3L68 58V42l16-10.3v36.6z" />
  </svg>
);

export default function VideoChat() {
  const { socket } = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  const [flag, setFlag] = useState(false);
  const [messagesArray, setMessagesArray] = useState<
    Array<{ sender: string; message: string }>
  >([]);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const theme = useTheme();
  const navigate = useNavigate();

  const loaderColor = theme.theme === "dark" ? "#D1D5DB" : "#4B5563";

  const toggleMic = () => setIsMicOn((prev) => !prev);
  const toggleVideo = () => setIsVideoOn((prev) => !prev);

  const getUserStream = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000, // CD-quality audio sample rate
        sampleSize: 16, // Higher sample size
        channelCount: 2, // Stereo audio
      },
    });
    // const processedStream = processAudio(stream);
    setMyStream(stream);
  }, []);

  useEffect(() => {
    getUserStream();
  }, [getUserStream, myStream]);

  const sendStream = useCallback(() => {
    if (myStream) {
      // console.log("send Stream");
      const videoTrack = myStream.getVideoTracks()[0];
      const audioTrack = myStream.getAudioTracks()[0];

      const senders = peerservice.peer.getSenders();

      if (videoTrack) {
        const videoSender = senders.find((s) => s.track === videoTrack);
        if (!videoSender) {
          peerservice.peer.addTrack(videoTrack, myStream); // Add video first
        }
      }

      if (audioTrack) {
        const audioSender = senders.find((s) => s.track === audioTrack);
        if (!audioSender) {
          peerservice.peer.addTrack(audioTrack, myStream); // Add audio second
        }
      }
    }
  }, [myStream]);

  const handleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      const videoTrack = myStream?.getVideoTracks()[0];
      const screenSender = peerservice.peer
        .getSenders()
        .find((s) => s.track?.kind === "video");

      if (videoTrack && screenSender) {
        screenSender.replaceTrack(videoTrack);
      }

      // Stop all tracks in the screen stream
      screenStream?.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
      setMyStream(myStream); // Reset local view back to the webcam stream
      setIsScreenSharing(false);

      // Renegotiate after stopping screen sharing
      if (peerservice.peer.signalingState === "stable") {
        const offer = await peerservice.getOffer();
        socket?.emit("peer:nego:needed", { offer, to: remoteSocketId });
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        setScreenStream(stream);
        setMyStream(stream);
        setIsScreenSharing(true);

        const screenTrack = stream.getVideoTracks()[0];
        const videoSender = peerservice.peer
          .getSenders()
          .find((s) => s.track?.kind === "video");

        if (videoSender) {
          videoSender.replaceTrack(screenTrack);
        } else {
          peerservice.peer.addTrack(screenTrack, stream);
        }

        if (peerservice.peer.signalingState === "stable") {
          const offer = await peerservice.getOffer();
          socket?.emit("peer:nego:needed", { offer, to: remoteSocketId });
        }
      } catch (error) {
        console.error("Error sharing screen:", error);
      }
    }
  }, [isScreenSharing, myStream, screenStream, remoteSocketId, socket]);

  const setAudioBandwidth = (peerConnection: RTCPeerConnection) => {
    const sender = peerConnection
      .getSenders()
      .find((s) => s.track && s.track.kind === "audio");
    if (sender) {
      const parameters = sender.getParameters();
      parameters.encodings[0] = {
        maxBitrate: 128000, // Set a high bitrate for audio, 128 kbps
      };
      sender.setParameters(parameters);
    }
  };

  const handleUserJoined = useCallback(
    async (remoteId: string) => {
      setRemoteSocketId(remoteId);
      const offer = await peerservice.getOffer();

      socket?.emit("offer", { offer, to: remoteId });
      // console.log("user joined");
    },
    [socket]
  );

  const handleIncommingOffer = useCallback(
    async ({ offer, from }: Offer) => {
      setRemoteSocketId(from);
      await getUserStream();

      if (peerservice.peer.signalingState === "stable") {
        const answer = await peerservice.getAnswer(offer);
        setAudioBandwidth(peerservice.peer);
        socket?.emit("answer", { answer, to: from });
        // console.log("Answer created and sent");
        sendStream();
      } else {
        console.warn(
          "Cannot handle incoming offer in signaling state:",
          peerservice.peer.signalingState
        );
      }
    },
    [getUserStream, socket, sendStream]
  );

  const handleIncommingAnswer = useCallback(
    async ({ answer }: Answer) => {
      if (peerservice.peer.signalingState === "have-local-offer") {
        await peerservice.setRemoteDescription(answer);
        sendStream();
        // console.log("get Answer");
      } else {
        console.warn("Peer not in a proper state to set remote description.");
      }
    },
    [sendStream]
  );

  const modifySDP = (sdp: string) => {
    return sdp.replace(
      /a=fmtp:111 .*opus.*/,
      "a=fmtp:111 maxplaybackrate=48000;stereo=1;sprop-stereo=1;maxaveragebitrate=510000;useinbandfec=1"
    );
  };

  const handleNegotiationNeeded = useCallback(async () => {
    if (peerservice.peer.signalingState === "stable") {
      const currentOffer = await peerservice.getOffer();

      if (currentOffer && currentOffer.sdp) {
        const modifiedSDP = modifySDP(currentOffer.sdp);

        // Create a new RTCSessionDescription with the modified SDP
        const modifiedOffer = new RTCSessionDescription({
          type: currentOffer.type,
          sdp: modifiedSDP,
        });

        setAudioBandwidth(peerservice.peer);

        socket?.emit("peer:nego:needed", {
          offer: modifiedOffer,
          to: remoteSocketId,
        });

        // console.log("Negotiation initiated with modified SDP.");
      }
    } else {
      console.warn("Peer is not in a stable state for negotiation.");
    }
  }, [remoteSocketId, socket]);

  // const handleNegotiationNeeded = useCallback(async () => {

  //   if (peerservice.peer.signalingState === "stable") {
  //     const currentOffer = await peerservice.getOffer();
  //     socket?.emit("peer:nego:needed", {
  //       offer: currentOffer,
  //       to: remoteSocketId,
  //     });
  //     console.log("Negotiation initiated.");
  //   } else {
  //     console.warn("Peer is not in a stable state for negotiation.");
  //   }
  // }, [remoteSocketId, socket]);

  const handleNegotiationIncomming = useCallback(
    async ({ offer, from }: Offer) => {
      if (
        peerservice.peer.signalingState === "stable" ||
        peerservice.peer.signalingState === "have-local-offer"
      ) {
        const answer = await peerservice.getAnswer(offer);
        socket?.emit("peer:nego:done", { answer, to: from });
      } else {
        console.warn(
          "Cannot handle negotiation in state:",
          peerservice.peer.signalingState
        );
      }
      // console.log("nego:incomming");
    },
    [socket]
  );

  const handleNegotiationFinal = useCallback(
    async ({ answer }: NegotiationDone) => {
      if (
        peerservice.peer.signalingState === "have-local-offer" ||
        peerservice.peer.signalingState === "have-remote-offer"
      ) {
        await peerservice.setRemoteDescription(answer);
        sendStream();
        // console.log("Final negotiation step completed.");
      } else if (peerservice.peer.signalingState === "stable") {
        console.log("Connection is stable, no need for further negotiation.");
      } else {
        console.warn(
          "Cannot set remote description: Peer connection is in state",
          peerservice.peer.signalingState
        );
      }
    },
    [sendStream]
  );

  const handleSkip = useCallback(async () => {
    // console.log("Skipping current user");

    peerservice.peer.getTransceivers().forEach((transceiver) => {
      if (transceiver.stop) {
        transceiver.stop();
      }
    });

    peerservice.peer.getSenders().forEach((sender) => {
      if (sender.track) {
        sender.track.stop();
        peerservice.peer.removeTrack(sender);
      }
    });

    peerservice.peer.onicecandidate = null;
    peerservice.peer.ontrack = null;
    peerservice.peer.onnegotiationneeded = null;

    if (peerservice.peer.signalingState !== "closed") {
      // console.log("closed");
      peerservice.peer.close();
    }
    peerservice.initPeer();
    setMessagesArray([]);
    setFlag(false);

    setRemoteStream(null);
    setRemoteSocketId(null);

    socket?.emit("skip");
  }, [socket]);

  useEffect(() => {
    if (flag !== true) {
      peerservice.peer.addEventListener(
        "negotiationneeded",
        handleNegotiationNeeded
      );
      setFlag(false);
    }

    return () => {
      peerservice.peer.removeEventListener(
        "negotiationneeded",
        handleNegotiationNeeded
      );
    };
  }, [flag, handleNegotiationNeeded]);

  useEffect(() => {
    const handleTrackEvent = (event: RTCTrackEvent) => {
      const [incomingStream] = event.streams; // Get the MediaStream from event.streams
      // console.log("Received track event:", event.track);
      setRemoteStream(incomingStream);
    };

    peerservice.peer.addEventListener("track", handleTrackEvent);

    return () => {
      peerservice.peer.removeEventListener("track", handleTrackEvent);
    };
  }, [isScreenSharing, sendStream, flag]);

  const userDisConnected = useCallback(async () => {
    // console.log("You've been skipped. Looking for a new user...");
    setFlag(true);
    peerservice.peer.getTransceivers().forEach((transceiver) => {
      if (transceiver.stop) {
        transceiver.stop();
      }
    });

    peerservice.peer.getSenders().forEach((sender) => {
      peerservice.peer.removeTrack(sender);
    });

    peerservice.peer.onicecandidate = null;
    peerservice.peer.ontrack = null;
    peerservice.peer.onnegotiationneeded = null;

    if (peerservice.peer.signalingState !== "closed") {
      // console.log("closed");
      peerservice.peer.close();
    }

    setRemoteStream(null);
    setRemoteSocketId(null);

    peerservice.initPeer();
    setMessagesArray([]);
  }, []);

  useEffect(() => {
    socket?.on("skipped", userDisConnected);

    return () => {
      socket?.off("skipped", userDisConnected);
    };
  }, [socket, userDisConnected]);

  useEffect(() => {
    peerservice.peer.onicecandidate = (event) => {
      if (event.candidate) {
        // console.log("Sending ICE candidate:", event.candidate);
        socket?.emit("ice-candidate", {
          candidate: event.candidate,
          to: remoteSocketId,
        });
      }
    };
  }, [socket, remoteSocketId]);

  useEffect(() => {
    socket?.on("ice-candidate", (data) => {
      if (data.candidate) {
        const candidate = new RTCIceCandidate(data.candidate);
        peerservice.peer
          .addIceCandidate(candidate)
          .then(() => {
            // console.log("Added ICE candidate:", candidate);
          })
          .catch((error) => {
            console.error("Error adding ICE candidate:", error);
          });
      }
    });

    return () => {
      socket?.off("ice-candidate");
    };
  }, [socket]);

  useEffect(() => {
    socket?.on("user:connect", handleUserJoined);
    socket?.on("offer", handleIncommingOffer);
    socket?.on("answer", handleIncommingAnswer);
    socket?.on("peer:nego:needed", handleNegotiationIncomming);
    socket?.on("peer:nego:final", handleNegotiationFinal);
    socket?.on("partnerDisconnected", userDisConnected);

    return () => {
      socket?.off("user:connect", handleUserJoined);
      socket?.off("offer", handleIncommingOffer);
      socket?.off("answer", handleIncommingAnswer);
      socket?.off("peer:nego:needed", handleNegotiationIncomming);
      socket?.off("peer:nego:final", handleNegotiationFinal);
      socket?.off("partnerDisconnected", userDisConnected);
    };
  }, [
    handleIncommingAnswer,
    handleIncommingOffer,
    handleNegotiationFinal,
    handleNegotiationIncomming,
    handleUserJoined,
    socket,
    userDisConnected,
  ]);

  const handleCleanup = useCallback(() => {
    // console.log("Cleaning up...");

    // Stop camera stream
    if (myStream) {
      myStream.getTracks().forEach((track) => {
        // console.log("Stopping track:", track);
        track.stop(); // Stop each media track (video/audio)
      });
      setMyStream(null); // Clear the state to ensure the stream is stopped
    }

    // Stop screen sharing stream
    if (screenStream) {
      screenStream.getTracks().forEach((track) => {
        // console.log("Stopping screen sharing track:", track);
        track.stop(); // Stop each screen sharing track
      });
      setScreenStream(null);
      setIsScreenSharing(false);
    }

    // Disconnect the socket
    if (socket) {
      socket.disconnect();
    }

    // Close and reset Peer Connection
    if (peerservice.peer.signalingState !== "closed") {
      peerservice.peer.close();
      peerservice.initPeer(); // Re-initialize the peer connection if needed
    }

    navigate("/");
    window.location.reload();
  }, [myStream, navigate, screenStream, socket]);

  return (
    <div className="flex flex-col lg:flex-row w-screen bg-gradient-to-b from-gray-200 to-gray-400 dark:from-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Left Side */}
      <div className="lg:w-[450px] w-full lg:h-[calc(100vh-64px)] h-auto border-b lg:border-b-0 lg:border-r border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
        {/* My Stream */}
        {myStream ? (
          <div className="relative w-full h-64 lg:h-1/2 group">
            <ReactPlayer
              className="absolute inset-0 rounded-lg"
              url={myStream}
              playing
              muted
              width="100%"
              height="100%"
            />
            <div className="absolute bottom-0 left-0 bg-gradient-to-t from-black via-transparent to-transparent p-3 text-white text-sm rounded-tl-lg">
              My Stream
            </div>
            {/* Mic and Video Toggle Controls (shown on hover) */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 hidden group-hover:flex space-x-4 z-50">
              <Button 
                onClick={toggleMic}
                aria-label={isMicOn ? "Turn microphone off" : "Turn microphone on"}
                title={isMicOn ? "Turn microphone off" : "Turn microphone on"}
                className="flex items-center justify-center w-15 h-15 bg-transparent hover:bg-transparent focus:outline-none"
              >
                <MicIcon isActive={!isMicOn} />
              </Button>
              <Button 
                onClick={toggleVideo}
                aria-label={isVideoOn ? "Turn video off" : "Turn video on"}
                title={isVideoOn ? "Turn video off" : "Turn video on"}
                className="flex items-center justify-center w-15 h-15 bg-transparent hover:bg-transparent focus:outline-none"
              >
                <VideoIcon isActive={!isVideoOn}/>
              </Button>
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-64 lg:h-1/2 bg-gray-400 dark:bg-gray-700 rounded-lg shadow-md">
            <ClipLoader color={loaderColor} size={50} />
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Loading your stream...
            </p>
          </div>
        )}

        {/* Remote Stream */}
        {remoteStream ? (
          <div className="relative w-full h-64 lg:h-1/2">
            <ReactPlayer
              className="absolute inset-0 rounded-lg"
              url={remoteStream}
              playing
              muted={false}
              width="100%"
              height="100%"
            />
            <div className="absolute bottom-0 left-0 bg-gradient-to-t from-black via-transparent to-transparent p-3 text-white text-sm rounded-tl-lg">
              Remote Stream
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-64 lg:h-1/2 bg-gray-400 dark:bg-gray-700 rounded-lg shadow-md">
            <ClipLoader color={loaderColor} size={50} />
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Waiting for user to connect...
            </p>
          </div>
        )}
      </div>

      {/* Right Side */}
      <div className="flex-1 flex flex-col w-full">
        {/* Button Controls */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-row gap-4 h-auto sm:h-16 shadow rounded-lg bg-gray-50 dark:bg-gray-900">
          <Button
            className="flex-1 p-2 gap-2 bg-red-600 text-white rounded-md"
            size={"icon"}
            onClick={handleCleanup}
          >
            <StepBack size={18} />
            <span className="hidden sm:inline">Stop</span>
          </Button>
          <Button
            className={`flex-1 p-2 gap-2 bg-blue-600 text-white rounded-md ${
              remoteSocketId === null ? "opacity-50 cursor-not-allowed" : ""
            }`}
            size={"icon"}
            onClick={handleSkip}
            disabled={remoteSocketId === null}
          >
            <StepForward size={18} />
            <span className="hidden sm:inline">Skip</span>
          </Button>
          <Button
            className="flex-1 p-2 gap-2 bg-green-600 text-white rounded-md"
            onClick={handleScreenShare}
            size={"icon"}
          >
            <ScreenShare size={18} />
            <span className="hidden sm:inline">
              {isScreenSharing ? "Stop Sharing" : "Share Screen"}
            </span>
          </Button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 max-h-[calc(100vh-128px)] overflow-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow-inner">
          {screenStream ? (
            <ReactPlayer
              className="w-full h-full rounded-lg"
              url={screenStream}
              playing
              width="100%"
              height="100%"
            />
          ) : (
            <Messages
              remoteSocketId={remoteSocketId}
              messagesArray={messagesArray}
              setMessagesArray={setMessagesArray}
            />
          )}
        </div>
      </div>
    </div>
  );
}
