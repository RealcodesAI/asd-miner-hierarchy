import {RewardLog} from "./RewardLog.ts";
import {RewardLogger} from "./RewardLogger.ts";
import {Logger} from "./Logger.ts";

export class Node {
    public id: number; // Sử dụng number hoặc string để hỗ trợ cả ID và username
    public username: number | string; // Sử dụng number hoặc string để hỗ trợ cả ID và username
    public level: number;
    public parent: Node | null;
    public children: Node[];
    public totalSystemSales: number; // Tổng doanh số mua license của tất cả các node con từ từ F1 đến F3
    public totalLicensePurchase: number; // Tổng số license đã mua
    public totalLicensePurchaseValue: number; // Tổng tiền đã mua license (tính theo giá license)
    public buyLicenseCommission: number; // Hoa hồng mua license cho user bố trực tiếp
    public miningRewardCommission: number; // Hoa hồng thưởng đào ASD cho user bố trực tiếp
    public miningReward: number; // Thưởng đào ASD cho user này
    public miningRewardSharedCommission: number; // Hoa hồng thưởng đào ASD đồng hưởng cho user các cấp trên (Max 20 tầng)
    public miningRewardOtherCommission: number; // Phần hoa hồng đào ASD cho các hoạt động khác (nếu có)
    public buyLicenseCommissionReceived: number; // Hoa hồng mua license đã nhận (Dùng để check maxout)
    public totalMining: number; // Tổng số ASD đã đào được
    public totalF1Count: number; // Tổng số F1 (mua 3+ license) của user này

    constructor(_id: number, _username: string | number, _level: number = 0) {
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
        this.totalMining = 0;
        this.totalLicensePurchaseValue = 0;
        this.totalF1Count = 0; // Khởi tạo tổng số F1
    }

    // Getters and Setters
    public getId(): number {
        return this.id;
    }

    public setId(_id: number): void {
        this.id = _id;
    }

    public getUsername(): number | string {
        return this.username;
    }

    public setUsername(_username: number | string): void {
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

    public getTotalMining(): number {
        return this.totalMining;
    }

    public setTotalMining(_totalMining: number): void {
        if (_totalMining < 0) {
            throw new Error("Total mining cannot be negative.");
        }

        this.totalMining = _totalMining;
    }

    public getTotalLicensePurchaseValue(): number {
        return this.totalLicensePurchaseValue;
    }

    public setTotalLicensePurchaseValue(_totalLicensePurchaseValue: number): void {
        if (_totalLicensePurchaseValue < 0) {
            throw new Error("Total license purchase value cannot be negative.");
        }

        this.totalLicensePurchaseValue = _totalLicensePurchaseValue;
    }

    public setTotalF1Count(_totalF1Count: number): void {
        if (_totalF1Count < 0) {
            throw new Error("Total F1 count cannot be negative.");
        }

        this.totalF1Count = _totalF1Count;
    }

    public getTotalF1Count(): number {
        return this.totalF1Count;
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
        0: 0,
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
        0: 0,
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
        0: 0,
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
        0: 0,
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
        0: 0,
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
        if (level < 0 || level > 10) {
            throw new Error("Level must be between 0 and 10.");
        }
        return this.LICENSE_REQUIREMENTS[level as keyof typeof this.LICENSE_REQUIREMENTS] || 0;
    }

    public static getBuyLicenseCommissionRate(level: number): number {
        if (level < 0 || level > 10) {
            throw new Error("Level must be between 0 and 10.");
        }
        return this.BUY_LICENSE_COMMISSION_RATES[level as keyof typeof this.BUY_LICENSE_COMMISSION_RATES] || 0;
    }

    public static getSalesRequirement(level: number): number {
        if (level < 0 || level > 10) {
            throw new Error("Level must be between 0 and 10.");
        }
        return this.SALES_REQUIREMENTS[level as keyof typeof this.SALES_REQUIREMENTS] || 0;
    }

    public static getF1CountRequirement(level: number): number {
        if (level < 0 || level > 10) {
            throw new Error("Level must be between 0 and 10.");
        }
        return this.F1_COUNT_REQUIREMENTS[level as keyof typeof this.F1_COUNT_REQUIREMENTS] || 0;
    }

    public static getMiningRewardCommissionRate(level: number): number {
        if (level < 0 || level > 10) {
            throw new Error("Level must be between 0 and 10.");
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

    /*
        Function to validate if the parent node meets the requirements for level
     */
    public validateParentLevel(checkLevel?: number): boolean {
        // Kiểm tra xem bố đã mua license chưa
        const currentLevel = checkLevel ?? this.getLevel();
        if (this.getTotalLicensePurchase() < Node.getLicenseRequirement(currentLevel)) {
            Logger.warn(`Parent ${this.username} không đủ điều kiện license cho level ${currentLevel}.`)
            return false;
        }

        // Kiểm trả xem doanh số mua license của bố có đủ để nhận hoa hồng không
        if (this.getTotalSystemSales() < Node.getSalesRequirement(currentLevel)) {
            Logger.warn(`Parent ${this.username} không đủ doanh số cho level ${currentLevel}.`);
            return false;
        }

        // Kiểm tra xem số lượng F1 (mua 3+ license) có đủ để nhận hoa hồng không
        if (this.getTotalF1Count() < Node.getF1CountRequirement(currentLevel)) {
            Logger.warn(`Parent ${this.username} không đủ F1 (3+ licenses) cho level ${currentLevel}.`);
            return false;
        }

        return true;
    }

    public updateLevel(): void {
        const startLevel = this.level + 1;
        let newLevel = this.level;

        for (let level = startLevel; level <= 10; level++) {
            const hasEnoughLicenses = this.totalLicensePurchase >= Node.getLicenseRequirement(level);
            const hasEnoughSales = this.totalSystemSales >= Node.getSalesRequirement(level);
            const hasEnoughF1s = this.totalF1Count >= Node.getF1CountRequirement(level);

            if (hasEnoughLicenses && hasEnoughSales && hasEnoughF1s) {
                newLevel = level; // Đủ điều kiện, cập nhật level mới
            } else {
                break; // Không đủ điều kiện cho level này, dừng kiểm tra
            }
        }

        if (newLevel > this.level) {
            Logger.success(`User ${this.username} đã được thăng cấp từ Lv${this.level} lên Lv${newLevel}!`);
            this.level = newLevel;
        }
    }

    private checkMaxoutLicenseCommission(amount: number, licensePrice: number): number {
        // Lấy tổng doanh số mua license của bố
        const totalSales = this.getTotalLicensePurchaseValue() === 0 ?
            this.getTotalLicensePurchase() * licensePrice :
            this.getTotalLicensePurchaseValue();
        // Lấy hoa hồng mua license đã nhận của bố
        const receivedCommission = this.getBuyLicenseCommissionReceived();

        // Tính hoa hồng mua license tối đa mà bố có thể nhận
        const maxCommission = totalSales * Node.MAXOUT_LICENSE_COMMISSION_RATE;

        if (receivedCommission >= maxCommission) {
            Logger.warn(`Parent ${this.username} đã đạt giới hạn hoa hồng license.`);
            return 0; // Không trả hoa hồng nếu đã maxout
        }

        if (receivedCommission + amount > maxCommission) {
            return maxCommission - receivedCommission; // Trả hoa hồng tối đa có thể nhận
        }

        return amount; // Trả toàn bộ hoa hồng nếu chưa maxout
    }

    public buyLicense(quantity: number, licensePrice: number = Node.LICENSE_PRICE): number {
        if (quantity <= 0) {
            throw new Error("Quantity must be greater than 0.");
        }

        Logger.info(`User ${this.username} đang mua ${quantity} license với giá ${licensePrice}.`);

        this.totalLicensePurchase += quantity;
        this.totalLicensePurchaseValue += quantity * licensePrice;
        this.updateLevel();

        const parent = this.getParent();
        if (parent) {
            if (parent.validateParentLevel()) {
                const commissionRate = Node.getBuyLicenseCommissionRate(parent.getLevel());
                const commission = quantity * licensePrice * commissionRate;
                const commissionToReceive = parent.checkMaxoutLicenseCommission(commission, licensePrice);
                // Cập nhật hoa hồng mua license cho bố và upgrade cho bố

                parent.buyLicenseCommission += commissionToReceive;
                parent.buyLicenseCommissionReceived += commissionToReceive;
                parent.totalSystemSales += quantity * licensePrice;
                if(this.getTotalLicensePurchase() > 3) {
                    parent.setTotalF1Count(parent.getTotalF1Count() + 1);
                }
                parent.updateLevel();
                Logger.success(`Parent ${parent.username} nhận được ${commissionToReceive} hoa hồng mua license.`);
                // Create a reward log for the commission
                RewardLogger.addLog(
                    parent.getId(),
                    this.getId(),
                    "buy_license_commission",
                    commissionToReceive,
                    `Commission for buying ${quantity} licenses at price ${licensePrice} each.`,
                )
            } else {
                Logger.warn(`Parent ${parent.username} không đủ điều kiện nhận hoa hồng license.`);
            }
        }

        return this.totalLicensePurchase;
    }

    public rewardMining(amount: number) {
        if (amount <= 0) {
            throw new Error("Reward must be greater than 0.");
        }

        Logger.info(`User ${this.username} đang nhận thưởng đào ${amount} ASD.`);

        const miningReward = amount * Node.MINING_REWARD_RATES;
        this.miningReward += miningReward
        Logger.success(`User ${this.username} nhận được ${miningReward} thưởng đào cá nhân.`);
        // Phần dư hoa hồng đào ASD sẽ được trả về hệ thống
        let remainingReward = amount * Node.MINING_REWARD_COMMISSION_RATE_MAX;

        // Tính hoa hồng đào ASD cho bố trực tiếp
        const actualCommission = this.processMiningRewardCommission(amount, remainingReward);

        // Create a reward log for the mining reward
        RewardLogger.addLog(
            this.getId(),
            null,
            "mining_reward",
            miningReward,
            `Mining reward of ${miningReward} received.`,
        )


        return {
            remainingReward: remainingReward - actualCommission,
            miningReward: miningReward,
            miningRewardCommission: actualCommission,
            miningRewardSharedCommission: amount * Node.MINING_REWARD_SHARED_COMMISSION_RATE_MAX,
            miningRewardOtherCommission: amount * Node.MINING_REWARD_OTHER_COMMISSION_RATE_MAX,
        }
    }

    private processMiningRewardCommission(amount: number, maxRewardCommission: number): number {
        const parent = this.getParent();
        if (parent) {
            if (!parent.validateParentLevel()) {
                Logger.warn(`Parent ${parent.username} không đủ điều kiện nhận hoa hồng đào.`);
                return 0;
            }
            const commissionRate = Node.getMiningRewardCommissionRate(parent.getLevel());
            const actualCommission = amount * commissionRate;

            // Trả thưởng
            parent.miningRewardCommission += actualCommission;
            Logger.success(`Parent ${parent.username} nhận được ${actualCommission} hoa hồng đào trực tiếp.`);

            // Create a reward log for the mining reward commission
            RewardLogger.addLog(
                parent.getId(),
                this.getId(),
                "mining_reward_commission",
                actualCommission,
                `Mining reward commission of ${actualCommission} received.`,
                maxRewardCommission - actualCommission
            )

            return actualCommission;
        }

        return 0; // Không có bố, không trả hoa hồng
    }

    // Trả thưởng hoa hồng đào ASD đồng hưởng cho user dựa theo cấp độ của node và tổng số ASD đã đào được
    public rewardMiningShared(amount: number): {success: boolean, sharedCommission: number, remainingSharedCommission: number} {
        // Kiểm tra xem có đủ phần thưởng để phân phối không
        if (amount <= 0) {
            return {
                success: false,
                sharedCommission: 0,
                remainingSharedCommission: 0
            }
        }

        if (!this.validateParentLevel(4)) {
            Logger.warn(`User ${this.username} không đủ điều kiện nhận hoa hồng đồng hưởng.`);
            return {
                success: false,
                sharedCommission: 0,
                remainingSharedCommission: 0
            }
        }
        const descendants = this.getDescendants().filter(descendant => descendant.getLayer() <= Node.MAX_LEADER_LAYERS);

        // Tính tổng số ASD đã đào được của tất cả các con
        let totalMiningDescendants = descendants.reduce(
            (total, descendant) => total + descendant.getTotalMining(), 0
        )

        if (totalMiningDescendants === 0) {
            Logger.info(`Không có thưởng để phân phối cho user ${this.username}.`);
            return {
                success: false,
                sharedCommission: 0,
                remainingSharedCommission: 0
            }
        }

        let remainingSharedCommission = amount * Node.MINING_REWARD_SHARED_COMMISSION_RATE_MAX;

        const sharedCommissionRate = Node.getMiningRewardSharedCommissionRate(this.getLevel());
        const sharedCommission = remainingSharedCommission * sharedCommissionRate;

        // Cập nhật hoa hồng đào ASD đồng hưởng cho user
        this.miningRewardSharedCommission += sharedCommission;
        Logger.success(`User ${this.username} nhận được ${sharedCommission} hoa hồng đồng hưởng.`);

        // Create a reward log for the mining reward shared commission
        RewardLogger.addLog(
            this.getId(),
            null,
            "mining_reward_shared_commission",
            sharedCommission,
            `Shared mining reward commission of ${sharedCommission} received.`,
            remainingSharedCommission - sharedCommission
        );

        return {
            sharedCommission: sharedCommission,
            remainingSharedCommission: remainingSharedCommission - sharedCommission,
            success: true
        }
    }

    public getTotalCommission(): number {
        return this.buyLicenseCommission + this.miningRewardCommission + this.miningRewardSharedCommission + this.miningRewardOtherCommission;
    }

    public getCommissionByType() {
        return {
            buyLicenseCommission: this.buyLicenseCommission,
            miningRewardCommission: this.miningRewardCommission,
            miningRewardSharedCommission: this.miningRewardSharedCommission,
            miningRewardOtherCommission: this.miningRewardOtherCommission
        };
    }

    public getAllLogs(): RewardLog[] {
        return RewardLogger.getAllLogs()
    }

    public getLogsForUser(userId: number): RewardLog[] {
        return RewardLogger.getLogsForUser(userId);
    }
}