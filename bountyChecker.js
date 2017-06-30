
const brainLocation = require('./config').brainLocation
const request = require('superagent')

module.exports = bountyClaimProcess

function bountyClaimProcess(scannedFob, isHandledCallback) {
  if (activeBounty) {
      // Have an active bounty so next tap is to claim bounty:
      request
          .get(brainLocation + 'members/' + scannedFob)
          .end((err, res) => {
            if (err || res.body.error) {
              console.log('Invalid Fob')
              // clear bounty if random fob tries to claim?
              resetBountyClaim()
              return isHandledCallback(false)
            }

            payoutRequest.action["address"] = res.body.address
            claimRequest.action["address"] = res.body.address
            claimRequest.action["notes"] = Date.now().toString()

            console.log({payoutRequest, claimRequest})

            request
                .post(brainLocation + 'members')
                .send(payoutRequest)
                .end((err, res) => {
                    if (err || res.body.error) {
                      console.log('Unable to create')
                      return null
                    }
                    console.log(res.body)
                })

            request
                .post(brainLocation + 'bounties')
                .send(claimRequest)
                .end((err, res) => {
                    if (err || res.body.error) {
                      console.log('Unable to create')
                    }
                    console.log(res.body)
                })
            request
                .post(bountiesSlack)
                .send({text: activeBounty.name + ' was claimed by ' + res.body.name+ ' for $'+ payoutRequest.action.amount})
                .end( (err, res)=> {
                    console.log({err,res})
                })


            resetBountyClaim()
            isHandledCallback(true)

          })
  } else {
    request
      .get(brainLocation + 'bounties/' + scannedFob)
      .end((err, res) => {
          if (err || res.body.error || ( Object.keys(res.body).length === 0 ) ) {
              console.log('Invalid Fob, bounties/:fob')
              return isHandledCallback(false)
          }

          activeBounty = res.body
          console.log("res to bounties/:fob", activeBounty)
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


}
