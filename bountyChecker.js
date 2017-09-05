const request = require('superagent')
const config = require('./configuration')
var claimRequest, payoutRequest, activeBounty, claimant

function resetBountyClaim(){
    claimRequest  = {
        type: "bounty-claimed"
    }
    payoutRequest = {
        type: "member-paid",
        isCash: false
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
    //
    bountyTagCheck(scannedFob, isHandledCallback)
    if (activeBounty) {
        // Have an active bounty so next tap is to claim bounty:
        attemptToClaim(scannedFob, isHandledCallback)
        isHandledCallback(true)
    } else {
        triggerNotHandled(isHandledCallback)
    }
}

function attemptToClaim(scannedFob, isHandledCallback){
    request
        .get(config.brainLocation + 'members/' + scannedFob)
        .end((err, res) => {
            if (err || res.body.error || !Object.keys(res.body).length) {
                console.log('Invalid Fob')
                // clear bounty if random fob tries to claim?
                resetBountyClaim()
                // no response indicates
                return triggerNotHandled(isHandledCallback)
            } else {
                claimant = res.body
                payoutRequest.memberId = claimant.memberId
                claimRequest.memberId = claimant.memberId
                claimRequest.notes = "dctrl-fobtap"

                claimReq((err, res)=> {
                    if (err) return console.log('claimReq error', err)
                    payoutReq((err,res)=> {
                        if (err) return console.log('payoutReq error', err)
                        // TODO: flash led to show bounty claimed successfully
                        slackReq((err, res)=> {
                            resetBountyClaim()
                            if (err) return console.log('slack err: ', err);
                            console.log('success!')
                        })
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
                triggerNotHandled(isHandledCallback)
            } else {
                activeBounty = res.body
                console.log("new active bounty!", activeBounty)

                let monthValue = activeBounty.value
                let lastClaimed = activeBounty['last-claimed']
                let amount = calculatePayout(monthValue, lastClaimed)
                // Build in the info we need from the bounty, next tap will send these requests
                claimRequest.bountyId = activeBounty.bountyId
                payoutRequest.notes = activeBounty.bountyId
                payoutRequest.amount = amount.toString()
                // This was a bounty tag so tap has been handled
                isHandledCallback(true)
            }
        })
}

function claimReq(callback){
    console.log(claimRequest)
    request
        .post(config.brainLocation + 'bounties')
        .send(claimRequest)
        .end(callback)
}

function payoutReq(callback){
    console.log(payoutRequest)
    request
        .post(config.brainLocation + 'members')
        .send(payoutRequest)
        .end(callback)
}

function slackReq(callback){
    request
        .post(config.bountiesSlack)
        .send({text: activeBounty.name + ' was claimed by ' + claimant.name+ ' for $'+ payoutRequest.action.amount})
        .end(callback)
}

function calculatePayout(monthValue, lastClaimed){
    let msSince = Date.now() - (lastClaimed * 1000)
    let today = new Date()
    let daysThisMonth = new Date(today.getYear(), today.getMonth(), 0).getDate()
    let msThisMonth = daysThisMonth * 24 * 60 * 60 * 1000
    return (msSince / msThisMonth) * monthValue
}

module.exports = bountyClaimProcess
