var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var SettingsSchema = new Schema({
    installation: {type: String , default: "local"},
    newLayoutsEnable: {type: Boolean , default: false},
    systemMessagesHide: {type: Boolean, default: false},
    forceTvOn: {type: Boolean, default: false},
    disableCECPowerCheck: {type: Boolean, default: false},
    defaultDuration: {type: Number, default: 10},
    language: {type: String , default: 'en'},
    logo: {type: String},
    url: {type: String},
    sshPassword: {type: String, default: null},
    enableLog : {type: Boolean, default: false},
    hideWelcomeNotice: {type: Boolean, default: false},
    reportIntervalMinutes:  {type: Number, default: 5},
    enableYoutubeDl : {type: Boolean, default: true},
    authCredentials: {
        user: {type: String , default: 'pi'},
        password: {type: String , default: 'pi'}
    }
}, {
    usePushEach: true
})

mongoose.model('Settings', SettingsSchema)

