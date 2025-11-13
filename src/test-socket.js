import { io } from "socket.io-client";

// Troque a URL conforme o seu backend:
const socket = io("http://localhost:3333");

// Entra em uma socialNetwork específica
socket.emit("joinSocialNetwork", { socialNetworkId: 1, userId: "teste-uuid" });

socket.on("joinedSocialNetwork", (data) => {
  console.log("Entrou na sala!", data);
});

// Envia uma mensagem
setTimeout(() => {
  socket.emit("message", {
    socialNetworkId: 1,
    userId: "teste-uuid",
    content: "Olá, pessoal!"
  });
}, 2000);

// Recebe mensagens do chat
socket.on("message", (msg) => {
  console.log("Nova mensagem recebida:", msg);
});
