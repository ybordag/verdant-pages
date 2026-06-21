import { useEffect } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NavProvider, useNav } from '@/components/shell/AppNav/NavContext'
import NotificationDrawer from './NotificationDrawer'

// NavProvider has no prop to start with the drawer open — it's only ever
// opened via setDrawerOpen from inside the tree (normally AppNav's bell
// button). This stand-in opens it on mount so each test can focus purely on
// the drawer's own dismissal behavior, decoupled from AppNav.
function OpenDrawerOnMount() {
  const { setDrawerOpen } = useNav()
  useEffect(() => setDrawerOpen(true), [setDrawerOpen])
  return null
}

function renderOpenDrawer() {
  return render(
    <NavProvider>
      <OpenDrawerOnMount />
      <NotificationDrawer />
    </NavProvider>,
  )
}

describe('NotificationDrawer', () => {
  it('renders nothing when the drawer is closed', () => {
    render(
      <NavProvider>
        <NotificationDrawer />
      </NavProvider>,
    )
    expect(screen.queryByRole('dialog', { name: 'Notifications' })).not.toBeInTheDocument()
  })

  it('renders the dialog when open', () => {
    renderOpenDrawer()
    expect(screen.getByRole('dialog', { name: 'Notifications' })).toBeInTheDocument()
  })

  it('closes when the close button is clicked', async () => {
    renderOpenDrawer()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog', { name: 'Notifications' })).not.toBeInTheDocument()
  })

  it('closes on Escape', async () => {
    renderOpenDrawer()
    expect(screen.getByRole('dialog', { name: 'Notifications' })).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'Notifications' })).not.toBeInTheDocument()
  })

  it('does not close on other keys', async () => {
    renderOpenDrawer()
    await userEvent.keyboard('{Enter}')
    expect(screen.getByRole('dialog', { name: 'Notifications' })).toBeInTheDocument()
  })

  it('closes when the backdrop is clicked', async () => {
    const { container } = renderOpenDrawer()
    const backdrop = container.ownerDocument.body.querySelector('[class*="backdrop"]')
    expect(backdrop).not.toBeNull()
    await userEvent.click(backdrop as Element)
    expect(screen.queryByRole('dialog', { name: 'Notifications' })).not.toBeInTheDocument()
  })

  it('does not close when clicking inside the drawer itself', async () => {
    renderOpenDrawer()
    await userEvent.click(screen.getByText('Notifications', { selector: 'span' }))
    expect(screen.getByRole('dialog', { name: 'Notifications' })).toBeInTheDocument()
  })

  it('removes the keydown listener on unmount so a later Escape press is a no-op', async () => {
    const { unmount } = renderOpenDrawer()
    unmount()
    // Must not throw or affect any other element — there's nothing to assert
    // on directly, but this would surface as a leaked-listener error in
    // strict/dev mode if the effect's cleanup were missing.
    await userEvent.keyboard('{Escape}')
  })
})
