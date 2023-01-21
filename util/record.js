export default class Record {
	static formatRepeatSetting = (type, dateoffset) => {
		if (type === 'holiday') {
			return '节假日';
		} else if (type === 'workingDay') {
			return '工作日';
		}
		let subfix = '';
		switch (type) {
			case 'daily':
			subfix = '天';
			break;
			case 'weekly':
			subfix = '周';
			break;
			case 'monthly':
			subfix = '月';
			break;
			case 'yearly':
			subfix = '年';
			break;
		}
		return `每 ${dateoffset} ${subfix}`
	}
	static formatRepeatType = (type) => {
		switch (type) {
			case 'holiday':
			return '节假日';
			case 'workingDay':
			return '工作日';
			case 'daily':
			return '天';
			case 'weekly':
			return '周';
			case 'monthly':
			return '月';
			case 'yearly':
			return '年';
		}
	}
	static formatRepeatTypeToEn = (type) => {
		switch (type) {
			case '节假日':
			return 'holiday';
			case '工作日':
			return 'workingDay';
			case '天':
			return 'daily';
			case '周':
			return 'weekly';
			case '月':
			return 'monthly';
			case '年':
			return 'yearly';
		}
	}
	static types = () => {
		return ['节假日', '工作日', '天', '周', '月', '年']
	}
}
