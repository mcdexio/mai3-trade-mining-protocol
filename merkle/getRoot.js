const ethers = require('ethers')
const { MerkleTree } = require('merkletreejs')

const hash = (x) => Buffer.from(ethers.utils.keccak256(x).slice(2), 'hex')

const padAccount = (account) => Buffer.from(account.slice(2).padStart(64, '0'), 'hex')

const makeTree = accounts => new MerkleTree(accounts.map(x => padAccount(x)), hash, { sortPairs: true })

const makeLeaf = (user, amount) => ethers.utils.solidityKeccak256(["address", "uint256"], [user, amount])

const sum = l => l.map(x => ethers.BigNumber.from(x[1])).reduce((x, y) => x.add(y))

function calcEpoch(path) {
    const epochData = require(path)
    const generateRoot = () => makeTree(epochData.map(x => makeLeaf(x[0], x[1]))).getRoot().toString('hex')
    const generateProof = (user, amount) => makeTree(epochData.map(x => makeLeaf(x[0], x[1]))).getHexProof(makeLeaf(user, amount))
    // for setter
    const root = generateRoot()
    console.log(`${path}: root => ${"0x" + root}`)
    // for claimer
    // const proof = generateProof("0xe2122cc59439959db230dbf38d3bebc6be15e328", "807477897304838776").map(s => `"${s}"`)
    // console.log(`${path}: proof => ${proof}`)
    // then call contract to claim
    // MerkleRedeem("0x205285d6eef9055779650f6556c3704a5b514271").claimEpoch(0, amount, proof)
    console.log(`${path}: sum => ${sum(epochData)/*.div(ethers.BigNumber.from("1000000000000000000"))*/}`)
    console.log("---------------------------------------------------")
}

function main() {
    // epoch0
    calcEpoch('./epoch0.json')

    // epoch1
    calcEpoch('./epoch1.json')

    // epoch2Arb
    calcEpoch('./epoch2Arb.json')

    // epoch2Bsc
    calcEpoch('./epoch2Bsc.json')

    // epoch3Arb
    calcEpoch('./epoch3Arb.json')

    // epoch3Bsc
    calcEpoch('./epoch3Bsc.json')

    // bscGasRebate0
    calcEpoch('./bscGasRebate0.json')

    // // bscGasRebate1
    calcEpoch('./bscGasRebate1.json')

    // bscGasRebate2
    calcEpoch('./bscGasRebate2.json')

    // bscGasRebate3
    calcEpoch('./bscGasRebate3.json')

    // bscGasRebate4
    calcEpoch("./bscGasRebate4.json")

    // bscGasRebate5
    calcEpoch("./bscGasRebate5.json")
}

main()