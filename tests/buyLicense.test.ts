// tests/Node.buyLicense.test.ts
import { expect, test, describe, beforeEach } from "bun:test";
import { Node } from "../src/Node";
import { RewardLogger } from "../src/RewardLogger";

/**
 * Hàm helper để thiết lập một node với các điều kiện cụ thể cho một level.
 * @param node - Node cần thiết lập.
 * @param level - Level mục tiêu.
 * @param options - Tùy chọn để thiết lập node đủ hoặc không đủ điều kiện.
 * - qualified: true nếu muốn node đủ mọi điều kiện.
 * - licenses, sales, f1s: ghi đè các giá trị cụ thể.
 */
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


describe("Node - Buy License Scenarios", () => {
    let parent: Node, child: Node;

    beforeEach(() => {
        parent = new Node(1, 101);
        child = new Node(2, 102);
        parent.addChild(child);
        RewardLogger.clearLogs();
    });

    // =============================================
    // SECTION: KIỂM TRA ĐIỀU KIỆN NHẬN THƯỞNG
    // =============================================
    describe("Qualification Conditions per Level", () => {
        // --- Test chi tiết cho Level 7 ---
        describe("For a mid-level (Lv 7)", () => {
            const testLevel = 7;

            test(`should FAIL if license requirement is not met`, () => {
                configureNode(parent, testLevel, {
                    qualified: true,
                    licenses: Node.getLicenseRequirement(testLevel) - 1 // Thiếu 1 license
                });
                child.buyLicense(1);
                expect(parent.getTotalCommission()).toBe(0);
            });

            test(`should FAIL if sales requirement is not met`, () => {
                configureNode(parent, testLevel, {
                    qualified: true,
                    sales: Node.getSalesRequirement(testLevel) - 1 // Thiếu doanh số
                });
                child.buyLicense(1);
                expect(parent.getTotalCommission()).toBe(0);
            });

            test(`should FAIL if F1 requirement is not met`, () => {
                configureNode(parent, testLevel, {
                    qualified: true,
                    f1s: Node.getF1CountRequirement(testLevel) - 1 // Thiếu 1 F1
                });
                child.buyLicense(1);
                expect(parent.getTotalCommission()).toBe(0);
            });

            test(`should SUCCEED when all conditions are met`, () => {
                configureNode(parent, testLevel, { qualified: true });
                child.buyLicense(1);
                expect(parent.getTotalCommission()).toBe(60); // 1 license * 600 * 0.1 = 60
            });
        })
    });

    // =============================================
    // SECTION: KIỂM TRA HOA HỒNG VÀ MAXOUT
    // =============================================
    describe("Commission and Maxout Logic", () => {
        test("a fully qualified Lv 10 parent should receive correct commission", () => {
            configureNode(parent, 10, { qualified: true });

            // Con mua 5 licenses
            child.buyLicense(5);

            const expectedCommission = 5 * Node.LICENSE_PRICE * Node.getBuyLicenseCommissionRate(10); // 5 * 600 * 0.1 = 300
            expect(parent.getBuyLicenseCommission()).toBe(expectedCommission);

            const logs = RewardLogger.getLogsForUser(parent.getId());
            expect(logs.length).toBe(1);
            expect(logs[0].amount).toBe(expectedCommission);
        });

        test("commission should be zero if parent is already at maxout", () => {
            configureNode(parent, 1, { qualified: true });
            parent.setTotalLicensePurchase(10); // $6000 => Maxout $12000
            parent.setBuyLicenseCommissionReceived(12000); // Đã đạt maxout

            child.buyLicense(1);
            expect(parent.getBuyLicenseCommission()).toBe(0);
        });

        test("commission should be capped exactly at the maxout limit", () => {
            configureNode(parent, 1, { qualified: true });
            parent.setTotalLicensePurchase(10); // $6000 => Maxout $12000
            parent.setTotalLicensePurchaseValue(10 * Node.LICENSE_PRICE); // $6000
            parent.setBuyLicenseCommissionReceived(11990); // Sắp đạt maxout, chỉ còn thiếu $10

            // Con mua 1 license, hoa hồng tiềm năng là $60
            child.buyLicense(1);

            // Hoa hồng thực nhận chỉ là $10
            const expectedCappedCommission = 10;
            expect(parent.getBuyLicenseCommission()).toBe(expectedCappedCommission);
        });
    });

    // =============================================
    // SECTION: KIỂM TRA TỰ ĐỘNG LÊN LEVEL
    // =============================================
    describe("Automatic Level Up Scenarios", () => {
        test("node should level up from 0 to 1 after meeting all conditions", () => {
            const node = new Node(1, 101); // Bắt đầu ở level 0

            // Thiết lập sẵn điều kiện sales và F1
            node.setTotalSystemSales(Node.getSalesRequirement(1));
            node.setTotalF1Count(Node.getF1CountRequirement(1));

            // Mua license cuối cùng để đủ điều kiện
            node.buyLicense(Node.getLicenseRequirement(1));

            expect(node.getLevel()).toBe(1);
        });

        test("node should jump multiple levels if conditions are met", () => {
            const node = new Node(1, 101);

            // Node đã là Lv1
            configureNode(node, 1, { qualified: true });

            // Một hành động mua số lượng lớn license, thỏa mãn điều kiện lên đến Lv3
            const licensesForLv3 = Node.getLicenseRequirement(3);
            node.setTotalSystemSales(Node.getSalesRequirement(3));
            node.setTotalF1Count(Node.getF1CountRequirement(3));

            // Mua đủ license để nhảy cấp
            node.buyLicense(licensesForLv3 - node.getTotalLicensePurchase());

            expect(node.getLevel()).toBe(3);
        });
    });

    // =============================================
    // SECTION: CÁC TRƯỜNG HỢP KHÁC
    // =============================================
    describe("Edge Cases", () => {
        test("node with no parent should not trigger commission and not throw error", () => {
            const orphanNode = new Node(99, 199);

            let commission = 0;
            expect(() => {
                // commission ở đây là tổng số license của user, không phải hoa hồng
                commission = orphanNode.buyLicense(1);
            }).not.toThrow();

            expect(commission).toBe(1); // Trả về tổng số license đã mua
            expect(orphanNode.getBuyLicenseCommission()).toBe(0); // Không có hoa hồng
            expect(RewardLogger.getAllLogs().length).toBe(0); // Không có log nào được tạo
        });
    });
});