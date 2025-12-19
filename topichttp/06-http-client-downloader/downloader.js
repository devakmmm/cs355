const https = require("https");
const fs = require("fs");

const downloadURL = `https://raymondlaw.github.io/cs355/index.html`;
const saveAsFileName = `webpage.html`

const options = {
    method: "GET",
    headers:{
        "User-Agent":"nodejs",
    }
}
const myreq = https.request(downloadURL, options);
myreq.end();
myreq.on("response", (httpResponseStream)=>{
    const ws = fs.createWriteStream(saveAsFileName);
    httpResponseStream.pipe(ws);
});