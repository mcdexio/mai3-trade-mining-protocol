const { ethers } = require("hardhat");

export function toWei(n) { return ethers.utils.parseEther(n) };
export function fromWei(n) { return ethers.utils.formatEther(n); }
export function toBytes32(s) { return ethers.utils.formatBytes32String(s); }
export function fromBytes32(s) { return ethers.utils.parseBytes32String(s); }

var defaultSigner = null

export function setDefaultSigner(signer) {
    defaultSigner = signer
}

export async function getAccounts(): Promise<any[]> {
    const accounts = await ethers.getSigners();
    const users = [];
    accounts.forEach(element => {
        users.push(element.address);
    });
    return accounts;
}

export async function createFactory(path, libraries = {}) {
    const parsed = {}
    for (var name in libraries) {
        parsed[name] = libraries[name].address;
    }
    return await ethers.getContractFactory(path, { libraries: parsed })
}

export async function createContract(path, args = [], libraries = {}) {
    const factory = await createFactory(path, libraries);
    if (defaultSigner != null) {
        return await factory.connect(defaultSigner).deploy(...args)
    } else {
        return await factory.deploy(...args);
    }
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function ensureFinished(transaction): Promise<any> {
    const result = await transaction;
    if (typeof result.deployTransaction != 'undefined') {
        await result.deployTransaction.wait()
    } else {
        await result.wait()
    }
    return result
}


export function hash(x): Buffer {
    return Buffer.from(ethers.utils.keccak256(x).slice(2), 'hex')
}

export function padAccount(account: string): Buffer {
    return Buffer.from(account.slice(2).padStart(64, '0'), 'hex')
}
