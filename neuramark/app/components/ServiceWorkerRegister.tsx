// components/ServiceWorkerRegister.tsx
'use client'

import { useEffect } from 'react';

const ServiceWorkerRegister: React.FC = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (_registration) => {
            console.log('ServiceWorker registration successful');
          },
          (err) => {
            console.log('ServiceWorker registration failed: ', err);
          }
        );
      });
    }
  }, []);

  return null;
};

export default ServiceWorkerRegister;