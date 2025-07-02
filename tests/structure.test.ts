// tests/Node.structure.test.ts
import { expect, test, describe, beforeAll, beforeEach } from "bun:test";
import { Node } from "../src/Node"; // Đảm bảo đường dẫn đúng

describe("Node Tree Structure", () => {

    // =================================================================
    // PHẦN 1: KIỂM TRA CÁC THAO TÁC CƠ BẢN
    // =================================================================
    describe("Basic Operations", () => {
        let root: Node, child1: Node, child2: Node;

        beforeEach(() => {
            root = new Node(1, 101);
            child1 = new Node(2, 102);
            child2 = new Node(3, 103);
            root.addChild(child1);
            root.addChild(child2);
        });

        test("should set parent and children correctly", () => {
            expect(child1.getParent()).toBe(root);
            expect(root.getChildren()).toContain(child1);
        });

        test("should throw an error when adding a child that already has a parent", () => {
            const anotherParent = new Node(5, 105);
            expect(() => {
                anotherParent.addChild(child1);
            }).toThrow("Child already has a parent.");
        });

        test("should remove a child correctly", () => {
            const childCountBefore = root.getChildren().length;
            root.removeChild(child1);

            expect(root.getChildren().length).toBe(childCountBefore - 1);
            expect(root.getChildren()).not.toContain(child1);
            expect(child1.getParent()).toBe(null);
        });

        test("should throw an error when trying to remove a non-existent child", () => {
            const nonExistentChild = new Node(99, 199);
            expect(() => root.removeChild(nonExistentChild)).toThrow("Child not found in this node's children.");
        });
    });

    // =================================================================
    // PHẦN 2: KIỂM TRA TRÊN CÂY LỚN (HƠN 20 TẦNG)
    // =================================================================
    describe("Large Scale & Deep Tree Operations", () => {
        let deepRoot: Node;
        let deepNode: Node;
        const MAX_DEPTH = 25; // Độ sâu của cây
        const CHILDREN_PER_NODE = 2; // Số con mỗi node

        // Sử dụng beforeAll để chỉ tạo cây lớn một lần, tiết kiệm thời gian
        beforeAll(() => {
            deepRoot = new Node(1, 1001);
            let currentNode = deepRoot;

            // Vòng lặp để tạo ra một chuỗi node sâu 25 tầng
            for (let i = 1; i <= MAX_DEPTH; i++) {
                const newNode = new Node(i + 1, 1001 + i);
                currentNode.addChild(newNode);
                currentNode = newNode;
            }
            deepNode = currentNode; // Lưu lại node ở tầng sâu nhất
        });

        test("should correctly calculate layer for a very deep node", () => {
            // Layer được tính từ 0, nên tầng 25 sẽ có layer là 25
            expect(deepNode.getLayer()).toBe(MAX_DEPTH);
        });

        test("should get all ancestors from a very deep node", () => {
            const ancestors = deepNode.getAncestors();
            // Node ở tầng 25 sẽ có 25 tổ tiên (từ tầng 24 lên đến root)
            expect(ancestors.length).toBe(MAX_DEPTH);
            expect(ancestors[ancestors.length - 1]).toBe(deepRoot); // Tổ tiên cuối cùng phải là root
        });

        test("getDescendants should return correct count for a multi-branch tree", () => {
            const root = new Node(1, 1);
            // Hàm helper để tạo cây đệ quy
            const buildTree = (parent: Node, depth: number) => {
                if (parent.getLayer() >= depth) return;
                for (let i = 0; i < CHILDREN_PER_NODE; i++) {
                    const child = new Node(Number(`${parent.id}${i}`), Number(`${parent.username}${i}`));
                    parent.addChild(child);
                    buildTree(child, depth);
                }
            };

            // Tạo cây có 3 tầng, mỗi node có 2 con
            buildTree(root, 3);

            // Tầng 1: 2 node
            // Tầng 2: 2*2 = 4 node
            // Tầng 3: 4*2 = 8 node
            // Tổng số hậu duệ = 2 + 4 + 8 = 14
            expect(root.getDescendants().length).toBe(14);
        });

        test("should find a specific node deep within the tree", () => {
            // Tìm node có ID là 15 (tầng 14)
            const targetNodeId = 15;
            const descendants = deepRoot.getDescendants();
            const foundNode = descendants.find(node => node.getId() === targetNodeId);

            expect(foundNode).toBeDefined();
            expect(foundNode?.getId()).toBe(targetNodeId);
            expect(foundNode?.getLayer()).toBe(targetNodeId - 1);
        });
    });
});