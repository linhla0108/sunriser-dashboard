import { useState } from "react"

interface PaginationOptions {
  page?: number
  onPageChange?: (page: number) => void
}

export function usePagination(totalItems: number, pageSize = 15, options: PaginationOptions = {}) {
  const [state, setState] = useState({ currentPage: 1, pageSize, totalItems })
  const totalPages = Math.ceil(totalItems / pageSize)
  const maxPage = Math.max(1, totalPages)
  const internalPage = state.totalItems === totalItems && state.pageSize === pageSize ? state.currentPage : 1
  const requestedPage = options.page ?? internalPage
  const currentPage = Math.min(Math.max(1, requestedPage), maxPage)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const canGoPrev = currentPage > 1
  const canGoNext = currentPage < totalPages

  function setPage(page: number) {
    if (options.onPageChange) options.onPageChange(page)
    else setState({ currentPage: page, pageSize, totalItems })
  }

  function goNext() {
    if (canGoNext) setPage(currentPage + 1)
  }

  function goPrev() {
    if (canGoPrev) setPage(currentPage - 1)
  }

  return { currentPage, totalPages, startIndex, endIndex, canGoPrev, canGoNext, goNext, goPrev }
}
