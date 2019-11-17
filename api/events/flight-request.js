
const d = require('../drivers/drones/drones');

module.exports = (socket, pickupPoints) => {
    socket.on('request flight', (flight) => {
        console.log('flight requested', flight);

        if(!flight.to) {
            socket.emit('request flight error', 'flight.to is undefined');
            return;
        }

        if(!flight.from) {
            socket.emit('request flight error', 'flight.from is undefined');
            return;
        }

        if(flight.from == flight.to) {
            socket.emit('request flight error', 'flight.from can not equal flight.to');
            return;
        }

        if(!pickupPoints[flight.from]) {
            socket.emit('request flight error', 'Unknown pickup point');
            return;
        }
        flight.from = {
            name: flight.from,
            ...pickupPoints[flight.from]
        };

        if(!pickupPoints[flight.to]) {
            socket.emit('request flight error', 'Unknown destination point');
            return;
        }
        flight.to = {
            name: flight.to,
            ...pickupPoints[flight.to]
        };

        flight.socket = socket;

        d.scheduleFlight(flight);
    });
}
