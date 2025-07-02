## Hướng dẫn sử dụng API

Dưới đây là cách sử dụng 3 hàm chính để vận hành hệ thống trả thưởng.

### 1\. `buyLicense(quantity: number, pricePerLicense?: number)`

Hàm này mô phỏng hành động một người dùng mua license.

- **Mục đích**: Ghi nhận số license người dùng đã mua và kích hoạt hoa hồng cho tuyến trên.
- **Tác động**:
    - Tăng `totalLicensePurchase` (tổng số license đã mua) của chính người dùng đó.
    - Tự động kiểm tra và nâng cấp `level` cho người dùng nếu đủ điều kiện.
    - Tính toán và cộng `buyLicenseCommission` (hoa hồng mua license) cho `parent` (người cha) trực tiếp nếu người đó đủ điều kiện.
- **Ví dụ**:

<!-- end list -->

```typescript
import { Node } from './Node';

// Tạo người dùng cha (parent) và con (child)
const parent = new Node(1, 101);
const child = new Node(2, 102);
parent.addChild(child);

// Giả sử parent đã đủ điều kiện nhận hoa hồng ở Level 1
parent.setLevel(1);
parent.setTotalLicensePurchase(1); // Tổng số license đã mua của parent
parent.setTotalSystemSales(100); // Tổng doanh số hệ thống các cấp dưới từ F1 đến F3
// Thêm tất cả các F1 cho parent để tính toán điều kiện nhân hoa hồng
for (let i = 0; i < 10; i++) {
    const f1 = new Node(100 + i, 1100 + i);
    f1.setTotalLicensePurchase(3); // Số license đã mua của F1 đó - giả sử mỗi F1 mua 3 license
    parent.addChild(f1);
}
//...

// Child mua 1 license
child.buyLicense(1); 

// Kết quả: parent.buyLicenseCommission sẽ được cộng thêm 60 (600 * 0.1)
```

-----

### 2\. `rewardMining(amount)`

Hàm này mô phỏng việc một người dùng được nhận thưởng từ hoạt động đào ASD của cá nhân họ.

- **Mục đích**: Trả thưởng cho người đào và kích hoạt hoa hồng trực tiếp cho người cha.
- **Tác động**:
    1.  **Thưởng cá nhân**: Cộng thưởng vào thuộc tính `miningReward` của chính người dùng đó.
    2.  **Hoa hồng trực tiếp**: Tính toán và cộng hoa hồng vào thuộc tính `miningRewardCommission` cho `parent` nếu đủ điều kiện.
- **Giá trị trả về**: Hàm trả về một object chứa các thông tin:
    - `miningReward`: Phần thưởng cá nhân của người đào.
    - `miningRewardCommission`: Hoa hồng trả cho người cha.
    - `remainingReward`: Phần dư còn lại từ quỹ hoa hồng 3% để trả về cho hệ thống.
- **Ví dụ**:

<!-- end list -->

```typescript
// Tiếp tục ví dụ trên, parent đã đủ điều kiện
// Child đào được 1000 ASD
const result = child.rewardMining(1000);

// Kết quả:
// 1. child.miningReward sẽ được cộng 920 (1000 * 0.92)
// 2. parent.miningRewardCommission sẽ được cộng 10 (1000 * 0.01)
// 3. result.remainingReward sẽ là 20 (30 - 10)
```

-----

### 3\. `rewardMiningShared()`

Hàm này dùng để tính **hoa hồng đồng hưởng** cho một người lãnh đạo (leader) dựa trên hoạt động của toàn bộ tuyến dưới của họ.

- **Mục đích**: Trả thưởng cho các leader cấp cao (từ Level 4 trở lên).
- **Logic tính toán (phiên bản đã sửa)**:
    - Hàm sẽ tính tổng số ASD đã đào (`totalMining`) của **tất cả các hậu duệ** trong 20 tầng.
    - Hoa hồng được tính bằng: `(tổng ASD của hậu duệ) * (tỷ lệ hoa hồng đồng hưởng của leader)`.
- **Tác động**:
    - Cộng hoa hồng tính được vào thuộc tính `miningRewardSharedCommission` của chính leader đó.
- **Ví dụ**:

<!-- end list -->

```typescript
// Tạo một cây nhỏ
const leader = new Node(1, 101);
const child1 = new Node(2, 102);
const child2 = new Node(3, 103);
const grandchild1 = new Node(4, 104);

leader.addChild(child1);
leader.addChild(child2);
child1.addChild(grandchild1);

// Thiết lập sản lượng đào
child1.setTotalMining(10000);
child2.setTotalMining(5000);
grandchild1.setTotalMining(20000);
// Tổng sản lượng tuyến dưới = 35000

// Giả sử leader đã đủ điều kiện ở Level 7
// (cần set licenses, sales, F1s...)
leader.setLevel(7); 
leader.setTotalLicensePurchase(60); // Tổng số license đã mua của leader
leader.setTotalSystemSales(50000); // Tổng doanh số hệ thống các cấp dưới từ F1 đến F3
// Thêm tất cả các F1 cho parent để tính toán điều kiện nhân hoa hồng
for (let i = 0; i < 10; i++) {
    const f1 = new Node(100 + i, 1100 + i);
    f1.setTotalLicensePurchase(3); // Số license đã mua của F1 đó - giả sử mỗi F1 mua 3 license
    parent.addChild(f1);
}

// Leader gọi hàm để nhận thưởng
const result = leader.rewardMiningShared();

// Kết quả:
// Tỷ lệ cho Lv7 là 0.015
// Hoa hồng = 35000 * 0.015 = 525
// leader.miningRewardSharedCommission sẽ được cộng 525
```

## Chạy Test

Để kiểm tra tất cả các kịch bản, chạy lệnh sau ở thư mục gốc của dự án:

```bash
bun test
```