import { Response } from "express";

export interface IMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface IResponseData<T> {
    httpStatusCode: number;
    success: boolean;
    message: string;
    data?: T;
    meta?: IMeta;
}


export const sendResponse = <T>(res: Response, responseData: IResponseData<T>) => {
    const { httpStatusCode, success, message, data, meta } = responseData;

    res.status(httpStatusCode).json({
        success,
        message,
        meta,
        data
    });
}