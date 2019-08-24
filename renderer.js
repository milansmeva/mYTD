

require('angular');

angular
    .module("mYTD", [])
    .controller('mainController', require('./controller/main.controller')).factory('downloadService', require("./services/download.service"))
    .factory('databaseService',require('./services/database.service'))