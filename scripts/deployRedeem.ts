const { ethers } = require("hardhat");
const hre = require("hardhat");

import {
    toWei,
    createContract,
    ensureFinished,
} from "./utils";

const addresses = {
    ProxyAdmin: {
        arb1: "0x93a9182883C1019e1dBEbB5d40C140e7680cd151",
        arbrinkeby: "0x9EA057F302E9F3AEFf8e08d56C66C1FF6bD356D4",
        bsc: "0xd80c8fF02Ac8917891C47559d415aB513B44DCb6",
    },
    MCB: {
        arb1: "0x4e352cF164E64ADCBad318C3a1e222E9EBa4Ce42",
        arbrinkeby: "0x292f76B159039Df190660f8E4A1535bb183B4592",
        bsc: "0x5fe80d2cd054645b9419657d3d10d26391780a7b",
    }
}

const addressOf = (n) => addresses[n][hre.network.name]

async function main() {
    // const testStakeToken = await createContract("TestERC20", ["TTK", "TTK", 18])
    // const testStakeToken = { address: "or the token u like"} 
    const redeem = await ensureFinished(createContract("MerkleRedeem"))
    console.log(`redeem => ${redeem.address}`)
    const proxy = await ensureFinished(createContract(
        "TransparentUpgradeableProxy",
        [redeem.address, addressOf("ProxyAdmin"), "0x"]
    ))
    console.log(`proxy => ${proxy.address}`)
    // const final = await ensureFinished(createContract("MerkleRedeem"))
    const final = await ethers.getContractAt("MerkleRedeem", proxy.address)
    await ensureFinished(final.initialize(addressOf("MCB")))

    const rewardToken = await final.token()
    console.log(`MerkleRedeem is deployed at ${final.address}(${rewardToken})`)
    console.log(`Using ${addressOf("ProxyAdmin")}(${addressOf("MCB")})`)
}

ethers.getSigners()
    .then(() => main())
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });