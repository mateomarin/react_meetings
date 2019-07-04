import { Op } from 'sequelize';
import Booking from '../models/Booking';
import Meetup from '../models/Meetup';

class SessionBookingController {
  async index(req, res) {
    const bookings = await Booking.findAll({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          as: 'meetup',
          attributes: ['date'],
          order: ['date'],
          where: {
            date: {
              [Op.gt]: new Date(),
            },
          },
        },
      ],
    });

    return res.json({ bookings });
  }
}

export default new SessionBookingController();
