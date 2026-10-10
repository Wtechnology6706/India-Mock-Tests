import { RowDataPacket } from "mysql2";
import { db } from "./db";
import {
  SiteConfiguration,
  defaultSiteConfig,
  defaultMockTestMenu,
  defaultTutorialMenu,
  defaultTestimonials,
} from "./site-config-defaults";

export * from "./site-config-defaults";

// Global in-memory cache
const globalForConfig = globalThis as unknown as { siteConfig?: SiteConfiguration };
if (!globalForConfig.siteConfig) {
  globalForConfig.siteConfig = defaultSiteConfig;
}

export async function getSiteConfiguration(): Promise<SiteConfiguration> {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS site_configurations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        config_key VARCHAR(100) UNIQUE NOT NULL,
        config_value LONGTEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    const [rows] = await db.query<(RowDataPacket & { config_key: string; config_value: string })[]>(
      "SELECT config_key, config_value FROM site_configurations WHERE config_key = 'main_config' LIMIT 1"
    );

    if (rows[0]?.config_value) {
      const parsed = JSON.parse(rows[0].config_value) as Partial<SiteConfiguration>;
      const merged: SiteConfiguration = {
        ...defaultSiteConfig,
        ...parsed,
        mockTestMenu: parsed.mockTestMenu && parsed.mockTestMenu.length > 0 ? parsed.mockTestMenu : defaultMockTestMenu,
        tutorialMenu: parsed.tutorialMenu && parsed.tutorialMenu.length > 0 ? parsed.tutorialMenu : defaultTutorialMenu,
        testimonials: parsed.testimonials && parsed.testimonials.length > 0 ? parsed.testimonials : defaultTestimonials,
      };
      globalForConfig.siteConfig = merged;
      return merged;
    }
  } catch {
    // Return memory fallback
  }

  return globalForConfig.siteConfig ?? defaultSiteConfig;
}

export async function saveSiteConfiguration(config: Partial<SiteConfiguration>): Promise<SiteConfiguration> {
  const current = await getSiteConfiguration();
  const updated: SiteConfiguration = {
    ...current,
    ...config,
    portalName: config.portalName !== undefined ? config.portalName.trim() : current.portalName,
    portalTagline: config.portalTagline !== undefined ? config.portalTagline.trim() : current.portalTagline,
    contactEmail: config.contactEmail !== undefined ? config.contactEmail.trim() : current.contactEmail,
    supportPhone: config.supportPhone !== undefined ? config.supportPhone.trim() : current.supportPhone,
    adsenseClientId: config.adsenseClientId !== undefined ? config.adsenseClientId.trim() : current.adsenseClientId,
    logoImageUrl: config.logoImageUrl !== undefined ? config.logoImageUrl.trim() : current.logoImageUrl,
    razorpayKeyId: config.razorpayKeyId !== undefined ? config.razorpayKeyId.trim() : current.razorpayKeyId,
    razorpayKeySecret: config.razorpayKeySecret !== undefined ? config.razorpayKeySecret.trim() : current.razorpayKeySecret,
    razorpayWebhookSecret: config.razorpayWebhookSecret !== undefined ? config.razorpayWebhookSecret.trim() : current.razorpayWebhookSecret,
    razorpayEnabled: config.razorpayEnabled !== undefined ? Boolean(config.razorpayEnabled) : (current.razorpayEnabled ?? true),
    razorpayTestMode: config.razorpayTestMode !== undefined ? Boolean(config.razorpayTestMode) : (current.razorpayTestMode ?? true),
    razorpayTestKeyId: config.razorpayTestKeyId !== undefined ? config.razorpayTestKeyId.trim() : current.razorpayTestKeyId,
    razorpayTestKeySecret: config.razorpayTestKeySecret !== undefined ? config.razorpayTestKeySecret.trim() : current.razorpayTestKeySecret,
    razorpayLiveKeyId: config.razorpayLiveKeyId !== undefined ? config.razorpayLiveKeyId.trim() : current.razorpayLiveKeyId,
    razorpayLiveKeySecret: config.razorpayLiveKeySecret !== undefined ? config.razorpayLiveKeySecret.trim() : current.razorpayLiveKeySecret,
    mockTestMenu: config.mockTestMenu && config.mockTestMenu.length > 0 ? config.mockTestMenu : current.mockTestMenu,
    tutorialMenu: config.tutorialMenu && config.tutorialMenu.length > 0 ? config.tutorialMenu : current.tutorialMenu,
    testimonials: config.testimonials && config.testimonials.length > 0 ? config.testimonials : current.testimonials,
    customNavMenu: config.customNavMenu !== undefined ? config.customNavMenu : current.customNavMenu,
  };

  globalForConfig.siteConfig = updated;

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS site_configurations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        config_key VARCHAR(100) UNIQUE NOT NULL,
        config_value LONGTEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await db.execute(
      "INSERT INTO site_configurations (config_key, config_value) VALUES ('main_config', ?) ON DUPLICATE KEY UPDATE config_value = VALUES(config_value)",
      [JSON.stringify(updated)]
    );
  } catch (err) {
    console.error("Failed to persist site configuration to database:", err);
  }

  return updated;
}
