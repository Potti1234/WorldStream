import { useState } from 'react';
import { MiniKit, VerifyCommandInput, VerificationLevel, ISuccessResult } from '@worldcoin/minikit-js'
import { clientLogger } from '@/lib/client-logger'
import { useVerification } from '@/contexts/verification-context'

export const useVerificationGuard = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const { isVerified, setIsVerified } = useVerification();

  const verifyPayload: VerifyCommandInput = {
    action: 'verification',
    verification_level: VerificationLevel.Device
  };

  const handleVerify = async (): Promise<boolean> => {
    try {
      setIsVerifying(true);
      
      clientLogger.info('World App is installed ✓', {}, 'handleVerify');
      
      const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);
      
      if (finalPayload.status === 'error') {
        console.log('Error payload', finalPayload);
        return false;
      }
      
      const verifyResponse = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: finalPayload as ISuccessResult, // Parses only the fields we need to verify
          action: 'verification',
        }),
      });
      
      const verifyResponseJson = await verifyResponse.json();
      
      if (verifyResponseJson.status === 200) {
        clientLogger.info('Verification success!', {}, 'handleVerify');
        setIsVerified(true);
        return true;
      } else {
        clientLogger.error('Verification failed', {}, 'handleVerify');
        return false;
      }
    } catch (error) {
      clientLogger.error('Verification error:', error, 'handleVerify');
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const withVerification = async (
    action: () => void,
    options: { onSuccess?: () => void; onError?: () => void } = {}
  ) => {
    // If already verified or not on a mobile device, proceed without verification
    if (isVerified || (typeof window !== 'undefined' && !window.matchMedia('(pointer:coarse)').matches && !window.matchMedia('(max-device-width: 480px)').matches)) {
      action();
      options.onSuccess?.();
      return true;
    }

    // If not verified, proceed with verification
    const username = MiniKit.user.username;
    clientLogger.info('MiniKit user', username, 'withVerification');

    const verified = await handleVerify();
    if (verified) {
      action();
      options.onSuccess?.();
    } else {
      options.onError?.();
    }
    return verified;
  };

  return {
    withVerification,
    isVerifying,
  };
};

