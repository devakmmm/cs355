/* Example 05: BirthdayEmitter.js (No Changes) */
const EventEmitter = require('events');
class BirthdayEmitter extends EventEmitter {
    constructor({birthdays, day_emitter} = spec){
        super();
        day_emitter.on("newday", ({mm_dd}) => {
            let month = Number.parseInt(`${mm_dd[0]}${mm_dd[1]}`);
            let day   = Number.parseInt(`${mm_dd[3]}${mm_dd[4]}`);
            birthdays
                .filter (birthday => birthday.month === month && birthday.day === day)
                .forEach(birthday => this.emit("birthday", {birthday}));
        });
    }
}
module.exports = BirthdayEmitter;