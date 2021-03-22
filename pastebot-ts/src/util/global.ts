let config;
try{
    config = require('../config.json');
}
catch{
    config = process.env;
}

export default {
    PREFIX: config.PREFIX,
    TOKEN: config.TOKEN,
};