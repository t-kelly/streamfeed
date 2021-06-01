const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');
const express = require('express');
const cookieParser = require("cookie-parser");
const NextAuth = require("next-auth").default;
const nextAuthOptions = require('./next-auth-options');
const {listenForTweets} = require('./lib/twitter')


const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const handle = nextApp.getRequestHandler()

nextApp.prepare().then(() => {
  const expressApp = express()
  const server = createServer(expressApp)
  const io = new Server(server);

  listenForTweets((data) => {
    io.sockets.emit('twitter', data)
  })

  // NextAuth ExpressJS Integration https://github.com/nextauthjs/next-auth/issues/531
  expressApp.use(express.json());
  expressApp.use(express.urlencoded({ extended: true }));
  expressApp.use(cookieParser());
  expressApp.use((req, res, next) => {
    const baseUrl = "/api/auth/";

    if (!req.url.startsWith(baseUrl)) {
      return next();
    }

    req.query.nextauth = req.url
      .slice(baseUrl.length) 
      .replace(/\?.*/, "") 
      .split("/"); 

    NextAuth(req, res, nextAuthOptions);
  });

  // Pass Github Webhooks to WebSocket
  expressApp.post('/api/github/webhooks', (req,res) => {
    console.log('Webhook Received');
    io.sockets.emit('github', req.body)
    res.sendStatus(200);
  })

  // Use default NextJS routing for remaining routes
  expressApp.all('*', (req,res) => {
    return handle(req, res);
  })

  io.on('connection', (socket) => {
    console.log('a user connected');
    io.sockets.emit('SOME_EVENT', 'HelloWorld')
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})