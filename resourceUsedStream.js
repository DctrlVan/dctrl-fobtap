const io = require('socket.io-client')
const Kefir = require('kefir')
const request = require('superagent')
const config = require('./configuration')

console.log('resourceUsedStream')

const socket = io('ws://' + config.brainLocation)

var resourceUsed //
module.exports = Kefir.stream(emitter => {
    resourceUsed = emitter.emit
}).log('resourceUsedStream')

socket.on('connect', ()=> {
    console.log('Connected!!!!*!~!!*~!~!~*~~')

    socket.emit('authentication', {
        token: config.token
    })

    socket.on('authenticated', ()=> {
      console.log('Connected with authentication!!!!*!~!!*~!~!~*~~')

      socket.on('eventstream', ev => {
        console.log('evstream', ev)
        if (
            ev.type === 'invoice-paid' &&
            ev.ownerId === config.resourceId
        ){
            let amount = 1
            // TODO: payout by CAD_AMOUNT / config.charged
            resourceUsed(amount)
        }

        if (
            ev.type === 'resource-used' &&
            ev.resourceId === config.resourceId
        ){
            let amount = 1
            resourceUsed(amount)
        }
      })
    })
})
