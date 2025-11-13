// app.js

import express from 'express';
import cors from 'cors';
import routes from './routes.js';
import routesSupabase from './app/supabse/supabaseRoutes.js';

// Importando nossa database
import './database';

import * as dotenv from 'dotenv';
import multer from 'multer';

import http from 'http';
import session from 'express-session';
import { Server } from 'socket.io';

import passport from './config/clientGoogle.js';
import Message from './app/models/Message.js';
import User from './app/models/User.js';

dotenv.config();


async function  fetchMessages(socket , socialNetworkId, limit, offset) {
  return Message.findAll({
    where: { social_network_id: socialNetworkId },
    order: [['created_at', 'DESC']],
    attributes: ['id', 'user_id', 'content', 'created_at'],
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['name', 'surname', 'email']
      }
    ],
    limit,
    offset,
  });
}

const corsOptions = {
  origin: [
    'http://localhost:4207',
    'https://mindway-frontend.netlify.app'
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
};

class App {
    constructor() {
        this.app = express();

        this.middlewares();
        this.routes();
        this.routesSupabase();
        this.io = null;
    }

    middlewares() {
        this.app.use(cors(corsOptions));
        this.app.use(express.json());

        this.app.use(session({
          secret: process.env.SESSION_SECRET,
          resave: false,
          saveUninitialized: true,
          cookie: { secure: false}
        }));

        this.app.use(passport.initialize());
        this.app.use(passport.session());

        const storage = multer.memoryStorage(); // Armazenar os arquivos em memória
        const upload = multer({
          storage: storage,
          limits: {
              fileSize: 15 * 1024 * 1024, // 15MB (ajuste conforme necessário)
          },
      });

        this.app.use(upload.array('anexos[]'));
    }

    routes() {
      this.app.use(routes);
    }

    routesSupabase() {
      this.app.use(routesSupabase);
    }

    listen(port, callback) {

        const httpServer = http.createServer(this.app);

        this.io = new Server(httpServer, {
          cors: {
            origin: ['http://localhost:4207', 'https://amritb.github.io/socketio-client-tool/'],
            methods: ['GET', 'POST'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true,
          },
        });

        this.startSocketListeners();

        httpServer.listen(port, callback);
    }

    startSocketListeners() {
      this.io.on('connection', (socket) => {
        console.log('Usuário conectado: ' + socket.id);

        socket.on('leaveSocialNetwork', ({ socialNetworkId, userId }) => {
          this.leaveSocialNetwork(socket, socialNetworkId, userId);
        });

        socket.on('joinSocialNetwork', ({ socialNetworkId, userId }) => {
          this.joinSocialNetwork(socket, socialNetworkId, userId);
        });

        socket.on('message', ({ socialNetworkId, userId, content }) => {
          this.handleMessage(socket, socialNetworkId, userId, content);
        });

        socket.on('disconnect', () => {
          console.log('Usuário desconectado: ' + socket.id);
        });
      });
    }

    leaveSocialNetwork(socket, socialNetworkId, userId) {
      socket.leave(`social_${socialNetworkId}`);

      socket.to(`social_${socialNetworkId}`).emit('userLeft', { userId });
    }

    async joinSocialNetwork(socket, socialNetworkId, userId, limit = 10, offset = 0 ) {
      const currentSocialNetwork = {};
      // Sair da sala anterior, se houver
      const previousRoom = currentSocialNetwork[socket.id];
      if (previousRoom && previousRoom !== `social_${socialNetworkId}`) {
        socket.leave(previousRoom);
        socket.to(previousRoom).emit('userLeft', { userId });
      }

      // Entrar na nova sala
      const newRoom = `social_${socialNetworkId}`;
      socket.join(newRoom);
      currentSocialNetwork[socket.id] = newRoom;

      console.log('UserId: ', userId);
      try {
        const messages = await fetchMessages(socket, socialNetworkId, limit, offset);

        socket.emit('messageHistory', messages);
      } catch (err) {
        console.error('Erro ao buscar histórico:', err.message);
        socket.emit('errorLoadingHistory', { message: 'Erro ao carregar histórico.' });
      }

      socket.emit('joinedSocialNetwork', { socialNetworkId });
      console.log(`User ${userId} joined ${newRoom}`);
    }


    handleMessage(socket, socialNetworkId, userId, content) {
      const createdAt = new Date();

      console.log('Teste do id: ', userId)

      this.io.to(`social_${socialNetworkId}`).emit('message', {
        user_id: userId,
        content,
        created_at: createdAt
      });

      setTimeout(async () => {
        try {
          await Message.create({
            social_network_id: socialNetworkId,
            user_id: userId,
            content,
            created_at: createdAt
          });

        } catch (err) {
          console.error('Erro ao salvar mensagem:', err.message);
        }
      }, 500);
    }


    /**
     * Função para gerenciar as respostas do assistente com base na mensagem do usuário
     * @param data Dados da mensagem enviada pelo usuário
     * @param socket Socket do usuário
     * @param io Instância do Socket.io
     */
    handleAssistantResponse(data, socket, io) {
        console.log(`Handling assistant response for message: ${data.message}`);
        const message = data.message.trim();

        if (message === '1') {
            // Agendamento
            const redirectMessage = {
                user: 'Assistente',
                message: 'Redirecionando para o agendamento... 🗓️',
                timestamp: new Date(),
                isAssistant: true,
            };
            socket.emit('receive_message', redirectMessage);
            socket.emit('redirect', { destination: 'agendamento' });

        } else if (message === '2') {
            // Suporte Técnico
            const supportMessage = {
                user: 'Assistente',
                message: 'Conectando você ao suporte técnico... 🔧',
                timestamp: new Date(),
                isAssistant: true,
            };
            socket.emit('receive_message', supportMessage);
            socket.emit('redirect', { destination: 'suporte-tecnico' });

        } else if (message === '3') {
            // Falar com um atendente
            const attendantMessage = {
                user: 'Assistente',
                message: 'Aguarde enquanto conectamos você a um atendente... 👩‍💼👨‍💼',
                timestamp: new Date(),
                isAssistant: true,
            };
            socket.emit('receive_message', attendantMessage);
            socket.emit('redirect', { destination: 'atendente' });

        }
        // **Opção 4** — Horário de Funcionamento
        else if (message === '4') {
            const scheduleMessage = {
                user: 'Assistente',
                message: 'Nosso horário de funcionamento é de segunda a sexta, das 09h às 19h. ⏰',
                timestamp: new Date(),
                isAssistant: true,
            };
            socket.emit('receive_message', scheduleMessage);

        } else {
            // Mensagem inválida
            const invalidMessage = {
                user: 'Assistente',
                message: 'Não entendi, por favor, escolha uma das opções do menu. 😊\n\n1. Agendamento\n2. Suporte Técnico\n3. Falar com um atendente\n4. Horário de Funcionamento',
                timestamp: new Date(),
                isAssistant: true,
            };
            socket.emit('receive_message', invalidMessage);
        }
    }

}

export default new App();
