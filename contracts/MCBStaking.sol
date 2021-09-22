// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.6;

import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract MCBStaking is Initializable, ReentrancyGuardUpgradeable, OwnableUpgradeable {
    using SafeMathUpgradeable for uint256;
    using SafeERC20Upgradeable for IERC20Upgradeable;

    string public constant name = "MCBStaking";

    struct StakedBalance {
        uint256 balance;
        uint256 unlockTime;
    }

    IERC20Upgradeable public stakeToken;
    uint256 public lockPeriod;
    mapping(address => StakedBalance) public stakedBalances;

    event SetUnlockPeriod(uint256 previousLockPeriod, uint256 newLockPeriod);
    event Stake(
        address indexed account,
        uint256 newStaked,
        uint256 totalStaked,
        uint256 unlockTime
    );
    event Redeem(address indexed account, uint256 redeemed);

    function initialize(address stakeToken_, uint256 lockPeriod_) external initializer {
        __ReentrancyGuard_init();
        __Ownable_init();

        stakeToken = IERC20Upgradeable(stakeToken_);
        _setUnlockPeriod(lockPeriod_);
    }

    function balanceOf(address account) public view returns (uint256) {
        return stakedBalances[account].balance;
    }

    function unlockTime(address account) public view returns (uint256) {
        return stakedBalances[account].unlockTime;
    }

    function calcUnlockTime(address account, uint256 amount) public view returns (uint256) {
        return _calcUnlockTime(stakedBalances[account], amount);
    }

    function secondsUntilUnlock(address account) public view returns (uint256) {
        uint256 eta = stakedBalances[account].unlockTime;
        uint256 current = _blockTime();
        return eta > current ? eta - current : 0;
    }

    function stake(uint256 amount) external nonReentrant {
        require(amount != 0, "MCBStaking::stake::ZeroStakeAmount");
        StakedBalance storage staked = stakedBalances[msg.sender];

        uint256 newUnlockTime = _calcUnlockTime(staked, amount);
        stakeToken.transferFrom(msg.sender, address(this), amount);
        staked.balance += amount;
        staked.unlockTime = newUnlockTime;

        emit Stake(msg.sender, amount, staked.balance, staked.unlockTime);
    }

    function redeem() external nonReentrant {
        StakedBalance storage staked = stakedBalances[msg.sender];
        require(staked.balance != 0, "MCBStaking::redeem::NotStaked");
        require(_blockTime() >= staked.unlockTime, "MCBStaking::redeem::LockTimeNotSurpassed");

        uint256 balance = staked.balance;
        staked.balance -= staked.balance;
        stakeToken.transfer(msg.sender, balance);

        emit Redeem(msg.sender, balance);
    }

    function setUnlockPeriod(uint256 period) external onlyOwner {
        _setUnlockPeriod(period);
    }

    function _setUnlockPeriod(uint256 period) internal {
        require(period != lockPeriod, "MCBStaking::_setUnlockPeriod::PeriodUnchanged");
        emit SetUnlockPeriod(lockPeriod, period);
        lockPeriod = period;
    }

    function _calcUnlockTime(StakedBalance storage staked, uint256 amount)
        internal
        view
        returns (uint256)
    {
        uint256 eta = staked.unlockTime;
        if (amount == 0) {
            return eta;
        }
        uint256 current = _blockTime();
        uint256 remaining = eta > current ? eta - current : 0;
        return
            current +
            (staked.balance * remaining + amount * lockPeriod) /
            (staked.balance + amount);
    }

    function _blockTime() internal view virtual returns (uint256) {
        return block.timestamp;
    }
}
