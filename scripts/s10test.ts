const { ethers } = require("hardhat");

import {
    toWei,
    createContract,
} from "./utils";

async function main() {
    const mcb = "0xfa53fd78b5176b4d772194511cc16c02c7f183f9"
    const pool = "0x3e46dd62b5ce4246e739748c9de043f9f3337bb2"
    const collateral = "0x8b2c4fa78fba24e4cbb4b0ca7b06a29130317093"
    const mining = await createContract("Mining", [mcb])
    console.log(mining.address)
    await mining.setRebateRate(toWei("0.3"))
    await mining.addMiningPool(pool, collateral)
    await mining.setMingingBudget(toWei("2000"))
}

ethers.getSigners()
    .then(() => main())
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });