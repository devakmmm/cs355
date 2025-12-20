const fs = require("fs");
const http = require("http");
const port = 3000;
const server = http.createServer();
server.on("request", request_handler);
function request_handler(req, res){
    console.log(`New Request from ${req.socket.remoteAddress} for ${req.url}`);
    if(req.url === "/"){
        res.writeHead(200, {"Content-Type": "text/html"});
        res.write(`<h1>Cat!</h1><img src="cat.jpg" />`);
        res.end();
    }
    else if (req.url === "/cat.jpg"){
        res.writeHead(200, {"Content-Type": "image/jpeg"});
        const image_stream = fs.createReadStream("images/cat.jpg");
		image_stream.pipe(res);
    }
    else{
        res.writeHead(404, {"Content-Type": "text/html"});
        res.end(`<h1>404 Not Found</h1>`);
    }
}
server.on("listening", listen_handler)
function listen_handler(){
    console.log(`Now Listening on Port ${port}`)    
}
server.listen(port);