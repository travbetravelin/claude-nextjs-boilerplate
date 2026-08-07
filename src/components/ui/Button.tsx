'use client'

import { useLayoutEffect, useRef, useState } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'link'

interface Props extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: Variant
  size?: 'md' | 'sm'
  // The label shown while working. Blocks the click, and never shrinks the
  // button below its resting width, so a row can widen but never jump
  // backwards mid-save.
  busy?: string | false
  type?: 'button' | 'submit'
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
  link: 'btn-cta-link',
}

export default function Button({
  variant = 'secondary',
  size = 'md',
  busy = false,
  type = 'button',
  disabled,
  className,
  children,
  style,
  ...rest
}: Props) {
  const ref = useRef<HTMLButtonElement>(null)
  const [restWidth, setRestWidth] = useState<number>()

  useLayoutEffect(() => {
    if (!busy && ref.current) setRestWidth(ref.current.offsetWidth)
  }, [busy, children])

  const classes = ['btn', VARIANT_CLASS[variant], size === 'sm' ? 'btn-sm' : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || !!busy}
      data-busy={busy ? 'true' : undefined}
      style={busy && restWidth ? { ...style, minWidth: restWidth } : style}
      {...rest}
    >
      {busy || children}
    </button>
  )
}
