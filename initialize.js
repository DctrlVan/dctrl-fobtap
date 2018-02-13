
const prompt = require('prompt')
const request = require('superagent')
const uuidV1 = require('uuid/v1')
const uuidV4 = require('uuid/v4')
const colors = require("colors/safe");
const fs = require('fs')
const cryptoUtils = require('./crypto')

prompt.delimiter = colors.red("(>-_-<)")
prompt.start()

prompt.get([{
    name: 'admin',
    default: 'localhost:8003/',
    description: colors.white( 'Provide the root ip of dctrl-admin.'),
    type: 'string',
    required: true,
  },{
    name: 'name',
    default: 'newsource',
    description: colors.white( 'Provide a name for the new resource.'),
    type: 'string',
    required: true,
  }, {
      name: 'charged',
      default: 0,
      description: colors.white( 'How much should be charged on tap? (CAD).'),
      type: 'number',
      required: true,
  },{
      name: 'reaction',
      default: 'door',
      description: colors.white( 'What type of pin response: currently available: door, bitpepsi.'),
      type: 'string',
      required: true,
  }, {
      name: 'hackername',
      default: 'rhodes',
      description: colors.white( 'Your dctrl hackername'),
      type: 'string',
      required: true
  }, {
      name: 'secret',
      default: '1235',
      hidden: true,
      description: colors.white( 'please type your password'),
      type: 'string',
      required: true,
  }], function (err, promptData) {



      auth(promptData.admin, promptData.hackername, promptData.secret, (err, token)=>{
          if (err) {
              console.log('authentication failed, try again?')
              return prompt.stop()
          }

          console.log({token})

          createResource(promptData.admin, token, promptData.name, promptData.charged, (err, resourceInfo)=> {
              if (err){
                  console.log('creation failed, odd...')
                  console.log(err)
                  return prompt.stop()
              }

              console.log(colors.blue("resource created"), {resourceInfo})

              auth(promptData.admin, resourceInfo.resourceId, resourceInfo.secret, (err, resourceToken)=> {
                  console.log({resourceToken})

                  console.log(colors.yellow("Going to guess which keyboard is the reader"))
                  fs.readdir("/dev/input/by-id", function(err, items) {
                      console.log(colors.yellow("found input: ", items[0]))
                      console.log({promptData})
                      let str = "module.exports = " + JSON.stringify({
                          brainLocation: promptData.admin,
                          resourceId: resourceInfo.resourceId,
                          secret: resourceInfo.secret,
                          reaction: promptData.reaction,
                          token: resourceToken,
                          fobReader: "/dev/input/by-id/" + items[0] // ls /dev/input/by-id
                      })

                      fs.writeFileSync(__dirname + '/configuration.js', str)
                      console.log(colors.green( 'SUCCESS!!@#$@#@!' ))
                    })
              })
          })
      })
});

function auth(admin, name, secret, callback){
    let session = uuidV1()
    let sessionKey = cryptoUtils.createHash(session + secret)
    let token = cryptoUtils.hmacHex(session, sessionKey)
    console.log(colors.yellow('authenticating user', name, secret))
    request
        .post(admin + 'session')
        .set('Authorization', token)
        .set('Session', session)
        .set('name', name)
        .end((err,res)=>{
            if (err) {
                console.log(err)
                return callback(err)
            }
            console.log(colors.green("authenticated credentials for " + name))
            callback(null, token)
        })
}

function createResource(admin, token, name, charged, callback){
    let resourceId = uuidV1()
    let secret = uuidV4()
    console.log('attempting to create new resource:', name)
    request
        .post(admin + 'events')
        .set('Authorization', token)
        .send({
            type: 'resource-created',
            resourceId,
            name,
            charged,
            secret
        })
        .end((err, res)=> {
            if (err) return callback(err);

            callback(null, {
                secret,
                resourceId
            })
        })
}
