# Mi&Eco Website – header/footer dùng chung

## Chạy local

```powershell
py -m http.server 5500
```

Mở: `http://localhost:5500`

> Không mở trực tiếp bằng `file://`, vì header và footer được tải bằng `fetch()` từ thư mục `components`.

## Component dùng chung

- `components/header.html`: nội dung header của toàn bộ website.
- `components/footer.html`: nội dung footer của toàn bộ website.
- `assets/css/shared.css`: toàn bộ style header/footer dùng chung.
- `assets/js/common.js`: tải component, đánh dấu menu active và xử lý tìm kiếm.

Header desktop dùng đúng bố cục của trang `gioithieu.html` làm chuẩn. CSS riêng của từng trang không còn chứa style header/footer nên sẽ không bị lệch giữa Trang chủ, Giới thiệu, Sản phẩm và Liên hệ.

Mỗi trang chỉ giữ placeholder:

```html
<header class="header-full" data-component="header" data-page="products"></header>
<footer class="footer-section" data-component="footer"></footer>
```

Giá trị `data-page`: `home`, `about`, `products`, `contact`.

## Trang chủ

- Giữ section **Sản phẩm nổi bật**.
- Đã bỏ section **Từ thiên nhiên trở về thiên nhiên** theo yêu cầu.
- Đã tăng khoảng trống phía trên section sản phẩm để floating header không che tiêu đề.
- Dot navigation còn 4 mục: Slider, Giới thiệu, Sản phẩm nổi bật và Footer.
