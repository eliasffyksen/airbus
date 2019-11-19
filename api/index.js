const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// const db = require('./drivers/rethinkdb');

var pickupPoints = {
  'Times Square': { x: -225, y: 318 },
  'Manhattan': { x: 170, y: -190 },
  'Trump Tower': {x: 14, y: 16},
  'Central Park': {x: 110, y: -100},
  'Empire State Building': {x: -180, y: -100}

};

// db.connect()
//   .then(() => {
//     pickupPoints = db.live(db.r.table('pickup_points'), (pickupPoints) => {
//       io.emit('pickup points', pickupPoints.map(elm => ({name: elm.name})));
//     });
//   });

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/html/index.html');
});

app.get('/jquery.js', (req, res) => {
  res.sendFile(__dirname + '/html/jquery-1.11.1.min.js');
});

io.on('connection', async (socket) => {
  console.log('a user connected');
  socket.isDrone = false;

  socket.on('disconnect', () => {
    console.log('a user disconnected');
  });

  socket.on('connect drone', (id) => {
    require('./events/drones')(socket, id);
  });

  require('./events/flight-request')(socket, pickupPoints);
  require('./events/pickup-points')(socket, pickupPoints);
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});

