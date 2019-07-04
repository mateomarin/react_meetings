import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class BookingMail {
  get key() {
    return 'BookingMail';
  }

  async handle({ data }) {
    const { meetup, user } = data;

    await Mail.sendMail({
      to: `${meetup.user.name} <${meetup.user.email}>`,
      subject: 'Nova Inscrição Realizada',
      template: 'booking',
      context: {
        provider: meetup.user.name,
        user,
        meetup: meetup.title,
      },
    });
  }
}

export default new BookingMail();
