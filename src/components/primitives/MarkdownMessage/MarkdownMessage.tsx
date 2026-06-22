import type { ReactNode } from 'react'
import s from './MarkdownMessage.module.css'

type MarkdownBlock =
  | { type: 'paragraph'; text: string }
  | MarkdownListBlock

type MarkdownListBlock = {
  type: 'ul' | 'ol'
  items: MarkdownListItem[]
}

type MarkdownListItem = {
  text: string
  children: MarkdownListBlock[]
}

type Props = {
  content: string
}

const listItemPattern = /^(\s*)((?:\d+[.)])|[-*+])\s+(.+)$/

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
  let listStack: Array<{ indent: number; block: MarkdownListBlock }> = []

  function flushParagraph() {
    if (paragraph.length === 0) return
    blocks.push({ type: 'paragraph', text: paragraph.join('\n') })
    paragraph = []
  }

  function flushList() {
    listStack = []
  }

  function lastItem(block: MarkdownListBlock): MarkdownListItem | undefined {
    return block.items[block.items.length - 1]
  }

  function appendItem(block: MarkdownListBlock, text: string) {
    block.items.push({ text, children: [] })
  }

  function startRootList(type: 'ul' | 'ol', indent: number, text: string) {
    const block: MarkdownListBlock = { type, items: [] }
    blocks.push(block)
    appendItem(block, text)
    listStack = [{ indent, block }]
  }

  function startNestedList(parent: MarkdownListBlock, type: 'ul' | 'ol', indent: number, text: string) {
    const parentItem = lastItem(parent)
    if (!parentItem) return
    const block: MarkdownListBlock = { type, items: [] }
    parentItem.children.push(block)
    appendItem(block, text)
    listStack.push({ indent, block })
  }

  function appendListItem(type: 'ul' | 'ol', indent: number, text: string) {
    flushParagraph()

    if (listStack.length === 0) {
      startRootList(type, indent, text)
      return
    }

    while (listStack.length > 0 && listStack[listStack.length - 1].indent > indent) {
      listStack.pop()
    }

    const current = listStack[listStack.length - 1]
    if (!current) {
      startRootList(type, indent, text)
      return
    }

    if (indent > current.indent) {
      startNestedList(current.block, type, indent, text)
      return
    }

    if (current.indent === indent && current.block.type === type) {
      appendItem(current.block, text)
      return
    }

    const currentItem = lastItem(current.block)
    if (current.indent === indent && currentItem?.text.trim().endsWith(':')) {
      startNestedList(current.block, type, indent, text)
      return
    }

    while (
      listStack.length > 0 &&
      !(
        listStack[listStack.length - 1].indent === indent &&
        listStack[listStack.length - 1].block.type === type
      )
    ) {
      listStack.pop()
    }

    const matchingList = listStack[listStack.length - 1]
    if (matchingList) {
      appendItem(matchingList.block, text)
      return
    }

    startRootList(type, indent, text)
  }

  for (const line of lines) {
    const listItem = line.match(listItemPattern)

    if (listItem) {
      const [, rawIndent, marker, item] = listItem
      appendListItem(marker.match(/\d/) ? 'ol' : 'ul', rawIndent.length, item)
      continue
    }

    if (line.trim() === '') {
      flushParagraph()
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

  function renderList(block: MarkdownListBlock, keyPrefix: string) {
    const ListTag = block.type
    return (
      <ListTag key={keyPrefix}>
        {block.items.map((item, itemIndex) => (
          <li key={`${keyPrefix}-${itemIndex}`}>
            {parseInline(item.text, `${keyPrefix}-${itemIndex}`)}
            {item.children.map((child, childIndex) =>
              renderList(child, `${keyPrefix}-${itemIndex}-${childIndex}`),
            )}
          </li>
        ))}
      </ListTag>
    )
  }

  return (
    <div className={s.root}>
      {blocks.map((block, index) => {
        if (block.type === 'paragraph') {
          return <p key={index}>{parseInline(block.text, `p-${index}`)}</p>
        }

        return renderList(block, `${block.type}-${index}`)
      })}
    </div>
  )
}
