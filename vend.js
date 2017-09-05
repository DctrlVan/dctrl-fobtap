const Kefir = require('kefir')
const request = require('superagent')
const config = require('./configuration')

var emit = null
const vendStream = Kefir.stream(emitter => {
    emit = emitter.emit
}).log('vendStream')

function vendChecker(scannedFob) {
  // first check for valid member
  request
    .get(config.brainLocation + 'state/members/' + scannedFob)
    .end((err, res) => {
      if (err || res.body.error) {
        console.log('Invalid Fob', err, res.body)
        return null
      }
      let creditLimit = res.body.active * -3
      if ( res.body.balance < creditLimit){
          return console.log("Credit limit reached not vending :(")
      }
      // then create request to charge member, use supply
      let chargeEvent = {
          type: "member-charged",
          memberId: res.body.memberId,
          notes: "bitpepsi",
          amount: "3"
      }
      let usedEvent = {
          type: "supplies-used",
          amount: '1',
          supplyType:"bitpepsi",
          notes: res.body.memberId
      }
      // charge
      request
        .post(config.brainLocation + 'events/member_charge')
        .send(chargeEvent)
        .end((err, res) => {
          if (err || res.body.error) {
            console.log('Unable to create')
            return null
          }
          // update stock
          request
              .post(config.brainLocation + 'events/supplies_use')
              .send(usedEvent)
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
