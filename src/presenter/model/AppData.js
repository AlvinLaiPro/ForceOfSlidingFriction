export default class AppData {
	/**
	 * 单例
	 */
	static _inst;

	static getInst() {
		AppData._inst = AppData._inst || new AppData;
		return AppData._inst;
	}

	constructor() {
		this._defaultData = {
			animateProgress: null,
			curSelected: '',
			curTip: '',
			curState: 0,
			curIndex: 0, //当前材质索引
			curSpeed: 1, // 当前速度1为初始速度2为两倍速度
			curWeight: 0, //当前砝码数
			lines: [] //当前绘制的所有线
		};

		this.data = {};
		// this._curState = 0;  //0:动画未开始状态 1:运动状态 2:暂停状态 3:动画结束状态
	}

	init(app, data) {
		this.app = app;
		if (!data) {
			data = this._defaultData;
		}
		if (app.config.inStudentMobile) {
			this.app.config.initStudentMobile = true;
		} else {
			data.animateProgress = null;
			data.curSelected = '';
			data.curTip = '';
		}
		let curState = data.curState;
		data.curState = 0;

		for (let key in data) {
			this.data[key] = data[key];
			this[key] = data[key];
		}

		let that = this;

		if (app.config.inStudentMobile) {
			setTimeout(function() {

				if (curState !== 0) {
					let minus = curState;
					while (minus--) {
						that['curState'] = that['curState'] + 1;
					}
					curState === 3 ? that['lines'] = data['lines'] : null;

				}

				if (data.curSelected) {
					that.app.GraphControl.selectGroup(data.curSelected);
					if (data.curTip) {
						that.app.GraphControl.controlCircle(data.curTip);
					}
				}


				that.app.config.initStudentMobile = false;

			}, 100);
		}

		return this;
	}

	destroy() {
		AppData._inst = null;
	}

	get totalWeight() {
		return (this.app.config.WOOD_WEIGHT + this.app.config.IRON_WEIGHT * this.curWeight) / 1000 * this.app.config.g;
	}

	get totalTime() {
		return this.app.config.TOTAL_TIME / this.curSpeed;
	}

	get curIndex() {
		return this.data.curIndex;
	}

	set curIndex(index) {
		this.data.curIndex = index;
		this.app.func.watchTexture(index)
	}

	get curSpeed() {
		return this.data.curSpeed;
	}

	set curSpeed(speed) {
		this.data.curSpeed = speed;
		this.app.func.watchSpeed(speed)
	}


	get curWeight() {
		return this.data.curWeight;
	}

	set curWeight(weight) {
		this.data.curWeight = weight;
		this.app.func.watchWeightChange(weight)

	}


	get lines() {
		return this.data.lines;
	}

	set lines(lines) {
		this.data.lines = lines.concat();
		if (this.data.lines.length > this.app.config.MAX_LINE_NUM) {
			this.data.lines.shift()
		}
		this.app.GraphControl.controlLines(this.data.lines);
		console.log(this.data.lines)
	}

	get curState() {
		return this.data.curState;
	}

	set curState(state) {
		let preState = this.data.curState;
		this.data.curState = state;
		state === this.app.config.INIT_STATE ? this.app.animate.reset() : this.app.animate.operate(state, preState);
		this.app.func.watchStart(state);
		this.app.GraphControl.animateControl(state);
	}

	get curSelected() {
		return this.data.curSelected;
	}

	set curSelected(classString) {
		this.data.curSelected = classString;
	}

	get curTip() {
		return this.data.curTip;
	}

	set curTip(classString) {
		this.data.curTip = classString;
	}

	get animateProgress() {
		return this.data.animateProgress;
	}

	set animateProgress(rate) {
		this.data.animateProgress = rate;
	}


}