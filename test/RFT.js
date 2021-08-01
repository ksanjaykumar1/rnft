const {time} = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const { assert } = require('console');



// RFT is injected here by truffle
const RFT = artifacts.require('RFT.sol');
const NFT = artifacts.require('NFT.sol');
const DAI = artifacts.require('DAI.sol');

// web3 library is injected by truffle framework
// 1 eth = 10^18 wei

const DAI_AMOUNT = web3.utils.toWei('25000');
const SHARE_AMOUNT = web3.utils.toWei('25000');

contract('RFT', async addresses => {

    const [admin, buyer1, buyer2,buyer3,buyer4, _] = addresses;

    it('ICO should work', async ()=>{
        // deploy the DAI and NFT contract
        const dai = await DAI.new();
        const nft = await NFT.new('My awesome NF', 'NFT')
        
        // admin buying nft from nft contract
        await nft.mint(admin,1);

        //executing several async calls in parallel
        await Promise.all([
            dai.mint(buyer1,DAI_AMOUNT),
            dai.mint(buyer2,DAI_AMOUNT),
            dai.mint(buyer3,DAI_AMOUNT),
            dai.mint(buyer4,DAI_AMOUNT)
        ]);

        //deploying RFT contract
        // nft tokenId is one as minted above
        // price of 1 share is 1 dai
        const rft = await RFT.new(
            'MY awesome RFT',
            'RFT',
            nft.address,
            1,
            1,
            web3.utils.toWei('100000'),
            dai.address
        );
        // nft approving rft to spend nft token with tokenId 1
        await nft.approve(rft.address,1);
        await rft.startIco();

        //by default the first address calls the function if we don't specify the from address
    
        //for buyer 1
        await dai.approve(rft.address,DAI_AMOUNT,{from: buyer1});
        await rft.buyShare(SHARE_AMOUNT,{from: buyer1});

        //for buyer 2
        await dai.approve(rft.address,DAI_AMOUNT,{from: buyer2});
        await rft.buyShare(SHARE_AMOUNT,{from: buyer2});

        //for buyer 3
        await dai.approve(rft.address,DAI_AMOUNT,{from: buyer3});
        await rft.buyShare(SHARE_AMOUNT,{from: buyer3});

        //for buyer 4
        await dai.approve(rft.address,DAI_AMOUNT,{from: buyer4});
        await rft.buyShare(SHARE_AMOUNT,{from: buyer4});

        //test-helper helps in manulplate time in our local blockchain 

        await time.increase(7 * 86400 +1);
        await rft.withdrawIcoProfits();
        
        const balanceofShareBuyer1= await rft.balanceOf(buyer1);
        const balanceofShareBuyer2= await rft.balanceOf(buyer2);
        const balanceofShareBuyer3= await rft.balanceOf(buyer3);
        const balanceofShareBuyer4= await rft.balanceOf(buyer4);

        assert( balanceofShareBuyer1.toString() === SHARE_AMOUNT );
        assert( balanceofShareBuyer2.toString() === SHARE_AMOUNT );
        assert( balanceofShareBuyer3.toString() === SHARE_AMOUNT );
        assert( balanceofShareBuyer4.toString() === SHARE_AMOUNT );

        const balanceAdminDai = await dai.balanceOf(admin);

        assert(balanceAdminDai.toString()=== web3.utils.toWei('100000'))



    })

})

