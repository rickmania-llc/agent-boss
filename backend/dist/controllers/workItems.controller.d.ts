import { Request, Response, NextFunction } from 'express';
export declare function getAllWorkItems(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getWorkItem(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function createWorkItem(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateWorkItem(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function assignWorkItem(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function completeWorkItem(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function failWorkItem(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=workItems.controller.d.ts.map