
const request = require('superagent')
const config = require('./configuration')
const fobtapStream = require('./fobtapStream')

console.log(config)

// initialize reactions that listen to socket feed
require('./reactions/' + config.reaction)

// core functionality is read tap and hit post to server.
// see: https://github.com/DecentralVan/dctrl-admin/blob/master/server/fobtap/index.js
// this allows task claiming, layered on the resource used

fobtapStream
  .log()
  .throttle(2345, {trailing: false})
  .onValue(fob => {
    request
        .set('Authorization', config.token)
        .post(config.brainLocation + 'fobtap')
        .send({
            fob,
            resourceId: config.resourceId
        })
        .end( (err, res)=>{
            if (err) {
                // TODO
                return console.log('err res from server, may be down need a fallback', err)
            }
            console.log("result:", res)
            //
        })
})
