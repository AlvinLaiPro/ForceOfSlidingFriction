import BaseControl from './BaseControl'

let TimelineMax = require('TimelineMax');

export default class AnimateControl extends BaseControl {
	/**
	 * 单例
	 */
	static _inst;

	static getInst() {
		AnimateControl._inst = AnimateControl._inst || new AnimateControl();

		return AnimateControl._inst;
	}

	/**
	 * 构造
	 */
	constructor() {
		super();
		this.$body = $('.frictionalForce_body');
		this.$text = $('.scale .reading b'); // 显示刻度值对象
		this.$dynamometer = $('.scale'); // 弹簧测力计对象
		this.$overall = $('.pullObject'); // 弹簧测力计与木块整体对象
		// this.$desktop = $('.glassbg');  // 桌面对象
		// this.$block = $('.weightObject');  // 木块对象
		this.moveDis = this.$body.width() - this.$dynamometer.width() -
			Number.parseInt(this.$dynamometer.css('left')) - Number.parseInt(this.$overall.css('left'));
		this._text = 0.0; // 摩擦力值
		this._staticTime = 3; // 一阶段动画时间
		this._conversionTime = 0.2; // 二阶段动画时间
		this._dynamicTime = 5.8; // 三阶段动画时间
		this._force = {}; // 摩擦力
		this._currentType = null; // 当前类型,如0_1_0 => 木板_1倍速度_0个砝码
		this._animates = {}; // 存储相应类型的tweenMax动画
	}

	/**
	 * 析构
	 */
	destroy() {
		if (this.tl) {
			this.reset();
		}
		AnimateControl._inst = null;
	}

	/**
	 * 初始化事件
	 */
	init(app) {
		this.app = app;
		// Todo 
		TweenLite.defaultEase = Linear.easeNone; // 修改动画默认的缓动方式
		this.moveDis -= 2 * this.app.config.fontSize; // 以免木块超出材质的右边界
		return this;
	}

	/**
	 * 创建滑动动画
	 */
	_createAnimate(type) {
		let animate = this._animates[type];
		this._currentType = type;
		this._force = this._computeForce();
		// 根据当前设定的速度进行三段动画的时间设定
		this.totalTime = this.app.data.totalTime;
		this._staticTime = this.app.config.STATIC_TIME / this.app.config.TOTAL_TIME * this.totalTime;
		this._conversionTime = this.app.config.CONVERSION_TIME / this.app.config.TOTAL_TIME * this.totalTime;
		this._dynamicTime = this.app.config.DYNAMIC_TIME / this.app.config.TOTAL_TIME * this.totalTime;
		if (animate) {
			this.tl = animate;
		} else {
			this.tl = new TimelineMax({
				onUpdate: this._update.bind(this), // 动画过程中执行方法
				onComplete: this._complete.bind(this) // 动画结束后执行的方法
			});
			// tweenMax动画
			this.tl.to(this.$overall,
					this._staticTime + this._conversionTime, {
						x: 0
					})
				.to(this.$overall,
					this._dynamicTime, {
						x: this.moveDis
					});
			this._animates[type] = this.tl;
		}
	}

	/**
	 * 计算摩擦力
	 */
	_computeForce() {
		let totalWeight = this.app.data.totalWeight; // 质量
		let staticFn = totalWeight * this.app.config.coefficient[this.app.data.curIndex].staticCoefficient; // 静摩擦力
		let dynamicFn = totalWeight * this.app.config.coefficient[this.app.data.curIndex].dynamicCoefficient; // 动摩擦力
		return {
			staticFn,
			dynamicFn
		}
	}

	/**
	 * 操作动画
	 */
	operate(state, preState) {
		let type,
			config = this.app.config;
		if (state !== config.COMPLETE_STATE) {
			switch (preState) {
				case config.INIT_STATE:
					type = this._getCurrentType();
					if (this._currentType !== type) {
						this._createAnimate(type);
					}
					this._play();
					break;
				case config.RUN_STATE:
					this._pause();
					break;
				case config.PAUSE_STATE:
					this._resume();
					break;
				case config.COMPLETE_STATE:
					this._restart();
					break;
				default:
					type = this._getCurrentType();
					if (this._currentType !== type) {
						this._createAnimate(type);
					}
					this._play();
			}
		}else{
			if(this.app.config.initStudentMobile){
				this.tl.progress(1);
			}
		}
	}

	/**
	 * 获取当前状态类型
	 */
	_getCurrentType() {
		return `${this.app.data.curIndex}_${this.app.data.curSpeed}_${this.app.data.curWeight}`;
	}

	/**
	 * 播放动画
	 */
	_play() {
		this.tl.play();
	}

	/**
	 * 暂停动画
	 */
	_pause() {
		if (this.tl) {
			this.tl.pause();
			this.app.config.inStudentMobile ? null : this.app.data.animateProgress = this.tl.time() / this.tl.totalDuration();
			if(this.app.config.initStudentMobile && this.app.data.animateProgress){
				this.tl.progress(this.app.data.animateProgress);
			}
			console.log(this.app.data.animateProgress);
		}

	}

	/**
	 * 继续动画
	 */
	_resume() {
		this.tl.resume();
	}

	/**
	 * 重播动画
	 */
	_restart() {
		this.tl.restart();
	}

	/**
	 * 控制进度
	 * @param rate:Number  控制进度0-1之间，小于0为0，大于1为1 
	 */
	_progress(rate) {
		typeof rate === 'number' ? this.tl.progress(rate) : this.tl.progress(0)
	}

	/**
	 * 复位暂停
	 */
	reset() {

		if (this.tl) {
			this._progress();
			this._pause();
			this._update();
			this.tl.kill();
			this._currentType = null;
			this.tl = null;
		}
	}

	/**
	 * 更新放大镜的文字
	 */
	_update() {
		let time = this.tl.time();
		if (time <= this._staticTime) {
			this._text = (time / this._staticTime * this._force.staticFn).toFixed(2);
		} else if (time > this._staticTime && time <= this._staticTime + this._conversionTime) {
			this._text = (this._force.staticFn - ((time - this._staticTime) / this._conversionTime * (this._force.staticFn - this._force.dynamicFn))).toFixed(2);
		} else {
			this._text = this._force.dynamicFn.toFixed(2);
		}
		this.$text.text(this._text);
	}

	/**
	 * 动画结束后执行
	 */
	_complete() {
		this.app.data.curState = this.app.config.COMPLETE_STATE;
	}

}