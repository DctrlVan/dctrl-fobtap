

// bountyClaimProcess(fob, isHandled => {
//
//     console.log("Should Try to charge for beer", {isHandled})
//     if (!isHandled) {
//         checkWithBrain(fob)
//     }
//     fob = ""
// })
require('./dispense')
const fobtapStream = require('./tap')
const bountyChecker = require('./bountyChecker').bountyChecker
const vendChecker = require('./vend').vendChecker

// listen on the fob numbers from the reader and async chain bounty check then vend check
fobtapStream.onValue(fob => {
    bountyChecker(fob, isHandled => {
        if (!isHandled){
            vendChecker(fob)
        }
    })
})
