const request = require('superagent')
const config = require('./configuration')

// As taps are recieved claimRequest is built
var bountyId
resetActiveBounty()

function resetActiveBounty(){
    bountyId = false
}

// Wrapper around callback, pass must be called twice to trigger callback (see *)
var notHandled = 0
function pass(isHandledCallback){
    notHandled++
    if ( notHandled === 2){
        isHandledCallback(false)
        notHandled = 0
    }
}

// exported
function bountyChecker(scannedFob, isHandledCallback) {
    bountyTagCheck(scannedFob, isHandledCallback)
    if (bountyId) {
        attemptToClaim(scannedFob, isHandledCallback)
    } else {
        //* triggering once here allows an unsuccessful bounty tag check to pass to the vend check
        pass(isHandledCallback)
    }
}

function attemptToClaim(fob, bountyId, isHandledCallback){
    request
        .post(config.brainLocation + 'events/bounties_claim')
        .send({
            fob,
            bountyId
        })
        .end((err, res) => {
            if (err) {
                resetActiveBounty()
                return pass(isHandledCallback)
            }
        })
}


function bountyTagCheck(scannedFob, isHandledCallback){
    request
        .get(config.brainLocation + 'state/bounties/' + scannedFob)
        .end((err, res) => {
            if (err) {
                pass(isHandledCallback)
            } else {
                bountyId = res.body.bountyId
            }
        })
}



module.exports = {
  bountyChecker
}
