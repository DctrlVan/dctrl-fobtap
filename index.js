
const request = require('superagent')
const BloomFilter = require('bloom-filter')
const config = require('./configuration')
const cryptoUtils = require('./crypto')
const fobtapStream = require('./fobtapStream')
const fs = require('fs')

require('./reactions/' + config.reaction)

var filter
// TODO: door work if server down
// request
//     .post(config.brainLocation + 'bloom')
//     .set('Authorization', config.token)
//     .end( (err, res)=>{
//         if (err) {
//             return console.log('err res from server, may be down, cannot get bloom', err)
//         }
//
//         console.log('got a backup filter')
//         filter = new BloomFilter( res.body.filter )
//         console.log({filter})
//
//         fs.writeFileSync(__dirname + '/bloom', filter)
//     })

fobtapStream
  .log()
  .throttle(2345, {trailing: false})
  .onValue(fob => {
    request
        .post(config.brainLocation + 'fobtap')
        .set('Authorization', config.token)
        .send({
            fob,
            resourceId: config.resourceId
        })
        .end( (err, res)=>{
            if (err) {
                console.log({err})
                // TODO:
                // if (config.reaction === 'door' && filter.contains( cryptoUtils.createHash(fob))){
                //     console.log('fob passed bloom filter')
                //     door()
                // }
                // return console.log('err res from server, may be down need a fallback', err)
            }
            console.log('fobtap registered!')
        })
})
