
module.exports = (socket, pickupPoints) => {
  socket.on('pickup points', () => {
    socket.emit('pickup points', Object.keys(pickupPoints).map(key => {
      return {
        name: key
      }
    }));
  });
}