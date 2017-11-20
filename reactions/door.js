
const Kefir = require('kefir')
const exec = require('child_process').exec
const resourceUsedStream = require('../resourceUsedStream')

console.log('door reaction initialized')
resourceUsedStream
    .log('door') // unlocked (pin high) for 12 seconds
    .flatMapConcat(() => Kefir.sequentially(12345, [1, 0]))
    .onValue(pinValue => exec(`echo "` + pinValue + `"> /sys/class/gpio/gpio17/value`))
