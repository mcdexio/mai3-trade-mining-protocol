const { ethers } = require("hardhat");

import {
    toWei,
    createContract,
    ensureFinished,
} from "./utils";

async function main() {
    // const testStakeToken = await createContract("TestERC20", ["TTK", "TTK", 18])
    // const testStakeToken = { address: "or the token u like"} 
    // const redeem = await ensureFinished(createContract("MerkleRedeem"))
    // console.log(redeem.address)

    // const proxy = await createContract(
    //     "TransparentUpgradeableProxy",
    //     [redeem.address, "0xd80c8fF02Ac8917891C47559d415aB513B44DCb6", "0x"]  //ProxyAdmin
    // )
    // const redeem = await ensureFinished(createContract("MerkleRedeem"))
    const final = await ethers.getContractAt("MerkleRedeem", "0x205285d6eef9055779650f6556c3704a5b514271")
    // await final.initialize("0x5fe80d2cd054645b9419657d3d10d26391780a7b") // MCB

    const rewardToken = await final.token()
    console.log(`MCBStaking is deployed at ${final.address}(${rewardToken})`)
}

ethers.getSigners()
    .then(() => main())
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });