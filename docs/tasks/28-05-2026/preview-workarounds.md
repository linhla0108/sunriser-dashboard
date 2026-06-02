# Academic & Portfolio Preview Workarounds

Tag: candidates/feature

## Goal

Tăng tỉ lệ candidate có preview hữu ích ngay trong dashboard: render DOCX inline, dùng Open Graph card khi iframe bị chặn, resolve short link, lọc rác URL parser.

## Scope

- Included
  - DOCX preview inline bằng `docx-preview` (1 candidate trong 40 supplements).
  - Endpoint server-side `/api/candidates/og-preview` để fetch + resolve redirect + parse OG/Twitter meta tags (xử lý LinkedIn, Notion, surl.li, các site cản X-Frame-Options).
  - Component `OgCardPreview` thay nút fallback đơn cho external-only host và iframe timeout.
  - Bỏ `notion.so` khỏi `EXTERNAL_ONLY_HOSTS` để thử iframe Notion trước.
  - Sửa `URL_PATTERN` trong `candidateLinks.ts` để không bắt `m.th` từ "năm.thực hành" (yêu cầu first label ≥ 2 ký tự cho generic host).
- Excluded
  - `react-pdf` custom viewer cho PDF (proxy hiện tại đã ép `Content-Disposition: inline`).
  - Liệt kê nội dung ZIP/RAR.
  - Cache OG response vào Supabase (chỉ HTTP `Cache-Control: private, max-age=600`).
  - Microsoft/Google Office viewer (không dùng được vì proxy yêu cầu auth).

## Acceptance criteria

- Candidate có Academic `.docx` (vd `026`) hiện DOCX content trực tiếp trong dialog preview, không phải nút "download".
- Candidate có portfolio LinkedIn / Notion / behance / site cản iframe hiển thị OG card (image + title + description + site) thay vì màn hình trắng có 1 nút.
- Short link `surl.li/...` (vd candidate `010`) khi mở OG card hiển thị title/host của destination thật, không phải `surl.li`.
- `extractCandidateUrls("năm.thực hành tại trường")` trả `[]`.
- `getCandidatePreviewKind` trả `"docx"` cho `.docx`, `"unsupported-file"` cho `.zip/.rar/.doc`, `"embeddable-web"` cho Notion.
- `npx tsc --noEmit`, `npm run lint`, `npm test` sạch.

---

## Report

Status: Done

### Thay đổi behavior

1. **Academic DOCX**: thêm kind `"docx"`, component `DocxPreview` fetch file qua proxy hiện có rồi `docx-preview.renderAsync` để render HTML inline trong dialog. Proxy `/api/candidates/preview-file` thêm MIME `application/vnd.openxmlformats-officedocument.wordprocessingml.document` cho `.docx`.
2. **Portfolio OG card**: route mới `/api/candidates/og-preview` fetch HEAD HTML (cap 256KB, timeout 6s, block private/local hostnames), parse `<title>`, `og:*`, `twitter:*`, `<meta name="description">`. Resolve image relative URL, trả `finalUrl` từ `response.url` để xử lý redirect short link. Component `OgCardPreview` render card với hero image (16:9), title, description, site name, host, button mở tab. Wire vào `PreviewFrame`: thay `PreviewFallback` cho `external-only` và cho nhánh iframe `status === "fallback"` (ảnh vẫn dùng PreviewFallback vì image fallback khác bản chất).
3. **Notion**: bỏ `notion.so`/`www.notion.so` khỏi `EXTERNAL_ONLY_HOSTS`. Iframe thử trước; nếu Notion publish-to-web cho phép sẽ load, nếu không sẽ rớt sang OG card sau 4.5s timeout.
4. **URL_PATTERN cleanup**: nhánh generic host đổi `[a-z0-9-]+` → `[a-z0-9-]{2,}` cho first label. Loại bỏ junk match `m.th` từ "năm.thực hành", giữ nguyên `vnd.id.vn`, `113mobile.somee.com`, các whitelisted host.

### Files chính

- `src/lib/candidates/candidateLinks.ts` — kind `"docx"`, regex first-label ≥ 2 ký tự, bỏ Notion khỏi external-only, helper `candidateOgPreviewUrl`.
- `src/lib/candidates/ogParse.ts` — **mới**, regex-based OG/Twitter meta parser, entity decoding, relative image resolve.
- `src/app/api/candidates/og-preview/route.ts` — **mới**, server-side fetcher + SSRF guard + redirect resolve.
- `src/app/api/candidates/preview-file/route.ts` — thêm MIME docx.
- `src/components/candidates/DocxPreview.tsx` — **mới**, render DOCX client-side với dynamic import của `docx-preview`.
- `src/components/candidates/CandidatePreviewDialog.tsx` — wire `docx` kind + `OgCardPreview` cho external-only và iframe-fallback.
- `package.json` — `docx-preview` mới.

### Tests

- `src/lib/candidates/__tests__/candidateLinks.test.ts` — **mới**, 11 case bao phủ URL parser + kind detection.
- `src/lib/candidates/__tests__/ogParse.test.ts` — **mới**, 6 case OG parser (fallback chains, entity decode, relative image resolve).
- `src/components/candidates/__tests__/CandidatePreviewDialog.test.tsx` — cập nhật 3 case cũ (docx kind, OG card cho LinkedIn, archive .zip cho unsupported fallback).
- Tổng: 427/427 vitest pass, 0 lint error, tsc sạch.

### Out of scope đã chốt với user

- PDF vẫn dùng iframe (chưa thêm react-pdf — chỉ làm nếu manual verify thấy PDF không render inline).
- ZIP/RAR vẫn unsupported.
- Office Online / Google Docs Viewer không dùng được do proxy auth.

Remaining: manual verify thực tế trong browser (theo `docs/claude/feedback-testing-tools.md` — `browser_snapshot`, không screenshot loop) cho 2-3 candidate PDF + DOCX + LinkedIn để xác nhận trải nghiệm cuối.
