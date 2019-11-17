$(document).ready(() => {

    var socket = io('http://172.20.10.2:3000');
    
    socket.on('pickup points', (pickupPoints) => {
        var html = pickupPoints.reduce(
            (str, row) => str + '<option>' + row.name + '</option>',
            ''
        );
        $('.point-picker').html(html);
    });
    socket.emit('pickup points');

    socket.on('request flight error', err => {
        alert(err);
    });
    socket.on('request flight success', () => {
        document.location.href = './waiting.html';
    });

    $('#summit').click(e => {
        e.preventDefault();

        var from = $('#select1 option:selected').text();
        var to = $('#select2 option:selected').text();

        socket.emit('request flight', {
            from,
            to
        });
    });
    $('#back').click(e => {
        document.location.href = './index.html'
    })

});