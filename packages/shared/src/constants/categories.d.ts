import type { IssueCategory } from '../types/issue';
export interface CategoryConfig {
    id: IssueCategory;
    label: string;
    icon: string;
    color: string;
    department: string;
    description: string;
}
export declare const ISSUE_CATEGORIES: CategoryConfig[];
export declare const CATEGORY_MAP: Map<IssueCategory, CategoryConfig>;
export declare function getCategoryConfig(id: IssueCategory): CategoryConfig | undefined;
export declare function getCategoryLabel(id: IssueCategory): string;
export declare function getCategoryDepartment(id: IssueCategory): string;
//# sourceMappingURL=categories.d.ts.map