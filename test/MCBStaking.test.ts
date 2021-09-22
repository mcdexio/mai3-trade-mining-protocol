import { expect } from "chai";

import {
    toWei,
    getAccounts,
    createContract
} from '../scripts/utils';


describe('Staking', () => {
    let staking;
    let stakeToken;
    let user0;
    let user1;
    let user2;
    let user3;

    before(async () => {
        const accounts = await getAccounts()
        user0 = accounts[0]
        user1 = accounts[1]
        user2 = accounts[2]
        user3 = accounts[3]
    })

    beforeEach(async () => {
        staking = await createContract("TestMCBStaking")
        stakeToken = await createContract("TestERC20", ["TTK", "TTK", 18])
        await staking.initialize(stakeToken.address, 30)

    })

    it("stake / redeem - raw", async () => {
        staking = await createContract("MCBStaking")
        stakeToken = await createContract("TestERC20", ["TTK", "TTK", 18])
        await staking.initialize(stakeToken.address, 30)

        await staking.setUnlockPeriod(0);

        await stakeToken.mint(user1.address, toWei("100"))
        await stakeToken.mint(user2.address, toWei("100"))
        await stakeToken.mint(user3.address, toWei("100"))

        await stakeToken.connect(user1).approve(staking.address, toWei("1000000"))
        await stakeToken.connect(user2).approve(staking.address, toWei("1000000"))
        await stakeToken.connect(user3).approve(staking.address, toWei("1000000"))

        await staking.connect(user1).stake(toWei("2"))
        await staking.connect(user2).stake(toWei("3"))
        await staking.connect(user3).stake(toWei("4"))

        expect(await staking.balanceOf(user1.address)).to.equal(toWei("2"))
        expect(await staking.balanceOf(user2.address)).to.equal(toWei("3"))
        expect(await staking.balanceOf(user3.address)).to.equal(toWei("4"))
        expect(await stakeToken.balanceOf(staking.address)).to.equal(toWei("9"))

        await staking.connect(user2).stake(toWei("3.5"))
        await staking.connect(user3).stake(toWei("0.1"))

        expect(await staking.balanceOf(user1.address)).to.equal(toWei("2"))
        expect(await staking.balanceOf(user2.address)).to.equal(toWei("6.5"))
        expect(await staking.balanceOf(user3.address)).to.equal(toWei("4.1"))
        expect(await stakeToken.balanceOf(staking.address)).to.equal(toWei("12.6"))

        await staking.connect(user1).redeem()
        await staking.connect(user2).redeem()
        await staking.connect(user3).redeem()

        expect(await staking.balanceOf(user1.address)).to.equal(toWei("0"))
        expect(await staking.balanceOf(user2.address)).to.equal(toWei("0"))
        expect(await staking.balanceOf(user3.address)).to.equal(toWei("0"))
        expect(await stakeToken.balanceOf(staking.address)).to.equal(toWei("0"))

        expect(await stakeToken.balanceOf(user1.address)).to.equal(toWei("100"))
        expect(await stakeToken.balanceOf(user2.address)).to.equal(toWei("100"))
        expect(await stakeToken.balanceOf(user3.address)).to.equal(toWei("100"))
    })

    it("stake / redeem - 0 lock period", async () => {
        await staking.setUnlockPeriod(0);

        await stakeToken.mint(user1.address, toWei("100"))
        await stakeToken.mint(user2.address, toWei("100"))
        await stakeToken.mint(user3.address, toWei("100"))

        await stakeToken.connect(user1).approve(staking.address, toWei("1000000"))
        await stakeToken.connect(user2).approve(staking.address, toWei("1000000"))
        await stakeToken.connect(user3).approve(staking.address, toWei("1000000"))

        await staking.connect(user1).stake(toWei("2"))
        await staking.connect(user2).stake(toWei("3"))
        await staking.connect(user3).stake(toWei("4"))

        expect(await staking.balanceOf(user1.address)).to.equal(toWei("2"))
        expect(await staking.balanceOf(user2.address)).to.equal(toWei("3"))
        expect(await staking.balanceOf(user3.address)).to.equal(toWei("4"))
        expect(await stakeToken.balanceOf(staking.address)).to.equal(toWei("9"))

        await staking.connect(user2).stake(toWei("3.5"))
        await staking.connect(user3).stake(toWei("0.1"))

        expect(await staking.balanceOf(user1.address)).to.equal(toWei("2"))
        expect(await staking.balanceOf(user2.address)).to.equal(toWei("6.5"))
        expect(await staking.balanceOf(user3.address)).to.equal(toWei("4.1"))
        expect(await stakeToken.balanceOf(staking.address)).to.equal(toWei("12.6"))

        await staking.connect(user1).redeem()
        await staking.connect(user2).redeem()
        await staking.connect(user3).redeem()

        expect(await staking.balanceOf(user1.address)).to.equal(toWei("0"))
        expect(await staking.balanceOf(user2.address)).to.equal(toWei("0"))
        expect(await staking.balanceOf(user3.address)).to.equal(toWei("0"))
        expect(await stakeToken.balanceOf(staking.address)).to.equal(toWei("0"))

        expect(await stakeToken.balanceOf(user1.address)).to.equal(toWei("100"))
        expect(await stakeToken.balanceOf(user2.address)).to.equal(toWei("100"))
        expect(await stakeToken.balanceOf(user3.address)).to.equal(toWei("100"))
    })

    it("stake / redeem - 86400 lock period", async () => {
        await staking.setBlockTime(1000);
        // so the unlock time should be 87400
        await staking.setUnlockPeriod(86400);

        await stakeToken.mint(user1.address, toWei("100"))
        await stakeToken.mint(user2.address, toWei("100"))
        await stakeToken.mint(user3.address, toWei("100"))

        await stakeToken.connect(user1).approve(staking.address, toWei("1000000"))
        await stakeToken.connect(user2).approve(staking.address, toWei("1000000"))
        await stakeToken.connect(user3).approve(staking.address, toWei("1000000"))

        await staking.connect(user1).stake(toWei("2"))
        expect(await staking.unlockTime(user1.address), "unlockTime").to.equal(87400)
        expect(await staking.secondsUntilUnlock(user1.address), "secondsUntilUnlock").to.equal(86400)
        await expect(staking.connect(user1).redeem()).to.be.revertedWith("MCBStaking::redeem::LockTimeNotSurpassed")

        await staking.setBlockTime(2000);
        await staking.connect(user2).stake(toWei("12"))
        expect(await staking.unlockTime(user2.address), "unlockTime").to.equal(88400)
        expect(await staking.secondsUntilUnlock(user2.address), "secondsUntilUnlock").to.equal(86400)

        await staking.setBlockTime(87400);
        await staking.connect(user1).redeem()
        await expect(staking.connect(user2).redeem()).to.be.revertedWith("MCBStaking::redeem::LockTimeNotSurpassed")

        await staking.setBlockTime(100000);
        await staking.connect(user2).redeem()
        await staking.connect(user1).stake(toWei("2"))
        expect(await staking.unlockTime(user1.address), "unlockTime").to.equal(186400)
        expect(await staking.secondsUntilUnlock(user1.address), "secondsUntilUnlock").to.equal(86400)
        await expect(staking.connect(user1).redeem()).to.be.revertedWith("MCBStaking::redeem::LockTimeNotSurpassed")

        await expect(staking.connect(user2).redeem()).to.be.revertedWith("MCBStaking::redeem::NotStaked")

        await staking.setBlockTime(143200); // 86400 /2 
        expect(await staking.secondsUntilUnlock(user1.address), "secondsUntilUnlock").to.equal(43200)

        await staking.connect(user1).stake(toWei("5")) // should be => (2 * 43200 + 5 * 86400) / 7 = 74057
        expect(await staking.unlockTime(user1.address), "unlockTime").to.equal(217257)
        expect(await staking.secondsUntilUnlock(user1.address), "secondsUntilUnlock").to.equal(74057)

        await staking.setBlockTime(227257); // 86400 /2 
        expect(await staking.unlockTime(user1.address), "unlockTime").to.equal(217257)
        expect(await staking.secondsUntilUnlock(user1.address), "secondsUntilUnlock").to.equal(0)
        await staking.connect(user1).redeem();
    })

    it("stake / redeem - set lock period", async () => {
        await staking.setBlockTime(1000);
        await staking.setUnlockPeriod(86400);
        await stakeToken.mint(user1.address, toWei("100"))
        await stakeToken.connect(user1).approve(staking.address, toWei("1000000"))

        await staking.connect(user1).stake(toWei("2"))
        expect(await staking.unlockTime(user1.address), "unlockTime").to.equal(87400)
        expect(await staking.secondsUntilUnlock(user1.address), "secondsUntilUnlock").to.equal(86400)

        await staking.setBlockTime(5000);
        expect(await staking.unlockTime(user1.address), "unlockTime").to.equal(87400)
        expect(await staking.secondsUntilUnlock(user1.address), "secondsUntilUnlock").to.equal(82400)

        await staking.setUnlockPeriod(864000); // 1 => 10 days
        expect(await staking.calcUnlockTime(user1.address, toWei("2"))).to.equal(478200)
        expect(await staking.calcUnlockTime(user1.address, toWei("0"))).to.equal(87400)

        await staking.connect(user1).stake(toWei("2")) // should be => (2 * 82400 + 2 * 864000) / 4 = 473200
        expect(await staking.unlockTime(user1.address), "unlockTime").to.equal(478200)
        expect(await staking.secondsUntilUnlock(user1.address), "secondsUntilUnlock").to.equal(473200)

        await staking.setBlockTime(478201);
        expect(await staking.calcUnlockTime(user1.address, toWei("0"))).to.equal(478200)
    })

    it("something wrong", async () => {
        await expect(staking.initialize(stakeToken.address, 30)).to.be.revertedWith("contract is already initialized")

        await staking.setBlockTime(1000);
        await staking.setUnlockPeriod(86400);
        await expect(staking.setUnlockPeriod(86400)).to.be.revertedWith("MCBStaking::_setUnlockPeriod::PeriodUnchanged");

        await stakeToken.mint(user1.address, toWei("100"))
        await stakeToken.connect(user1).approve(staking.address, toWei("1000000"))
        await expect(staking.connect(user1).stake(toWei("0"))).to.be.revertedWith("MCBStaking::stake::ZeroStakeAmount")

        await expect(staking.connect(user2).setUnlockPeriod(86400)).to.be.revertedWith("Ownable: caller is not the owner")
    })
})