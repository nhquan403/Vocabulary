# Hướng dẫn sử dụng

Trang web tĩnh, không cần cài đặt hay mạng. Mở `index.html` bằng trình duyệt (Chrome, Edge, Safari, Firefox).

## Các trang

| Trang | Chức năng |
|---|---|
| `index.html` | Danh sách 20 bài đọc về cuộc sống hằng ngày (~1500 từ/bài). |
| `read.html?id=…` | Đọc bài. Bấm vào bất kỳ từ nào để xem nghĩa, loại từ, nghe phát âm 🔊 và bấm “Chưa biết” để thêm vào danh sách ôn tập. Nút “In bài này (A4)” in ra giấy A4 (khoảng 3 trang, ẩn toàn bộ nút bấm và màu đánh dấu). |
| Thanh nghe (bài có file audio) | Nghe trọn bài bằng giọng đọc tự nhiên: phát/dừng, lùi/tới 5 giây, tốc độ 0.5×–1.5× (trang nhớ tốc độ bạn chọn), thanh tua, nút 🔁 lặp lại. Phím tắt: Space phát/dừng, ← → tua 5 giây. Thanh nghe không xuất hiện khi in. |
| Nghe từ một từ | Trong bài có audio, bấm một từ rồi bấm “▶ Nghe từ đây (lùi 2 giây)”: thanh nghe nhảy tới chỗ từ đó được đọc, lùi 2 giây rồi phát. Nút chỉ hiện khi bài đã có file thời điểm của giọng đang chọn. |
| `dictionary.html` | Từ điển hơn 3000 từ. Tìm bằng tiếng Anh hoặc tiếng Việt (gõ không dấu cũng được), lọc theo chữ cái, chỉ từ chưa biết, hoặc chỉ từ có trong bài đọc. |
| `review.html` | Ôn tập: nền đen, nghĩa tiếng Việt chữ trắng ở giữa. Nút “Hiện tiếng Anh”, nút 🔊 đọc từ tiếng Anh, “Đã thuộc” để bỏ từ khỏi danh sách. Phím tắt: Space hiện/ẩn, ← → chuyển từ, S nghe. |

Danh sách từ chưa biết được lưu trong trình duyệt (`localStorage`), nên sẽ mất nếu xóa dữ liệu trình duyệt hoặc dùng trình duyệt/máy khác.

Hộp chọn giọng trên thanh menu (🇺🇸 Giọng Mỹ: nữ `af_heart`, thư mục `audio/`; 🇮🇳 Giọng Ấn Độ: nam `hm_omega`, thư mục `audio/in/`; 🇮🇳 Ấn Độ (đậm): `hm_omega` được phóng đại chất giọng, phát âm kiểu Anh, nhanh hơn 15%, thư mục `audio/in-strong/`; cấu hình trong `scripts/voices.py`) áp dụng cho thanh nghe bài đọc và nút 🔊 từng từ; trang nhớ giọng đã chọn. Nếu thiếu file của giọng đang chọn, trang dùng file giọng Mỹ; nếu vẫn thiếu, nút 🔊 dùng giọng có sẵn của trình duyệt.

## Sửa nội dung

Dữ liệu gốc nằm trong `data/src/`:

- `words-*.txt` — mỗi dòng `từ|loại từ|nghĩa tiếng Việt`. `words-names.txt` chứa tên riêng (loại `name`, không tính vào số từ).
- `irregular.txt` — dạng bất quy tắc `dạng|từ gốc` (went|go, children|child…).
- `stories/NN-ten-bai.txt` — dòng đầu là tiêu đề, các đoạn cách nhau bởi một dòng trống.

- `audio/stories/<id>.mp3` — file nghe trọn bài (giọng Ấn Độ: `audio/in/stories/`). Tạo bằng Kokoro miễn phí, thêm `--voice in` hoặc `--voice in-strong` cho giọng Ấn Độ:

```
pip install kokoro-onnx soundfile numpy
# tải kokoro-v1.0.onnx và voices-v1.0.bin từ https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
python scripts/generate-story-audio.py --model <thư-mục-chứa-mô-hình> [--voice in|in-strong] 02-going-to-the-market
```

- `audio/words/<từ>.mp3` — file đọc từng từ (dấu `'` trong tên file đổi thành `_`, ví dụ `don_t.mp3`). Tạo hoặc bổ sung cho từ mới (bỏ qua file đã có):

```
python scripts/generate-word-audio.py --model <thư-mục-chứa-mô-hình> [--voice in|in-strong]
```

Thêm `--story <id bài>` để chỉ tạo cho những từ xuất hiện trong bài đó (danh sách lấy bằng `node scripts/story-words.js <id bài>`).

- `audio/…/stories/<id>.timings.js` — thời điểm bắt đầu của từng từ trong file nghe trọn bài (dùng cho nút “Nghe từ đây”). Tạo bằng Whisper miễn phí, chạy lại mỗi khi tạo lại file nghe của bài:

```
pip install faster-whisper
python scripts/align-story-audio.py [--voice in|in-strong] [id bài…]   # không ghi id: làm mọi bài có file nghe
```

Sau khi sửa, chạy:

```
node scripts/build.js
```

Script tạo lại `js/data.js` và báo lỗi nếu có từ nào trong bài đọc không tra được trong từ điển, hoặc từ điển có ít hơn 3000 từ.

## Trang trực tuyến (GitHub Pages)

Địa chỉ: https://nhquan403.github.io/Vocabulary/

GitHub Pages lấy nội dung từ nhánh `gh-pages`. Sau khi sửa và commit trên `master`, cập nhật trang bằng cách:

```
git push origin master:gh-pages
```

Trang thường cập nhật sau khoảng 1 phút.
