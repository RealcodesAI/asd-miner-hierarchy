// tests/Node.structure.test.ts
import { expect, test, describe, beforeEach } from "bun:test";
import { Node } from "../src/Node";
import { RewardLogger } from "../src/RewardLogger";

describe("Node Tree Structure", () => {
    let root: Node, child1: Node, child2: Node, grandchild1: Node;

    beforeEach(() => {
        // Tạo cây mới cho mỗi test
        root = new Node(1, 101);
        child1 = new Node(2, 102);
        child2 = new Node(3, 103);
        grandchild1 = new Node(4, 104);

        root.addChild(child1);
        root.addChild(child2);
        child1.addChild(grandchild1);
    });

    test("should set parent and children correctly", () => {
        expect(child1.getParent()).toBe(root);
        expect(root.getChildren()).toContain(child1);
        expect(root.getChildren().length).toBe(2);
    });

    test("should throw an error when adding a child that already has a parent", () => {
        const anotherParent = new Node(5, 105);
        expect(() => {
            anotherParent.addChild(child1);
        }).toThrow("Child already has a parent.");
    });

    test("should get ancestors correctly", () => {
        const ancestors = grandchild1.getAncestors();
        expect(ancestors.length).toBe(2);
        expect(ancestors).toContain(child1);
        expect(ancestors).toContain(root);
    });

    test("should get descendants correctly", () => {
        const descendants = root.getDescendants();
        expect(descendants.length).toBe(3);
        expect(descendants).toContain(child1);
        expect(descendants).toContain(child2);
        expect(descendants).toContain(grandchild1);
    });

    test("should calculate layer correctly", () => {
        expect(root.getLayer()).toBe(0);
        expect(child1.getLayer()).toBe(1);
        expect(grandchild1.getLayer()).toBe(2);
    });
});