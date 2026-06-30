import type { IssueSeverity } from '../types/issue';
export interface SeverityConfig {
    id: IssueSeverity;
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: string;
    responseTimeHours: number;
    description: string;
    priority: number;
}
export declare const SEVERITY_LEVELS: SeverityConfig[];
export declare const SEVERITY_MAP: Map<IssueSeverity, SeverityConfig>;
export declare function getSeverityConfig(id: IssueSeverity): SeverityConfig;
export declare function getSeverityColor(id: IssueSeverity): string;
//# sourceMappingURL=severity.d.ts.map