const puppeteer = require('puppeteer');

class TinderSwiper {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  // Random delay for human-like behavior
  async humanDelay(min = 2000, max = 5000) {
    const delay = Math.floor(Math.random() * (max - min + 1) + min);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Initialize browser
  async init(profilePath) {
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        `--user-data-dir=${profilePath}`
      ]
    });
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1280, height: 800 });
  }

  // Navigate to Tinder
  async goToTinder() {
    await this.page.goto('https://tinder.com/app/recs', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    await this.humanDelay(3000, 5000);
  }

  // Swipe right (like)
  async swipeRight() {
    try {
      // Try different selectors (Tinder changes these)
      const selectors = [
        '[data-testid="gamepad-like"]',
        '.recsCardboard__cardsContainer button:nth-child(4)',
        'button[aria-label="Like"]'
      ];
      
      for (const selector of selectors) {
        const button = await this.page.$(selector);
        if (button) {
          await button.click();
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Swipe right failed:', error.message);
      return false;
    }
  }

  // Swipe left (pass)
  async swipeLeft() {
    try {
      const selectors = [
        '[data-testid="gamepad-nope"]',
        '.recsCardboard__cardsContainer button:nth-child(1)',
        'button[aria-label="Nope"]'
      ];
      
      for (const selector of selectors) {
        const button = await this.page.$(selector);
        if (button) {
          await button.click();
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Swipe left failed:', error.message);
      return false;
    }
  }

  // Main swipe session
  async swipeSession(count, rightRatio = 0.7) {
    const results = {
      total: 0,
      right: 0,
      left: 0,
      matches: 0,
      errors: 0
    };

    for (let i = 0; i < count; i++) {
      // Decide swipe direction
      const goRight = Math.random() < rightRatio;
      
      let success;
      if (goRight) {
        success = await this.swipeRight();
        if (success) results.right++;
      } else {
        success = await this.swipeLeft();
        if (success) results.left++;
      }

      if (success) {
        results.total++;
      } else {
        results.errors++;
      }

      // Human-like delay between swipes
      await this.humanDelay(2000, 6000);

      // Longer pause every 10-15 swipes
      if (i > 0 && i % (10 + Math.floor(Math.random() * 5)) === 0) {
        console.log(`Taking a break after ${i} swipes...`);
        await this.humanDelay(15000, 30000);
      }

      // Check for match popup
      const matchPopup = await this.page.$('[data-testid="modal"]');
      if (matchPopup) {
        results.matches++;
        // Close match popup
        await this.page.keyboard.press('Escape');
        await this.humanDelay(1000, 2000);
      }
    }

    return results;
  }

  // Close browser
  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = TinderSwiper;
