'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function TestNavigation() {
  const router = useRouter();

  const testNavigation = () => {
    console.log('Testing navigation...');
    router.push('/products/cmdd28uzq000hugt6hmftkn53/edit');
  };

  return (
    <Button onClick={testNavigation}>
      Test Navigation to Edit Product
    </Button>
  );
}
