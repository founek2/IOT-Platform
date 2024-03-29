import express from 'express';
import { RequestWithAuthOpt } from '../../types';
import { isRoot } from '../../utils/groups';

export function checkIsRoot() {
    return async ({ user }: RequestWithAuthOpt, res: express.Response, next: express.NextFunction) => {
        return user && isRoot(user.groups) ? next() : res.status(403).send({ error: 'InvalidPermissions' });
    };
}
