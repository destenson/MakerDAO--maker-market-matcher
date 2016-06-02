var Web3 = require('web3')
var web3 = new Web3()
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'))

var dapple = require('./build/js_module.js')
var Dapple = new dapple.class(web3, 'morden')
console.log('keeper started')

Dapple.objects.otc.last_offer_id(function (error, n) {
    console.log(n.toString())
})