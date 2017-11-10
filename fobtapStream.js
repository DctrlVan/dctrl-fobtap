const Kefir = require('kefir')
const evdev = require('evdev')

const config = require('./configuration')

const reader = new evdev()
const device = reader.open(config.fobReader)

console.log({device})

var fob = ""
var emit = null

module.exports = Kefir.stream(emitter => {
    emit = emitter.emit
}).log()

reader.on("EV_KEY", function(data) {
    if (data.value == 1)
        keyparse(data.code)
})

function keyparse(code) {
    var key = code.substr(4);
    if (key == "ENTER") {
        emit(fob)
        fob = ""
    } else {
        fob = fob + key;
    }
}
