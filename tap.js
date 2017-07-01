const Kefir = require('kefir')
const evdev = require('evdev')

const config = require('./config')

const reader = new evdev()
const device = reader.open(config.fobReader)

var fob = ""
var emit = null

const fobtapStream = Kefir.stream(emitter => {
    emit = emitter.emit
}).log()

module.exports = fobtapStream

reader.on("EV_KEY", function(data) {
    if (data.value == 1)
        keyparse(data.code)
});

function keyparse(code) {
    var key = code.substr(4);
    if (key == "ENTER") {
        emit(fob)
        fob = ""
    } else {
        fob = fob + key;
    }
}
