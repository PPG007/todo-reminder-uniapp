<template>
	<view>
		<u-toast ref="detailToast"></u-toast>
		<u-form :model="detail" labelAlign="center" labelWidth="auto">
			<u-form-item label="内容" prop="content">
				<u-textarea v-model="detail.content" :count="true" :autoHeight="true" border="bottom">
				</u-textarea>
			</u-form-item>
			<u-form-item label="提醒设置" prop="needRemind">
				<u-switch v-model="detail.needRemind" @change="onSwitchNeedRemind"></u-switch>
			</u-form-item>
			<u-form-item prop="remindAt" @click="onClickDatetimePicker">
				<u-input :disabled="!enableRemindAt" :value="remindAtValue" :placeholder="remindAtValue" readonly>
				</u-input>
			</u-form-item>
			<u-form-item label="重复设置" prop="isRepeatable">
				<u-switch v-model="detail.isRepeatable" @change="onSwitchIsRepeatable" :disabled="!detail.needRemind"></u-switch>
			</u-form-item>
			<u-form-item>
				<u-input :disabled="!detail.isRepeatable || detail.repeatType === 'workingDay' || detail.repeatType === 'holiday'" type="number" v-model.number="detail.repeatDateOffset"
					inputAlign="center">
					<template slot="prefix">
						<u-tag text="每" icon="bell-fill"></u-tag>
					</template>

					<template slot="suffix">
						<u-button @click="onClickShowRepeatTypeButton" type="primary" shape="circle">
							{{currentRepeatType}}</u-button>
					</template>
				</u-input>
			</u-form-item>
			<u-form-item>
				<u-button type="primary" @click="onSubmit" :disabled="detail.content === ''">提交</u-button>
			</u-form-item>
			<u-upload
				:multiple="true"
				:fileList="fileList"
				:maxCount="10"
				@delete="onDelete"
				@afterRead="onAfterRead"
				:previewFullImage="true"
			></u-upload>
		</u-form>
		<u-datetime-picker :show="showDatetimePicker" :closeOnClickOverlay="true" v-model="detail.remindAt"
			@cancel="onDateTimePickerClosed" @confirm="onDateTimePickerClosed" @close="onDateTimePickerClosed" :minDate="minDate">
		</u-datetime-picker>
		<u-picker :columns="repeatTypes" :show="showRepeatTypePicker" @close="onRepeatTypePickerClosed"
			@cancel="onRepeatTypePickerClosed" @confirm="onRepeatTypePickerChanged" closeOnClickOverlay>
		</u-picker>
	</view>
</template>

<script>
	import TimeUtil from '@/util/time.js';
	import Record from '@/util/record.js';
	import Request from '@/util/request.js';
	import moment from 'moment';
	export default {
		data() {
			return {
				detail: {
					id: '',
					remindAt: moment().toISOString(),
					hasBeedDone: false,
					content: '',
					doneAt: '',
					needRemind: false,
					isRepeatable: false,
					repeatType: 'daily',
					repeatDateOffset: 1,
					todoId: '',
					images: [],
				},
				showDatetimePicker: false,
				showRepeatTypePicker: false,
				fileList: [],
			}
		},
		methods: {
			onSwitchNeedRemind() {
				this.detail.isRepeatable = false;
			},
			onSwitchIsRepeatable() {

			},
			onClickDatetimePicker() {
				if (!this.detail.needRemind) {
					return
				}
				this.showDatetimePicker = !this.showDatetimePicker;
			},
			onDateTimePickerClosed() {
				this.showDatetimePicker = false;
			},
			onRepeatTypePickerClosed() {
				this.showRepeatTypePicker = false;
			},
			onClickShowRepeatTypeButton() {
				this.showRepeatTypePicker = true
			},
			onRepeatTypePickerChanged(e) {
				this.detail.repeatType = Record.formatRepeatTypeToEn(e.value[0]);
				this.onRepeatTypePickerClosed();
			},
			onConfirm() {
				console.log('confirm');
			},
			onCancel() {
				console.log('cancel');
			},
			async onLoad(param) {
				if (param.id &&param.id !== '') {
					try {
						const resp = await Request.getDetail(param.id);
						this.detail = resp.data;
						this.formatFileList();
					} catch(e) {
						this.showToast('未知错误', 'error')
					}
				}
			},
			async onSubmit() {
				if (this.detail.isRepeatable) {
					if (this.detail.repeatDateOffset === 0) {
						this.showToast('重复时间必须大于等于 1', 'error')
						return;
					} else if (this.detail.repeatDateOffset % 1 !== 0) {
						this.showToast('重复时间必须是整数', 'error')
						return;
					}
				}
				const req = {
					needRemind: this.detail.needRemind,
					content: this.detail.content,
					isRepeatable: this.detail.isRepeatable,
					repeatType: this.detail.repeatType,
					repeatDateOffset: this.detail.repeatDateOffset,
					remindAt: moment(this.detail.remindAt).toISOString(),
					id: this.detail.todoId,
					images: this.formatImageNames(),
				};
				try {
					await Request.createTodo(req);
					this.showToast('操作成功', 'success')
					uni.navigateBack();
				} catch (e) {
					this.showToast('操作失败', 'error')
				}
			},
			showToast(message, type) {
				this.$refs.detailToast.show({
					message: message,
					type: type,
					duration: 1000
				})
			},
			async onAfterRead(event, error) {
				let files = [].concat(event.file);
				files.map((file) => {
					this.fileList.push({
						...file,
						status: 'uploading',
						message: '上传中',
					});
				})
				files.map(async (file) => {
					try {
						const resp = await Request.uploadFile(file.url, this.getFileName(file.url));
						this.updateFileUploadStatus(file.url, resp.data.url, resp.data.name, 'success');
					} catch (e) {
						this.showToast('上传失败', 'error')
						this.updateFileUploadStatus(file.url, '', '', 'failed');
					}
				})
			},
			async onDelete(event, error) {
				this.fileList.splice(event.index, 1);
			},
			getFileName(path) {
				const arr = path.split("/");
				return arr[arr.length-1]
			},
			updateFileUploadStatus(filePath, fileUrl, fileName, status) {
				const newList = [];
				this.fileList.forEach(file => {
					if (file.url == filePath) {
						file.message = '';
						file.status = status;
						file.name = fileName;
						if (fileUrl != '') {
							file.url = fileUrl;
						}
						if (status == 'failed') {
							return;
						}
					}
					newList.push(file);
				})
				this.fileList = newList;
			},
			formatFileList() {
				this.fileList = [];
				this.detail.images.forEach(image => {
					this.fileList.push({
						name: image.name,
						url: image.url,
						type: 'image',
					})
				});
			},
			formatImageNames() {
				let result = [];
				this.fileList.forEach(file => {
					result.push(file.name);
				})
				return result;
			}
		},
		computed: {
			enableRemindAt: {
				get() {
					return this.detail.needRemind
				}
			},
			remindAtValue: {
				get() {
					if (!this.detail.needRemind) {
						return '';
					}
					return TimeUtil.formatTime(this.detail.remindAt);
				}
			},
			repeatTypes: {
				get() {
					return [Record.types()];
				}
			},
			currentRepeatType: {
				get() {
					return Record.formatRepeatType(this.detail.repeatType);
				}
			},
			minDate: {
				get() {
					return moment().unix()*1000;
				}
			}
		}
	}
</script>

<style>

</style>
