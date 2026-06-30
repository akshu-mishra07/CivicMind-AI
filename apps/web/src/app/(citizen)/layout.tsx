'use client';

import React from 'react';
import DashboardShell from '@/components/layout/DashboardShell';

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="citizen">{children}</DashboardShell>;
}
