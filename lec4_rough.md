Asynchronous programming

whats a large program, what makes a program large-i/o maybe harddrive
cant understand what exact second it might finish
to be 100% effecient we shouldnt block the cpu to do these operations

fs read write files
nodejs.org 

event queues take all our call back functions

const fs = require("fs");
fs.readFile("input/file01.txt", "utf8", function (err, data){
    if(err){
        console.log(`Error Reading File`);
    }
    else{
        console.log(`Finished Reading File: `, data.length);
    }
});
console.log("hello")

line 2 delegates the read operation the file , who performs the reading tho? and what prints out?

in a world where read operation finishes instantly, is it possible 
on completion of read operation theres always a call back function as mentioned in defn of the function
whats a callback? behaves opposite to traditional functions, they have output paramaters
means that when someone is performing rad operations will fill in the parameters 

in after_read, the err and data is put in after you apply the read operation
who performs the call back function?
and libuv performs the asynchorous function, right??
even if read operation is done instantly would we abkle to print "finisjed reading" b4 hello?

no as long as there is 1 line of code that is not read yet or finished yet you cannot, explain this more with examples like what code has priority and why

to do stuff with data you add another function function other(newdata) then we add this function in else of the above fucntion
  else{
        console.log(`Finished Reading File: `, data.length);
        other(data)
    }
});



06-concurrency

multile async funcs

const dns = require("dns");
const domain = "venus.cs.qc.cuny.edu";
dns.resolve(domain, after_resolution);
function after_resolution(err, records){
    if(err){
        console.error("Failed to resolve", domain);
    }
    else{
        console.log(domain, records);
    }
}
how do we know its async? callback as last paramater ---IMPORTANT

const dns = require("dns");
const domain = "venus.cs.qc.cuny.edu";
dns.resolve(domain, after_resolution);
dns.resolve(......)
function after_resolution(err, records){
    if(err){
        console.error("Failed to resolve", domain);
    }
    else{
        console.log(domain, records);
    }
}

each gets placed in task queue, in worker thread one picks one task and other picks another task, and their task is not to do it in sync but just to finish it so theres no gurantee that which one finishes first


and then let say after-mars finish first it goes in event queue, at bottom since its stack then above it after_venus goes above it

dont ever take out the callback function , most imp


const dns = require("dns");
const venus = "venus.cs.qc.cuny.edu";
const mars  = "mars.cs.qc.cuny.edu";

dns.resolve(venus, after_venus);
console.log("Prints Immediately 01");
function after_venus (err, records){
    if(err){
        console.error("Failed to resolve", venus);
    }
    else{
        console.log(venus, records);
    }
}

dns.resolve(mars, after_mars);
console.log("Prints Immediately 02");
function after_mars(err, records){
    if(err){
        console.error("Failed to resolve", mars);
    }
    else{
        console.log(mars, records);
    }
}



difficulty- scale to size n domains

need to have a wrapper function

const dns = require("dns");

resolve(venus)
resolve(mars)
function resolve(domain){ 
    dns.resolve(domain, after_resolution); 
    function after_resolution(err, records){ ////why callback here, for dependency in form of closure
        if(err){
            console.error("Failed to resolve", domain);
        }
        else{
            console.log(domain, records);
        }
    }
}


const dns = require("dns");
const domains = ["venus.cs.qc.cuny.edu", "mars.cs.qc.cuny.edu", "earth.cs.qc.cuny.edu", "cs.qc.cuny.edu", "qc.cuny.edu", "definitely.not.a.domain", "cuny.edu"];

for(let i = 0; i < domains.length; i++){
    resolve(domains[i]);
}
function resolve(domain){ 
    dns.resolve(domain, after_resolution);
    function after_resolution(err, records){
        if(err){
            console.error("Failed to resolve", domain);
        }
        else{
            console.log(domain, records);
        }
    }
}
why this is more helpful and what scenarious would i use this?

are these domains beong resolved one at time or concurrently? concurrently 

for loop does the scheduling and moves on to next domain

lets imagine we have 10 mil domains, to do them at the same time the server wont be able to do it, because they are gonna think were attacking them by requesting 10 mil resoltions

to do this we cant have for loop because for loop dont wait it just keeps scheduling minimizing downtime to do it as fast as possible


to do it one at a time, 
let i=0
we resolve first domain resolve[i]
function resolve(domain){ 

            console.log(domain, records);
            then we recursive call resolve[i] that does the second domain
        }
    }
} more like this
const dns = require("dns");
const domains = ["venus.cs.qc.cuny.edu", "mars.cs.qc.cuny.edu", "earth.cs.qc.cuny.edu", "cs.qc.cuny.edu", "qc.cuny.edu", "definitely.not.a.domain", "cuny.edu"];
const ip_addresses = [];
let count = 0;

dns.resolve(domains[count], after_resolved);
function after_resolved(err, records){
    count++;
    ip_addresses.push(records);
    if(count === domains.length){
        console.log(ip_addresses);                      //all domains.length resolved
    }
    else{
        dns.resolve(domains[count], after_resolved);    //more domains to resolve
    }
}
order is gurantee as we resolve 1 domain and then we see are we at length then we do second domain


how we structure our calls makes how we do this concurrently or sequntially

 the cost difference see notebook


const fs = require("fs");
const dns = require("dns");
const input_file = "input/domains.txt"

fs.readFile(input_file, {encoding:"utf8"}, after_read);
function after_read(err, data){
    if(err){
        console.error(err);
    }
    else{
        let domains = data.split('\r\n');        //split String on newlines
        for(let i=0 ; i < domains.length; i++){
            resolve(domains[i]);
        }
    }
}
function resolve(domain){
    dns.resolve(domain, after_resolution);
    function after_resolution(err, records){
        if(err){
            console.error("Failed to resolve", domain);
        }
        else{
            console.log(domain, records);
        }
    }
}

howver another way of doing it is by using results=[]

results[i]='$domain, $records[0]'
if resolved==domains.length to see if we got everything and finished it
console.table(results
)




compressing with dflate

// 01 - Compressing with Deflate
const fs = require("fs");
const zlib = require("zlib");
const output_file = "./output/content.deflated";
const content = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Montes nascetur ridiculus mus mauris. Ut tortor pretium viverra suspendisse potenti nullam ac tortor. Cras fermentum odio eu feugiat pretium nibh ipsum. Dictum fusce ut placerat orci nulla pellentesque dignissim enim sit. Felis eget nunc lobortis mattis aliquam. Ac placerat vestibulum lectus mauris ultrices eros in cursus. Interdum varius sit amet mattis vulputate. Nibh cras pulvinar mattis nunc sed blandit. Tristique nulla aliquet enim tortor at auctor urna nunc id. Sed euismod nisi porta lorem mollis aliquam ut porttitor. Leo integer malesuada nunc vel. Nulla aliquet enim tortor at auctor. Blandit massa enim nec dui nunc mattis enim. Egestas tellus rutrum tellus pellentesque eu. Nec dui nunc mattis enim ut tellus elementum sagittis. Adipiscing bibendum est ultricies integer quis. Tortor at risus viverra adipiscing at in tellus integer feugiat. Arcu vitae elementum curabitur vitae nunc sed velit. Ac tortor dignissim convallis aenean et tortor at. Suscipit tellus mauris a diam maecenas. Nulla aliquet enim tortor at auctor urna nunc id. Venenatis cras sed felis eget velit aliquet sagittis id.`;

zlib.deflate(content, after_compress); 
function after_compress(err, buffer){
    if(err){
        console.log(err);
    }
    else{
        fs.writeFile(output_file, buffer, function after_write(err){
            if(err){
                console.log(err);
            }
            else{
                console.log(`File Written to "${output_file}"`);
                console.log(`Original Size: ${content.length}`);
                console.log(`New Size: ${buffer.length}`);
            }
        });
    }
}
the compressed file will be in binary data since its comressed

/* 01 - Deompressing with Inflate */
const fs = require("fs");
const zlib = require("zlib");
const input_file = "./input/content.deflated";

fs.readFile(input_file, {encoding:null}, function after_read(err, data){ //{encoding:null} for anything unreadbke other wise utf-08
    if(err){
        console.log(err);
    }
    zlib.inflate(data, function after_decompress(err, buf){
        if(err){
            console.log(err);
        }
        else{
            console.log(buf.toString("utf8"));
            console.log(`======================================`);
            console.log(`Compressed Size : ${data.length}`);
            console.log(`Decompressed Size : ${buf.length}`);
            console.log(`======================================`);
        }
    });
});



// Loop A
{
    let i;
    for(i = 0 ; i < 10 ; i++){
        setTimeout(()=>console.log(i),1000)
        
    }
} this only prints 10

// Loop B
for(let i = 0 ; i < 10 ; i++){
    setTimeout(()=>console.log(i),1000)

    //however even for (var i) wont wotk onlt for (let) loop works
    
    #TCP/IP MODEL AND OSI MODEL

    WHAT LAYERS PROVIDEs?
    allows us to abstraction and sepration of tasks
    physical layer-underlying delivery of data 
    trnasportation occur through cable-wjat kind of cable copper or fibre
    data link delivers msgs betwwen two adj devices
    network provides end to end delivery
    transport layer- atp we reached the correct device reaching the machine however is inefficient since we dont know who the messages are supposed to go so transport layer make sure messages go to right places
    session layer provides ability to remeber your instance and recall it from same device or diff device
    presentation refers to how content we received is delivered and displaced to us. eg we are deaf and we can customize how webpage is customized to us
    application is where our program lives

    these layers are designed to be interchangable and it wont affect the other layers
    


    COMMUNICATION PROTOCOLS

    776 BC 
    - HOMING PIGEON-used to deliver results of first ever olympics from one city to another 
    - its unencryted, unidirectionality info flows in 1 direction, slower it could get lost and no detection
    - no order guranteed



    400 BC
    - HYDRAULIC SEMAPHOR
            -each city has identetical semaphor
            


}




