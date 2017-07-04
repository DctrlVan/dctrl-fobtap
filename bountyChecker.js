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

function bountyTagCheck(fob, isHandledCallback){
    request
        .get(config.brainLocation + 'bounties/' + scannedFob)
        .end((err, res) => {
            if ( err || res.body.error ) {
                console.log('Invalid Fob, bounties/:fob')
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

function bountyClaimProcess(scannedFob, isHandledCallback) {
    bountyTagCheck(scannedFob, isHandledCallback)
    if (activeBounty) {
        // Have an active bounty so next tap is to claim bounty:
        request
            .get(config.brainLocation + 'members/' + scannedFob)
            .end((err, res) => {
                if (err || res.body.error) {
                    console.log('Invalid Fob')
                    // clear bounty if random fob tries to claim?
                    resetBountyClaim()
                    return isHandledCallback(false)
                } else {
                    claimant = res.body
                    payoutRequest.action["address"] = claimant.address
                    claimRequest.action["address"] = claimant.address
                    claimRequest.action["notes"] = Date.now().toString()

                    claimRequest()
                    payoutRequest()
                    slackReq()
                    resetBountyClaim()
                    isHandledCallback(true)
                }
            })
    }
}

function claimRequest(){
    request
        .post(config.brainLocation + 'bounties')
        .send(claimRequest)
        .end((err, res) => {
            if (err || res.body.error) {
              console.log('Unable to create')
            }
            console.log(res.body)
        })
}

function payoutRequest(){
    request
        .post(config.brainLocation + 'members')
        .send(payoutRequest)
        .end((err, res) => {
            if (err || res.body.error) {
              console.log('Unable to create')
            }
        })
}

function slackReq(){
    request
        .post(config.bountiesSlack)
        .send({text: activeBounty.name + ' was claimed by ' + claimant.name+ ' for $'+ payoutRequest.action.amount})
        .end( (err, res)=> {
            console.log({err,res})
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
