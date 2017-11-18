
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
        .post(config.brainLocation + 'fobtap')
        .send({
            fob,
            resourceId: config.resourceId
        })
        .end( (err, res)=>{
            if (err) return console.log( err.message )
            console.log("res.body:", res.body)
        })
})
