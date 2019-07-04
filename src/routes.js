import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import AdminMeetupController from './app/controllers/AdminMeetupController';
import BookingController from './app/controllers/BookingController';
import SessionBookingController from './app/controllers/SessionBookingController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.get('/', (req, res) => {
  res.json({ success: true });
});

routes.get('/users', UserController.list);
routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.get('/meetups/admin', AdminMeetupController.index);
routes.get('/meetups', MeetupController.index);
routes.post('/meetups', MeetupController.store);
routes.put('/meetups/:id', MeetupController.update);
routes.delete('/meetups/:id', MeetupController.delete);

routes.post('/bookings', BookingController.store);
routes.get('/bookings/session', SessionBookingController.index);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
