
const request = require('superagent')
const config = require('./config')

function vendChecker(scannedFob) {
  request
    .get(config.brainLocation + 'members/' + scannedFob)
    .end((err, res) => {
      if (err || res.body.error) {
        console.log('Invalid Fob')
        return null
      }
      let chargeRequest = {
        action: {
          type: "member-charged",
          address: res.body.address,
          amount: "3",
          notes: "BitPepsi"
        }
      }
      console.log({
        chargeRequest
      })
      request
        .post(config.brainLocation + 'members')
        .send(chargeRequest)
        .end((err, res) => {
          if (err || res.body.error) {
            console.log('Unable to create')
            return null
          }
          emit(1)
        })
    })
}


module.exports = vendChecker
