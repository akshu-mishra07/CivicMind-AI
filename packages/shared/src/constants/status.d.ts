import type { IssueStatus } from '../types/issue';
export interface StatusConfig {
    id: IssueStatus;
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: string;
    description: string;
    order: number;
}
export declare const ISSUE_STATUSES: StatusConfig[];
export declare const STATUS_MAP: Map<IssueStatus, StatusConfig>;
export declare function getStatusConfig(id: IssueStatus): StatusConfig;
export declare function getStatusColor(id: IssueStatus): string;
export declare const STATUS_FLOW: Record<IssueStatus, IssueStatus[]>;
export declare function getNextStatuses(current: IssueStatus): IssueStatus[];
//# sourceMappingURL=status.d.ts.map