// SPDX-License-Identifier: GPL-3.0-or-later
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

pragma solidity 0.8.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/MerkleProofUpgradeable.sol";

contract MerkleDistributor is OwnableUpgradeable {
    using SafeERC20Upgradeable for IERC20Upgradeable;

    uint256 public constant INITIAL_INDEX = 1;

    struct ClaimStatus {
        uint256 index;
        uint256 amount;
    }

    IERC20Upgradeable public token;

    event ClaimReward(address recipient, uint256 amount);
    event AllocateDistribution(
        uint256 indexed merkleIndex,
        bytes32 indexed merkleRoot,
        uint256 totalAllocation
    );

    uint256 public merkleIndex = INITIAL_INDEX;
    bytes32[] public merkleRootList;
    mapping(bytes32 => uint256) public merkleRoots;
    mapping(address => ClaimStatus) public claimStatuses;

    function initialize(address token_) external initializer {
        __Ownable_init();
        token = IERC20Upgradeable(token_);
    }

    function isMerkleRootExists(bytes32 merkleRoot) public view returns (bool) {
        return merkleRoots[merkleRoot] > 0;
    }

    function allocateDistribution(bytes32 merkleRoot, uint256 totalAllocation) external onlyOwner {
        require(
            !isMerkleRootExists(merkleRoot),
            "MerkleDistributor::allocateDistribution:DuplicatedMerkleRoot"
        );
        uint256 index = merkleIndex++;
        merkleRoots[merkleRoot] = index;
        merkleRootList.push(merkleRoot);
        if (totalAllocation > 0) {
            token.transferFrom(msg.sender, address(this), totalAllocation);
        }
        emit AllocateDistribution(index, merkleRoot, totalAllocation);
    }

    function claim(
        bytes32 merkleRoot,
        uint256 amount,
        bytes32[] memory merkleProof
    ) public {
        require(isMerkleRootExists(merkleRoot), "MerkleDistributor::claim:MerkleRootNotExists");
        ClaimStatus storage status = claimStatuses[msg.sender];
        require(status.index < merkleRoots[merkleRoot], "MerkleDistributor::claim:AlreadyClaimed");
        uint256 totalAmount = status.amount + amount;
        require(
            verifyClaim(merkleRoot, msg.sender, totalAmount, merkleProof),
            "MerkleDistributor::claim:IncorrectMerkleProof"
        );
        status.amount = totalAmount;
        status.index = merkleRoots[merkleRoot];
        _disburse(msg.sender, amount);
    }

    function verifyClaim(
        bytes32 merkleRoot,
        address recipient,
        uint256 amount,
        bytes32[] memory merkleProof
    ) public view returns (bool valid) {
        bytes32 leaf = keccak256(abi.encodePacked(recipient, amount));
        return MerkleProofUpgradeable.verify(merkleProof, merkleRoot, leaf);
    }

    function _disburse(address recipient, uint256 amount) private {
        if (amount > 0) {
            emit ClaimReward(recipient, amount);
            token.safeTransfer(recipient, amount);
        }
    }
}
