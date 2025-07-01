import {RewardLog} from "./RewardLog.ts";

export class RewardLogger {
    private static logs: RewardLog[] = [];

    public static addLog(
        recipientId: number,
        sourceId: number | null,
        type: string,
        amount: number,
        description: string,
        remainingAmount: number = 0
    ): void {
        const log = new RewardLog(
            new Date(),
            recipientId,
            sourceId,
            type,
            amount,
            description,
            remainingAmount
        );
        this.logs.push(log);
    }

    public static getLogsForUser(userId: number): RewardLog[] {
        return this.logs.filter(log => log.recipientId === userId);
    }

    public static getAllLogs(): RewardLog[] {
        return this.logs;
    }

    public static clearLogs(): void {
        this.logs = [];
    }
}