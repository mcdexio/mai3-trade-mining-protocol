const { ethers } = require("hardhat");

import {
    toWei,
    createContract,
    ensureFinished,
} from "./utils";

async function main() {
    const testStakeToken = await createContract("TestERC20", ["TTK", "TTK", 18])
    // const testStakeToken = { address: "or the token u like"} 
    const staking = await createContract("MCBStaking")
    await staking.initialize(testStakeToken.address, 86400)

    const stakeTokenAddress = await staking.stakeToken()
    const lockPeriod = await staking.lockPeriod()

    console.log(`MCBStaking is deployed at ${staking.address}(${stakeTokenAddress}, ${lockPeriod})`)
}

ethers.getSigners()
    .then(() => main())
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });