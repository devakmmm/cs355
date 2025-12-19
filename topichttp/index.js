const http = require("http");
const port = 3000;

const server = http.createServer();
server.on("request", request_handler);
function request_handler(req, res){ // req-incoming msg(wrapped on readstream)  res-outgoing msg(wrapped on writestream)

    console.log(`New Request from ${req.socket.remoteAddress} for ${req.url}`);
    res.writeHead(200, "OK", {'Content-Type':'text/html'});
    res.write(`<h1>Hello World</h1>`);
    res.end();
}

server.on("listening", listen_handler)
function listen_handler(){
    console.log(`Now Listening on Port ${port}`)    
}
server.listen(port);