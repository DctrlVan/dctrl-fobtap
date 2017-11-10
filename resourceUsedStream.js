const r = require('rethinkdb')
const Kefir = require('kefir')
const request = require('superagent')
const config = require('./configuration')
var conn, resourceUsed

module.exports = Kefir.stream(emitter => {
    resourceUsed = emitter.emit
}).log('resourceUsedStream')

r.connect(config.rethink).then(rethinkDbConnection => {
    conn = rethinkDbConnection
    startFeed()
})

function startFeed(){
    r
        .table('events')
        .filter({
            type: "resource-used",
            resourceId: config.resourceId
        })
        .changes()
        .run(conn, (err, cursor)=> {
            if (err) return console.log('err getting feed', err)
            cursor.each((err, ev)=>{
                if (err) return console.log('err getting event', err)
                resourceUsed(1)
            })
        })
}
