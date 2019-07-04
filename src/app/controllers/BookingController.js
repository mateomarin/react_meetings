import * as Yup from 'yup';

import Booking from '../models/Booking';
import Meetup from '../models/Meetup';
import User from '../models/User';

import BookingMail from '../jobs/BookingMail';
import Queue from '../../lib/Queue';

class BookingController {
  async store(req, res) {
    const schema = Yup.object().shape({
      meetup_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validation Fails' });

    const meetup = await Meetup.findByPk(req.body.meetup_id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email'],
        },
      ],
    });

    if (meetup.past) return res.status(401).json({ error: 'Meetup antigo' });

    const isBooked = await Booking.findOne({
      where: { meetup_id: meetup.id, user_id: req.userId },
    });

    if (isBooked) return res.status(401).json({ error: 'Já está inscrito' });

    const otherBookings = await Booking.findAll({
      include: [
        {
          model: Meetup,
          as: 'meetup',
          attributes: ['date'],
          where: { date: meetup.date },
        },
      ],
    });

    if (otherBookings.length)
      return res
        .status(401)
        .json({ error: 'Já está inscrito num outro meetup no mesmo horário' });

    const booking = await Booking.create({
      date: new Date(),
      meetup_id: meetup.id,
      user_id: req.userId,
    });

    Queue.add(BookingMail.key, {
      meetup,
      user: req.userName,
    });

    return res.json({ booking });
  }

  async index(req, res) {
    return res.json({ success: true });
  }
}

export default new BookingController();
