# mcdex3-trade-mining

## Mining

### install

```
npm install  && npx hardhat --network s10 run scripts/s10test.ts
```

## Staking

### compile && test && coverage

```
npm install
npx hardhat compile
npx hardhat test
npx hardhat coverage
```

### deploy

- update hardhat.config.ts, add your network config;
- check scripts/deploy.ts, replace the params with yours;
- run deploy script.

```
npx hardhat compile
npx hardhat --network [network name] run scripts/deploy.ts
```