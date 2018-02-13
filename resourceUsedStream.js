const Kefir = require('kefir')
const request = require('superagent')
const WebSocket = require('ws');

const config = require('./configuration')

const socket = new WebSocket('ws://' + config.brainLocation);

// ws.on('open', function open() {
//   ws.send('something');
// });
//
// ws.on('message', function incoming(data) {
//   console.log(data);
// });

console.log('resourceUsedStream')

const socket = io()

var resourceUsed //
module.exports = Kefir.stream(emitter => {
    resourceUsed = emitter.emit
}).log('resourceUsedStream')

socket.on('connect', ()=> {
    console.log('Connected!!!!*!~!!*~!~!~*~~')
    console.log('attempting to auth with', config.token)
    socket.emit('authentication', {
        token: config.token
    })

    socket.on('authenticated', ()=> {
      console.log('Connected with authentication!!!!*!~!!*~!~!~*~~')

      socket.on('eventstream', ev => {
        console.log('evstream', ev)
        if (
            ev.type === 'resource-used' &&
            ev.resourceId === config.resourceId
        ){
            let amount = 1
            if (ev.charged){
                amount = ev.amount / ev.charged
            }
            resourceUsed(amount)
        }
      })
    })
})
