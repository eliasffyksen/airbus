
const d = require('../drivers/drones/drones');

module.exports = (socket, id) => {

  d.connect(id, socket)
    .then(() => {

      socket.on('disconnect', () => {
        d.disconnect(id);
      });

      socket.on('pos', (pos) => {
        d.updatePos(id, pos);
      });
    })
    .catch(() => {});
}