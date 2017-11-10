
require('./dispense')

const request = require('superagent')
const config = require('./configuration')
const fobtapStream = require('./fobtapStream')
// listen on the fob numbers from the reader and async chain bounty check then vend check
fobtapStream
  .log()
  .throttle(2345, {trailing: false})
  .onValue(fob => {
    request
        .post(config.brainLocation + 'events')
        .send({
            fob,
            resourceId: config.resourceId,
            amount: 1,
            charged: config.charged
        })
        .end( (err, res)=>{
            console.log({err,res})
        })
})
