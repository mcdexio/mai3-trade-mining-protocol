const { ethers } = require("hardhat");
import { expect } from "chai";
import { MerkleTree } from 'merkletreejs'

import {
    toWei,
    getAccounts,
    createContract,
    padAccount,
    hash
} from '../scripts/utils';


describe('Staking', () => {
    let redeem;
    let rewardToken;
    let user0;
    let user1;
    let user2;
    let user3;

    const makeTree = accounts => new MerkleTree(
        accounts.map(x => padAccount(x)),
        hash,
        { sortPairs: true }
    )

    const makeLeaf = (user, amount) => ethers.utils.solidityKeccak256(["address", "uint256"], [user, amount])

    before(async () => {
        const accounts = await getAccounts()
        user0 = accounts[0]
        user1 = accounts[1]
        user2 = accounts[2]
        user3 = accounts[3]
    })

    beforeEach(async () => {
        redeem = await createContract("MerkleRedeem")
        rewardToken = await createContract("TestERC20", ["TTK", "TTK", 18])
        await redeem.initialize(rewardToken.address)

    })

    it("merkle", async () => {
        const data = require('../merkle/epoch0.json')
        const tree = makeTree(data.map(x => makeLeaf(x[0], x[1])))
        const root = "0x" + tree.getRoot().toString('hex')
        await redeem.seedAllocations(0, root, 0)

        const proof = tree.getHexProof(makeLeaf("0x022e3ce4eda264b3e3fef62036c8182ceb88e6ce", "19672585927448070489"))
        await expect(redeem.claimEpoch(0, "19672585927448070489", proof)).to.be.revertedWith("Incorrect merkle proof")
    })

    it("merkle2", async () => {
        const data = require('../merkle/epoch0.json')
        data.push([user0.address, toWei("1.23")])
        const tree = makeTree(data.map(x => makeLeaf(x[0], x[1])))
        const root = "0x" + tree.getRoot().toString('hex')
        await redeem.seedAllocations(0, root, 0)

        await rewardToken.mint(user0.address, toWei("1.23"))
        await rewardToken.transfer(redeem.address, toWei("1.23"))

        const proof = tree.getHexProof(makeLeaf(user0.address, toWei("1.23")))
        await redeem.claimEpoch(0, toWei("1.23"), proof)

        expect(await rewardToken.balanceOf(user0.address)).to.equal(toWei("1.23"))
        expect(await rewardToken.balanceOf(redeem.address)).to.equal(0)

        await redeem.claimEpochs([{ epoch: 0, amount: toWei("1.23"), merkleProof: proof }])

        expect(await rewardToken.balanceOf(user0.address)).to.equal(toWei("1.23"))
        expect(await rewardToken.balanceOf(redeem.address)).to.equal(0)
    })
})