'use strict';
const DEFAULT_DATABAASE = "realms://driveraid.us1a.cloud.realm.io/default";


var util = require('util'),
    winston = require('winston'),
    Realm = require('realm');

// const Driver = {
//     name: 'Driver',
//     primaryKey: 'userId',
//     properties: {
//     userId: {type: 'string', optional: false},
//     FullName: {type: 'string', optional: false},
//     UserName: {type: 'string', optional: false},
//     Phone: {type: 'string', optional: false},
//     Email: {type: 'string', optional: false},
//     PlateNumber: {type: 'string', optional: false},
//     CarType: {type: 'string', optional: false},
//     NationalID: {type: 'string', optional: false},
// }
// };
// exports.Driver = Driver
// var remoteRealm = exports.remoteRealm = Realm.open(global.currentSyncUser.createConfiguration())
// var remoteRealm = exports.remoteRealm = Realm.open({
//     sync: {
//         url: DEFAULT_DATABAASE,
//         user: global.currentSyncUser,
//     },
//     schema: [Driver],
// });
var remoteRealm = exports.remoteRealm = Realm.open(global.currentSyncUser.createConfiguration());

var RealmLogger = exports.Realm = function (options) {
    winston.Transport.call(this, options);

    //
    // Configure the Realm`
    //
    let LogSchema = {
        name: 'Log',
        properties: {
            level: 'string',
            message: 'string',
            timestamp: 'date',
        }
    };

    this.realm = new Realm({
        path: 'winston.realm',
        schema: [LogSchema]
    });
};

//
// Inherit from `winston.Transport` so you can take advantage
// of the base functionality and `.handleExceptions()`.
//
util.inherits(RealmLogger, winston.Transport);

//
// Expose the name of this Transport on the prototype
//
RealmLogger.prototype.name = 'realm';

//
// Define a getter so that `winston.transports.Realm`
// is available and thus backwards compatible.
//
winston.transports.Realm = RealmLogger;

//
// ### function log (level, msg, [meta], callback)
// #### @level {string} Level at which to log the message.
// #### @msg {string} Message to log
// #### @meta {Object} **Optional** Additional metadata to attach
// #### @callback {function} Continuation to respond to when complete.
// Core logging method exposed to Winston. Metadata is optional.
//
RealmLogger.prototype.log = function (level, msg, meta, callback) {
    let ts = new Date();

    this.realm.write(() => {
        this.realm.create('Log', {level: level, message: msg, timestamp: ts});
    });

    callback(null, true);
};
