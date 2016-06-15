# Maker Market Matcher

## Intro/background
Keepers are defined in the [Maker white paper](https://makerdao.github.io/docs/#how-external-agents-assist-maker) as a class of agents that systematically earn an income from Maker and the Dai by exploiting simple profit opportunities.  Keepers are vital to Maker by participating in continuous splitting auctions, market making the dai around the target price and providing external information such as price feeds to Maker. The Maker Market Matcher is a Keeper that performs automatic trading, matching bids against asks when the bid price is higher than the ask price.


## Installation
* geth `brew install ethereum` (or [`apt-get` for ubuntu](https://github.com/ethereum/go-ethereum/wiki/Installation-Instructions-for-Ubuntu))
* solidity https://solidity.readthedocs.org/en/latest/installing-solidity.html
* Global dapple, `npm install -g dapple`

Clone and install:

```bash
git clone https://github.com/MakerDAO/maker-market-matcher
cd maker-market-matcher
git submodule update --init --recursive
npm install
dapple build
```

Deploy the Keeper contract.
Transfer tokens to the keeper contract to trade with.

## Usage
Start the Keeper by running `node keeper.js` 

## Running tests
Run dapple test