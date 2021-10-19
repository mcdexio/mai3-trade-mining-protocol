const ethers = require('ethers')
const { MerkleTree } = require('merkletreejs')
const epoch0Data = require('./epoch0.json')

const hash = (x) => Buffer.from(ethers.utils.keccak256(x).slice(2), 'hex')

const padAccount = (account) => Buffer.from(account.slice(2).padStart(64, '0'), 'hex')

const makeTree = accounts => new MerkleTree(accounts.map(x => padAccount(x)), hash, { sortPairs: true })

const makeLeaf = (user, amount) => ethers.utils.solidityKeccak256(["address", "uint256"], [user, amount])

function generateRoot() {
    return makeTree(epoch0Data.map(x => makeLeaf(x[0], x[1]))).getRoot().toString('hex')
}

function generateProof(user, amount) {
    return makeTree(epoch0Data.map(x => makeLeaf(x[0], x[1]))).getHexProof(makeLeaf(user, amount))
}

function main() {
    // for setter
    const root = generateRoot()
    console.log(`root => ${"0x" + root}`)
    // for claimer
    const proof = generateProof("0x022e3ce4eda264b3e3fef62036c8182ceb88e6ce", "19672585930000000000")
    console.log(`proof => ${proof}`)
    // then call contract to claim
    // MerkleRedeem("0x205285d6eef9055779650f6556c3704a5b514271").claimEpoch(0, amount, proof)
}

main()