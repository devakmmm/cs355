const https = require("https");
const fs = require("fs");

const downloadURL = `https://raymondlaw.github.io/cs355/index.html`;
const saveAsFileName = `webpage.html`

const myreq = https.request(downloadURL, options);
myreq.end();
myreq.on("response", (httpResponseStream)=>{
    const ws = fs.createWriteStream(saveAsFileName);
    httpResponseStream.pipe(ws);
});
const options= {
    method: "GET",  
    headers: {
        "User-Agent": "nodejs",
        "Accept-Language": "en-US,en;q=0.9 "
    }
}


my_req=https.request(downloadURL, options, recieve_response); //only creates the request whats the type of my_req? its writestream why?

downloadURL.write();

function recieve_response(download_res){
    download.res.pipe(filestream);
    cosnole.log(`Downloading ${downloadURL} to ${saveAsFileName}`);
} //