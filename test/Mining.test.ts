import { expect } from "chai";

import { 
    toWei,
    getAccounts,
    createContract 
} from '../scripts/utils';


describe('Mining', () => {
    it("main", async () => {
        var ctk = await createContract("TestERC20", ["collateral", "CTK", 18]);
        var mining = await createContract("Mining", [ctk.address]);
        expect(await mining.getMCBToken()).to.equal(ctk.address);
        await mining.setRebateRate(toWei("0.3"));
        expect(await mining.getRebateRate()).to.equal(toWei('0.3'));
        await mining.setMingingBudget(toWei("2000"));
        expect(await mining.getBudget()).to.equal(toWei('2000'));

        const pool = "0x3e46dd62b5ce4246e739748c9de043f9f3337bb2";
        await mining.addMiningPool(pool);
        var pools = await mining.getMiningPools()
        expect(pools[0].toLowerCase()).to.equal("0x3e46dd62b5ce4246e739748c9de043f9f3337bb2");

        await mining.delMiningPool(pool);
        pools = await mining.getMiningPools()
        expect(pools[0]).to.equal("0x0000000000000000000000000000000000000000");

        const user1 = "0x276EB779d7Ca51a5F7fba02Bf83d9739dA11e3ba";
        const user2 = "0xc4E2fB5D38cd947DaEeBe07825c009402109568F";
        var accounts = await getAccounts();
        const user0 = accounts[0];
        await ctk.mint(user0.address, toWei('1000'));
        await ctk.connect(user0).approve(mining.address, toWei("10000"));
        expect(await ctk.balanceOf(user0.address)).to.equal(toWei('1000'));
        await mining.connect(user0).disperseMCB([user1, user2], [toWei('200'), toWei('500')], 1000);

        expect(await ctk.balanceOf(user0.address)).to.equal(toWei('300'));
        expect(await ctk.balanceOf(user1)).to.equal(toWei('200'));
        expect(await ctk.balanceOf(user2)).to.equal(toWei('500'));
    });
})