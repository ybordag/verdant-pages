import type { ComposerAutocompletePosition } from '../types'

export function measureTextareaIndex(
  textarea: HTMLTextAreaElement,
  index: number,
): ComposerAutocompletePosition {
  const style = window.getComputedStyle(textarea)
  const mirror = document.createElement('div')
  const marker = document.createElement('span')
  const properties = [
    'borderBottomWidth',
    'borderLeftWidth',
    'borderRightWidth',
    'borderTopWidth',
    'boxSizing',
    'fontFamily',
    'fontSize',
    'fontStyle',
    'fontWeight',
    'letterSpacing',
    'lineHeight',
    'paddingBottom',
    'paddingLeft',
    'paddingRight',
    'paddingTop',
    'textIndent',
    'textTransform',
    'width',
  ] as const

  mirror.style.position = 'absolute'
  mirror.style.visibility = 'hidden'
  mirror.style.whiteSpace = 'pre-wrap'
  mirror.style.overflowWrap = 'break-word'
  mirror.style.top = '0'
  mirror.style.left = '-9999px'
  for (const property of properties) mirror.style[property] = style[property]

  marker.textContent = '\u200b'
  mirror.textContent = textarea.value.slice(0, index) || '\u200b'
  mirror.append(marker)
  document.body.append(mirror)

  const mirrorRect = mirror.getBoundingClientRect()
  const markerRect = marker.getBoundingClientRect()
  const position = {
    left: markerRect.left - mirrorRect.left + textarea.offsetLeft - textarea.scrollLeft,
    top: markerRect.top - mirrorRect.top + textarea.offsetTop - textarea.scrollTop,
  }

  mirror.remove()
  return position
}
