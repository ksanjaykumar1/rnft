pragma solidity ^0.7.0;

import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract RFT is ERC20{

    //by default these values will be zero
    uint public icoSharePrice;
    uint public icoShareSupply;
    uint public icoEnd;

    uint public nftId;
    IERC721 public nft;
    IERC20 public dai;

    // address of the owner of the NFT
    address public admin;

    // creating tokens  , the user will pass the name and symbol of the token
    // _nftAddress is address of NFT contact in which his token exist
    //_nftId , id of token in _nftAddress
    //_icoShareSupply , number of shares he wants to create and 
    // _icoSharePrice price of each share
    // _daiAddress , the token address of the token which he will accept has payment
    constructor(
        string memory _name,
        string memory _symbol,
        address _nftAddress,
        uint _nftId,
        uint _icoSharePrice,
        uint _icoShareSupply,
        address _daiAddress
    )ERC20(_name, _symbol)
    {
        nftId=_nftId;
        nft=IERC721(_nftAddress);
        dai=IERC20(_daiAddress);
        icoSharePrice=_icoSharePrice;
        icoShareSupply=_icoShareSupply;
        admin = msg.sender;
    }

    // this will take nft from owner and then lock this nft inside this contract
    //which will kick start the token sale
    function startIco() external {
        //only admin can call this function
        require(msg.sender == admin,'only admin');
        nft.transferFrom(msg.sender, address(this), nftId);
        //ico will end in one week 
        // 86400 is the number of second in one day(24hr)
        icoEnd = block.timestamp + 7 *86400;
    }

    function buyShare(uint shareAmount) external{
        require(icoEnd > 0,'ICO not started yet');
        require(block.timestamp <= icoEnd,'ICO is finished');
        // we are inheriting totalSupply() from ERC20
        // totalSupply() gives the total supply of the token 
        require(totalSupply()+ shareAmount <= icoShareSupply,'Not enough shares left');
        // calculating the total bill 
        uint daiAmount = shareAmount* icoSharePrice;
        //dai tokens are sent to this contract address
        dai.transferFrom(msg.sender, address(this),daiAmount);
        // calling mint function to create tokens from inherited ERC20 contract
        _mint(msg.sender, shareAmount);

    }

    function withdrawIcoProfits() external {
        require(msg.sender== admin, 'only admin');
        require(block.timestamp > icoEnd , 'ICO not finished yet');
        uint daiBalance = dai.balanceOf(address(this));
        if (daiBalance > 0){
            dai.transfer(admin,daiBalance);
        }
        uint unsoldShareBalance = icoShareSupply - totalSupply();
        if(unsoldShareBalance >0)
        {
            _mint(admin, unsoldShareBalance);
        }
    }


}

