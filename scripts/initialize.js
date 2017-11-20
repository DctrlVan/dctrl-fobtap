const config = require('../configuration')
const request = require('superagent')

let newEvent = {
    type: 'resource-created',
    resourceId: config.resourceId,
    charged: config.charged
}

request
    .post('http://'+ config.brainLocation +'events')
    .send(newEvent)
    .end((err, res) => {
        if (err) return console.log(err)
        console.log({newEvent})
        console.log(res.body)
    })
