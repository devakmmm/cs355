10/25
Properties of async programming w callbacks
     -all the functions in async are done as fast as possible so very demand focuses
     -singular
     -callbacks are required by the architecture
     -expectation that the task completes
     -tight coupling
     -callabcks can only notify one particular entity that is finished



Properties of observer pattern
    -Request oriented (waits for an event) so were saying in the future if this event occurs do this fucntion that is compared diff to async which is told do this as soon as possible
    -fire multiple times, we can press the enter key multiple times
    -there is no expectation that a "event" in this case lets say hitting the eneter key, happens/fires that is a user never hits the enter key that is its default to 0 (not an error state)
    -tight coupling same as async
    -multiple observrs can each run own codwe when event is detected 



Pub sub pattern
    -no tight coupling


OBSERVER PATTERN
    entities: subjects and observers
    Key to find the subjects:
        emit(eventNAme- which is a <string>,[...data];)
    observers:
        .on(eventName- also a <string>,listeer which is a function)

        
        
        
        /* Example 01A: readline-a.js */ only observer half

const readline = require('readline');
const rl = readline.createInterface({input: process.stdin}); --readline allows us to inyeract with stdin that is inputs

rl.on('line', (input) => {   --its triggered when enter is pressed and the function starts executing
    console.log(`Received: ${input}`);
});
console.log("Enter any input and press enter to fire line event");

the fucntion gets triggerd on new line and it logs "receieved:text " right after we press enter


we can do this by doing async as well

function canptureIput(){
r1.question(">",(input)=>{
    console.log("recoeved ${input}")
})}

so this example is not demand focuses not singluar 



rl.on('line', (input) => {   console.log(`Received: ${input}`);});
rl.on('line', (input) => {   console.log(`Received: ${input}`);});
console.log("Enter any input and press enter to fire line event");

outputs input twice as it shows one-to-many behaviour 


if we put a settimeout on listeners the listeners wouldnt work until timeout is over and the last input would be outputted


/* Example 01C: readline-c.js */

const readline = require('readline');
const rl = readline.createInterface({input: process.stdin});
rl.setMaxListeners(32);	// Default is 10

function print(input){
	console.log(`Received: ${input}`);
	rl.on('line', print);
}

rl.on('line', print);
console.log("If you need more listeners use the method setMaxListeners");


whats the mistake in this code above? 

initally line 74 sets up q obserer, triggers print fucntion and calls in another listerner and they last till the program exists



/* Example 02A: DayEmitter.js */

const EventEmitter = require('events');
class DayEmitter extends EventEmitter {
    constructor(update_time = 240) {
        super();
        this.day = new Date();
        this.update_time = update_time;        // How many ms should represent a day
    }
    start(){
        this.day.setDate(this.day.getDate() + 1);                   // Adds 1 to Day
        let mm = `${(this.day.getMonth() + 1 + "").padStart(2, "0")}`;    // 0 = Jan
        let dd = `${(this.day.getDate() + "").padStart(2, "0")}`;
        this.emit('newday', {mm_dd:`${mm}/${dd}`});       // Returns {mm_dd:"mm/dd"}
        this.sleep();
    }
    sleep(){
        setTimeout(() => this.start(), this.update_time);
    }
}
module.exports = DayEmitter;

line 87 defines a class and inherits event emitter and gets access to on and emit and others
line 88 is our constructor, which has a single input that is how many milisecond represent a day if value not provided defaulted at 240ms
line89 super calls the parent consrtuctor which makes it do everything the parent emitter does and should always use it if didnt write the parent class. 
line90-91 are the instance var that makes our day emitter work 

we have start and sleep
    start
        - line 94 redefined setters and getters
        -line 95 


observer in 1 file emitter in another 

/* Example 02B: index.js */

const DayEmitter = require("./modules/DayEmitter");
const day_emitter = new DayEmitter();
day_emitter.on("newday", function({mm_dd}){
    process.stdout.cursorTo(0, 0);
    process.stdout.clearLine();
    process.stdout.write(mm_dd);
    process.stdout.cursorTo(0, 1);

});
console.clear();
day_emitter.start();

a clock type system, everytime a new data occurs itll emit a signal runs day emitter.on so every 1000 a new event is emitted it removes what was there previously millisecond the calender starts moving

/* Example 02B: index.js */

const DayEmitter = require("./modules/DayEmitter");
const day_emitter = new DayEmitter();
day_emitter.on("newday", function({mm_dd}){
    process.stdout.cursorTo(0, 0);
    process.stdout.clearLine();
    process.stdout.write(mm_dd);
    process.stdout.cursorTo(0, 1);
    
    {day_emitter.on("newday", function({mm_dd,temp}){
    process.stdout.cursorTo(5, 0);
    process.stdout.clearLine();
    process.stdout.write(mm_dd);
    process.stdout.cursorTo(0, 1);}
    
    
    day_emitter.on("newday", function({mm_dd,temp,weather){
    process.stdout.cursorTo(10, 0);
    process.stdout.clearLine();
    process.stdout.write(mm_dd);
    process.stdout.cursorTo(0, 1);

});
console.clear();
day_emitter.start();

shows time at three diff curoor positions

however we ca use deconsstructing assn and make it that we wrap the var in an obj so we dont have to not not extra var while calling out temp or weather so we do 

this.emit('newday', {mm_dd, weather,temp}) then

day_emitter.on("newday", function({mm_dd}){
    process.stdout.cursorTo(0, 0);
    process.stdout.clearLine();
    process.stdout.write(mm_dd);
    process.stdout.cursorTo(0, 1);
    
    {day_emitter.on("newday", function({temp}){
    process.stdout.cursorTo(5, 0);
    process.stdout.clearLine();
    process.stdout.write(mm_dd);
    process.stdout.cursorTo(0, 1);}
    
    
    day_emitter.on("newday", function({weather}){
    process.stdout.cursorTo(10, 0);
    process.stdout.clearLine();
    process.stdout.write(mm_dd);
    process.stdout.cursorTo(0, 1);

    