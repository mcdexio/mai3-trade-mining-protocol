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

    const makeLeaf = (user, amount) => ethers.utils.solidityKeccak256(["address", "uint256"], [user.address, amount])

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
        const data = [
            [user0, toWei("1")],
            [user1, toWei("2")],
            [user2, toWei("3")],
        ]
        const leaves = data.map(x => makeLeaf(x[0], x[1]))
        const tree = makeTree(leaves)
        const root = tree.getRoot().toString('hex')
        {
            const leaf = makeLeaf(user0, toWei("1"))
            const proof = tree.getProof(leaf)
            expect(tree.verify(proof, leaf, root)).to.be.true // true
        }
        {
            const leaf = makeLeaf(user0, toWei("1"))
            const proof = tree.getProof(leaf)
            const falseLeaf = makeLeaf(user0, toWei("2"))
            expect(tree.verify(proof, falseLeaf, root)).to.be.false // true
        }
    })


    it("redeem", async () => {
        const data = [
            [user0, toWei("1")],
            [user1, toWei("2")],
            [user2, toWei("3")],
        ]
        const leaves = data.map(x => makeLeaf(x[0], x[1]))
        const tree = makeTree(leaves)
        const root = "0x" + tree.getRoot().toString('hex')

        await rewardToken.mint(user0.address, toWei("100"))
        await rewardToken.approve(redeem.address, toWei("100"))
        await redeem.seedAllocations(0, root, toWei("6"))

        expect(await rewardToken.balanceOf(user0.address)).to.equal(toWei("94"))
        expect(await rewardToken.balanceOf(redeem.address)).to.equal(toWei("6"))
        {
            const proof = tree.getHexProof(makeLeaf(user0, toWei("1")))
            await redeem.connect(user0).claimEpoch(0, toWei("1"), proof)
        }
        {
            const proof = tree.getHexProof(makeLeaf(user1, toWei("2")))
            await redeem.connect(user1).claimEpoch(0, toWei("2"), proof)
        }
        {
            const proof = tree.getHexProof(makeLeaf(user2, toWei("3")))
            await redeem.connect(user2).claimEpoch(0, toWei("3"), proof)
        }
        expect(await rewardToken.balanceOf(redeem.address)).to.equal(toWei("0"))
    })

    it("multiple redeem", async () => {
        await rewardToken.mint(user0.address, toWei("100"))
        await rewardToken.approve(redeem.address, toWei("100"))
        let tree0
        let tree1
        {
            const data = [
                [user0, toWei("1")],
                [user1, toWei("2")],
                [user2, toWei("3")],
            ]
            const leaves = data.map(x => makeLeaf(x[0], x[1]))
            tree0 = makeTree(leaves)
            const root = "0x" + tree0.getRoot().toString('hex')
            await redeem.seedAllocations(0, root, toWei("6"))
        }
        {
            const data = [
                [user0, toWei("5")],
                [user1, toWei("5")],
            ]
            const leaves = data.map(x => makeLeaf(x[0], x[1]))
            tree1 = makeTree(leaves)
            const root = "0x" + tree1.getRoot().toString('hex')
            await redeem.seedAllocations(1, root, toWei("10"))
        }
        expect(await rewardToken.balanceOf(user0.address)).to.equal(toWei("84"))
        expect(await rewardToken.balanceOf(redeem.address)).to.equal(toWei("16"))
        {
            const proof0 = tree0.getHexProof(makeLeaf(user0, toWei("1")))
            const proof1 = tree1.getHexProof(makeLeaf(user0, toWei("5")))
            await redeem.connect(user0).claimEpochs([
                { epoch: 0, amount: toWei("1"), merkleProof: proof0 },
                { epoch: 1, amount: toWei("5"), merkleProof: proof1 }
            ])
        }
        // expect(await rewardToken.balanceOf(redeem.address)).to.equal(toWei("0"))
    })
})