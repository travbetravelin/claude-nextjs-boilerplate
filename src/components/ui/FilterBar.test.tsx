import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import FilterBar from './FilterBar'

describe('FilterBar', () => {
  it('renders children inside the .filter-bar wrapper', () => {
    render(
      <FilterBar>
        <select aria-label="Status" />
      </FilterBar>
    )
    const select = screen.getByLabelText('Status')
    expect(select.parentElement).toHaveClass('filter-bar')
  })
})
