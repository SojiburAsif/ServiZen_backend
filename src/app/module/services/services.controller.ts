import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ServicesService } from "./services.service";
import { Request, Response } from "express";

const createservice = catchAsync(async (req: Request, res: Response) => {

    const result = await ServicesService.createServices(req.body, req.user);
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Service created successfully",
        data: result,
    })
}
)

const getServices = catchAsync(async (req: Request, res: Response) => {
    const result = await ServicesService.getAllServices(req.query);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Services fetched successfully",
        data: result,
    })
})

const getServiceById = catchAsync(async (req: Request, res: Response) => {
    const result = await ServicesService.getServiceById(req.params.id as string);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Service fetched successfully",
        data: result,
    })
})

const updateService = catchAsync(async (req: Request, res: Response) => {
    const result = await ServicesService.updateService(req.params.id as string, req.body, req.user);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Service updated successfully",
        data: result,
    })
})

const deleteService = catchAsync(async (req: Request, res: Response) => {
    const result = await ServicesService.deleteService(req.params.id as string, req.user);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Service deleted successfully",
        data: result,
    })
})

export const ServicesController = {
    createservice,
    getServices,
    getServiceById,
    updateService,
    deleteService,

}