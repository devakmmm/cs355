const https = require("https");
const options = {
    method:"GET",
    headers:{
        "User-Agent":"nodejs",
    }
}
process.stdin.on("data", chunk => getDefinition(chunk));
function getDefinition(word){
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;  // dictionaryapi {word} represents the word we want to look up 
    const myreq = https.request(url, options);
    myreq.end();
    myreq.on("response", (jsonStream)=>{ // to turn the strram into object
        let jsonBody = "";
        jsonStream.on("data", chunk => jsonBody += chunk);
        jsonStream.on("end" , ()=>{
            const defObj = JSON.parse(jsonBody); // turns it into object
            const firstDef = defObj[0]?.meanings[0]?.definitions[0]?.definition || // since its an object we use this to access the definition {} tells us its an obj [] tells us its an array we use ? to avoid error if its undefined use it when we are depending on something that is not under out control
            (firstDef === undefined) ? console.log("[No Definitions Found]") : console.log(firstDef);
        })
    });
}