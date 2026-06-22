import type { ReactNode } from 'react'
import s from './MarkdownMessage.module.css'

type MarkdownBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'ul' | 'ol'; items: string[] }

type Props = {
  content: string
}

const unorderedItemPattern = /^\s*[-*+]\s+(.+)$/
const orderedItemPattern = /^\s*\d+[.)]\s+(.+)$/

function isSafeHref(value: string): boolean {
  try {
    const url = new URL(value)
    return ['http:', 'https:', 'mailto:'].includes(url.protocol)
  } catch {
    return value.startsWith('/')
  }
}

function parseBlocks(content: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = []
  const lines = content.replace(/\r\n/g, '\n').split('\n')
  let paragraph: string[] = []
  let list: { type: 'ul' | 'ol'; items: string[] } | null = null

  function flushParagraph() {
    if (paragraph.length === 0) return
    blocks.push({ type: 'paragraph', text: paragraph.join('\n') })
    paragraph = []
  }

  function flushList() {
    if (!list) return
    blocks.push(list)
    list = null
  }

  for (const line of lines) {
    const unordered = line.match(unorderedItemPattern)
    const ordered = line.match(orderedItemPattern)

    if (unordered || ordered) {
      flushParagraph()
      const type = unordered ? 'ul' : 'ol'
      const item = (unordered ?? ordered)?.[1] ?? ''
      if (!list || list.type !== type) {
        flushList()
        list = { type, items: [] }
      }
      list.items.push(item)
      continue
    }

    if (line.trim() === '') {
      flushParagraph()
      flushList()
      continue
    }

    flushList()
    paragraph.push(line)
  }

  flushParagraph()
  flushList()
  return blocks
}

function parseInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let index = 0

  function pushText(value: string) {
    if (!value) return
    nodes.push(value)
  }

  while (index < text.length) {
    if (text[index] === '\n') {
      nodes.push(<br key={`${keyPrefix}-br-${index}`} />)
      index += 1
      continue
    }

    if (text[index] === '`') {
      const end = text.indexOf('`', index + 1)
      if (end > index + 1) {
        nodes.push(<code key={`${keyPrefix}-code-${index}`}>{text.slice(index + 1, end)}</code>)
        index = end + 1
        continue
      }
    }

    if (text.startsWith('**', index)) {
      const end = text.indexOf('**', index + 2)
      if (end > index + 2) {
        nodes.push(
          <strong key={`${keyPrefix}-strong-${index}`}>
            {parseInline(text.slice(index + 2, end), `${keyPrefix}-strong-${index}`)}
          </strong>,
        )
        index = end + 2
        continue
      }
    }

    if (text[index] === '*') {
      const end = text.indexOf('*', index + 1)
      if (end > index + 1) {
        nodes.push(
          <em key={`${keyPrefix}-em-${index}`}>
            {parseInline(text.slice(index + 1, end), `${keyPrefix}-em-${index}`)}
          </em>,
        )
        index = end + 1
        continue
      }
    }

    if (text[index] === '[') {
      const labelEnd = text.indexOf(']', index + 1)
      const hrefStart = labelEnd >= 0 ? text.indexOf('(', labelEnd) : -1
      const hrefEnd = hrefStart >= 0 ? text.indexOf(')', hrefStart) : -1
      if (labelEnd > index + 1 && hrefStart === labelEnd + 1 && hrefEnd > hrefStart + 1) {
        const label = text.slice(index + 1, labelEnd)
        const href = text.slice(hrefStart + 1, hrefEnd)
        if (isSafeHref(href)) {
          nodes.push(
            <a key={`${keyPrefix}-link-${index}`} href={href} rel="noreferrer" target="_blank">
              {parseInline(label, `${keyPrefix}-link-${index}`)}
            </a>,
          )
          index = hrefEnd + 1
          continue
        }
      }
    }

    const nextSpecial = ['\n', '`', '*', '[']
      .map((char) => text.indexOf(char, index + 1))
      .filter((position) => position !== -1)
      .sort((a, b) => a - b)[0]

    const nextIndex = nextSpecial ?? text.length
    pushText(text.slice(index, nextIndex))
    index = nextIndex
  }

  return nodes
}

export default function MarkdownMessage({ content }: Props) {
  const blocks = parseBlocks(content)

  return (
    <div className={s.root}>
      {blocks.map((block, index) => {
        if (block.type === 'paragraph') {
          return <p key={index}>{parseInline(block.text, `p-${index}`)}</p>
        }

        const ListTag = block.type
        return (
          <ListTag key={index}>
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>{parseInline(item, `${block.type}-${index}-${itemIndex}`)}</li>
            ))}
          </ListTag>
        )
      })}
    </div>
  )
}
