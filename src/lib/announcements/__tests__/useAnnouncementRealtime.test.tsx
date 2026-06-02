import { renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { useAnnouncementRealtime } from "../useAnnouncementRealtime"

describe("useAnnouncementRealtime", () => {
  it("subscribes and cleans up the realtime channel", () => {
    const unsubscribe = vi.fn()
    const removeChannel = vi.fn()
    const on = vi.fn().mockReturnValue({
      subscribe: () => ({ unsubscribe }),
    })
    const channel = vi.fn().mockReturnValue({ on })

    const client = {
      channel,
      removeChannel,
    }

    const { unmount } = renderHook(() =>
      useAnnouncementRealtime({
        enabled: true,
        onInsert: vi.fn(),
        client,
      })
    )

    expect(channel).toHaveBeenCalledWith("announcements-insert")
    expect(on).toHaveBeenCalled()

    unmount()

    expect(unsubscribe).toHaveBeenCalled()
    expect(removeChannel).toHaveBeenCalled()
  })
})
