// SPDX-License-Identifier: UNLICENSE
pragma solidity 0.7.4;

import "@openzeppelin/contracts/access/Ownable.sol";

// erc20 interface for mcb token transfer
interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

contract Mining is Ownable {
    address internal _mcb;
    int256 internal _budget;
    int256 internal _rebateRate;
    address[] internal _pools;

    event AddMiningPool(address indexed pool);
    event DelMiningPool(address indexed pool);
    event RebateRateChange(int256 prevRebateRate, int256 newRebateRate);
    event MiningBudgetChange(int256 prevBudget, int256 newBudget);
    event RewardPaid(address indexed user, uint256 reward, uint256 paidBlock);

    constructor(address mcb) Ownable() {
        _mcb = mcb;
    }

    /**
     * @notice Get budget of mining
     * @return int256 The budget of mining
     */
    function getBudget() public view returns (int256) {
        return _budget;
    }

    /**
     * @notice Get MCB token address
     * @return address The address of mcb token
     */
    function getMCBToken() public view returns (address) {
        return _mcb;
    }

    /**
     * @notice Get the rebate rate of mining
     * @return int256 The rebate rate of mining
     */
    function getRebateRate() public view returns (int256) {
        return _rebateRate;
    }

    /**
     * @notice Get all mining pool address
     * @return pools The address of mining pools
     */
    function getMiningPools() public view returns (address[] memory pools) {
        return _pools;
    }

    /**
     * @notice  add mining pool. Can only called by owner.
     *
     * @param   pool  pool address for mining
     */
    function addMiningPool(address pool) external onlyOwner {
        for (uint256 i = 0; i < _pools.length; i++) {
            require(_pools[i] != pool, "pool already exists");
        }

        _pools.push(pool);
        emit AddMiningPool(pool);
    }

    /**
     * @notice  delete mining pool. Can only called by owner.
     *
     * @param   pool  pool address for mining
     */
    function delMiningPool(address pool) external onlyOwner {
        bool isExist = false;
        uint256 i = 0;
        for (i = 0; i < _pools.length; i++) {
            if (_pools[i] == pool) {
                isExist = true;
                break;
            }
        }

        require(isExist, "pool not exists");
        delete _pools[i];
        emit DelMiningPool(pool);
    }

    /**
     * @notice  Set new mining rebate rate. Can only called by owner.
     *
     * @param   newRebateRate  mining rebate rate
     */
    function setRebateRate(int256 newRebateRate) external onlyOwner {
        require(newRebateRate >= 0, "negative rebate rate");
        require(_rebateRate != newRebateRate, "unchanged rate");
        emit RebateRateChange(_rebateRate, newRebateRate);
        _rebateRate = newRebateRate;
    }

    /**
     * @notice  Set new mining budget. Can only called by owner.
     *
     * @param   newBudget  mining budget
     */
    function setMingingBudget(int256 newBudget) external onlyOwner {
        require(newBudget >= 0, "negative budget");
        require(_budget != newBudget, "unchanged budget");
        emit MiningBudgetChange(_budget, newBudget);
        _budget = newBudget;
    }

    /**
     * @notice  disperse mcb to miners. Can only called by owner.
     *
     * @param   recipients miner addresses
     * @param   values miner rewards
     * @param   paidBlock blocknumber of calculate reward
     */
    function disperseMCB(address[] memory recipients, uint256[] memory values, uint256 paidBlock) external {
        IERC20 token = IERC20(_mcb);
        uint256 total = 0;
        for (uint256 i = 0; i < recipients.length; i++) {
            total += values[i];
        }
        // transfer mcb token from sender to contract
        require(token.transferFrom(msg.sender, address(this), total), "transfer to contract failed.");
        // transfer mcb token to each user
        for (uint256 i = 0; i < recipients.length; i++) {
            require(token.transfer(recipients[i], values[i]), "transfer failed.");
            emit RewardPaid(recipients[i], values[i], paidBlock);
        }
    }
}