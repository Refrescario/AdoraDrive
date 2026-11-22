import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { verifyLicense, type DeviceIdentity, type LicensePayload, type VerificationKey } from '@/lib/licenses';
import { getDeviceIdentity, cachedVerificationKeys, readLicenseValue, writeLicenseValue } from '@/lib/license-storage';

const BUNDLED_VERIFICATION_KEY: VerificationKey = {
  id: 'bb07e1f8-524b-4ba9-81cc-2b6cbb16b6c1',
  jwk: {
    kty: 'EC', crv: 'P-256',
    x: 'cVfwmJD6rEQecJ29Uce6lzUBST9WfX6TN8m5WkfecFE',
    y: 'Ir43zadv_OdzQAIk1IhoRsUWt4PeTDFqI2XHCdmJ24o',
    key_ops: ['verify'], ext: true,
  } as JsonWebKey,
};

export function useDeviceLicense() {
  const [device, setDevice] = useState<DeviceIdentity | null>(null);
  const [license, setLicense] = useState<LicensePayload | null>(null);
  const [keys, setKeys] = useState<VerificationKey[]>([]);
  const [ready, setReady] = useState(false);
  const [needsOnlineSetup, setNeedsOnlineSetup] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    let alive = true;
    const initialize = async () => {
      try {
        const identity = await getDeviceIdentity();
        let verificationKeys = await cachedVerificationKeys();
        if (navigator.onLine) {
          try {
            const { data, error } = await supabase.from('license_verification_keys').select('id, public_jwk');
            if (!error && data?.length) {
              verificationKeys = data.map(row => ({ id: row.id, jwk: row.public_jwk as JsonWebKey }));
              await writeLicenseValue('verification-keys', verificationKeys);
            }
          } catch { /* offline ok */ }
        }
        if (!verificationKeys.some(k => k.id === BUNDLED_VERIFICATION_KEY.id)) {
          verificationKeys = [BUNDLED_VERIFICATION_KEY, ...verificationKeys];
        }
        const saved = await readLicenseValue<string>('activation-code');
        const simpleActivation = await readLicenseValue<{ activatedAt: string; code: string }>('activation-status');
        let verified: LicensePayload | null = null;
        if (simpleActivation) {
          verified = { activated: true, activatedAt: simpleActivation.activatedAt } as unknown as LicensePayload;
        } else if (saved) {
          try { verified = await verifyLicense(saved, identity.id, verificationKeys); }
          catch (error) { if (alive) setMessage(error instanceof Error ? error.message : 'A licenca salva nao e valida.'); }
        }
        if (alive) {
          setDevice(identity);
          setKeys(verificationKeys);
          setLicense(verified);
          setNeedsOnlineSetup(verificationKeys.length === 0);
        }
      } catch (error) {
        if (alive) setMessage(error instanceof Error ? error.message : 'Nao foi possivel preparar a instalacao.');
      } finally { if (alive) setReady(true); }
    };
    void initialize();
    return () => { alive = false; };
  }, []);
  const activate = async (code: string) => {
    if (!device) throw new Error('A identificacao da instalacao nao esta disponivel.');
    const verified = await verifyLicense(code, device.id, keys);
    await writeLicenseValue('activation-code', code.trim());
    setLicense(verified);
    setNeedsOnlineSetup(false);
    setMessage('Licenca validada e salva nesta instalacao.');
  };
  return { deviceId: device?.id ?? '', license, ready, needsOnlineSetup, message, setMessage, activate };
}