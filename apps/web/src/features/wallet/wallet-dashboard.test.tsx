import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { WalletDashboard } from './wallet-dashboard'

describe('WalletDashboard', () => {
  it('renders the Coin Islands wallet screen', () => {
    const html = renderToString(
      <MemoryRouter>
        <WalletDashboard />
      </MemoryRouter>,
    )

    expect(html).toContain('收款码头')
    expect(html).toContain('转账船坞')
    expect(html).toContain('海岛')
    expect(html).toContain('主岛城邦')
    expect(html).toContain('东港村岛')
  })
})
