'use client';

import React from 'react';
import DashboardShell from '@/components/layout/DashboardShell';

export default function OfficerLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="officer">{children}</DashboardShell>;
}
