const request = require('superagent')
const config = require('./config')

var claimRequest, payoutRequest, activeBounty, claimant
function resetBountyClaim(){
  claimRequest  = {
    action: {
      type: "bounty-claimed",
    }
  }
  payoutRequest = {
    action: {
      type: "member-paid",
      "cash?": false,
    }
  }
  activeBounty = false
}
resetBountyClaim()

var notHandled = 0
function triggerNotHandled(isHandledCallback){
    notHandled++
    if ( notHandled === 2){
        isHandledCallback(false)
        notHandled = 0
    }
}

// exported
function bountyClaimProcess(scannedFob, isHandledCallback) {
    notHandled = 0
    bountyTagCheck(scannedFob, isHandledCallback)
    if (activeBounty) {
        // Have an active bounty so next tap is to claim bounty:
        attemptToClaim(scannedFob)
        isHandledCallback(true)
    } else {
      return triggerNotHandled(isHandledCallback)
    }
}

function attemptToClaim(scannedFob){
    request
        .get(config.brainLocation + 'members/' + scannedFob)
        .end((err, res) => {
            if (err || res.body.error || !Object.keys(res.body).length) {
                console.log('Invalid Fob')
                // clear bounty if random fob tries to claim?
                resetBountyClaim()
                return triggerNotHandled(isHandledCallback)
            } else {
                claimant = res.body
                payoutRequest.action["address"] = claimant.address
                claimRequest.action["address"] = claimant.address
                claimRequest.action["notes"] = Date.now().toString()

                claimReq()
                payoutReq()
                if (config.bountiesSlack){
                    slackReq()
                } else {
                    console.warn("missing slack hook")
                }
                resetBountyClaim()
            }
        })
}


function bountyTagCheck(scannedFob, isHandledCallback){
    request
        .get(config.brainLocation + 'bounties/' + scannedFob)
        .end((err, res) => {
            if ( err || res.body.error || !Object.keys(res.body).length ) {
                console.log('No bounty, bounties/:fob')
                triggerNotHandled(isHandledCallback)
            }

            activeBounty = res.body
            console.log("new active bounty!", activeBounty)

            let now = Date.now()
            let monthValue = activeBounty.value
            let lastClaimed = activeBounty.notes
            let amount = calculatePayout(monthValue, lastClaimed, now)
            // Build in the info we need from the bounty, next tap will send these requests
            claimRequest.action["bounty-id"] = activeBounty["bounty-id"]
            payoutRequest.action["notes"] = activeBounty["bounty-id"]
            payoutRequest.action["amount"] = amount.toString()
            // This was a bounty tag so we do not need to check for beer
            isHandledCallback(true)
        })
}

function claimReq(){
    request
        .post(config.brainLocation + 'bounties')
        .send(claimRequest)
        .end((err, res) => {
            if (err || res.body.error) {
                console.log(err, res.body)
            } else {
                console.log(res.body)
            }
        })
}

function payoutReq(){
    request
        .post(config.brainLocation + 'members')
        .send(payoutRequest)
        .end((err, res) => {
            if (err || res.body.error) {
                console.log(err, res.body)
            } else {
                console.log(res.body)
            }
        })
}

function slackReq(){
    request
        .post(config.bountiesSlack)
        .send({text: activeBounty.name + ' was claimed by ' + claimant.name+ ' for $'+ payoutRequest.action.amount})
        .end( (err, res)=> {
            if (err || res.body.error) {
                console.log(err, res.body)
            } else {
                console.log(res.body)
            }
        })
}

function calculatePayout(monthValue, lastClaimed, now){
    let msSince = now - lastClaimed
    let today = new Date()
    let daysThisMonth = new Date(today.getYear(), today.getMonth(), 0).getDate()
    let msThisMonth = daysThisMonth * 24 * 60 * 60 * 1000
    return (msSince / msThisMonth) * monthValue
}

module.exports = bountyClaimProcess
