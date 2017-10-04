const r = require('rethinkdb')
const Kefir = require('kefir')
const request = require('superagent')
const config = require('./configuration')
var conn


// file listens for supplies used events and pas

var vendEmit = null
const vendStream = Kefir.stream(emitter => {
    vendEmit = emitter.emit
}).log('vendStream')

function startFeed(){
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
    .connect(config.rethink)
    .then(rethinkDbConnection => {
        console.log("db connected")
        conn = rethinkDbConnection
        startFeed()
    })


module.exports = {
    vendStream
}
