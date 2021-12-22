const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = () => {
    return new User(
        // { displayName: 'test', googleId: 'test' }
        {}
        ).save();
}