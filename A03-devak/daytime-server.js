const net= require('net');

const server=net.createServer();
server.on('connetion',new_connection);


function new_connection(socket) {

    console.log('New connection established');
    socket.on('end', () => {
        console.log("client disconnected");
    });
    socket.write('hello\r\n');
    socket.pipe(socket);
} 


server.on('error', server_error);
function server_error(error) {
    throw err;
}


server.on('listening', server_listening);
function server_listening() {
console.log('Server is listening on port 13');
}

server.listen(13);
