export class Node {
    public id: number;
    public username: number;
    public level: number;
    public parent: Node | null;
    public children: Node[];
    public totalSystemSales: number; // Tổng doanh số mua license của tất cả các node con từ từ F1 đến F3
    public totalLicensePurchase: number; // Tổng số license đã mua
    public buyLicenseCommission: number; // Hoa hồng mua license cho user bố trực tiếp
    public miningRewardCommission: number; // Hoa hồng thưởng đào ASD cho user bố trực tiếp
    public miningReward: number; // Thưởng đào ASD cho user này
    public miningRewardSharedCommission: number; // Hoa hồng thưởng đào ASD đồng hưởng cho user các cấp trên (Max 20 tầng)
    public miningRewardOtherCommission: number; // Phần hoa hồng đào ASD cho các hoạt động khác (nếu có)
    public buyLicenseCommissionReceived: number; // Hoa hồng mua license đã nhận (Dùng để check maxout)

    constructor(_id: number, _username: number, _level: number = 0) {
        this.id = _id;
        this.username = _username;
        this.level = _level;
        this.parent = null;
        this.children = [];
        this.totalSystemSales = 0;
        this.totalLicensePurchase = 0;
        this.buyLicenseCommission = 0;
        this.miningRewardCommission = 0;
        this.miningReward = 0;
        this.miningRewardSharedCommission = 0;
        this.miningRewardOtherCommission = 0;
        this.buyLicenseCommissionReceived = 0;
    }

    // Getters and Setters
    public getId(): number {
        return this.id;
    }

    public setId(_id: number): void {
        this.id = _id;
    }

    public getUsername(): number {
        return this.username;
    }

    public setUsername(_username: number): void {
        this.username = _username;
    }

    public getLevel(): number {
        return this.level;
    }

    public setLevel(_level: number): void {
        if (_level < 0 && _level > 10) {
            throw new Error("Level must be between 0 and 10.");
        }
        this.level = _level;
    }

    public getParent(): Node | null {
        return this.parent;
    }

    public setParent(_parent: Node | null): void {
        this.parent = _parent;
    }

    public getChildren(): Node[] {
        return this.children;
    }

    public addChild(_child: Node): void {
        if (_child.parent !== null) {
            throw new Error("Child already has a parent.");
        }
        _child.setParent(this);
        this.children.push(_child);
    }

    public getTotalSystemSales(): number {
        return this.totalSystemSales;
    }

    public setTotalSystemSales(_totalSystemSales: number): void {
        if (_totalSystemSales < 0) {
            throw new Error("Total system sales cannot be negative.");
        }

        this.totalSystemSales = _totalSystemSales;
    }

    public getTotalLicensePurchase(): number {
        return this.totalLicensePurchase;
    }

    public setTotalLicensePurchase(_totalLicensePurchase: number): void {
        if (_totalLicensePurchase < 0) {
            throw new Error("Total license purchase cannot be negative.");
        }

        this.totalLicensePurchase = _totalLicensePurchase;
    }

    public getBuyLicenseCommissionReceived(): number {
        return this.buyLicenseCommissionReceived;
    }

    public setBuyLicenseCommissionReceived(_buyLicenseCommissionReceived: number): void {
        if (_buyLicenseCommissionReceived < 0) {
            throw new Error("Buy license commission received cannot be negative.");
        }

        this.buyLicenseCommissionReceived = _buyLicenseCommissionReceived;
    }

    public getBuyLicenseCommission(): number {
        return this.buyLicenseCommission;
    }

    public getMiningRewardCommission(): number {
        return this.miningRewardCommission;
    }

    public getMiningReward(): number {
        return this.miningReward;
    }

    public getMiningRewardSharedCommission(): number {
        return this.miningRewardSharedCommission;
    }

    public getMiningRewardOtherCommission(): number {
        return this.miningRewardOtherCommission;
    }

    // Số license tối thiểu cho từng cấp
    public static readonly LICENSE_REQUIREMENTS = {
        1: 1,
        2: 2,
        3: 5,
        4: 10,
        5: 20,
        6: 30,
        7: 60,
        8: 80,
        9: 100,
        10: 150,
    }

    // Tỷ lệ hoa hồng nhận được khi F1 mua license
    public static readonly BUY_LICENSE_COMMISSION_RATES = {
        1: 0.1,
        2: 0.1,
        3: 0.1,
        4: 0.1,
        5: 0.1,
        6: 0.1,
        7: 0.1,
        8: 0.1,
        9: 0.1,
        10: 0.1,
    }

    // Tổng doanh số các con từ F1 đến F3 cần tối thiểu để nhận hoa hồng mua license
    public static readonly SALES_REQUIREMENTS = {
        1: 100,
        2: 250,
        3: 500,
        4: 1_000_000,
        5: 2_000_000,
        6: 4_000_000,
        7: 6_000_000,
        8: 8_000_000,
        9: 10_000_000,
        10: 15_000_000,
    }

    // Số lượng F1 (mua 3+ license) cần thiết để nhận hoa hồng mua license
    public static readonly F1_COUNT_REQUIREMENTS = {
        1: 2,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7,
        8: 8,
        9: 9,
        10: 10,
    }

    public static readonly MAX_LEADER_LAYERS = 20;

    public static readonly MINING_REWARD_COMMISSION_RATES = {
        1: 0.01,
        2: 0.01,
        3: 0.015,
        4: 0.015,
        5: 0.02,
        6: 0.02,
        7: 0.025,
        8: 0.025,
        9: 0.03,
        10: 0.03,
    }

    public static readonly MINING_REWARD_SHARED_COMMISSION_RATES = {
        4: 0.01,
        5: 0.01,
        6: 0.015,
        7: 0.015,
        8: 0.02,
        9: 0.02,
        10: 0.03,
    }

    public static readonly MINING_REWARD_RATES = 0.92;

    public static readonly LICENSE_PRICE = 600;

    // Max % user bố nhận trực tiếp từ hoa hồng đào ASD của con, phần dư còn lại sẽ được trả về hệ thống
    public static readonly MINING_REWARD_COMMISSION_RATE_MAX = 0.03;

    public static readonly MAXOUT_LICENSE_COMMISSION_RATE = 2;

    public static readonly MINING_REWARD_SHARED_COMMISSION_RATE_MAX = 0.03;

    public static readonly MINING_REWARD_OTHER_COMMISSION_RATE_MAX = 0.02;

    public static getLicenseRequirement(level: number): number {
        if (level < 1 || level > 10) {
            throw new Error("Level must be between 1 and 10.");
        }
        return this.LICENSE_REQUIREMENTS[level as keyof typeof this.LICENSE_REQUIREMENTS] || 0;
    }

    public static getBuyLicenseCommissionRate(level: number): number {
        if (level < 1 || level > 10) {
            throw new Error("Level must be between 1 and 10.");
        }
        return this.BUY_LICENSE_COMMISSION_RATES[level as keyof typeof this.BUY_LICENSE_COMMISSION_RATES] || 0;
    }

    public static getSalesRequirement(level: number): number {
        if (level < 1 || level > 10) {
            throw new Error("Level must be between 1 and 10.");
        }
        return this.SALES_REQUIREMENTS[level as keyof typeof this.SALES_REQUIREMENTS] || 0;
    }

    public static getF1CountRequirement(level: number): number {
        if (level < 1 || level > 10) {
            throw new Error("Level must be between 1 and 10.");
        }
        return this.F1_COUNT_REQUIREMENTS[level as keyof typeof this.F1_COUNT_REQUIREMENTS] || 0;
    }

    public static getMiningRewardCommissionRate(level: number): number {
        if (level < 1 || level > 10) {
            throw new Error("Level must be between 1 and 10.");
        }
        return this.MINING_REWARD_COMMISSION_RATES[level as keyof typeof this.MINING_REWARD_COMMISSION_RATES] || 0;
    }

    public static getMiningRewardSharedCommissionRate(level: number): number {
        if (level < 4 || level > 10) {
            throw new Error("Level must be between 4 and 10 for shared commission.");
        }
        return this.MINING_REWARD_SHARED_COMMISSION_RATES[level as keyof typeof this.MINING_REWARD_SHARED_COMMISSION_RATES] || 0;
    }

    public removeChild(_child: Node): void {
        const index = this.children.indexOf(_child);
        if (index > -1) {
            _child.setParent(null);
            this.children.splice(index, 1);
        } else {
            throw new Error("Child not found in this node's children.");
        }
    }

    public getAncestors(): Node[] {
        const ancestors: Node[] = [];
        let current: Node | null = this.parent;

        while (current !== null) {
            ancestors.push(current);
            current = current.parent;
        }

        return ancestors;
    }

    public getDescendants(): Node[] {
        const descendants: Node[] = [];
        const stack: Node[] = [...this.children];

        while (stack.length > 0) {
            const current = stack.pop()!;
            descendants.push(current);
            stack.push(...current.children);
        }

        return descendants;
    }

    public getLayer(): number {
        let layer = 0;
        let current: Node | null = this.parent;

        while (current !== null) {
            layer++;
            current = current.parent;
        }

        return layer;
    }

    private validateParentLevel(): boolean {
        // Kiểm tra xem bố đã mua license chưa
        if (this.getTotalLicensePurchase() < Node.getLicenseRequirement(this.getLevel())) {
            console.log(`Parent ${this.username} does not meet the license requirement for level ${this.getLevel()}.`);
            return false;
        }

        // Kiểm trả xem doanh số mua license của bố có đủ để nhận hoa hồng không
        if (this.getTotalSystemSales() < Node.getSalesRequirement(this.getLevel())) {
            console.log(`Parent ${this.username} does not meet the sales requirement for buy license commission for level ${this.getLevel()}.`);
            return false;
        }

        // Kiểm tra xem số lượng F1 (mua 3+ license) có đủ để nhận hoa hồng không
        const f1Count = this.getChildren().filter(child => child.getTotalLicensePurchase() >= 3).length;

        if (f1Count < Node.getF1CountRequirement(this.getLevel())) {
            console.log(`Parent ${this.username} does not have enough F1s (3+ licenses) to receive buy license commission for level ${this.getLevel()}.`);
            return false;
        }

        return true;
    }

    private checkMaxoutLicenseCommission(amount: number, licensePrice: number): number {
        // Lấy tổng doanh số mua license của bố
        const totalSales = this.getTotalLicensePurchase() * licensePrice;
        // Lấy hoa hồng mua license đã nhận của bố
        const receivedCommission = this.getBuyLicenseCommissionReceived();

        // Tính hoa hồng mua license tối đa mà bố có thể nhận
        const maxCommission = totalSales * Node.MAXOUT_LICENSE_COMMISSION_RATE;

        if(receivedCommission >= maxCommission) {
            console.log(`Parent ${this.username} has already received the maximum license commission.`);
            return 0; // Không trả hoa hồng nếu đã maxout
        }

        if(receivedCommission + amount > maxCommission) {
            return maxCommission - receivedCommission; // Trả hoa hồng tối đa có thể nhận
        }

        return amount; // Trả toàn bộ hoa hồng nếu chưa maxout
    }

    public buyLicense(quantity: number, licensePrice: number = Node.LICENSE_PRICE): number {
        if (quantity <= 0) {
            throw new Error("Quantity must be greater than 0.");
        }

        console.log(`User ${this.username} is buying ${quantity} licenses at price ${licensePrice} each.`);

        this.totalLicensePurchase += quantity;

        const parent = this.getParent();
        if (parent) {
            if (parent.validateParentLevel()) {
                const commissionRate = Node.getBuyLicenseCommissionRate(parent.getLevel());
                const commission = quantity * licensePrice * commissionRate;
                const commissionToReceive = parent.checkMaxoutLicenseCommission(commission, licensePrice);
                // Cập nhật hoa hồng mua license cho bố
                parent.buyLicenseCommission += commissionToReceive;
            } else {
                console.log(`Parent ${parent.username} does not qualify for receive license commission.`);
            }
        }

        return this.totalLicensePurchase;
    }

    public rewardMining(amount: number) {
        if (amount <= 0) {
            throw new Error("Reward must be greater than 0.");
        }

        console.log(`User ${this.username} is receiving mining reward of ${amount}.`);

        const miningReward = amount * Node.MINING_REWARD_RATES;
        this.miningReward += miningReward

        // Phần dư hoa hồng đào ASD sẽ được trả về hệ thống
        let remainingReward = amount * Node.MINING_REWARD_COMMISSION_RATE_MAX;

        // Tính hoa hồng đào ASD cho bố trực tiếp
        const actualCommission = this.processMiningRewardCommission(amount);

        return {
            remainingReward: remainingReward - actualCommission,
            miningReward: miningReward,
            miningRewardCommission: actualCommission,
            miningRewardSharedCommission: amount * Node.MINING_REWARD_SHARED_COMMISSION_RATE_MAX,
            miningRewardOtherCommission: amount * Node.MINING_REWARD_OTHER_COMMISSION_RATE_MAX,
        }
    }

    private processMiningRewardCommission(amount: number): number {
        const parent = this.getParent();
        if (parent) {
            if(!parent.validateParentLevel()) {
                console.log(`Parent ${parent.username} does not qualify for mining reward commission.`);
                return 0;
            }
            const commissionRate = Node.getMiningRewardCommissionRate(parent.getLevel());
            const actualCommission = amount * commissionRate;

            // Trả thưởng
            parent.miningRewardCommission += actualCommission;

            return actualCommission;
        }

        return 0; // Không có bố, không trả hoa hồng
    }

    // Trả thưởng hoa hồng đào ASD đồng hưởng cho các cấp trên (Max 20 tầng) theo tuần
    public rewardMiningShared(amount: number) {
        // Lấy danh sách các node trên this node, giới hạn ở MAX_LEADER_LAYERS
        const ancestors = this.getAncestors().slice(0, Node.MAX_LEADER_LAYERS);

        for (let node of ancestors) {
            if (!node.validateParentLevel()) {
                console.log(`Node ${node.username} does not qualify for mining reward shared commission.`);
                continue;
            }

            if(node.getLevel() < 4) {
                console.log(`Node ${node.username} is not eligible for mining reward shared commission at level ${node.getLevel()}.`);
                continue;
            }

            const commissionRate = Node.getMiningRewardSharedCommissionRate(node.getLevel());
            const commission = amount * commissionRate;

            // Cập nhật hoa hồng đào ASD đồng hưởng cho node
            node.miningRewardSharedCommission += commission;
            console.log(`Node ${node.username} received shared mining reward commission of ${commission} for level ${node.getLevel()}.`);
        }
    }
}