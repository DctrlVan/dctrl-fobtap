const Kefir = require('kefir')
const request = require('superagent')
const config = require('./config')

var emit = null
const vendStream = Kefir.stream(emitter => {
    emit = emitter.emit
}).log('vendStream')

function vendChecker(scannedFob) {
  // first check for valid member
  request
    .get(config.brainLocation + 'members/' + scannedFob)
    .end((err, res) => {
      if (err || res.body.error) {
        console.log('Invalid Fob', err, res.body)
        return null
      }
      // then create request to charge member, use supply
      let chargeRequest = {
        action: {
          type: "member-charged",
          address: res.body.address,
          amount: "3",
          notes: "BitPepsi"
        }
      }
      let supplyUsedRequest = {
          action: {
              type: "supplies-used",
              amount: '1',
              "supply-type":"bitpepsi",
              notes: res.body.address
          }
      }
      // charge
      request
        .post(config.brainLocation + 'members')
        .send(chargeRequest)
        .end((err, res) => {
          if (err || res.body.error) {
            console.log('Unable to create')
            return null
          }
          // update stock
          request
              .post(config.brainLocation + 'dctrl')
              .send(supplyUsedRequest)
              .end((err,res)=>{
                  // pass to dispense
                  emit(1)
              })
        })
  })
}

module.exports = {
    vendChecker,
    vendStream
}
