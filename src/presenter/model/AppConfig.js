/**
 * 颗粒配置环境
 *
 * @author Tiago
 */
class AppConfig {

	/**
	 * 单例
	 */
	static _inst;

	static getInst() {
		AppConfig._inst = AppConfig._inst || new AppConfig();
		return AppConfig._inst;
	}

	/**
	 * 初始化
	 */
	init( app ) {
		let that = this;
		this.app = app;
		this.fontSize = this.app.$view.find('#layout').css('font-size').replace(/px/,'');
		this.basePath = './';
		
		this.animatePoint = null;
		this.coefficient = [
			{staticCoefficient: 0.6, dynamicCoefficient: 0.4},	// 木-木静摩擦因数与动摩擦因数
			{staticCoefficient: 0.8, dynamicCoefficient: 0.6},  // 木-毛巾静摩擦因数与动摩擦因数
			{staticCoefficient: 0.06, dynamicCoefficient: 0.04} // 木-玻璃静摩擦因数与动摩擦因数
		];

		this.lineColor = {
		[ that['coefficient'][0]['staticCoefficient']]: ['#eb8f35','#c48100', '#aa4801'],
			[ that['coefficient'][1]['staticCoefficient']]: ['#0173a1','#2478dc','#244ddc'],
			[ that['coefficient'][2]['staticCoefficient']]: ['#479600', '#038203', '#015c22']
		}
		//svg绘制参数
		this.currentLineColor = '#FF0000';
		this.currentLineWidth = 5*this.fontSize/24;
		this.highlightLineColor = '#FF0000';
		this.highlightLineWidth = 5*this.fontSize/24;
		this.highlightPointRadius = 7.5*this.fontSize/24;
		this.selectCircleColor = '#FFFC00';
		this.selectedPointRadius = 12*this.fontSize/24;

		this.MAX_LINE_NUM = 3;
		
		this.PULL_MAX = 5;  // 弹簧测力计最大拉力5N
		this.WOOD_WEIGHT = 50;  // 木块重量
		this.IRON_WEIGHT = 100;   // 砝码重量
		this.g = 10;   // g = 10N/KG
		this.STATIC_TIME = 3; // 动画总时间
		this.CONVERSION_TIME = 0.2; // 动画总时间
		this.DYNAMIC_TIME = 5.8; // 动画总时间
		this.TOTAL_TIME = 9; // 动画总时间
		this.WEIGHT_MAX = 2;
		this.INIT_STATE =0;  //动画未开始状态
		this.RUN_STATE =1;   //运动状态
		this.PAUSE_STATE =2;  //暂停状态
		this.COMPLETE_STATE =3;  //动画结束状态
		this.SINGLE_SPEED =1;  //一倍速度
		this.DOUBLE_SPEED =2;  //二倍速度

		return this;
	}

	destroy() {
		AppConfig._inst = null;
	}

}


export default AppConfig;