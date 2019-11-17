const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// const db = require('./drivers/rethinkdb');

var pickupPoints = {
  'Times Square': { x: 10, y: -15 },
  'Manhattan': { x: -10, y: 5 },
  'Trump Tower': {x: 10, y: 2}
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

