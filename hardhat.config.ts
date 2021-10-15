import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "hardhat-contract-sizer";
import "solidity-coverage"
import "@nomiclabs/hardhat-etherscan";
import "./misc/typechain-ethers-v5-mcdex";


const pk = process.env["PK"];
const etherscanApiKey = process.env["ETHERSCAN_API_KEY"];

task("accounts", "Prints the list of accounts", async (args, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});

task("encode", "Encode calldata")
    .addPositionalParam("sig", "Signature of contract to deploy")
    .addOptionalPositionalParam("args", "Args of function call, seprated by common ','")
    .setAction(async (args, hre) => {
        if (typeof args.args != 'undefined') {
            args.args = args.args.split(',')
        }
        args.sig = args.sig.replace('function ', '')
        var iface = new hre.ethers.utils.Interface(["function " + args.sig])
        var selector = args.sig.slice(0, args.sig.indexOf('('))
        // console.log(args.sig, args.args, selector)
        var calldata = iface.encodeFunctionData(selector, args.args)
        console.log("encoded calldata", calldata)
    })


task("deploy", "Deploy a single contract")
    .addPositionalParam("name", "Name of contract to deploy")
    .addOptionalPositionalParam("args", "Args of contract constructor, seprated by common ','")
    .setAction(async (args, hre) => {
        if (typeof args.args != 'undefined') {
            args.args = args.args.split(',')
        }
        const factory = await hre.ethers.getContractFactory(args.name);
        const contract = await factory.deploy(...args.args);
        console.log(args.name, "has been deployed to", contract.address);
    })

task("send", "Call contract function")
    .addPositionalParam("address", "Address of contract")
    .addPositionalParam("sig", "Signature of contract")
    .addOptionalPositionalParam("args", "Args of function call, seprated by common ','")
    .setAction(async (args, hre) => {
        if (typeof args.args != 'undefined') {
            args.args = args.args.split(',')
        }
        args.sig = args.sig.replace('function ', '')
        var iface = new hre.ethers.utils.Interface(["function " + args.sig])
        var selector = args.sig.slice(0, args.sig.indexOf('('))
        // console.log(args.sig, args.args, selector)
        var calldata = iface.encodeFunctionData(selector, args.args)
        // console.log("encoded calldata", calldata)
        const signer = hre.ethers.provider.getSigner(0);

        const tx = await signer.sendTransaction({
            to: args.address,
            from: signer._address,
            data: calldata,
        });
        console.log(tx);
        console.log(await tx.wait());
    })

task("call", "Call contract function")
    .addPositionalParam("address", "Address of contract")
    .addPositionalParam("sig", "Signature of contract")
    .addOptionalPositionalParam("args", "Args of function call, seprated by common ','")
    .setAction(async (args, hre) => {
        if (typeof args.args != 'undefined') {
            args.args = args.args.split('|')
        }
        args.sig = args.sig.replace('function ', '')
        var iface = new hre.ethers.utils.Interface(["function " + args.sig])
        var selector = args.sig.slice(0, args.sig.indexOf('('))
        console.log(args.sig, args.args, selector)
        var calldata = iface.encodeFunctionData(selector, args.args)
        //       console.log("encoded calldata", calldata)
        const signer = hre.ethers.provider.getSigner(0);
        const result = await signer.call({
            to: args.address,
            data: calldata,
        })
        console.log("result", result);
    })

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            allowUnlimitedContractSize: true
        },
        bsc: {
            url: `https://bsc-dataseed4.binance.org/`,
            gasPrice: 5e9,
            accounts: [pk],
        },
        bsctest: {
            url: `https://data-seed-prebsc-1-s1.binance.org:8545`,
            accounts: [pk],
        },
        arbr1: {
            url: `https://arb1.arbitrum.io/rpc`,
            gasPrice: 2e9,
            blockGasLimit: "80000000",
            accounts: [pk],
        },
        arbrinkeby: {
            url: `https://rinkeby.arbitrum.io/rpc`,
            gasPrice: 6e8,
            blockGasLimit: "80000000",
            accounts: [pk],
        },
        kovan: {
            url: "https://kovan.infura.io/v3/3582010d3cc14ab183653e5861d0c118",
            gasPrice: 1e9,
            // accounts: [""],
            timeout: 300000,
            confirmations: 1,
        },
        bscTestnet: {
            url: "https://data-seed-prebsc-2-s1.binance.org:8545/",
            gasPrice: 20e9,
            // accounts: [""],
            timeout: 300000,
            confirmations: 1,
        }
    },
    solidity: {
        compilers: [
            {
                version: "0.7.4",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            },
            {
                version: "0.8.6",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            }
        ]
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    },
    contractSizer: {
        alphaSort: true,
        runOnCompile: false,
        disambiguatePaths: false,
    },
    abiExporter: {
        path: './abi',
        clear: false,
        flat: true,
    },
    etherscan: {
        apiKey: etherscanApiKey
    },
    mocha: {
        timeout: 60000
    }
};
