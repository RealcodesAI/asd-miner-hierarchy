// tests/Node.miningRewards.test.ts
import { expect, test, describe, beforeEach } from "bun:test";
import { Node } from "../src/Node";
import { RewardLogger } from "../src/RewardLogger";

describe("Node - Mining Reward Scenarios", () => {
    let parent: Node, child: Node, leader: Node;

    beforeEach(() => {
        parent = new Node(1, 101, 1);
        child = new Node(2, 102);
        leader = new Node(3, 103, 4); // Leader cấp 4

        parent.addChild(child);
        leader.addChild(new Node(4, 104));

        RewardLogger.clearLogs();
    });

    const setupQualifiedNode = (p: Node) => {
        p.setTotalLicensePurchase(Node.getLicenseRequirement(p.getLevel()));
        p.setTotalSystemSales(Node.getSalesRequirement(p.getLevel()));
        const f1 = new Node(10, 110); f1.setTotalLicensePurchase(3);
        p.addChild(f1);
    }

    test("should receive personal mining reward", () => {
        child.rewardMining(1000);
        const expectedReward = 1000 * Node.MINING_REWARD_RATES;
        expect(child.getMiningReward()).toBe(expectedReward);

        const logs = RewardLogger.getLogsForUser(child.getId());
        expect(logs[0].type).toBe("mining_reward");
    });

    test("qualified parent should receive direct mining commission", () => {
        setupQualifiedNode(parent);
        child.rewardMining(1000);

        const expectedCommission = 1000 * Node.getMiningRewardCommissionRate(parent.getLevel()); // 1000 * 0.01 = 10
        expect(parent.getMiningRewardCommission()).toBe(expectedCommission);
    });

    test("qualified node (Lv4+) should receive shared mining commission", () => {
        setupQualifiedNode(leader);
        const descendant = leader.getChildren()[0];
        descendant.setTotalMining(10000);

        const totalSharedFund = 5000; // Giả sử quỹ đồng hưởng là 5000
        leader.rewardMiningShared(totalSharedFund);

        const rate = Node.getMiningRewardSharedCommissionRate(leader.getLevel()); // 0.01
        const maxCommissionFromFund = totalSharedFund * Node.MINING_REWARD_SHARED_COMMISSION_RATE_MAX;
        const expectedCommission = maxCommissionFromFund * rate;

        expect(leader.getMiningRewardSharedCommission()).toBe(expectedCommission);
    });

    test("unqualified node (Lv < 4) should not receive shared commission", () => {
        setupQualifiedNode(parent); // parent is level 1
        const result = parent.rewardMiningShared(5000);

        expect(result.success).toBe(false);
        expect(parent.getMiningRewardSharedCommission()).toBe(0);
    });
});