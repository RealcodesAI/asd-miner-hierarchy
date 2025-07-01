/**
 * Logger class để tạo ra các console log có màu sắc và định dạng đẹp hơn.
 * Sử dụng mã màu ANSI để hoạt động trong hầu hết các terminal hiện đại.
 */
export class Logger {
    // Mã màu ANSI
    private static readonly colors = {
        reset: "\x1b[0m",
        bright: "\x1b[1m",
        dim: "\x1b[2m",

        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
    };

    /**
     * Ghi log cho các thông tin chung.
     * @param message - Nội dung cần log.
     */
    public static info(message: string): void {
        console.log(`${this.colors.cyan}[INFO] ${message}${this.colors.reset}`);
    }

    /**
     * Ghi log cho các hành động thành công.
     * @param message - Nội dung cần log.
     */
    public static success(message: string): void {
        console.log(`${this.colors.green}[SUCCESS] ${message}${this.colors.reset}`);
    }

    /**
     * Ghi log cho các cảnh báo.
     * @param message - Nội dung cần log.
     */
    public static warn(message: string): void {
        console.log(`${this.colors.yellow}[WARN] ${message}${this.colors.reset}`);
    }

    /**
     * Ghi log cho các lỗi.
     * @param message - Nội dung cần log.
     */
    public static error(message: string, error?: any): void {
        console.error(`${this.colors.red}[ERROR] ${message}${this.colors.reset}`);
        if (error) {
            console.error(error);
        }
    }

    /**
     * Ghi log cho các hoạt động ghi dữ liệu, như log trả thưởng.
     * @param message - Nội dung cần log.
     */
    public static log(message: string): void {
        console.log(`${this.colors.magenta}📝 ${message}${this.colors.reset}`);
    }
}