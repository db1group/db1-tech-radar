import moment from "moment";
import 'moment/locale/pt';
import 'moment/locale/es';
import i18n from 'i18next';

const isoDateToMoment = (isoDate: moment.MomentInput) =>
  moment(isoDate, "YYYY-MM-DD");

export const formatRelease = (
  isoDate: moment.MomentInput,
  format: string = "MMMM YYYY"
) => isoDateToMoment(isoDate).locale(i18n.language).format(format);
