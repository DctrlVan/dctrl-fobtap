
const request = require('superagent')
const config = require('./configuration')
const cryptoUtils = require('./crypto')
const fobtapStream = require('./fobtapStream')
const BloomFilter = require('bloom-filter')
const door = require('./reactions/door')

require('./reactions/' + config.reaction)

var filter

request
    .post(config.brainLocation + 'bloom')
    .set('Authorization', config.token)
    .end( (err, res)=>{
        if (err) {
            return console.log('err res from server, may be down, cannot get bloom', err)
        }
        if (res.body.filter){
            console.log('got a backup filter')
            filter = new BloomFilter( res.body.filter )
        }
        // TODO poll to keep up to date?
    })


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
                if (filter.contains( cryptoUtils.createHash(fob))){
                    console.log('fob passed bloom filter')
                    door()
                }
                return console.log('err res from server, may be down need a fallback', err)
            }
            console.log('fobtap registered!')
        })
})
