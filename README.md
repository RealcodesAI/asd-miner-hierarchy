# ASD Reward System API / Hệ thống API Trả Thưởng ASD

**Languages / Ngôn ngữ:** [English](#english) | [Tiếng Việt](#tiếng-việt)

---

## English

### API Usage Guide

Below is how to use the 3 main functions to operate the reward system.

#### 1. `buyLicense(quantity: number, pricePerLicense?: number)`

This function simulates a user purchasing licenses.

- **Purpose**: Records the number of licenses purchased by the user and triggers commissions for the upline.
- **Effects**:
  - Increases the user's `totalLicensePurchase` (total licenses purchased).
  - Automatically checks and upgrades the user's `level` if conditions are met.
  - Calculates and adds `buyLicenseCommission` to the direct `parent` if they qualify.
- **Parameters**:
  - `quantity`: Number of licenses the user wants to purchase.
  - `pricePerLicense`: Price per license (default is 600 ASD).
- **Example**:

```typescript
import { Node } from './Node';

// Create parent and child users
const parent = new Node(1, 101);
const child = new Node(2, 102);
parent.addChild(child);

// Assume parent qualifies for commission at Level 1
parent.setLevel(1);
parent.setTotalLicensePurchase(1); // Parent's total licenses purchased
parent.setTotalSystemSales(100); // Total system sales from F1 to F3 downlines
// Add all F1s to parent for commission calculation conditions
for (let i = 0; i < 10; i++) {
    const f1 = new Node(100 + i, 1100 + i);
    f1.setTotalLicensePurchase(3); // Licenses purchased by each F1 - assume 3 each
    parent.addChild(f1);
}

// Child purchases 1 license
child.buyLicense(1); 

// Result: parent.buyLicenseCommission will be increased by 60 (600 * 0.1)
```

---

#### 2. `rewardMining(amount: number)`

This function simulates a user receiving rewards from their personal ASD mining activities.

- **Purpose**: Rewards the miner and triggers direct commission for the parent.
- **Effects**:
  1. **Personal reward**: Adds reward to the user's `miningReward` attribute.
  2. **Direct commission**: Calculates and adds commission to the `parent`'s `miningRewardCommission` if they qualify.
- **Parameters**: `amount` is the amount of ASD mined.
- **Return value**: Returns an object containing:
  - `miningReward`: Personal reward for the miner.
  - `miningRewardCommission`: Commission paid to the parent.
  - `remainingReward`: Remaining amount from the 3% commission fund to return to the system.
- **Example**:

```typescript
// Continuing the above example, parent already qualifies
// Child mines 1000 ASD
const result = child.rewardMining(1000);

// Results:
// 1. child.miningReward will be increased by 920 (1000 * 0.92)
// 2. parent.miningRewardCommission will be increased by 10 (1000 * 0.01)
// 3. result.remainingReward will be 20 (30 - 10)
```

---

#### 3. `rewardMiningShared(amount: number)`

This function calculates **shared mining commission** for a leader based on their entire downline's activities.

- **Purpose**: Rewards high-level leaders (Level 4 and above).
- **Calculation logic (updated version)**:
  - The function calculates the total ASD mined (`totalMining`) of **all descendants** within 20 levels.
  - Commission is calculated as: `(total ASD of descendants) * (leader's shared commission rate)`.
- **Effects**:
  - Adds the calculated commission to the leader's `miningRewardSharedCommission` attribute.
- **Parameters**: `amount` is the amount of ASD mined.
- **Example**:

```typescript
// Create a small tree
const leader = new Node(1, 101);
const child1 = new Node(2, 102);
const child2 = new Node(3, 103);
const grandchild1 = new Node(4, 104);

leader.addChild(child1);
leader.addChild(child2);
child1.addChild(grandchild1);

// Set mining output
child1.setTotalMining(10000);
child2.setTotalMining(5000);
grandchild1.setTotalMining(20000);
// Total downline output = 35000

// Assume leader qualifies at Level 7
// (need to set licenses, sales, F1s...)
leader.setLevel(7); 
leader.setTotalLicensePurchase(60); // Leader's total licenses purchased
leader.setTotalSystemSales(50000); // Total system sales from F1 to F3 downlines
// Add all F1s to leader for commission calculation conditions
for (let i = 0; i < 10; i++) {
    const f1 = new Node(100 + i, 1100 + i);
    f1.setTotalLicensePurchase(3); // Licenses purchased by each F1 - assume 3 each
    leader.addChild(f1);
}

// Leader calls function to receive reward
const result = leader.rewardMiningShared();

// Result:
// Rate for Lv7 is 0.015
// Commission = 35000 * 0.015 = 525
// leader.miningRewardSharedCommission will be increased by 525
```

### Running Tests

To check all scenarios, run the following command in the project root directory:

```bash
bun test
```

---

## Tiếng Việt

### Hướng dẫn sử dụng API

Dưới đây là cách sử dụng 3 hàm chính để vận hành hệ thống trả thưởng.

#### 1. `buyLicense(quantity: number, pricePerLicense?: number)`

Hàm này mô phỏng hành động một người dùng mua license.

- **Mục đích**: Ghi nhận số license người dùng đã mua và kích hoạt hoa hồng cho tuyến trên.
- **Tác động**:
  - Tăng `totalLicensePurchase` (tổng số license đã mua) của chính người dùng đó.
  - Tự động kiểm tra và nâng cấp `level` cho người dùng nếu đủ điều kiện.
  - Tính toán và cộng `buyLicenseCommission` (hoa hồng mua license) cho `parent` (người cha) trực tiếp nếu người đó đủ điều kiện.
- **Tham số**:
  - `quantity`: Số lượng license người dùng muốn mua.
  - `pricePerLicense`: Giá mỗi license (mặc định là 600 ASD).
- **Ví dụ**:

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

// Child mua 1 license
child.buyLicense(1); 

// Kết quả: parent.buyLicenseCommission sẽ được cộng thêm 60 (600 * 0.1)
```

---

#### 2. `rewardMining(amount: number)`

Hàm này mô phỏng việc một người dùng được nhận thưởng từ hoạt động đào ASD của cá nhân họ.

- **Mục đích**: Trả thưởng cho người đào và kích hoạt hoa hồng trực tiếp cho người cha.
- **Tác động**:
  1. **Thưởng cá nhân**: Cộng thưởng vào thuộc tính `miningReward` của chính người dùng đó.
  2. **Hoa hồng trực tiếp**: Tính toán và cộng hoa hồng vào thuộc tính `miningRewardCommission` cho `parent` nếu đủ điều kiện.
- **Tham số**: `amount` là số lượng ASD đã đào.
- **Giá trị trả về**: Hàm trả về một object chứa các thông tin:
  - `miningReward`: Phần thưởng cá nhân của người đào.
  - `miningRewardCommission`: Hoa hồng trả cho người cha.
  - `remainingReward`: Phần dư còn lại từ quỹ hoa hồng 3% để trả về cho hệ thống.
- **Ví dụ**:

```typescript
// Tiếp tục ví dụ trên, parent đã đủ điều kiện
// Child đào được 1000 ASD
const result = child.rewardMining(1000);

// Kết quả:
// 1. child.miningReward sẽ được cộng 920 (1000 * 0.92)
// 2. parent.miningRewardCommission sẽ được cộng 10 (1000 * 0.01)
// 3. result.remainingReward sẽ là 20 (30 - 10)
```

---

#### 3. `rewardMiningShared(amount: number)`

Hàm này dùng để tính **hoa hồng đồng hưởng** cho một người lãnh đạo (leader) dựa trên hoạt động của toàn bộ tuyến dưới của họ.

- **Mục đích**: Trả thưởng cho các leader cấp cao (từ Level 4 trở lên).
- **Logic tính toán (phiên bản đã sửa)**:
  - Hàm sẽ tính tổng số ASD đã đào (`totalMining`) của **tất cả các hậu duệ** trong 20 tầng.
  - Hoa hồng được tính bằng: `(tổng ASD của hậu duệ) * (tỷ lệ hoa hồng đồng hưởng của leader)`.
- **Tác động**:
  - Cộng hoa hồng tính được vào thuộc tính `miningRewardSharedCommission` của chính leader đó.
- **Tham số**: `amount` là số lượng ASD đã đào.
- **Ví dụ**:

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
// Thêm tất cả các F1 cho leader để tính toán điều kiện nhân hoa hồng
for (let i = 0; i < 10; i++) {
    const f1 = new Node(100 + i, 1100 + i);
    f1.setTotalLicensePurchase(3); // Số license đã mua của F1 đó - giả sử mỗi F1 mua 3 license
    leader.addChild(f1);
}

// Leader gọi hàm để nhận thưởng
const result = leader.rewardMiningShared();

// Kết quả:
// Tỷ lệ cho Lv7 là 0.015
// Hoa hồng = 35000 * 0.015 = 525
// leader.miningRewardSharedCommission sẽ được cộng 525
```

### Chạy Test

Để kiểm tra tất cả các kịch bản, chạy lệnh sau ở thư mục gốc của dự án:

```bash
bun test
```