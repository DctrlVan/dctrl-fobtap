
require('./dispense')

const request = require('superagent')
const config = require('./configuration')
const fobtapStream = require('./tap')
// listen on the fob numbers from the reader and async chain bounty check then vend check
fobtapStream
  .throttle(2345, {trailing: false})
  .onValue(fob => {
    request
        .post(config.brainLocation + 'fobtap')
        .send({
            fob,
            tapId: config.tapId
        })
        .end( (err, res)=>{
            console.log({err,res})
        })
})
