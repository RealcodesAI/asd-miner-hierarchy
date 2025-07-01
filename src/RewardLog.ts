export class RewardLog {
    public readonly timestamp: Date;
    public readonly recipientId: number;
    public readonly sourceId: number | null; // ID của người tạo ra thưởng, null nếu từ hệ thống
    public readonly type: string;
    public readonly amount: number;
    public readonly description: string;
    public readonly remainingAmount: number; // Số tiền dư còn lại sau khi thưởng

    constructor(
        timestamp: Date,
        recipientId: number,
        sourceId: number | null,
        type: string,
        amount: number,
        description: string,
        remainingAmount: number = 0
    ) {
        this.timestamp = timestamp;
        this.recipientId = recipientId;
        this.sourceId = sourceId;
        this.type = type;
        this.amount = amount;
        this.description = description;
        this.remainingAmount = remainingAmount;
    }
}