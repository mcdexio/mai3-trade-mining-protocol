// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.6;

import "../MCBStaking.sol";

contract TestMCBStaking is MCBStaking {
    uint256 public mockTime;

    function setBlockTime(uint256 time) external {
        mockTime = time;
    }

    function _blockTime() internal view virtual override returns (uint256) {
        if (mockTime != 0) {
            return mockTime;
        }
        return block.timestamp;
    }
}
