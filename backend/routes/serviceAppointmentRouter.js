import express from 'express';
import { clerkMiddleware, requireAuth } from '@clerk/express';

import { cancelServiceAppointment, confirmServicePayment, createServiceAppointment, getServiceAppoinments, getServiceAppoinmentsByPatient, getServiceAppointmentById, getServiceAppointmentStats, updateServiceAppointment } from '../controllers/serviceAppointmentController.js';

const serviceAppointmentRouter=express.Router();

serviceAppointmentRouter.get("/",getServiceAppoinments);
serviceAppointmentRouter.get("/confirm",confirmServicePayment);
serviceAppointmentRouter.get("/stats/summary",getServiceAppointmentStats);

serviceAppointmentRouter.post("/",clerkMiddleware(),requireAuth(),createServiceAppointment);
serviceAppointmentRouter.get("/me",clerkMiddleware(),requireAuth(),getServiceAppoinmentsByPatient);

serviceAppointmentRouter.get("/:id",getServiceAppointmentById);
serviceAppointmentRouter.get("/:id",updateServiceAppointment);
serviceAppointmentRouter.post("/:id/cancel",cancelServiceAppointment);

export default serviceAppointmentRouter;



