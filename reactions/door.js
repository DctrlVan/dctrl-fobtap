
const resourceUsedStream = require('../resourceUsedStream')
const Gpio = require('onoff').Gpio
const pin = new Gpio(17, 'out')

console.log('door reaction initialized')
resourceUsedStream
    .log('door') // unlocked (pin high) for 12 seconds
    .onValue(door)

function door(){
    pin.writeSync(1)
    setTimeout(()=>{
        pin.writeSync(0)
    }, 12345)
}
