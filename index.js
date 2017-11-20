

const request = require('superagent')
const config = require('./configuration')
const fobtapStream = require('./fobtapStream')
require('./reactions/' + config.reaction)

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
            console.log("result:", res.body)
        })
})
