/* Example 04A: BirthdayEmitter.js */
const EventEmitter = require('events');
class BirthdayEmitter extends EventEmitter {
    constructor({ birthdays, day_emitter }) {
        super();
        day_emitter.on("newday", ({ mm_dd }) => { //listen for new events
            let month = Number.parseInt(`${mm_dd[0]}${mm_dd[1]}`); //pull out the month
            let day = Number.parseInt(`${mm_dd[3]}${mm_dd[4]}`); //pull out the days
            birthdays //its the list of birthdays in our json
                .filter(birthday => birthday.month === month && birthday.day === day) //for each row check if birthday month matches 
                .forEach(birthday => this.emit("birthday", { birthday })); //tell me what this does
        });
    }
}
module.exports = BirthdayEmitter;
