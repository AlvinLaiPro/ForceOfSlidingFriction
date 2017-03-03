import BaseControl from './BaseControl'
let Snap = require('snapsvg');
// let TimelineMax = require('TimelineMax');
import {TimelineMax} from 'gsap'

export default class GraphControl extends BaseControl {
	/**
	 * 单例
	 */
	static _inst;

	static getInst() {
		GraphControl._inst = GraphControl._inst || new GraphControl();

		return GraphControl._inst;
	}

	/**
	 * 构造
	 */
	constructor() {
		super();
	}

	/**
	 * 析构
	 */
	destroy() {
		this.unbindEvent();
		if (this.animateObj) {
			this.animateObj.progress(0);
			this.animateObj.kill();
			this.animateGroup.remove();
			this.animateGroup = null;
			this.animateObj = null;
		}
		GraphControl._inst = null;
	}

	/**
	 * 初始化事件
	 */
	init(app) {
		let that = this;
		this.app = app;

		// 初始化svg界面
		var uid = 'svg' + this.uuid();
		this.app.$view.find('.frictional_coord').html('<svg id="' + uid + '" style="width: 100%;height: 100%;" ></svg>');
		this.$svg = this.app.$view.find('#' + uid);
		this.svg = Snap('#' + uid);
		this.numberTip = this.app.$view.find('.graph-prompt');
		this.deleteIcon = this.svg.image(this.app.config.basePath + 'resources/images/delete-icon.png', -1000, -1000, parseInt(32 * that.app.config.fontSize / 24), parseInt(38 * that.app.config.fontSize / 24)).addClass('deleteIcon');

		// svg绘制参数设置
		this.svgWidth = this.$svg.width();
		this.svgHeight = this.$svg.height();
		this.axisWidth = 3 * that.app.config.fontSize / 24;
		this.axisXWidth = 1 * that.app.config.fontSize / 24;
		this.axisYWidth = 2 * that.app.config.fontSize / 24;
		this.pointRadius = 7.5 * that.app.config.fontSize / 24;
		this.lineWidth = 5 * that.app.config.fontSize / 24;
		this.invisiblePointRadius = 12 * that.app.config.fontSize / 24;
		this.invisibleLineWidth = 9 * that.app.config.fontSize / 24;
		if (this.app.config.inStudentMobile) {
			this.invisiblePointRadius *= 1.5;
			this.invisibleLineWidth *= 2;
		}
		this.coordinate = {
			splitX: 18,
			splitY: 10,
			gridXWidth: 40 * that.app.config.fontSize / 24 + this.axisXWidth,
			gridYWidth: 40 * that.app.config.fontSize / 24 + this.axisYWidth,
			offsetLeft: 133 * that.app.config.fontSize / 24 + that.axisWidth,
			offsetBottom: 51 * that.app.config.fontSize / 24 + that.axisWidth,
			x: 133 * that.app.config.fontSize / 24 + that.axisWidth,
			y: that.svgHeight - 51 * that.app.config.fontSize / 24 - that.axisWidth
		}

		Snap.plugin(function(Snap, Element, Paper, glob) {
			var elproto = Element.prototype;
			elproto.toFront = function(target) {
				if (target) {
					this.appendTo(target);
					return this
				}
				this.appendTo(this.paper);
			};
			elproto.toBack = function(target) {
				if (target) {
					this.prependTo(target);
					return this
				}
				this.prependTo(this.paper);
			};
		});

		this.drawAllLines();
		this.bindEvent();
		return this;
	}

	/**	
	 * 绘制所有情况的折线
	 */
	drawAllLines() {
		let coefficient = this.app.config.coefficient.map(function(el, i) {
			return [el.staticCoefficient, el.dynamicCoefficient]
		});
		let weight = [this.app.config.WOOD_WEIGHT / 1000 * this.app.config.g,
			(this.app.config.WOOD_WEIGHT + this.app.config.IRON_WEIGHT) / 1000 * this.app.config.g,
			(this.app.config.WOOD_WEIGHT + this.app.config.IRON_WEIGHT * 2) / 1000 * this.app.config.g
		];
		let speed = [1, 2];
		let drawlineParams = this.joinArr([coefficient, weight, speed]);
		drawlineParams.map(function(el, i) {
			this.createPathGroup.apply(this, el.split(','))
		}, this);

	}

	/**
	 * 创建静态svg路径
	 * @param  {[number]} u1     [静摩擦力]
	 * @param  {[number]} u2     [动摩擦力]
	 * @param  {[number]} weight [压力]
	 * @param  {[number]} speed  [速度]
	 * @return {[object]}        [返回svg对象]
	 */
	createPathGroup(u1, u2, weight, speed) {

		let classString = 'line' + u1 * 100 + weight * 10 + speed;
		let color = this.app.config.lineColor[u1][Math.floor(weight / (this.app.config.IRON_WEIGHT * this.app.config.g / 1000))];
		let time = this.app.config.TOTAL_TIME / speed;
		let f1 = u1 * weight;
		let f2 = u2 * weight;
		let k1 = f1 / 0.2 * (this.coordinate.gridYWidth) / (this.coordinate.gridXWidth * time * 2 / 3);
		let group = this.svg.g().addClass(classString + ' lineToShow').data({
			classString: classString,
			'color': color
		});
		let pathString = `M${this.coordinate.x} ${this.coordinate.y}L${this.coordinate.gridXWidth*time*2/3 + this.coordinate.x - this.axisXWidth/2} ${this.coordinate.y - f1/0.2*(this.coordinate.gridYWidth) + this.axisYWidth/2}`;
		pathString += `L${(this.coordinate.gridXWidth*time*2 - this.coordinate.gridXWidth*time*2*5.8/9) + this.coordinate.x - this.axisXWidth/2} ${this.coordinate.y - f2/0.2*(this.coordinate.gridYWidth) + this.axisYWidth/2}`;
		pathString += `L${this.coordinate.gridXWidth*time*2 + this.coordinate.x - this.axisXWidth/2} ${this.coordinate.y - f2/0.2*(this.coordinate.gridYWidth) + this.axisYWidth/2}`;

		let path = this.svg.path({
			path: pathString,
			stroke: color,
			strokeWidth: this.lineWidth,
			fill: 'none'
		}).addClass('staticPath');

		let invisiblePath = this.svg.path({
			path: pathString,
			stroke: color,
			strokeWidth: this.invisibleLineWidth,
			fill: 'none'
		}).addClass('staticInvisiblePath').data({
			'classString': classString,
			'color': color
		});

		group.add(path, invisiblePath);

		for (let i = 1; i <= time * 2 / 3; i++) {
			let circle = this.svg.circle(this.coordinate.x + this.coordinate.gridXWidth * i - this.axisXWidth / 2, this.coordinate.y - this.coordinate.gridXWidth * i * k1 + this.axisYWidth / 2, this.pointRadius).attr({
				fill: color
			}).addClass('controlCircle staticCircle' + i).addClass('hide_dom');
			let invisibleCircle = this.svg.circle(this.coordinate.x + this.coordinate.gridXWidth * i - this.axisXWidth / 2, this.coordinate.y - this.coordinate.gridXWidth * i * k1 + this.axisYWidth / 2, this.invisiblePointRadius).attr({
				fill: color
			}).addClass('invisibleCircle staticInvisibleCircle' + i).addClass('hide_dom');
			group.add(circle, invisibleCircle);
		}
		let specialCircle = this.svg.circle(this.coordinate.x + this.coordinate.gridXWidth * time * 2 - this.coordinate.gridXWidth * time * 2 * 5.8 / 9 - this.axisXWidth / 2, this.coordinate.y - f2 / 0.2 * (this.coordinate.gridYWidth) + this.axisYWidth / 2, this.pointRadius)
			.attr({
				fill: color
			}).addClass('controlCircle staticCircle').addClass('hide_dom');
		let invisibleSpecialCircle = this.svg.circle(this.coordinate.x + this.coordinate.gridXWidth * time * 2 - this.coordinate.gridXWidth * time * 2 * 5.8 / 9 - this.axisXWidth / 2, this.coordinate.y - f2 / 0.2 * (this.coordinate.gridYWidth) + this.axisYWidth / 2, this.invisiblePointRadius)
			.attr({
				fill: color
			}).addClass('invisibleCircle staticInvisibleCircle').addClass('hide_dom');

		group.add(specialCircle, invisibleSpecialCircle);

		for (let i = time * 2 / 3 + 1; i <= time * 2; i++) {
			let circle = this.svg.circle(this.coordinate.x + this.coordinate.gridXWidth * i - this.axisXWidth / 2, this.coordinate.y - f2 / 0.2 * this.coordinate.gridYWidth + this.axisYWidth / 2, this.pointRadius).attr({
				fill: color
			}).addClass('controlCircle staticCircle' + i).addClass('hide_dom');
			let invisibleCircle = this.svg.circle(this.coordinate.x + this.coordinate.gridXWidth * i - this.axisXWidth / 2, this.coordinate.y - f2 / 0.2 * this.coordinate.gridYWidth + this.axisYWidth / 2, this.invisiblePointRadius).attr({
				fill: color
			}).addClass('invisibleCircle staticInvisibleCircle' + i).addClass('hide_dom');
			if (i == time * 2) {
				circle.removeClass('hide_dom').addClass('lastCircle');
				invisibleCircle.removeClass('hide_dom').addClass('lastCircle');
			}
			group.add(circle, invisibleCircle);
			group.data({
				x: circle.attr('cx'),
				y: circle.attr('cy')
			});
		}

		group.addClass('hide_dom');

		return group;
	}

	/**
	 * 绑定svg点击事件
	 */
	bindEvent() {
		let that = this;
		let classpart = 'static';
		let limit = {
			left: that.coordinate.offsetLeft,
			bottom: that.svgHeight - that.coordinate.offsetBottom,
			right: that.coordinate.offsetLeft + that.coordinate.gridXWidth * (that.coordinate.splitX + 1) + (+that.deleteIcon.attr('width')),
			top: that.svgHeight - that.coordinate.offsetBottom - that.coordinate.gridYWidth * (that.coordinate.splitY + 1)
		}
		that.svg.click((e) => {
			// 动画时直接返回
			if (this.animateObj && this.animateObj.isActive()) {
				return
			}
			// 边界限定
			// let boundary = this.svg.paper.node.getBoundingClientRect();
			// let point = {
			// 	x: e.clientX - boundary.left,
			// 	y: e.clientY - boundary.top
			// };

			// if(limit.left > point.x || limit.top > point.y || limit.right < point.x || limit.bottom < point.y){
			// 	return
			// }

			this.toggleTip(false);
			this.controlCircle();
			let target = e.target;
			let classString = target.getAttribute('class');
			// 点击折线
			if (classString && classString.includes(classpart)) {
				console.log(classString)

				let classString2 = target.parentElement.getAttribute('class');

				// 点击折线非当前选中折线
				if (!classString2.includes('activeGroup')) {

					this.unselectGroup();
					that.selectGroup(classString2);
				}
				// 点击对象为圆点
				if (target.tagName == 'circle') {
					// 校正选中圆点
					this.controlCircle(classString);
				}
			}
			// 点击删除图标
			else if (classString && classString.includes('deleteIcon')) {

				let classString2 = this.deleteIcon.data('classString');
				// this.deleteIcon.attr({
				// 	'href': this.app.config.basePath + 'resources/images/deleteon.png'
				// })
				let lines = this.app.data.lines;
				let index = lines.indexOf(classString2);
				lines.splice(index, 1);
				this.app.data.lines = lines;
				this.unselectGroup();

			} else {
				this.unselectGroup();
			}

		})
	}

	/**
	 * 解绑svg上的事件
	 */
	unbindEvent() {
		this.svg.unclick();
	}

	/**
	 * 显示折线的选中状态
	 * @param  {[obj]} group [传入需要被显示选中的折线]
	 */
	selectGroup(classString) {

		let group = Snap.select('.' + classString.split(' ').join('.'));
		this.app.data.curSelected = classString;

		group.addClass('activeGroup').toFront();

		group.selectAll('.controlCircle').attr({
			fill: this.app.config.highlightLineColor,
			r: this.app.config.highlightPointRadius
		});
		[...group.selectAll('circle')].map((el) => {
			el.removeClass('hide_dom');
		})
		group.selectAll('.staticPath').attr({
			stroke: this.app.config.highlightLineColor,
			strokeWidth: this.app.config.highlightLineWidth
		});
		this.deleteIcon.attr({
			x: +group.data('x') + this.coordinate.gridXWidth,
			y: +group.data('y') - this.deleteIcon.attr('height') / 2
		}).data({
			classString: group.data('classString')
		}).toFront();
	}

	/**
	 * 取消折线的选中状态
	 * @param  {[obj]} group [传入取消选中的折线（可选）]
	 */
	unselectGroup(group) {
		group = group || Snap.select('.activeGroup');
		if (!group) {
			return
		}

		let color = group.data('color');

		group.removeClass('activeGroup');
		group.selectAll('.controlCircle').attr({
			fill: color,
			r: this.pointRadius
		});

		[...group.selectAll('circle')].map((el, i, arr) => {
			el.hasClass('lastCircle') ? null : el.addClass('hide_dom');
		});

		group.selectAll('.staticPath').attr({
			stroke: color,
			strokeWidth: this.lineWidth
		});
		this.deleteIcon.attr({
			// 'href': this.app.config.basePath + 'resources/images/delete-icon.png',
			x: -1000,
			y: -1000
		}).data({
			classString: ''
		});

		if (this.animateGroup) {
			this.animateGroup.toFront();
		}
		this.app.data.curSelected = '';

	}

	controlCircle(classString) {
		let activedcircle = Snap.select('.activeCircle');
		if (!classString) {
			if (activedcircle) {

				let classString = activedcircle.data('nextClass');
				let parent = activedcircle.parent();

				if (parent.hasClass('activeGroup')) {

					activedcircle.attr({
						fill: this.app.config.highlightLineColor,
						r: this.app.config.highlightPointRadius
					})

				} else {

					activedcircle.attr({
						fill: activedcircle.parent().data('color'),
						r: this.pointRadius
					})

				}
				activedcircle.removeClass('activeCircle');
				if (classString) {
					let nextElement = parent.select('.' + classString.split(' ').join('.'));
					activedcircle.insertBefore(nextElement);
					activedcircle.data({
						nextClass: ''
					})
				}

			}
			this.app.data.curTip = '';
			return
		}
		this.app.data.curTip = classString;
		let group = Snap.select('.activeGroup');
		let currentCircle = group.select('.' + classString.replace(/invisibleCircle/i, 'controlCircle').replace(/invisible/i, '').split(' ').join('.'));
		let position = {
			x: +currentCircle.attr('cx'),
			y: this.coordinate.y - currentCircle.attr('cy') + this.coordinate.offsetBottom + this.app.config.selectedPointRadius
		};

		let value = (Math.round((this.coordinate.y - currentCircle.attr('cy')) / this.coordinate.gridYWidth * 0.2 * 100) / 100).toFixed(2);
		this.toggleTip(true, value, position);

		let nextElement = currentCircle.node.nextElementSibling;

		if (nextElement) {
			currentCircle.data({
				nextClass: nextElement.getAttribute('class')
			})
		}
		currentCircle.addClass('activeCircle').toFront(currentCircle.parent());
		currentCircle.attr({
			r: this.app.config.selectedPointRadius,
			fill: this.app.config.selectCircleColor
		})
	}

	/**
	 * 切换折线上的数值显示
	 * @param  {[bool]} visible  [是否显示数值]
	 * @param  {[string]} value    [显示的字符串数值内容]
	 * @param  {[obj]} position [显示的位置]
	 */
	toggleTip(visible, value, position) {
		if (!visible) {
			this.numberTip.css('display', 'none');
			return this
		}

		this.numberTip.find('i').html(value);
		position.x = parseInt(position.x - this.numberTip.outerWidth() * 0.2);
		this.numberTip.css({
			left: position.x,
			bottom: position.y
		});
		this.numberTip.css('display', 'block');

	}

	/**
	 * 生成id
	 * @return {[string]} [返回随机字符串]
	 */
	uuid() {
		let s = [],
			hexDigits = '0123456789abcdef';
		for (let i = 0; i < 10; i++) {
			s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
		}

		return s.join('');
	}

	/**
	 * 根据lines控制折线的显示
	 * @param  {[arr]} showLines [要显示的线]
	 */
	controlLines(showLines) {
		let hideLines = Snap.selectAll('.lineToShow');
		for (let i = 0; i < hideLines.length; i++) {
			hideLines[i].addClass('hide_dom')
		};

		showLines.map((el) => {
			Snap.select('.' + el).removeClass('hide_dom').toFront();
		})
	}

	/**
	 * 创建绘制svg路径动画对象
	 * @param  {[number]} u1     [静摩擦力]
	 * @param  {[number]} u2     [动摩擦力]
	 * @param  {[number]} weight [压力]
	 * @param  {[number]} speed  [速度]
	 * @return {[object]}        [返回动画对象]
	 */
	drawLine() {

		let u1 = this.app.config.coefficient[this.app.data.curIndex].staticCoefficient;
		let u2 = this.app.config.coefficient[this.app.data.curIndex].dynamicCoefficient;
		let weight = this.app.data.totalWeight;
		let speed = this.app.data.curSpeed;

		let time = this.app.data.totalTime;
		let color = this.app.config.currentLineColor;
		let radius = this.pointRadius;
		let lineWidth = this.app.config.currentLineWidth;
		let f1 = u1 * weight;
		let f2 = u2 * weight;
		let k1 = f1 / 0.2 * (this.coordinate.gridYWidth) / (this.coordinate.gridXWidth * time * 2 / 3);
		let path1 = `M${this.coordinate.x} ${this.coordinate.y}L${this.coordinate.gridXWidth*time*2/3 + this.coordinate.x + this.axisXWidth/2 - this.app.config.currentLineWidth/2} ${this.coordinate.y - f1/0.2*(this.coordinate.gridYWidth) + this.axisYWidth/2}`;
		let path2 = `M${this.coordinate.gridXWidth*time*2/3 + this.coordinate.x + this.axisXWidth/2 - this.app.config.currentLineWidth/2} ${this.coordinate.y - f1/0.2*(this.coordinate.gridYWidth) + this.axisYWidth/2}L${(this.coordinate.gridXWidth*time*2 - this.coordinate.gridXWidth*time*2*5.8/9) + this.coordinate.x + this.axisXWidth/2 - this.app.config.currentLineWidth/2} ${this.coordinate.y - (f2)/0.2*(this.coordinate.gridYWidth) + this.axisYWidth/2}`;
		let path3 = `M${(this.coordinate.gridXWidth*time*2 - this.coordinate.gridXWidth*time*2*5.8/9) + this.coordinate.x + this.axisXWidth/2 - this.app.config.currentLineWidth/2} ${this.coordinate.y - (f2)/0.2*(this.coordinate.gridYWidth) + this.axisYWidth/2}L${this.coordinate.gridXWidth*time*2 + this.coordinate.x} ${this.coordinate.y - (f2)/0.2*(this.coordinate.gridYWidth) + this.axisYWidth/2}`;
		let length1 = Snap.path.getTotalLength(path1);
		let length2 = Snap.path.getTotalLength(path2);
		let length3 = Snap.path.getTotalLength(path3);

		this.animateGroup = this.svg.g().addClass('hide_dom');
		this.animateGroup.add(
			this.svg.path({
				path: path1,
				strokeWidth: lineWidth,
				stroke: color,
				strokeDasharray: length1,
				'stroke-dashoffset': length1
			}).addClass('path1'),
			this.svg.path({
				path: path2,
				strokeWidth: lineWidth,
				stroke: color,
				strokeDasharray: length2,
				'stroke-dashoffset': length2
			}).addClass('path2'),
			this.svg.path({
				path: path3,
				strokeWidth: lineWidth,
				stroke: color,
				strokeDasharray: length3,
				'stroke-dashoffset': length3
			}).addClass('path3')
		);

		let t1 = new TimelineMax({
			data: {
				u1,
				u2,
				weight,
				speed
			},
			onStart: function() {
				console.log('start')
				if (this.animateGroup) {
					this.animateGroup.removeClass('hide_dom');
				}
			},
			onComplete: function() {
				if (this.animateGroup) {
					this.animateGroup.remove();
				}
			},
			onStartScope: this,
			onCompleteScope: this,
			ease: Linear.easeNone,
			paused: true
		});

		t1.to($('.path1'), time / 3, {
				'stroke-dashoffset': 0
			}, 0)
			.addCallback(function() {
				if (this.animateGroup) {
					this.animateGroup.select('.path1').attr({
						'stroke-linecap': 'square'
					})
				}
			}, time / 3, null, this)
			.to($('.path2'), time * 3.2 / 9 - time / 3, {
				'stroke-dashoffset': 0

			})
			.addCallback(function() {
				if (this.animateGroup) {
					this.animateGroup.select('.path2').attr({
						'stroke-linecap': 'square'
					})
				}
			}, time * 3.2 / 9, null, this)
			.to($('.path3'), time * 5.8 / 9, {
				'stroke-dashoffset': 0

			})

		return t1;

	}

	/**
	 * 根据state控制动画状态
	 * @param  {[number]} state [当前动画状态]
	 */
	animateControl(state) {
		switch (state) {
			case this.app.config.INIT_STATE:
				// 动画未初始化
				if (this.animateObj) {

					this.animateGroup ? this.animateGroup.addClass('hide_dom').remove() : null;
					this.animateObj.progress(0);
					this.animateObj.kill();
					this.animateGroup = null;
					this.animateObj = null;
				}
				break;
			case this.app.config.RUN_STATE:
				// 动画开始
				this.toggleTip(false);
				this.unselectGroup();
				if (this.animateObj) {
					this.animateObj.resume();
					return;
				}
				this.animateObj = this.drawLine();
				this.animateObj.play();
				break;
			case this.app.config.PAUSE_STATE:
				// 动画暂停
				if (this.animateObj) {
					this.animateObj.pause();
					if (this.app.config.initStudentMobile && this.app.data.animateProgress) {
						this.animateObj.progress(this.app.data.animateProgress);
					}
				}
				break;
			case this.app.config.COMPLETE_STATE:
				// 动画结束
				if (!this.animateObj) {
					return
				}
				this.animateObj.progress(1);
				let classString = 'line' + this.animateObj.data.u1 * 100 + this.animateObj.data.weight * 10 + this.animateObj.data.speed;
				let lines = this.app.data.lines;
				if (!lines.includes(classString)) {
					lines.push(classString);
				} else {
					let index = lines.indexOf(classString);
					lines.splice(index, 1);
					lines.push(classString);
				}
				this.app.data.lines = lines;
				this.animateObj = null;
				break;
			default:
				break;
		}
	}

	/**
	 * 对传入的多个数组组合后合并成单个数组
	 * @param  {[arr]} arrs [一个数组包含需要被组合的多个数组]
	 * @return {[arr]}      [组合后的单个数组]
	 */
	joinArr(arrs) {
		return arrs.reduce(function(prev, next) {
			var newNums = [];
			for (var i = 0; i < next.length; i++) {
				var a = next[i];
				prev.map(function(el) {

					newNums.push(el + ',' + a);
				})
			};

			return !prev.length ? next : newNums;
		}, []);

	}
}