var Web3 = require('web3')
var web3 = new Web3()
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'))

var dapple = require('./build/js_module.js')
var Dapple = new dapple.class(web3, 'morden')
var sugar = require('sugar')
console.log('keeper started')

var offers = []

startKeeper()

function startKeeper() {
    Dapple.objects.otc.last_offer_id(function (error, result) {
        if(!error) {
            var id = result.toNumber()
            console.log(id)
            if(id > 0) {
                synchronizeOffers(id)
                watchForUpdates()
            }
        }
        else {
            console.log(error)
        }
    })  
}

function watchForUpdates() {
    Dapple.objects.otc.ItemUpdate(function (error, result) {
        if(!error) {
            var id = result.args.id.toNumber()
            synchronizeOffers(id)
        }
    })
}

function synchronizeOffers(offer_id, max) {
    Dapple.objects.otc.offers(offer_id, function (error, data) {
        if(!error) {
            console.log(data)
            var sell_how_much = data[0]
            var sell_which_token = formattedString(data[1])
            var buy_how_much = data[2]
            var buy_which_token = formattedString(data[3])
            var owner = data[4]
            var active = data[5]
            if(active) {
                updateOffer(offer_id, sell_how_much, sell_which_token, buy_how_much, buy_which_token, owner)
            }
            else {
                removeOffer(offer_id)
            }
        }
        else {
            console.log(error)
        }
        if(max > 0 && offer_id > 1) {
            synchronizeOffers(offer_id - 1)
        }
        else {
            console.log('Amount of offers' + offers.length)
            showActiveOffers()
        }
    })
}

function showActiveOffers() {
    offers.forEach(function(offer) {
        console.log('offer id: ' + offer.id + ' sell_token: ' + offer.sell_which_token + ' sell_how_much: ' + offer.sell_how_much
        + ' buy_token: ' + offer.buy_which_token + ' buy_how_much: ' + offer.buy_how_much + ' ask_price: ' + offer.ask_price
        + ' bid_price: ' + offer.bid_price)
    })
}

function updateOffer(id, sell_how_much, sell_which_token, buy_how_much, buy_which_token, owner) {
    var newOffer = {
        id: id,
        owner: owner,
        buy_which_token: buy_which_token,
        sell_which_token: sell_which_token,
        sell_how_much: sell_how_much.toString(10),
        buy_how_much: buy_how_much.toString(10),
        ask_price: buy_how_much.div(sell_how_much).toNumber(),
        bid_price: sell_how_much.div(buy_how_much).toNumber()
    }
    
    var currentOffer = offers.find(function(offer) {
        return offer.id === newOffer.id
    })
    
    if(currentOffer == null) {
        offers.add(newOffer)    
    }
    else
    {
        offer.buy_how_much = buy_how_much.toString(10)
        offer.sell_how_much = sell_how_much.toString(10)
        ask_price = buy_how_much.div(sell_how_much).toNumber()
        bid_price = sell_how_much.div(buy_how_much).toNumber()
    }
}

function removeOffer(offer_id) {
    offers.remove(function(offer) { return offer.id === offer_id})
}

function formattedString (str) {
  return web3.toAscii(str).replace(/\0[\s\S]*$/g, '').trim()
}