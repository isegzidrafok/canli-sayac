const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // GitHub Pages ve diğer origin'lere izin ver
    methods: ["GET", "POST"]
  }
});

let sayac = 0;

// 1. PING / HEALTH CHECK ENDPOINT (UptimeRobot İçin)
// Bot / Spam filtrelerine takılmamak için anlamlı bir JSON ve User-Agent yanıtı veriyoruz.
app.get('/ping', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is active',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.send('Live Counter Socket.IO Server Running!');
});

// 2. SOCKET.IO MANTIĞI
io.on('connection', (socket) => {
  console.log('Yeni bir kullanıcı bağlandı:', socket.id);

  // Yeni bağlanan kullanıcıya mevcut sayac değerini gönder
  socket.emit('sayac_guncelle', sayac);

  // Sayaç artırma isteği geldiğinde
  socket.on('sayac_arttir', () => {
    sayac++;
    // Güncel değeri TÜM bağlı kullanıcılara yayınla (broadcast)
    io.emit('sayac_guncelle', sayac);
  });

  socket.on('disconnect', () => {
    console.log('Kullanıcı ayrıldı:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda dinleniyor...`);
});
