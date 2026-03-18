
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync.js";
import { sendResponse } from "../../shared/sendResponse.js";
import { SpecialtyService } from "./specialty.service";

const createSpecialty = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const result = await SpecialtyService.createSpecialty(payload);
        sendResponse(res, {
            httpStatusCode: 201,
            success: true,
            message: 'Specialty created successfully',
            data: result
        });
    }
)


const getAllSpecialties = catchAsync(
    async (req: Request, res: Response) => {
        const result = await SpecialtyService.getAllSpecialties();
        sendResponse(res, {
            httpStatusCode: 200,
            success: true,
            message: 'Specialties fetched successfully',
            data: result
        });
    }
)

const getMySpecialties = catchAsync(
    async (req: Request, res: Response) => {
        const result = await SpecialtyService.getMySpecialties(req.user);
        sendResponse(res, {
            httpStatusCode: 200,
            success: true,
            message: 'Provider specialties fetched successfully',
            data: result
        });
    }
)

const deleteSpecialty = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await SpecialtyService.deleteSpecialty(id as string);
        sendResponse(res, {
            httpStatusCode: 200,
            success: true,
            message: 'Specialty deleted successfully',
            data: result
        });
    }
)

const addMySpecialties = catchAsync(
    async (req: Request, res: Response) => {
        const result = await SpecialtyService.addMySpecialties(req.user, req.body.specialties);
        sendResponse(res, {
            httpStatusCode: 200,
            success: true,
            message: 'Provider specialties added successfully',
            data: result
        });
    }
)

const removeMySpecialty = catchAsync(
    async (req: Request, res: Response) => {
        const result = await SpecialtyService.removeMySpecialty(req.user, req.params.specialtyId as string);
        sendResponse(res, {
            httpStatusCode: 200,
            success: true,
            message: 'Provider specialty removed successfully',
            data: result
        });
    }
)

export const SpecialtyController = {
    createSpecialty,
    getAllSpecialties,
    getMySpecialties,
    deleteSpecialty,
    addMySpecialties,
    removeMySpecialty,
}