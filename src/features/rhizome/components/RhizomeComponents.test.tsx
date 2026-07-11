import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import ContextInlineInput from './ContextInlineInput'
import ConversationTimeline from './ConversationTimeline'
import RhizomeComposer from './RhizomeComposer'
import SessionContextStrip from './SessionContextStrip'
import WorkbenchHeader from './WorkbenchHeader'

describe('Rhizome feature components', () => {
  it('exposes thread and review actions from the workbench header', async () => {
    const user = userEvent.setup()
    const openThreads = vi.fn()
    const openReviews = vi.fn()
    render(
      <WorkbenchHeader
        activeThread={{
          thread_id: 'thread-1',
          title: 'Tomato plan',
          message_count: 1,
          pinned_context: [],
          created_at: '2026-07-10T12:00:00Z',
        }}
        collapsed={false}
        isNewThread={false}
        pendingReviewCount={2}
        onOpenReviews={openReviews}
        onOpenThreads={openThreads}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Tomato plan' }))
    await user.click(screen.getByRole('button', { name: 'Open pending reviews' }))
    expect(openThreads).toHaveBeenCalledOnce()
    expect(openReviews).toHaveBeenCalledOnce()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('renders timeline empty, error, markdown, and streaming states', async () => {
    const retry = vi.fn()
    const { rerender } = render(
      <ConversationTimeline
        isError={false}
        isLoading={false}
        isStreaming={false}
        messages={[]}
        streamingText=""
        onRetry={retry}
      />,
    )
    expect(screen.getByText('No messages in this thread yet.')).toBeInTheDocument()

    rerender(
      <ConversationTimeline
        isError
        isLoading={false}
        isStreaming={false}
        messages={[]}
        streamingText=""
        onRetry={retry}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(retry).toHaveBeenCalledOnce()

    rerender(
      <ConversationTimeline
        isError={false}
        isLoading={false}
        isStreaming
        messages={[{ role: 'assistant', type: 'ai', content: '**Ready**' }]}
        streamingText="Working"
        onRetry={retry}
      />,
    )
    expect(screen.getByText('Ready').tagName).toBe('STRONG')
    expect(screen.getByText('Working')).toBeInTheDocument()
  })

  it('keeps context chip removal separate from result selection', async () => {
    const user = userEvent.setup()
    const remove = vi.fn()
    const select = vi.fn()
    render(
      <ContextInlineInput
        contexts={[{ subject_type: 'plant', subject_id: 'plant-1', label: 'Tomato' }]}
        disabled={false}
        groups={[
          ['task', [{ subject_type: 'task', subject_id: 'task-1', label: 'Water tomato' }]],
        ]}
        isActive
        isError={false}
        isLoading={false}
        isTooShort={false}
        label="Message context"
        searchTerm="water"
        showAutocomplete
        onActivate={vi.fn()}
        onClose={vi.fn()}
        onDismiss={vi.fn()}
        onRemove={remove}
        onSearchTermChange={vi.fn()}
        onSelect={select}
      />,
    )

    await user.click(screen.getByText('Tomato'))
    expect(remove).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Remove Tomato context' }))
    expect(remove).toHaveBeenCalledOnce()
    await user.click(screen.getByRole('button', { name: /Water tomato/i }))
    expect(select).toHaveBeenCalledWith(
      expect.objectContaining({ subject_type: 'task', subject_id: 'task-1' }),
    )
  })

  it('submits the composer on Enter but not Shift+Enter', () => {
    const submit = vi.fn()
    render(
      <RhizomeComposer
        autocompleteGroups={[]}
        autocompleteIsError={false}
        autocompleteIsLoading={false}
        canPin
        canSend
        draft="Question"
        isStreaming={false}
        messageContextOpen={false}
        modelOptions={[]}
        modelValue=""
        pinnedContextOpen={false}
        showAutocomplete={false}
        onDismissAutocomplete={vi.fn()}
        onDraftChange={vi.fn()}
        onSelectionChange={vi.fn()}
        onSelectAutocomplete={vi.fn()}
        onSubmit={submit}
        onToggleMessageContext={vi.fn()}
        onTogglePinnedContext={vi.fn()}
      />,
    )
    const textarea = screen.getByLabelText('Message Rhizome')
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true })
    expect(submit).not.toHaveBeenCalled()
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false })
    expect(submit).toHaveBeenCalledOnce()
  })

  it('keeps session display and edit actions explicit', async () => {
    const user = userEvent.setup()
    const edit = vi.fn()
    render(
      <SessionContextStrip
        context={undefined}
        draft={{ time_text: '', energy_text: '' }}
        energyDisplay="low"
        error={null}
        focusDisplay="Tomatoes"
        focusPicker={null}
        hasOptimisticContext={false}
        isEditing={false}
        isError={false}
        isLoading={false}
        isSaving={false}
        timeDisplay="20 minutes"
        onCancel={vi.fn()}
        onDraftChange={vi.fn()}
        onEdit={edit}
        onSave={vi.fn()}
      />,
    )
    await user.click(screen.getByLabelText('Edit focus'))
    expect(edit).toHaveBeenCalledOnce()
    expect(screen.getByText('Tomatoes')).toBeInTheDocument()
  })
})
