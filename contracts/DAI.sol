pragma solidity ^0.7.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract DAI is ERC20{

    constructor() ERC20('DAI Stable Coin','Dai'){}

    function mint(address to, uint amount) external {
        _mint(to, amount);
    }

}