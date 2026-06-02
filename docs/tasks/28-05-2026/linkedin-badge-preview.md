# LinkedIn Badge Preview

Tag: candidates/feature

## Goal

Hiển thị thông tin profile LinkedIn ngay trong dashboard cho candidate portfolio thay vì rớt OG card trống (LinkedIn block server-side fetch trả 502).

## Scope

- Included
  - Detect `/in/<vanity>` URL trên `linkedin.com`, `www.linkedin.com`, và locale subdomain (`vn.linkedin.com`, ...).
  - Component `LinkedInBadgePreview` render official LinkedIn Profile Badge (script `platform.linkedin.com/badges/js/profile.js`).
  - Fallback "Open on LinkedIn" khi badge không load trong 6s (private profile, network block).
  - Wire vào `PreviewFrame` trước nhánh `external-only`.
- Excluded
  - LinkedIn company / posts / `/pub/...` (vẫn rớt OG card).
  - Self-host headless browser hay paid API (Proxycurl, Firecrawl) — đã đánh giá, không phù hợp.
  - Lưu cookie LinkedIn / login session (vi phạm TOS).

## Acceptance criteria

- Candidate có portfolio `https://www.linkedin.com/in/<slug>` → preview dialog hiển thị badge với ảnh + tên + headline + vị trí hiện tại.
- Candidate có URL LinkedIn không phải `/in/...` (company, pub) → vẫn rớt OG card như cũ.
- `parseLinkedInProfileUrl` trả `null` cho slug chứa ký tự không hợp lệ (`<script>`, dấu cách).
- `getCandidatePreviewKind("https://www.linkedin.com/in/...")` trả `"linkedin-profile"`.
- Không có CSP nào trong app block `platform.linkedin.com` script hoặc `www.linkedin.com` iframe (đã verify — `next.config.ts` không set CSP).

---

## Report

Status: Done

### Behavior

Khi user click preview portfolio LinkedIn:

1. `getCandidatePreviewKind` test `parseLinkedInProfileUrl` → `"linkedin-profile"`.
2. `PreviewFrame` render `LinkedInBadgePreview` với `vanity={slug}` + `profileUrl={url}`.
3. Component inject `<script src="https://platform.linkedin.com/badges/js/profile.js">` một lần (deduplicated). Trên remount gọi `window.IN.parse(host)` để xử lý badge mới.
4. LinkedIn's badge.js thay nội dung `.LI-profile-badge` bằng iframe trỏ về `www.linkedin.com/badges/profile-badge?...` — iframe hiển thị card chính thức.
5. `MutationObserver` watch container; khi iframe xuất hiện → set `status = "ready"`. Sau 6s không có iframe → `status = "fallback"` hiện CTA "Open on LinkedIn".

Card có header riêng (icon LinkedIn + `@vanity` + nút Open LinkedIn) bên trên badge để giữ navigation nhất quán với GitHub preview.

### Files chính

- `src/lib/candidates/candidateLinks.ts` — `parseLinkedInProfileUrl` + kind `"linkedin-profile"` + route trước `external-only`.
- `src/components/candidates/LinkedInBadgePreview.tsx` — **mới**, badge component + script loader + MutationObserver fallback. Inline LinkedIn glyph SVG vì `lucide-react` không export `Linkedin` ở version repo đang dùng.
- `src/components/candidates/CandidatePreviewDialog.tsx` — branch `"linkedin-profile"` trong `PreviewFrame`, fallback `OgCardPreview` nếu slug parse fail.

### Tests

- `src/lib/candidates/__tests__/candidateLinks.test.ts` — 7 case mới cho `parseLinkedInProfileUrl` (vanity slug, locale subdomain, decode percent-encoding, reject company/pub/unsafe chars), update kind expectation cho LinkedIn.
- `src/components/candidates/__tests__/CandidatePreviewDialog.test.tsx` — case mới "renders LinkedIn profile badge", chuyển case OG card hiện tại sang Notion URL (vì LinkedIn nay đã route sang badge).
- Tổng: 443/443 vitest pass. tsc + lint sạch.

### Limitations đã biết

- Badge chỉ hiển thị info LinkedIn cho phép public. Profile private chỉ hiện link "View profile on LinkedIn".
- Badge load JS từ `platform.linkedin.com` → LinkedIn set cookie/tracking trên trang dashboard. Nếu sau này thêm CSP cần allowlist `platform.linkedin.com` (script-src) và `www.linkedin.com` (frame-src).
- Vanity slug parse khớp regex `[a-zA-Z0-9._%-]+`. URL kiểu rất cũ `/pub/dir/first/last/id` không match — chủ động fallback OG card.
