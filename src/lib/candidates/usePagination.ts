import { useEffect, useState } from "react"

export function usePagination(totalItems: number, pageSize = 15) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const canGoPrev = currentPage > 1
  const canGoNext = currentPage < totalPages

  useEffect(() => {
    setCurrentPage(1)
  }, [totalItems])

  function goNext() {
    if (canGoNext) setCurrentPage(p => p + 1)
  }

  function goPrev() {
    if (canGoPrev) setCurrentPage(p => p - 1)
  }

  return { currentPage, totalPages, startIndex, endIndex, canGoPrev, canGoNext, goNext, goPrev }
}
