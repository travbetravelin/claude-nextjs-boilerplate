import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Field from './Field'

describe('Field', () => {
  it('associates the label with the control', () => {
    render(
      <Field label="Name" htmlFor="name">
        <input id="name" />
      </Field>
    )
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
  })

  it('renders the (optional) hint when optional', () => {
    render(
      <Field label="Notes" optional>
        <textarea />
      </Field>
    )
    expect(screen.getByText('(optional)')).toBeInTheDocument()
  })

  it('renders warning and notice lines', () => {
    render(
      <Field label="Date" warning="This date is locked" notice="Nearly out of range">
        <input />
      </Field>
    )
    expect(screen.getByText('This date is locked')).toBeInTheDocument()
    expect(screen.getByText('Nearly out of range')).toBeInTheDocument()
  })
})
