/* Example 04B: index.js */
const birthdays = require("./data/birthdays.json");
const DayEmitter = require("./modules/DayEmitter");
const BirthdayEmitter = require("./modules/BirthdayEmitter");

const day_emitter = new DayEmitter();
const birthday_emitter = new BirthdayEmitter({birthdays, day_emitter});
let current_line = 1;

birthday_emitter.on("birthday", function({birthday}){
    process.stdout.cursorTo(0, current_line);
    console.log(birthday);
    current_line++
});

day_emitter.on("newday", function({mm_dd}){
    process.stdout.cursorTo(0, 0);
    process.stdout.clearLine();
    process.stdout.write(mm_dd);
    process.stdout.cursorTo(0, current_line);
});

console.clear();
day_emitter.start();