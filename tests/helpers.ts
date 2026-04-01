/**
 * Helpers partagés entre tous les spec files Playwright.
 *
 * On utilise TOUJOURS le compte créé par global-setup.ts
 * (email confirmé via service role key, sans confirmation email).
 */
import { Page } from '@playwright/test'
import {
  TEST_MERCHANT_EMAIL,
  TEST_MERCHANT_PASSWORD,
} from './global-setup'

export { TEST_MERCHANT_EMAIL, TEST_MERCHANT_PASSWORD }

/**
 * Se connecte avec le compte de test pré-créé par global-setup.
 * Ne jamais essayer de créer un compte via l'UI (Supabase exige la confirmation email).
 */
export async function login(page: Page) {
  await page.goto('/login')
  await page.fill('input[type="email"]', TEST_MERCHANT_EMAIL)
  await page.fill('input[type="password"]', TEST_MERCHANT_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(dashboard|onboarding|cards)/, { timeout: 20000 })
}

/**
 * Crée une carte via /cards/new et retourne son ID.
 */
export async function createCard(
  page: Page,
  name: string,
  type: 'stamps' | 'points' = 'stamps'
): Promise<string> {
  await page.goto('/cards/new')
  await page.fill('input[placeholder*="Carte"]', name)
  if (type === 'points') await page.click('button:has-text("Points")')
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/cards\/[^/?]+$/, { timeout: 15000 })
  return page.url().split('/cards/')[1]
}
