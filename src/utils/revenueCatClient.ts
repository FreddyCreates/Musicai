import { Purchases, CustomerInfo } from '@revenuecat/purchases-js';
import { getOrCreateAppUserId } from './billingStorage';

let isConfigured = false;
let configuredPublicKey: string | null = null;
let currentAppUserId: string = getOrCreateAppUserId();

export interface RevenueCatOfferingsInfo {
  currentOfferingId?: string;
  packages: Array<{
    identifier: string;
    packageType: string;
    product: {
      identifier: string;
      title: string;
      description: string;
      priceString: string;
      price: number;
      currencyCode: string;
    };
  }>;
}

/**
 * Initializes the RevenueCat Purchases Web SDK
 */
export async function initializeRevenueCat(customPublicKey?: string, customAppUserId?: string): Promise<boolean> {
  const publicKey = customPublicKey || (import.meta as any).env?.VITE_REVENUECAT_PUBLIC_KEY;
  const appUserId = customAppUserId || currentAppUserId;

  if (!publicKey) {
    console.info('[RevenueCat] No public API key (VITE_REVENUECAT_PUBLIC_KEY) found. Running in resilient simulation mode.');
    return false;
  }

  if (isConfigured && configuredPublicKey === publicKey && currentAppUserId === appUserId) {
    return true;
  }

  try {
    Purchases.configure(publicKey, appUserId);
    isConfigured = true;
    configuredPublicKey = publicKey;
    currentAppUserId = appUserId;
    console.log('[RevenueCat] Web SDK successfully configured for app_user_id:', appUserId);
    return true;
  } catch (err) {
    console.warn('[RevenueCat] Failed to configure Purchases Web SDK:', err);
    return false;
  }
}

/**
 * Fetches Customer Info and active entitlements from RevenueCat
 */
export async function getRevenueCatCustomerInfo(): Promise<CustomerInfo | null> {
  if (!isConfigured) {
    const initialized = await initializeRevenueCat();
    if (!initialized) return null;
  }

  try {
    const customerInfo = await Purchases.getSharedInstance().getCustomerInfo();
    return customerInfo;
  } catch (err) {
    console.warn('[RevenueCat] Could not fetch customer info:', err);
    return null;
  }
}

/**
 * Checks if a specific entitlement (e.g. 'pro_master_license', 'label_unlimited') is active
 */
export async function checkEntitlementActive(entitlementId: string): Promise<boolean> {
  try {
    const info = await getRevenueCatCustomerInfo();
    if (!info) return false;
    return Boolean(info.entitlements.active[entitlementId]);
  } catch (err) {
    return false;
  }
}

/**
 * Initiates purchase of a RevenueCat package
 */
export async function purchaseRevenueCatPackage(packageIdentifier: string): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> {
  try {
    if (!isConfigured) {
      await initializeRevenueCat();
    }

    if (!isConfigured) {
      return { success: false, error: 'RevenueCat Web SDK no está configurado con una clave pública válida.' };
    }

    const offerings = await Purchases.getSharedInstance().getOfferings();
    const currentOffering = offerings.current;
    if (!currentOffering) {
      return { success: false, error: 'No se encontraron ofertas activas en RevenueCat.' };
    }

    const availablePackages: any[] = (currentOffering as any).availablePackages || (currentOffering as any).packages || [];
    const targetPackage = availablePackages.find((p: any) => p.identifier === packageIdentifier || p.product?.identifier === packageIdentifier);
    if (!targetPackage) {
      return { success: false, error: `El paquete '${packageIdentifier}' no se encontró en la oferta actual de RevenueCat.` };
    }

    const { customerInfo } = await Purchases.getSharedInstance().purchase({
      rcPackage: targetPackage
    });

    return {
      success: true,
      customerInfo
    };
  } catch (err: any) {
    console.error('[RevenueCat Purchase Error]:', err);
    return {
      success: false,
      error: err?.message || 'Error durante la compra en RevenueCat'
    };
  }
}
