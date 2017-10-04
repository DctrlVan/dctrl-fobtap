

// bountyClaimProcess(fob, isHandled => {
//
//     console.log("Should Try to charge for beer", {isHandled})
//     if (!isHandled) {
//         checkWithBrain(fob)
//     }
//     fob = ""
// })
require('./dispense')
const config = require('./configuration')
const request = require('superagent')
const fobtapStream = require('./tap')
// listen on the fob numbers from the reader and async chain bounty check then vend check
fobtapStream
  .throttle(2345, {trailing: false})
  .onValue(fob => {
    request
        .post(config.brainLocation + 'events/bounties_claim')
        .send({
            fob,
            tapId: config.tapId
        })
        .end( (err, res)=>{
            console.log({err,res})
        })
})
