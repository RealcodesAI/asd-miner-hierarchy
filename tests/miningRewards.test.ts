// tests/Node.miningRewards.test.ts
import { expect, test, describe, beforeEach } from "bun:test";
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

    [...node.getChildren()].forEach(child => node.removeChild(child));
    for (let i = 0; i < requiredF1s; i++) {
        const f1 = new Node(100 + i, 1100 + i);
        f1.setTotalLicensePurchase(3);
        node.addChild(f1);
    }
};

describe("Node - Mining Reward Scenarios", () => {
    beforeEach(() => {
        RewardLogger.clearLogs();
    });

    // =============================================
    // SECTION: THƯỞNG CÁ NHÂN & HOA HỒNG TRỰC TIẾP
    // =============================================
    describe("Personal & Direct Mining Commission", () => {

        test("should calculate personal mining reward correctly", () => {
            const child = new Node(2, 102);
            const result = child.rewardMining(1000);
            const expectedReward = 1000 * Node.MINING_REWARD_RATES; // 1000 * 0.92 = 920

            expect(result.miningReward).toBe(expectedReward);
            expect(child.getMiningReward()).toBe(expectedReward);
        });

        test("unqualified parent (Lv 8) should receive ZERO commission due to not enough F1s", () => {
            const parent = new Node(1, 101);
            const child = new Node(2, 102);
            parent.addChild(child);

            // Cấu hình parent Lv8 nhưng thiếu F1
            configureNode(parent, 8, { qualified: true, f1s: Node.getF1CountRequirement(8) - 1 });

            child.rewardMining(1000);
            expect(parent.getMiningRewardCommission()).toBe(0);
        });

        test("qualified parents at different levels should receive correct commission rates", () => {
            // Test cho Lv 5
            const parentLv5 = new Node(5, 105);
            const child5 = new Node(6, 106);
            configureNode(parentLv5, 5, { qualified: true });
            parentLv5.addChild(child5);
            child5.rewardMining(1000);
            const expectedCommissionLv5 = 1000 * Node.getMiningRewardCommissionRate(5); // 1000 * 0.02 = 20
            expect(parentLv5.getMiningRewardCommission()).toBe(expectedCommissionLv5);

            // Test cho Lv 10
            const parentLv10 = new Node(10, 110);
            const child10 = new Node(11, 111);
            configureNode(parentLv10, 10, { qualified: true });
            parentLv10.addChild(child10);
            child10.rewardMining(1000);
            const expectedCommissionLv10 = 1000 * Node.getMiningRewardCommissionRate(10); // 1000 * 0.03 = 30
            expect(parentLv10.getMiningRewardCommission()).toBe(expectedCommissionLv10);
        });

        test("should return the correct remaining reward for the system", () => {
            const parent = new Node(1, 101);
            const child = new Node(2, 102);
            configureNode(parent, 7, { qualified: true }); // Parent Lv7
            parent.addChild(child);

            const result = child.rewardMining(1000);

            // Tổng quỹ hoa hồng là 3%
            const totalCommissionPool = 1000 * Node.MINING_REWARD_COMMISSION_RATE_MAX; // 1000 * 0.03 = 30
            // Hoa hồng thực nhận của bố Lv7 là 2.5%
            const actualCommission = 1000 * Node.getMiningRewardCommissionRate(7); // 1000 * 0.025 = 25

            // Phần dư trả về hệ thống = 30 - 25 = 5
            const expectedRemaining = totalCommissionPool - actualCommission;

            expect(result.remainingReward).toBeCloseTo(expectedRemaining); // Dùng toBeCloseTo để tránh lỗi sai số
        });

        test("parent should receive commission AFTER buying enough licenses to qualify", () => {
            const parent = new Node(1, 101);
            const child = new Node(2, 102);

            // --- Giai đoạn 1: Parent không đủ điều kiện ---
            // Cấu hình parent Lv5 nhưng thiếu 1 license
            const requiredLicenses = Node.getLicenseRequirement(5);
            configureNode(parent, 5, { qualified: true, licenses: requiredLicenses - 1 });
            parent.addChild(child);

            // Con trả thưởng, bố không nhận được gì
            child.rewardMining(1000);
            expect(parent.getMiningRewardCommission()).toBe(0); // Hoa hồng ban đầu = 0
            expect(child.getMiningReward()).toBe(1000 * Node.MINING_REWARD_RATES); // 1000 * 0.92 = 920

            // --- Giai đoạn 2: Parent mua thêm license để đủ điều kiện ---
            parent.buyLicense(1);
            expect(parent.getTotalLicensePurchase()).toBe(requiredLicenses); // Kiểm tra đã mua đủ

            // --- Giai đoạn 3: Con trả thưởng lần nữa, BỐ NHẬN ĐƯỢC HOA HỒNG ---
            child.rewardMining(2000); // Dùng một số tiền khác để test
            expect(child.getMiningReward()).toBe(3000 * Node.MINING_REWARD_RATES); // 2000 * 0.92 = 1840
            const expectedCommission = 2000 * Node.getMiningRewardCommissionRate(5); // 2000 * 0.02 = 40

            // Hoa hồng của bố giờ sẽ là 40 (vì lần đầu nhận 0)
            expect(parent.getMiningRewardCommission()).toBe(expectedCommission);

            // Kiểm tra log, chỉ có 1 log nhận hoa hồng được tạo ra
            const parentLogs = RewardLogger.getLogsForUser(parent.getId());
            const commissionLogs = parentLogs.filter(log => log.type === 'mining_reward_commission');
            expect(commissionLogs.length).toBe(1);
            expect(commissionLogs[0].amount).toBe(expectedCommission);
        });
    });

    describe("Remaining Reward Calculation", () => {

        test("should return full commission pool as remainder if parent is unqualified", () => {
            const parent = new Node(1, 101);
            const child = new Node(2, 102);
            // Parent không đủ điều kiện
            configureNode(parent, 5, { qualified: false });
            parent.addChild(child);

            const result = child.rewardMining(1000);

            // Hoa hồng thực nhận của bố = 0
            // Toàn bộ quỹ hoa hồng 3% sẽ là phần dư
            const expectedRemaining = 1000 * Node.MINING_REWARD_COMMISSION_RATE_MAX; // 1000 * 0.03 = 30

            expect(result.remainingReward).toBeCloseTo(expectedRemaining);
        });

        test("should return correct remainder for a mid-level parent (Lv 6)", () => {
            const parent = new Node(1, 101);
            const child = new Node(2, 102);
            configureNode(parent, 6, { qualified: true }); // Parent Lv6
            parent.addChild(child);

            const result = child.rewardMining(1000);

            const totalCommissionPool = 1000 * Node.MINING_REWARD_COMMISSION_RATE_MAX; // = 30
            const actualCommission = 1000 * Node.getMiningRewardCommissionRate(6);     // = 1000 * 0.02 = 20
            const expectedRemaining = totalCommissionPool - actualCommission;          // = 30 - 20 = 10

            expect(result.remainingReward).toBeCloseTo(expectedRemaining);
        });

        test("should return ZERO remainder for a max-level parent (Lv 10)", () => {
            const parent = new Node(1, 101);
            const child = new Node(2, 102);
            configureNode(parent, 10, { qualified: true }); // Parent Lv10
            parent.addChild(child);

            const result = child.rewardMining(1000);

            const totalCommissionPool = 1000 * Node.MINING_REWARD_COMMISSION_RATE_MAX; // = 30
            const actualCommission = 1000 * Node.getMiningRewardCommissionRate(10);    // = 1000 * 0.03 = 30
            const expectedRemaining = totalCommissionPool - actualCommission;          // = 30 - 30 = 0

            expect(result.remainingReward).toBeCloseTo(expectedRemaining);
        });

    });
});