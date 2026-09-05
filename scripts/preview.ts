import { chromium } from 'playwright'
import { createServer } from 'vite'

const previewPath = 'disk/boot/preview.png'

const shareCard = { width: 1200, height: 630 }

const shownAt = new Date('2026-09-06T09:11:00Z')

const bootedLine = 'type  help  or press tab'

const server = await createServer({ logLevel: 'silent' })
await server.listen()

const [address] = server.resolvedUrls?.local ?? []
if (address === undefined) throw new Error('preview: the dev server published no address')

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: shareCard, deviceScaleFactor: 1 })

await page.clock.setFixedTime(shownAt)
await page.emulateMedia({ reducedMotion: 'reduce' })
await page.goto(address)
await page.getByText(bootedLine).waitFor({ timeout: 15_000 })
await page.getByLabel('command').focus()
await page.screenshot({ path: previewPath })

await browser.close()
await server.close()

console.log(`preview: ${previewPath} at ${shareCard.width}×${shareCard.height}`)
