import { Request, Response, NextFunction } from "express";

type ResponseData = Record<string, any>;

declare global {
  namespace Express {
    interface Response {
      sendMessage: (
        statusCode: number,
        message: string,
        data?: ResponseData
      ) => Response;
    }
  }
}

export const sendResponse = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.sendMessage = (
    statusCode: number,
    message: string,
    data: ResponseData = {}
  ) => {
    return res.status(statusCode).json({
      success: statusCode < 400,
      message,
      ...data,
    });
  };

  next();
};
