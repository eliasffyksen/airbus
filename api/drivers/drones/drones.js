const drones = require('./droneConfig').reduce((obj, id) => {
  obj[id] = {
    connected: false,
    socket: null,
    busy: false,
    flight: false,
    pos: {
      x: 0,
      y: 0
    }
  };
  return obj;
}, {});

exports.drones = drones;

exports.connect = (id, socket) => {
  return new Promise((resolve, reject) => {

    if(!Object.keys(drones).includes(id)) {
      console.error('Drone not registered with us (id:', id,')');
      reject();
      return;
    }

    if (drones[id].connected) {
      console.error('Drone', id, ' already connected');
    }

    drones[id].connected = true;
    drones[id].socket = socket;
    drones[id].busy = false;
    drones[id].flight = false;
    drones[id].pos = {
      x: 0,
      y: 0
    };
    socket.isDrone = true;
    socket.droneId = id;

    console.log('Drone', id, 'connected');
    resolve();
  });
};

exports.disconnect = (id) => {

  if(!Object.keys(drones).includes(id)) {
    console.error('Invalid drone id', id);
    return;
  }

  if(!drones[id].connected){
    console.error('Drone not connected', id);
    return;
  }

  drones[id].connected = false;
  drones[id].socket = null;
  console.log('Drone', id, 'disconnected');
}

exports.updatePos = (id, pos) => {
  
  if(!drones[id]) {
    console.error('No drone by id', id);
    return;
  }

  drones[id].pos = pos;
}

exports.scheduleFlight = (flight) => {

  var noDrones = true;
  var bestDistance = Infinity;
  var bestDrone = null;

  Object.values(drones).forEach(drone => {

    if (!drone.connected || drone.busy) {
      return;
    }

    const distance = Math.sqrt(Math.pow(drone.pos.x - flight.from.x, 2) + Math.pow(drone.pos.y - flight.from.y, 2));

    if (distance < bestDistance) {
      bestDistance = distance;
      bestDrone = drone;
    }

    noDrones = false;
  });

  if (noDrones) {
    flight.socket.emit('request flight error', 'No drones available');
    return;
  }

  bestDrone.busy = true;
  bestDrone.flight = flight;

  bestDrone.socket.emit('do flight', {
    to: flight.to,
    from: flight.from
  });

  flight.socket.emit('request flight success');

  bestDrone.socket.on('flight done', () => {
    bestDrone.flight = false;
    bestDrone.busy = false;
    console.log('flight done');
  });
}