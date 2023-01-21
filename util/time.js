import moment from 'moment';
export default class TimeUtil {
	static formatTime = (source) => {
		return moment(source).format('YYYY-MM-DD HH:mm')
	}
}