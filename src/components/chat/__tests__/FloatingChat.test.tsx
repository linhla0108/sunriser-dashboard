import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { formatLine } from '../FloatingChat'

describe('formatLine', () => {
  it('returns plain text as a string node', () => {
    const result = formatLine('hello world')
    expect(result).toHaveLength(1)
    expect(result[0]).toBe('hello world')
  })

  it('wraps single bold marker in <strong>', () => {
    const result = formatLine('say **hello** now')
    expect(result).toHaveLength(3)
    const { container } = render(<>{result}</>)
    expect(container.querySelector('strong')?.textContent).toBe('hello')
  })

  it('wraps multiple bold spans each in their own <strong>', () => {
    const result = formatLine('**a** and **b**')
    const { container } = render(<>{result}</>)
    const strongs = container.querySelectorAll('strong')
    expect(strongs).toHaveLength(2)
    expect(strongs[0].textContent).toBe('a')
    expect(strongs[1].textContent).toBe('b')
  })

  it('renders XSS payload as literal text inside <strong>', () => {
    const result = formatLine('**<img onerror=alert(1)>**')
    const { container } = render(<>{result}</>)
    const strong = container.querySelector('strong')
    expect(strong?.textContent).toBe('<img onerror=alert(1)>')
    expect(container.querySelector('img')).toBeNull()
  })

  it('returns unclosed marker as literal string without crashing', () => {
    const result = formatLine('**foo')
    expect(result).toHaveLength(1)
    expect(result[0]).toBe('**foo')
  })
})
