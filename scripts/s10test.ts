const { ethers } = require("hardhat");

import {
    toWei,
    createContract,
} from "./utils";

async function main() {
    const mcb = "0x8B2c4Fa78FBA24e4cbB4B0cA7b06A29130317093"
    const pool = "0x3e46dd62b5ce4246e739748c9de043f9f3337bb2"
    const pool1 = "0x038c982f67c091c77a358eb35ca8d12e830f29ab"
    const mining = await createContract("Mining", [mcb])
    console.log(mining.address)
    await mining.setRebateRate(toWei("0.3"))
    await mining.addMiningPool(pool)
    await mining.setMingingBudget(toWei("2000"))
    console.log(await mining.getBudget())
    console.log(await mining.getMCBToken())
    console.log(await mining.getRebateRate())
    console.log(await mining.getMiningPools())
    await mining.addMiningPool(pool1)
    console.log(await mining.getMiningPools())
    await mining.delMiningPool(pool1)
    console.log(await mining.getMiningPools())
//    await mining.addMiningPool(pool1)
//    console.log(await mining.getMiningPools())
}

ethers.getSigners()
    .then(() => main())
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });