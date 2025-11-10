/* Example 05B: index.js */
const DayEmitter = require("./modules/DayEmitter");
const BirthdayEmitter = require("./modules/BirthdayEmitter");
const birthdays = require("./data/birthdays.json");				// Contains Birthday Data

const day_emitter = new DayEmitter();
const birthday_emitter = new BirthdayEmitter({birthdays, day_emitter});
let current_line = 1;

// Listen for Birthdays
birthday_emitter.on("birthday", function({birthday}){
    process.stdout.cursorTo(0, current_line);
    current_line++
    console.log(birthday);
});

// Listen for Day
day_emitter.on("newday", function({mm_dd}){
    process.stdout.cursorTo(0, 0);
    process.stdout.clearLine();
    process.stdout.write(mm_dd);
    process.stdout.cursorTo(0, current_line);
});

// Listen for Key Presses
const readline = require('readline');
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (character, keypress) => {
      if (character === 'p' && status === "running") {
        day_emitter.pause();
        status = "paused";
    }
    if (character === 'r' && status === "paused") {
        day_emitter.start();
        status = "running";
    }
    if (keypress.name === 'c' && keypress.ctrl === true) {
        process.exit(0);
    }
});

let status = "running";
console.clear();
day_emitter.start();