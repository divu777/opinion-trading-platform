import { error } from "console";
import { useEffect, useState } from "react";

export const useSocket = () => {
  const [ws, setWs] = useState<null | WebSocket>();

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:4000");
    socket.onopen = () => {
      console.log("connected");
      setWs(socket);
    };

    socket.onclose = () => {
      setWs(null);
      console.log("disconnected");
    };

    socket.onerror = (error) => {
      setWs(null);
      console.log("errr" + error);
    };

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  return ws;
};
