const Kefir = require('kefir')
const request = require('superagent')
const config = require('./config')

var emit = null
const vendStream = Kefir.stream(emitter => {
    emit = emitter.emit
}).log('vendStream')

function vendChecker(scannedFob) {
  request
    .get(config.brainLocation + 'members/' + scannedFob)
    .end((err, res) => {
      if (err || res.body.error) {
        console.log('Invalid Fob', err, res.body)
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
      request
        .post(config.brainLocation + 'members')
        .send(chargeRequest)
        .end((err, res) => {
          if (err || res.body.error) {
            console.log('Unable to create')
            return null
          }
          console.log(res.body)
          emit(1)
        })
    })
}

module.exports = {
    vendChecker,
    vendStream
}
