const fs = require("fs");
const url = require("url");
const http = require("http");
const port = 3000;

const server = http.createServer();
server.on("request", request_handler);
function request_handler(req, res){
    console.log(`New Request from ${req.socket.remoteAddress} for ${req.url}`);
    if(req.url === "/"){
        res.writeHead(200, {"Content-Type": "text/html"});
        const html_stream = fs.createReadStream("html/form.html");
		html_stream.pipe(res);
    }
    else if (req.url.startsWith("/print")){ // since the get form has print
        res.writeHead(200, {"Content-Type": "text/html"});
        const user_input = url.parse(req.url, true).query;
		const today = new Date();
		const dob = new Date(user_input.dob);
		const days_old = Math.floor((today - dob) / (1000*60*60*24));
        res.end(`<h1>Welcome ${user_input.name}</h1>
                 <p>You are ${days_old} days old</p>`);
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