const express = require('express');

const AsyncRoute = require('../Utils/AsyncRoute.js')

const router = express.Router();

const fetchV10 = require('../MicrosoftGraph/fetchV10.js')

module.exports = router