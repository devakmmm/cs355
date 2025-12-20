const http = require("http");
const port = 3000;
const server = http.createServer();
server.on("request", request_handler);
function request_handler(req, res){
    console.log(`New Request from ${req.socket.remoteAddress} for ${req.url}`);
    if(req.url === "/"){
        res.writeHead(200, "OK", {"Content-Type": "text/html"});
        res.write(`<h1>Page 1</h1>
                   <a href="page2">Page 2</a>`);
        res.end();
    }
    else if (req.url === "/page2"){
        res.writeHead(200, "OK", {"Content-Type": "text/html"});
        res.write(`<h1>Page 2</h1>
                   <a href="/">Page 1</a>`);
        res.end();
    }
    else{
        res.writeHead(404, "Not Found", {"Content-Type": "text/html"});
        res.write(`<h1>404 Not Found</h1>`);
        res.end();
    }
}
server.on("listening", listen_handler)
function listen_handler(){
    console.log(`Now Listening on Port ${port}`);
}
server.listen(port);