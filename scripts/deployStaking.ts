const { ethers } = require("hardhat");

import {
    toWei,
    createContract,
    ensureFinished,
} from "./utils";

async function main() {
    // const testStakeToken = await createContract("TestERC20", ["TTK", "TTK", 18])
    // const testStakeToken = { address: "or the token u like"} 
    const staking = await ensureFinished(createContract("MCBStaking"))
    console.log(staking.address)

    const proxy = await createContract(
        "TransparentUpgradeableProxy",
        [staking.address, "0xd80c8fF02Ac8917891C47559d415aB513B44DCb6", "0x"]  //ProxyAdmin
    )
    const final = await ethers.getContractAt("MCBStaking", proxy.address)
    await final.initialize("0x5fe80d2cd054645b9419657d3d10d26391780a7b", 86400 * 100) // MCB, unlockTime

    const stakeTokenAddress = await final.stakeToken()
    const lockPeriod = await final.lockPeriod()

    console.log(`MCBStaking is deployed at ${final.address}(${stakeTokenAddress}, ${lockPeriod})`)
}

ethers.getSigners()
    .then(() => main())
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });