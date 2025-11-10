/* Example 05A: DayEmitter.js */
const EventEmitter = require('events');
class DayEmitter extends EventEmitter {
    constructor(update_time = 240) {
        super();
        this.day = new Date();
        this.update_time = update_time;				// How many ms should represent a day
    }
    start(){
        this.day.setDate(this.day.getDate() + 1);					   // Adds 1 to Day
        let mm = `${(this.day.getMonth() + 1 + "").padStart(2, "0")}`; // 0 = Jan, WTF?
        let dd = `${(this.day.getDate() + "").padStart(2, "0")}`;
        this.emit('newday', {mm_dd:`${mm}/${dd}`});	          // Returns {mm_dd:"mm/dd"}
        this.sleep();
    }
    sleep(){
        this.timeout_id = setTimeout(() => this.start(), this.update_time);
    }
    pause(){
        clearTimeout(this.timeout_id);
    }
}
module.exports = DayEmitter;


sleep(){
    this.timeout_id = setTimeout(() => this.start(), this.update_time);
}
pause(){
    clearTimeout(this.timeout_id);
}
}; // what does thid do 