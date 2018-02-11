
const resourceUsedStream = require('../resourceUsedStream')
const Gpio = require('onoff').Gpio
const pin = new Gpio(17, 'out')

console.log('door reaction initialized')

// TODO: because the door is critical it should survive the server being down.
// Do not really want the resources to have everyones fob.
// Thinking the server should provide a fob bloom filter that can be tested against
// as a fallback.

resourceUsedStream
    .log('door') // unlocked (pin high) for 12 seconds
    .onValue(door)

function door(){
    pin.writeSync(1)
    setTimeout(()=>{
        pin.writeSync(0)
    }, 12345)
}

module.exports = door
