# Material — Design Tokens & Theme

Thư mục `material/` chứa toàn bộ hệ thống thiết kế của project, được trích xuất từ Steep (extracted 2026-04-30). Theme: **light**, tên mã: **Steep — Warm, Crisp Canvas**.

---

## Files

### `material/DESIGN.md`

Tài liệu thiết kế chính (single source of truth cho con người và LLMs).

**Bao gồm:**

- **Màu sắc** — 10 màu với vai trò rõ ràng (`canvas`, `ink`, `graphite`, `warm-mist`, `terracotta`, `fog`, `muted-stone`, `light-steel`, `hint-of-grey`, `dusk-link`)
- **Font chữ** — hai font: `Sohne` (UI/body, condensed sans-serif) và `Signifier` (display/heading, serif)
- **Type scale** — 5 heading sizes từ 14px đến 90px với line-height và letter-spacing cụ thể
- **Spacing** — base unit 4px, 15 mức từ 4px đến 160px
- **Border radius** — 5 mức: tiny/pill/input/card (24px)
- **Shadow** — một cấp `subtle`: layered box-shadow nhẹ
- **Component specs** — Primary Button, Ghost Button (dark/light), Text Link Button, Card (default/subtle/accent), Input Field
- **Agent Prompt Guide** — quick color reference + example prompts để LLMs tạo component đúng style
- **Do's & Don'ts** — nguyên tắc sử dụng
- **CSS snippets** — `:root` variables và Tailwind v4 `@theme` copy-ready

### `material/tokens.json`

**Machine-readable** design tokens (JSON, Style Dictionary format).

- 5 nhóm: `color` (10), `font` (2), `typography` (18 bước từ `sm` → `5xl-2`), `spacing` (16), `radius` (5), `shadow` (1), `surface` (3)
- Mỗi token có `$value`, `$type`, `$description`
- **Đây là SSoT cho automation:** dùng để generate `theme.css`, `variables.css`, hoặc token cho Figma/Storybook
- Không chỉnh sửa trực tiếp — chỉnh sửa `DESIGN.md` rồi regenerate

### `material/theme.css`

**Tailwind v4 `@theme` block.** Tokens được khai báo trong `@theme { }` để Tailwind tự động map thành utility classes (ví dụ `bg-ink`, `text-canvas`, `p-20`...).

- Dùng khi: project dùng Tailwind v4
- Giống `variables.css` nhưng thiếu `font-weight`, `layout`, `named-radii` (radius theo tên element)

### `material/variables.css`

**CSS custom properties** khai báo trong `:root {}`.

- Dùng khi: project dùng CSS thuần (không Tailwind)
- Bao gồm thêm: `font-weight-*`, `layout` (`--page-max-width`, `--section-gap`, `--card-padding`, `--element-gap`), `named-radii` (`--radius-cards`, `--radius-images`, `--radius-inputs`, `--radius-buttons`)
- Import file này trong `index.css`/`globals.css` để toàn bộ tokens có sẵn

### `SUN.RISER Application 2026.xlsx`

File Excel — **không đọc được nội dung trong CLI**. Có thể là spec/brief ban đầu của ứng dụng.

---

## Quick Reference cho LLMs

| Bạn muốn làm gì                     | Dùng file nào                                                                |
| ----------------------------------- | ---------------------------------------------------------------------------- |
| Hiểu rõ thiết kế, tạo component mới | `DESIGN.md`                                                                  |
| Tạo component theo theme            | `DESIGN.md` → section **Agent Prompt Guide**                                 |
| Đổi giá trị token                   | `tokens.json` (SSoT), rồi regenerate CSS                                     |
| Dùng token trong Tailwind           | Import `theme.css`                                                           |
| Dùng token trong CSS thuần          | Import `variables.css`                                                       |
| Thêm font mới                       | Cập nhật cả 4 file: `DESIGN.md`, `tokens.json`, `theme.css`, `variables.css` |
