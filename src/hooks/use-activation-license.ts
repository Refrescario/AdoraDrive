import { useEffect, useState } from 'react';
import { readLicenseValue, writeLicenseValue } from '@/lib/license-storage';

type RedeemFn = (args: { data: { code: string; deviceId: string } }) => Promise<{ activated: boolean }>;

export type ActivationState = {
  activated: boolean;
  activatedAt: string | null;
  deviceId: string;
  ready: boolean;
  message: string;
  setMessage: (msg: string) => void;
  activate: (code: string, redeemFn: RedeemFn) => Promise<void>;
};

export function useActivationLicense(): ActivationState {
  const [activated, setActivated] = useState(false);
  const [activatedAt, setActivatedAt] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState('');
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let alive = true;
    const initialize = async () => {
      try {
        let id = await readLicenseValue<string>('simple-device-id');
        if (!id) {
          const bytes = crypto.getRandomValues(new Uint8Array(16));
          id = 'DEV-' + Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
          await writeLicenseValue('simple-device-id', id);
        }
        const savedActivation = await readLicenseValue<{ activatedAt: string }>('activation-status');
        if (alive) {
          setDeviceId(id);
          setActivated(!!savedActivation);
          setActivatedAt(savedActivation?.activatedAt ?? null);
        }
      } catch (error) {
        if (alive) setMessage(error instanceof Error ? error.message : 'Erro ao inicializar.');
      } finally {
        if (alive) setReady(true);
      }
    };
    void initialize();
    return () => { alive = false; };
  }, []);

  const activate = async (code: string, redeemFn: RedeemFn) => {
    const trimmed = code.replace(/\s+/g, '').trim().toUpperCase();
    if (!trimmed) throw new Error('Digite o codigo de ativacao.');
    const result = await redeemFn({ data: { code: trimmed, deviceId } });
    if (!result.activated) {
      throw new Error('Codigo invalido ou ja utilizado.');
    }
    const activatedAt = new Date().toISOString();
    await writeLicenseValue('activation-status', { activatedAt, code: trimmed });
    setActivated(true);
    setActivatedAt(activatedAt);
    setMessage('Licenca ativada com sucesso! O AdoraDrive funciona sem internet a partir de agora.');
  };

  return { activated, activatedAt, deviceId, ready, message, setMessage, activate };
}