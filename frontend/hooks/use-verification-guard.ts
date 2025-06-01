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
    if (isVerified) {
      action();
      return true;
    }

    clientLogger.info('MiniKit user', MiniKit, 'withVerification');
    const username = MiniKit.user.username


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
