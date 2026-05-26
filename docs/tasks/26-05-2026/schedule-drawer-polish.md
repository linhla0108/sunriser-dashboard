# Schedule Drawer Polish

Tag: schedule/ui

## Goal

Drawer `ScheduleEntryDrawer` hiện tại có animation nhưng quá subtle (translate chỉ 40px, duration 200ms) → user cảm giác như "không có animation". Polish thành drawer-slide đúng nghĩa + cải thiện micro-interaction để cảm giác premium production.

## Diagnosis

| Vấn đề                                                                                                       | Vị trí                                              |
| ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| Slide distance chỉ `translate-x-[2.5rem]` (40px) cho drawer rộng ~384px → ~10% width, cảm giác chỉ fade        | [src/components/ui/sheet.tsx](src/components/ui/sheet.tsx) class line 56 |
| Duration `200ms ease-in-out` quá nhanh + easing đối xứng → robotic                                            | sheet.tsx line 56                                   |
| Backdrop fade `200ms` opacity-0 → cùng tốc độ panel, không có depth                                           | sheet.tsx line 31                                   |
| View ↔ Edit mode switch **không có transition** — toàn bộ content nhảy đổi                                   | ScheduleEntryDrawer.tsx                             |
| Save button không có feedback (click → drawer đóng instant, không biết save thành công)                       | ScheduleEntryDrawer.tsx handleSave                  |
| Delete không có confirm — click 1 phát mất luôn entry, dễ sai                                                 | ScheduleEntryDrawer.tsx handleDelete                |
| Padding inconsistent: `space-y-4` ở edit form, `space-y-5` ở view body, `px-4` ở body nhưng header `p-4`     | ScheduleEntryDrawer.tsx                             |
| Content open thiếu micro-motion (header/body/footer cùng appear nhanh, không có stagger)                     | ScheduleEntryDrawer.tsx                             |

## Scope

**Included:**

- Slide drawer 100% width (translate-x-full → 0), không phải 40px.
- Duration 320ms cho enter, 240ms cho exit. Easing ease-out-expo (cubic-bezier(0.16, 1, 0.3, 1)) cho enter; ease-in cho exit.
- Backdrop fade 240ms ease-out, sync với panel exit nhưng chậm hơn 1 tick để có depth.
- Content stagger fade-up cho 3 section (header / body / footer) khi open — 120ms delay base, 60ms increment.
- View ↔ Edit mode transition: crossfade 180ms với subtle slide-up.
- Save button: hiển thị check icon + "Saved" 600ms trước khi đóng drawer.
- Delete: confirm step (button thành "Confirm delete" 3s timeout) thay vì single-click.
- Padding consistent: `p-5` cho header/body/footer; `space-y-5` mọi nơi; `gap-5` cho form sections.
- Date input prettier border + focus state primary `#FF5533`.

**Excluded:**

- Đổi shadcn Sheet primitive bên trong (chỉ override className của SheetContent / SheetOverlay tại schedule drawer use site, KHÔNG sửa file `src/components/ui/sheet.tsx` — file đó shared cho cả workspace).
- Animation cho Gantt entries (defer cho task riêng).
- Toast/sonner notification khi save (drawer self-confirms qua check icon là đủ cho phase này).

## Critical files

- [src/components/views/schedule/ScheduleEntryDrawer.tsx](src/components/views/schedule/ScheduleEntryDrawer.tsx) — thêm animation overrides + stagger + mode transition + button feedback + delete confirm.
- [src/app/globals.css](src/app/globals.css) — thêm 2 keyframes mới: `drawerSlideIn`, `drawerStaggerIn`.
- Không sửa: `src/components/ui/sheet.tsx` (shared primitive — override tại use site bằng className).

## Implementation order (slices)

1. **Drawer slide override.** Override `className` trên SheetContent và SheetOverlay để dùng `translate-x-full` (100% width slide) và duration mới (320/240ms). Verify trong browser: drawer trượt mượt từ phải full distance.
2. **Backdrop refine.** Override SheetOverlay với `transition-opacity duration-240` và `bg-black/15` (đậm hơn 5% cho depth). Verify backdrop fade vào trước panel khi exit.
3. **Content stagger keyframes.** Thêm 1 keyframe `drawerStaggerIn` trong globals.css với opacity + translateY(8px → 0). Apply qua inline style với `animationDelay` 0ms / 60ms / 120ms cho header / body / footer.
4. **View ↔ Edit crossfade.** Wrap ViewBody và EditForm trong 1 container với `key={editing}` để force remount, dùng `key`-based CSS animation `drawerStaggerIn` 180ms.
5. **Save button feedback.** State `saving: 'idle' | 'saved'`. Click → set saved → render check icon + "Saved" → 600ms timeout → onSave + close. Disable button during saved state.
6. **Delete confirm.** State `deleteArmed: boolean`. First click → armed = true + button label "Confirm delete?" + countdown 3s reset. Second click within 3s → actual delete.
7. **Padding + focus tokens.** Pass through entire drawer for consistent `p-5` / `space-y-5` / `gap-5`. Input focus border `#FF5533`.
8. **Browser verify.** `npm run dev` + Playwright MCP / Chrome devtools. Open /schedule, click entry, check slide. Test edit → save (with check feedback). Test delete confirm. Switch view/edit modes. Mobile width (375px) — drawer should be `w-full` and slide full screen.

## Acceptance criteria

- Open drawer: panel slides in 320ms ease-out-expo from full right; backdrop fades 240ms; content sections stagger in.
- Close drawer: panel slides out 240ms ease-in; backdrop fades synchronously.
- Switch view ↔ edit: crossfade 180ms, no instant jump.
- Click Save: check icon + "Saved" text appears 600ms before drawer closes.
- Click Delete: button becomes "Confirm delete?" (red) for 3s; second click within window deletes; otherwise resets.
- All padding / spacing in drawer is consistent (`p-5`, `space-y-5`, `gap-5`).
- Date input focus state shows primary border.
- `npx tsc --noEmit` + `npm run lint` pass.
- Browser verified at desktop (1280px) and mobile (375px).

---

## Report

(To be filled after implementation)
