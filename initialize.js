

const request = require('superagent')
const uuidV1 = require('uuid/v1')

// TODO
// auth by membername / password / resource name /
// use auth to get token, save token in file.
// index will load token from file, use it in socket
// assuming file on pi is fairly inaccessable

// 'faae510145073cdf4986c733d649b3514a139795e19cc35f2b0b9df210d753ac'

// createResource('faae510145073cdf4986c733d649b3514a139795e19cc35f2b0b9df210d753ac', null)


function createResource(token, callback){
    let uuid = uuidV1()
    console.log('attempting to create resource:', uuid)
    request
        .post('http://localhost:8003/events')
        .set('Authorization', token)
        .send({
            type: 'resource-created',
            resourceId: uuid,
            name: 'testresourcename',
            charged: 0
        })
        .end((err, res)=> {
            if (err) return console.log('err /events', {err})
            console.log('res body from /events, expect one inserted:', res.body)

        })
}
