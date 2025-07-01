// tests/Node.buyLicense.test.ts
import { expect, test, describe, beforeEach } from "bun:test";
import { Node } from "../src/Node";
import { RewardLogger } from "../src/RewardLogger";

describe("Node - Buy License Scenarios", () => {
    let parent: Node, child: Node;

    beforeEach(() => {
        parent = new Node(1, 101, 1);
        child = new Node(2, 102);
        parent.addChild(child);
        RewardLogger.clearLogs(); // Xóa log cũ trước mỗi test
    });

    const setupQualifiedParent = (p: Node) => {
        p.setTotalLicensePurchase(Node.getLicenseRequirement(1)); // 1 license
        p.setTotalSystemSales(Node.getSalesRequirement(1)); // $100
        // Thêm 2 F1 đã mua 3 licenses
        const f1_1 = new Node(10, 110); f1_1.setTotalLicensePurchase(3);
        const f1_2 = new Node(11, 111); f1_2.setTotalLicensePurchase(3);
        p.addChild(f1_1);
        p.addChild(f1_2);
    }

    test("qualified parent should receive full commission", () => {
        setupQualifiedParent(parent);

        child.buyLicense(1); // Mua 1 license giá $600

        const expectedCommission = 600 * Node.getBuyLicenseCommissionRate(1); // 600 * 0.1 = 60
        expect(parent.getBuyLicenseCommission()).toBe(expectedCommission);

        // Kiểm tra log
        const logs = RewardLogger.getLogsForUser(parent.getId());
        expect(logs.length).toBe(1);
        expect(logs[0].amount).toBe(expectedCommission);
    });

    test("unqualified parent (not enough licenses) should not receive commission", () => {
        // Parent chưa mua license nào
        child.buyLicense(1);
        expect(parent.getBuyLicenseCommission()).toBe(0);
    });

    test("commission should respect the maxout limit", () => {
        setupQualifiedParent(parent);
        parent.setTotalLicensePurchase(1); // $600
        // Giới hạn maxout = 600 * 2 = $1200
        parent.setBuyLicenseCommissionReceived(1150); // Đã nhận $1150

        // Mua 1 license, hoa hồng tiềm năng là $60
        child.buyLicense(1);

        // Chỉ có thể nhận thêm $50 (1200 - 1150)
        const expectedCommission = 50;
        expect(parent.getBuyLicenseCommission()).toBe(expectedCommission);
    });

    test("node with no parent should not trigger commission", () => {
        const orphan = new Node(99, 199);
        // Hàm buyLicense không nên throw lỗi
        expect(() => orphan.buyLicense(1)).not.toThrow();
        expect(orphan.getBuyLicenseCommission()).toBe(0);
    });
});