import * as Yup from 'yup';
import {
  isBefore,
  parseISO,
  setHours,
  setMinutes,
  getHours,
  getMinutes,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { Op } from 'sequelize';
import crypto from 'crypto';
import Meetup from '../models/Meetup';
import User from '../models/User';

class MeetupController {
  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.string().required(),
      time: Yup.string().required(),
      image_id: Yup.string().required(),
      user_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validation Fails' });

    const { date, user_id, time, ...rest } = req.body;
    const [hour, minute] = time.split(':');

    rest.title = `Meetup ${crypto
      .randomBytes(5)
      .toString('hex')
      .toUpperCase()}`;

    const parsedDate = setMinutes(setHours(parseISO(date), hour), minute);

    if (isBefore(parsedDate, new Date()))
      return res.status(400).json({ error: 'Past dates are not permitted' });

    const meetup = await Meetup.create({
      date: parsedDate,
      ...rest,
      user_id,
    });

    return res.json({ meetup });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.string(),
      time: Yup.string(),
      image_id: Yup.string(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validation Fails' });

    const { date, time, ...rest } = req.body;
    console.log('body', req.body);
    const meetup = await Meetup.findByPk(req.params.id);

    if (!meetup) return res.status(400).json({ error: 'Meetup não existe' });

    console.log('user', req.userId);

    if (meetup.user_id !== req.userId)
      return res
        .status(401)
        .json({ error: 'Apenas o criador pode editar o Meetup' });
    console.log('meeting past', meetup.past);

    if (meetup.past)
      return res
        .status(401)
        .json({ error: 'Não podem ser modificados Meetups passados' });

    let parsedDate = meetup.date;
    const hr = getHours(meetup.date);
    const min = getMinutes(meetup.date);

    if (date || time) {
      if (date) {
        const past = isBefore(parseISO(date), new Date());
        if (past) return res.status(400).json({ error: 'Data passada' });
        parsedDate = setHours(setMinutes(parseISO(date), min), hr);
      }
      if (time) {
        const [hour, minute] = time.split(':');
        const date_ref = setMinutes(setHours(parsedDate, hour), minute);
        const past = isBefore(date_ref, new Date());
        if (past) return res.status(400).json({ error: 'Data passada' });
        parsedDate = date_ref;
      }
    }
    const savedMeetup = await meetup.update({ ...rest, date: parsedDate });

    return res.json({ meetup: savedMeetup });
  }

  async index(req, res) {
    console.log('query', req.query);
    const { date, page = 1 } = req.query;
    const parsedDate = parseISO(date);
    const meetups = await Meetup.findAll({
      limit: 10,
      offset: (page - 1) * 10,
      where: {
        date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
        },
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email'],
        },
      ],
    });
    console.log('meetups', meetups);
    return res.json({ meetups });
  }

  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);
    if (meetup.user_id !== req.userId)
      return res.status(401).json({ error: 'Você não está autorizado' });
    await meetup.destroy();
    return res.json({
      message: `Meetup '${meetup.title}' removida com sucesso`,
    });
  }
}

export default new MeetupController();
