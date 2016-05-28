'use strict';

// For geth
if (typeof dapple === 'undefined') {
  var dapple = {};
}

if (typeof web3 === 'undefined' && typeof Web3 === 'undefined') {
  var Web3 = require('web3');
}

dapple['market-maker-matcher'] = (function builder () {
  var environments = {
      'default': 'morden'
    };

  function ContractWrapper (headers, _web3) {
    if (!_web3) {
      throw new Error('Must supply a Web3 connection!');
    }

    this.headers = headers;
    this._class = _web3.eth.contract(headers.interface);
  }

  ContractWrapper.prototype.deploy = function () {
    var args = new Array(arguments);
    args[args.length - 1].data = this.headers.bytecode;
    return this._class.new.apply(this._class, args);
  };

  var passthroughs = ['at', 'new'];
  for (var i = 0; i < passthroughs.length; i += 1) {
    ContractWrapper.prototype[passthroughs[i]] = (function (passthrough) {
      return function () {
        return this._class[passthrough].apply(this._class, arguments);
      };
    })(passthroughs[i]);
  }

  function constructor (_web3, env) {
    if (!env) {
      env = 'morden';
    }
    while (typeof env !== 'object') {
      if (!(env in environments)) {
        throw new Error('Cannot resolve environment name: ' + env);
      }
      env = environments[env];
    }

    if (typeof _web3 === 'undefined') {
      if (!env.rpcURL) {
        throw new Error('Need either a Web3 instance or an RPC URL!');
      }
      _web3 = new Web3(new Web3.providers.HttpProvider(env.rpcURL));
    }

    this.headers = {
      'TraderKeeper': {
        'interface': [
          {
            'constant': false,
            'inputs': [
              {
                'name': 'which_token',
                'type': 'bytes32'
              },
              {
                'name': 'token_amount',
                'type': 'uint256'
              }
            ],
            'name': 'withdraw',
            'outputs': [],
            'type': 'function'
          },
          {
            'constant': false,
            'inputs': [
              {
                'name': 'which_token',
                'type': 'bytes32'
              },
              {
                'name': 'token_amount',
                'type': 'uint256'
              }
            ],
            'name': 'deposit',
            'outputs': [],
            'type': 'function'
          },
          {
            'constant': false,
            'inputs': [
              {
                'name': 'bid_id',
                'type': 'uint256'
              },
              {
                'name': 'ask_id',
                'type': 'uint256'
              },
              {
                'name': 'quantity',
                'type': 'uint256'
              }
            ],
            'name': 'trade',
            'outputs': [],
            'type': 'function'
          },
          {
            'inputs': [
              {
                'name': 'contract_address',
                'type': 'address'
              }
            ],
            'type': 'constructor'
          }
        ],
        'bytecode': '60606040526040516020806103fc833981016040528080519060200190919050505b80600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908302179055505b506103a08061005c6000396000f360606040526000357c010000000000000000000000000000000000000000000000000000000090048063040cf0201461004f5780631de26e16146100705780634ee8d115146100915761004d565b005b61006e60048080359060200190919080359060200190919050506100bb565b005b61008f6004808035906020019091908035906020019091905050610173565b005b6100b960048080359060200190919080359060200190919080359060200190919050506101d2565b005b6000600060005060003373ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600050905081816000016000506000856000191681526020019081526020016000206000505410151561014757818160000160005060008560001916815260200190815260200160002060008282825054039250508190555061016d565b600081600001600050600085600019168152602001908152602001600020600050819055505b5b505050565b80600060005060003373ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000506000016000506000846000191681526020019081526020016000206000828282505401925050819055505b5050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1660405180807f6275795061727469616c2875696e743235362c2075696e743235362900000000815260200150601c01905060405180910390207c010000000000000000000000000000000000000000000000000000000090048483604051837c010000000000000000000000000000000000000000000000000000000002815260040180838152602001828152602001925050506000604051808303816000876161da5a03f19250505050600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1660405180807f6275795061727469616c2875696e743235362c2075696e743235362900000000815260200150601c01905060405180910390207c010000000000000000000000000000000000000000000000000000000090048383604051837c010000000000000000000000000000000000000000000000000000000002815260040180838152602001828152602001925050506000604051808303816000876161da5a03f192505050505b50505056'
      }
    };

    this.classes = {};
    for (var key in this.headers) {
      this.classes[key] = new ContractWrapper(this.headers[key], _web3);
    }

    this.objects = {};
    for (var i in env.objects) {
      var obj = env.objects[i];
      this.objects[i] = this.classes[obj['class']].at(obj.address);
    }
  }

  return {
    class: constructor,
    environments: environments
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = dapple['market-maker-matcher'];
}
