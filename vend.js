const r = require('rethinkdb')
const Kefir = require('kefir')
const request = require('superagent')
const config = require('./configuration')
var conn

var vendEmit = null
const vendStream = Kefir.stream(emitter => {
    vendEmit = emitter.emit
}).log('vendStream')

function startFeed(){
    console.log("starting feed...")
    r
        .table('events')
        .filter({
            type: "supplies-used",
            supplyType: "bitpepsi"
        })
        .changes()
        .run(conn, (err, cursor)=> {
            if (err) return console.log('err getting feed', err)
            cursor.each((err, ev)=>{
                if (err) return console.log('err getting event', err)
                console.log({ev})
                vendEmit(1)
            })
        })
}

r
    .connect({
        db: 'dctrl',
        host: config.rethinkLocation
    }).then(rethinkDbConnection => {
        console.log("db connected")
        conn = rethinkDbConnection
        startFeed()
    })

function vendChecker(scannedFob) {
  request
      .get(config.brainLocation + 'state/members/' + scannedFob)
      .end((err, res) => {
          if (err) {
            return console.log({err})
          }

          let creditLimit = res.body.active * -3
          if ( res.body.balance < creditLimit){
              return console.log("Credit limit reached not vending :(")
          }

          let usedReq = {
              charged: 3,
              amount: 1,
              memberId: res.body.memberId,
              supplyType: "bitpepsi",
              notes: 'dctrl-fobtap'
          }

          request
              .post(config.brainLocation + 'events/supplies_use')
              .send(usedReq)
              .end((err,res)=>{
                  console.log(res.body)
              })
      })
}

module.exports = {
    vendChecker,
    vendStream
}
