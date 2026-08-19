# YMM Academy

Ứng dụng React/Vite sử dụng Firebase Authentication làm nguồn xác thực duy nhất và Cloud Firestore làm nguồn dữ liệu dùng chung cho hồ sơ, quyền và metadata video.

## Cấu hình

Sao chép `.env.example` thành `.env.local` và điền Firebase Web SDK config công khai từ Firebase Console. Không commit `.env.local`, credential hoặc service-account key.

```bash
npm install
npm run dev
```

Firebase project production là `ymm-academy`; Firestore database `(default)` dùng Standard edition, Native mode tại `asia-southeast1`. Repository không dùng Cloud SQL, Cloud Run, Cloud Storage hay backend riêng.

## Data model

- `users/{uid}`: `email`, `displayName`, `role`, `status`, `createdAt`, `updatedAt`. Document ID chính là Firebase UID; client chỉ có thể tự tạo role `user`.
- `media/{mediaId}`: metadata video, visibility/status và tham chiếu nguồn. Không lưu binary, Blob hay base64.

`sourceType` hỗ trợ `external_url`, `youtube`, `vimeo`, `future_storage`, `unset`. Có thể tạo video draft với `sourceType=unset`, `sourceUrl=null`; player sẽ hiện “Video chưa được cấu hình”. Khi tích hợp nguồn mới, mở rộng resolver/adapter trong `src/services/videoSource.ts` mà không đổi schema cốt lõi.

## Kiểm thử và deploy

```bash
npm run typecheck
npm run lint
npm test
PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH" npm run test:rules
npm run build
firebase deploy --only firestore:rules,firestore:indexes,hosting --project ymm-academy
```

Rules tests dùng demo project và Emulator Suite, không đọc/ghi production. Truy vấn media có `limit`, không polling/realtime listener; các field mô tả và URL dài được miễn index để giảm storage. Admin checks trong Rules dùng một dependent read tới `users/{uid}`; Firestore có thể tính lượt đọc phụ khi rules phải đánh giá document này.

## Bootstrap admin đầu tiên

Đăng ký tài khoản thật qua ứng dụng và đăng nhập ít nhất một lần để tạo `users/{uid}`. Script dùng Application Default Credentials, không tải key:

```bash
gcloud auth application-default login
GOOGLE_CLOUD_PROJECT=ymm-academy npm run bootstrap:admin -- --email owner@example.com --dry-run
GOOGLE_CLOUD_PROJECT=ymm-academy npm run bootstrap:admin -- --email owner@example.com
```

Có thể dùng `--uid UID` thay `--email`. Lệnh thật yêu cầu nhập `PROMOTE`. Rules chặn admin tự hạ quyền chính mình, nhưng Firestore Rules không thể đếm admin toàn collection một cách nguyên tử; việc bảo toàn admin cuối cùng phải được đảm bảo bằng quy trình vận hành/bootstrap.

## Theo dõi quota

Theo dõi Reads, Writes, Deletes, Storage và network tại Firebase Console → Firestore Database → Usage. Cấu hình hiện tại không bật TTL, PITR, backup/restore/clone hoặc database thứ hai. Project không liên kết billing tại thời điểm thiết lập; cần kiểm tra lại trạng thái project trước mỗi lần bật thêm dịch vụ.
