const config = require('./config')

const evdev = require('evdev')
const reader = new evdev()
const device = reader.open(config.fobReader)
var fob = ""
var emit = null

module.exports = fobtapStream

const fobtapStream = Kefir.stream(emitter => {
    emit = emitter.emit
})

reader.on("EV_KEY", function(data) {
    if (data.value == 1)
        keyparse(data.code)
});

function keyparse(code) {
    var key = code.substr(4);
    if (key == "ENTER") {
        emit(fob)
    } else {
        fob = fob + key;
    }
}
