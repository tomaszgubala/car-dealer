import { test, expect } from '@playwright/test'

test.describe('Listing page', () => {
  test('loads and shows vehicles', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/AutoDealer|Samochody/)
    // Should show used by default
    await expect(page.locator('[role="tab"][aria-selected="true"]')).toContainText('Używane')
    // Should render at least one car card
    await expect(page.locator('a[href*="/uzywane/"]').first()).toBeVisible({ timeout: 10000 })
  })

  test('can switch to NEW', async ({ page }) => {
    await page.goto('/')
    await page.click('[role="tab"]:has-text("Nowe")')
    await expect(page).toHaveURL(/type=NEW/)
  })

  test('has SEO meta tags', async ({ page }) => {
    await page.goto('/')
    const title = await page.title()
    expect(title.length).toBeGreaterThan(10)
    const desc = await page.getAttribute('meta[name="description"]', 'content')
    expect(desc).toBeTruthy()
  })
})

test.describe('Vehicle detail page', () => {
  test('loads a vehicle page', async ({ page }) => {
    // Navigate to listing first
    await page.goto('/')
    const firstCard = page.locator('a[href*="/uzywane/"], a[href*="/nowe/"]').first()
    const href = await firstCard.getAttribute('href')
    if (!href) return

    await page.goto(href)
    await expect(page.locator('h1')).toBeVisible()
    // Should have price
    await expect(page.locator('text=PLN').first()).toBeVisible()
  })

  test('has JSON-LD structured data', async ({ page }) => {
    await page.goto('/')
    const firstCard = page.locator('a[href*="/uzywane/"], a[href*="/nowe/"]').first()
    const href = await firstCard.getAttribute('href')
    if (!href) return

    await page.goto(href)
    const jsonld = page.locator('script[type="application/ld+json"]')
    await expect(jsonld).toBeAttached()
    const content = await jsonld.textContent()
    const data = JSON.parse(content || '{}')
    expect(data['@type']).toBe('Car')
  })
})

test.describe('Admin', () => {
  test('redirects unauthenticated to login', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test('login page renders', async ({ page }) => {
    await page.goto('/admin/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })
})
