import { Request, Response, NextFunction } from 'express';

export const responseBodyHookMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const originalJson = res.json;
  const originalSend = res.send;

  if (!res.locals) {
    res.locals = {};
  }

  res.json = function (data) {
    res.locals.responseBody = structuredClone(data);
    return originalJson.call(this, data);
  };

  res.send = function (data) {
    if (typeof data === 'object' && data !== null) {
      res.locals.responseBody = structuredClone(data);
    } else {
      res.locals.responseBody = data;
    }
    return originalSend.call(this, data);
  };

  next();
};
