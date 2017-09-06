const request = require('superagent')
const config = require('./configuration')

// As taps are recieved claimRequest is built
var claimEvent, activeBounty, notHandled
resetBountyClaim()

function resetBountyClaim(){
    claimEvent  = {
        type: "bounty-claimed",
        notes: "dctrl-fobtap"
    }
    activeBounty = false
    notHandled = 0
}

// Wrapper around callback, pass must be called twice to trigger callback (see *)
function pass(isHandledCallback){
    notHandled++
    if ( notHandled === 2){
        isHandledCallback(false)
        notHandled = 0
    }
}

// exported
function bountyChecker(scannedFob, isHandledCallback) {
    notHandled = 0
    // we always check if its a bounty tag
    bountyTagCheck(scannedFob, isHandledCallback)
    if (activeBounty) {
        // regardless of what happens we have an active bounty so we don't vend
        isHandledCallback(true)
        // Have an active bounty so next tap is to claim bounty:
        attemptToClaim(scannedFob, isHandledCallback)
    } else {
        //* triggering once here allows an unsuccessful bounty tag check to pass to the vend check
        pass(isHandledCallback)
    }
}

function attemptToClaim(scannedFob, isHandledCallback){
    request
        .get(config.brainLocation + 'state/members/' + scannedFob)
        .end((err, res) => {
            if (err) {
                // the fob is invalid so we reset the status and try to pass
                resetBountyClaim()
                return pass(isHandledCallback)
            } else {
                claimant = res.body
                claimRequest.memberId = claimant.memberId

                claimReq((err, res)=> {
                    if (err) return console.log('claimReq error', err)
                    slackReq((err, res)=> {
                            resetBountyClaim()
                            if (err) return console.log('slack err: ', err);
                            console.log('success!')
                        })
                })
            }
        })
}


function bountyTagCheck(scannedFob, isHandledCallback){
    request
        .get(config.brainLocation + 'bounties/' + scannedFob)
        .end((err, res) => {
            if ( err || res.body.error || !Object.keys(res.body).length ) {
                console.log('No bounty, bounties/:fob')
                pass(isHandledCallback)
            } else {
                activeBounty = res.body

                let monthValue = activeBounty.value
                let lastClaimed = activeBounty.lastClaimed
                let amount = calculatePayout(monthValue, lastClaimed)
                // Build in the info we need from the bounty, next tap will send these requests
                claimRequest.bountyId = activeBounty.bountyId

                // This was a bounty tag so tap has been handled
                isHandledCallback(true)
            }
        })
}

function slackReq(callback){
    request
        .post(config.bountiesSlack)
        .send({text: activeBounty.name + ' was claimed by ' + claimant.name+ ' for $'+ payoutRequest.action.amount})
        .end(callback)
}
// The value
function calculatePayout(bounty){
    let msThisMonth = calculateMsThisMonth()
    let msSince = Date.now() - bounty.lastClaimed
    let payout = (msSince / msThisMonth) * parseFloat(bounty.value)
    let cap = parseFloat(bounty.cap)
    let boost = parseFloat(bounty.boost) || 0
    if (cap > 0){
        return Math.min(payout, cap) + boost
    }
    else {
        return payout + boost
    }
}

module.exports = { bountyChecker }
