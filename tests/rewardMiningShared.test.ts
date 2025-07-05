import { expect, test, describe, beforeAll, beforeEach } from "bun:test";
import { Node } from "../src/Node";
import { RewardLogger } from "../src/RewardLogger";

// Hàm helper để thiết lập node đủ hoặc không đủ điều kiện ở một level bất kỳ
const configureNode = (node: Node, level: number, options: {
    qualified?: boolean,
    licenses?: number,
    sales?: number,
    f1s?: number
} = {}) => {
    node.setLevel(level);
    const requiredLicenses = options.licenses ?? (options.qualified ? Node.getLicenseRequirement(level) : 0);
    const requiredSales = options.sales ?? (options.qualified ? Node.getSalesRequirement(level) : 0);
    const requiredF1s = options.f1s ?? (options.qualified ? Node.getF1CountRequirement(level) : 0);

    node.setTotalLicensePurchase(requiredLicenses);
    node.setTotalSystemSales(requiredSales);
    node.setTotalLicensePurchaseValue(requiredLicenses * Node.LICENSE_PRICE);
    node.setTotalF1Count(requiredF1s);
};

/**
 * Hàm helper để tạo một cây sâu.
 * @param root - Node gốc để bắt đầu tạo cây.
 * @param depth - Độ sâu của cây cần tạo.
 * @returns Tổng số ASD đã đào của tất cả các hậu duệ.
 */
const createDeepTree = (root: Node, depth: number): number => {
    let totalMining = 0;
    let currentNode = root;
    for (let i = 1; i <= depth; i++) {
        const newId = Number(`${root.id}${i}`);
        const child = new Node(newId, newId);
        const miningAmount = 100 * i; // Mỗi tầng đào được nhiều hơn
        child.setTotalMining(miningAmount);
        totalMining += miningAmount;
        currentNode.addChild(child);
        currentNode = child;
    }
    return totalMining;
};


describe("Node - Shared Mining Commission (rewardMiningShared)", () => {

    beforeEach(() => {
        RewardLogger.clearLogs();
    });

    describe("Qualification and Edge Cases", () => {
        test("should NOT receive commission if node is below Lv 4", () => {
            const leader = new Node(1, 101);
            configureNode(leader, 3, { qualified: true });
            const result = leader.rewardMiningShared(5000);
            expect(result.success).toBe(false);
        });

        test("should NOT receive commission if descendants have zero total mining", () => {
            const leader = new Node(1, 101);
            configureNode(leader, 5, { qualified: true });
            leader.addChild(new Node(2, 102)); // Hậu duệ có totalMining = 0

            const result = leader.rewardMiningShared(5000);
            expect(result.success).toBe(false);
        });
    });

    describe("Commission Calculation at Various Levels", () => {
        let root: Node;
        const DEEP_TREE_DEPTH = 21;
        const FUND_AMOUNT = 100000; // Quỹ thưởng cố định để test

        beforeAll(() => {
            // Chỉ cần tạo cây một lần
            root = new Node(1, 101);
        });

        test("a qualified Lv 4 node should receive correct commission and remainder", () => {
            configureNode(root, 4, { qualified: true });
            createDeepTree(root, DEEP_TREE_DEPTH);
            const result = root.rewardMiningShared(FUND_AMOUNT);

            const rate = Node.getMiningRewardSharedCommissionRate(4); // 0.01
            const maxCommissionFromFund = FUND_AMOUNT * Node.MINING_REWARD_SHARED_COMMISSION_RATE_MAX; // 3000
            const expectedCommission = maxCommissionFromFund * rate; // 30
            const expectedRemainder = maxCommissionFromFund - expectedCommission; // 2970

            expect(result.success).toBe(true);
            expect(root.getMiningRewardSharedCommission()).toBe(expectedCommission);
            expect(result.remainingSharedCommission).toBeCloseTo(expectedRemainder);
        });

        test("a qualified Lv 7 node should receive correct commission and remainder", () => {
            // Reset hoa hồng của root trước khi test
            root.miningRewardSharedCommission = 0;
            configureNode(root, 7, { qualified: true });
            createDeepTree(root, DEEP_TREE_DEPTH);
            const result = root.rewardMiningShared(FUND_AMOUNT);

            const rate = Node.getMiningRewardSharedCommissionRate(7); // 0.015
            const maxCommissionFromFund = FUND_AMOUNT * Node.MINING_REWARD_SHARED_COMMISSION_RATE_MAX; // 3000
            const expectedCommission = maxCommissionFromFund * rate; // 45
            const expectedRemainder = maxCommissionFromFund - expectedCommission; // 2955

            expect(result.success).toBe(true);
            expect(root.getMiningRewardSharedCommission()).toBe(expectedCommission);
            expect(result.remainingSharedCommission).toBeCloseTo(expectedRemainder);
        });

        test("a qualified Lv 10 node should receive correct commission and remainder", () => {
            root.miningRewardSharedCommission = 0;
            configureNode(root, 10, { qualified: true });
            createDeepTree(root, DEEP_TREE_DEPTH);
            const result = root.rewardMiningShared(FUND_AMOUNT);

            const rate = Node.getMiningRewardSharedCommissionRate(10); // 0.03
            const maxCommissionFromFund = FUND_AMOUNT * Node.MINING_REWARD_SHARED_COMMISSION_RATE_MAX; // 3000
            const expectedCommission = maxCommissionFromFund * rate; // 90
            const expectedRemainder = maxCommissionFromFund - expectedCommission; // 2910

            expect(result.success).toBe(true);
            expect(root.getMiningRewardSharedCommission()).toBe(expectedCommission);
            expect(result.remainingSharedCommission).toBeCloseTo(expectedRemainder);
        });
    });
});