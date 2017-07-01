

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
const bountyChecker = require('./bountyChecker')
const vendChecker = require('./vend').vendChecker

// fob ~ rfid tags the members have
fobtapStream.onValue(fob => {
    bountyChecker(fob, isHandled => {
        if (!isHandled){
            vendChecker(fob)
        }
    })
})
