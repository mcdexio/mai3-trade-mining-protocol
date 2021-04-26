const { ethers } = require("hardhat");

import {
    toWei,
    createContract,
    ensureFinished,
} from "./utils";

async function main() {
    const mcb = "0xA0A45F2B616a740C3C7a7fF69Be893f61E6455E3"
    const pool1 = "0xfe62314f9fb010bebf52808cd5a4c571a47c4c46"
    const collateral1 = "0xd4AC81D9FD2b28363eBD1D88a8364Ff3b3577e84"
    const pool2 = "0x1ef9db1c1eaf2240da2a78e581d53b9e833295be"
    const collateral2 = "0x025435ACD9A326fA25B4098887b38dD2CeDf6422"
    const mining = await createContract("Mining", [mcb])
    console.log("Mining Contract Address:")
    console.log(mining.address)
    await ensureFinished(mining.setRebateRate(toWei("0.8")))
    await ensureFinished(mining.setMingingBudget(toWei("10000")))
    await ensureFinished(mining.addMiningPool(pool1, collateral1))
    await ensureFinished(mining.addMiningPool(pool2, collateral2))
    console.log("deploy end")
}

ethers.getSigners()
    .then(() => main())
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });