import BaseControl from './BaseControl'

export default class FunctionControl extends BaseControl {
	/**
	 * 单例
	 */
	static _inst;

	static getInst() {
		FunctionControl._inst = FunctionControl._inst || new FunctionControl();

		return FunctionControl._inst;
	}

	/**
	 * 构造
	 */
	constructor() {
		super();
	}

	/**
	 * 初始化事件
	 */
	init(app){
		this.app = app;   //绑定AppControl到当前对象
		this.$reduce = this.app.$view.find(".reduceWeight.weightCom");  //减少砝码按钮
		this.$plus = this.app.$view.find(".plusWeight.weightCom");   //添加砝码按钮
		this.$startButton = this.app.$view.find(".list-middle li:eq(0)");     //开始按钮
		this.$resumeButton = this.app.$view.find(".list-middle li:eq(1)");   //复位按钮
		this.$speed = this.app.$view.find(".list-right");  //速度按钮
		this.$singleSpeed = this.$speed.children().eq(0);   //初始速度按钮
		this.$doubleSpeed = this.$speed.children().eq(1);   //二倍速度按钮
		this.$aside = this.app.$view.find(".frictionalForce_aside ul");    //侧边栏材质按钮
		this.$starSport = this.app.$view.find(".list-middle li:eq(0) span");   //span开始文字
		this.$prompt = this.app.$view.find(".prompt-sport");   //提示框
		this.$weight1 = this.app.$view.find(".farmar-top").eq(0);  //第一个砝码
		this.$weight2 = this.app.$view.find(".farmar-top").eq(1);   //第二个砝码
		this.$weight = this.app.$view.find(".weightObject");
		this.$farmar = this.app.$view.find('.farmar');
		this.$frictionalForce = this.app.$view.find(".frictionalForce_scene")  //frictionalForce_scene

		this.$reduce.click(this.clickReduce.bind(this));   //取下砝码绑定事件
		this.$weight.on("click","div",this.clickReduce.bind(this));  //取下砝码绑定事件
		this.$plus.click(this.clickPlus.bind(this));   //添加砝码绑定事件
		this.$farmar.click(this.clickPlus.bind(this)); //添加砝码绑定事件
		this.$startButton.click(this.clickStart.bind(this));   //开始按钮绑定事件
		this.$resumeButton.click(this.clickResume.bind(this))   //复位按钮绑定事件
		this.$speed.on("click","li",this.clickSpeed.bind(this));   //切换速度绑定事件
		this.$aside.on("click","li",this.textureSwitch.bind(this));   //切换材质绑定事件
		let image = new Image();
		image.src = this.app.config.basePath + 'resources/images/woodblock-towel.png';
		return this;
	}

	/**
	 * 减少砝码
	 */
	clickReduce(){
		if(this.app.data.curWeight===0){
			return;
		}
		if(this.app.data.curState==this.app.config.RUN_STATE||this.app.data.curState==this.app.config.PAUSE_STATE){//过程中
			this.popPropmt();
			return;
		}
		this.app.data.curWeight-=1;
		if(this.app.data.curState===this.app.config.COMPLETE_STATE){
			this.app.data.curState=this.app.config.INIT_STATE;
		}
	}

	/**
	 * 添加砝码
	 */
	clickPlus(){
		if(this.app.data.curWeight===this.app.config.WEIGHT_MAX){
			return;
		}
		if(this.app.data.curState==this.app.config.RUN_STATE||this.app.data.curState==this.app.config.PAUSE_STATE){//过程中
			this.popPropmt();
			return;
		}
		this.app.data.curWeight+=1;
		if(this.app.data.curState===this.app.config.COMPLETE_STATE){
			this.app.data.curState=this.app.config.INIT_STATE;
		}
	}

	/**
	 * 点击开始按钮
	 */
	clickStart(){
		//点击开始按钮后的状态
		if(this.app.data.curState!=this.app.config.RUN_STATE){  //若动画不是运动状态，点击后变为运动状态
			this.app.data.curState=this.app.config.RUN_STATE;
		}else {
			this.app.data.curState=this.app.config.PAUSE_STATE;   //若动画为运动状态，点击后变为暂停状态
		}
	}


	/**
	 * 点击复位按钮
	 */
	clickResume(){
		if(this.app.data.curState===this.app.config.INIT_STATE){
			return;
		}
        this.clearPopPropmt();
		this.app.data.curState=this.app.config.INIT_STATE;
	}

	/**
	 * 点击速度按钮
	 */
	clickSpeed(e){
		let $target = $(e.currentTarget);
		if($target.children().hasClass("ui_btn_active")){
			return;
		}
		if(this.app.data.curState==this.app.config.RUN_STATE||this.app.data.curState==this.app.config.PAUSE_STATE){//过程中
			this.popPropmt();
			return;
		}
		if(this.app.data.curState===this.app.config.COMPLETE_STATE){
			this.app.data.curState=this.app.config.INIT_STATE;
		}
		let index = Number($target.attr("data-index"));
		if(index===1){
			this.app.data.curSpeed=this.app.config.SINGLE_SPEED;
		}else {
			this.app.data.curSpeed=this.app.config.DOUBLE_SPEED;
		}
	}

	/**
	 * 切换材质按钮
	 * 1出现提示框 2更改curIndex 3木块和弹簧测力计回到初始位置，其他条件不变
	 */
	textureSwitch(e){
		let $target = $(e.currentTarget);
		if($target.hasClass("active")){
			return;
		}
		if(this.app.data.curState === this.app.config.RUN_STATE ||this.app.data.curState === this.app.config.PAUSE_STATE){//过程中
			this.popPropmt();
			return;
		}
		let index = Number($target.attr("index"));  //curIndex 0:plank,1:tower,2:glass
		this.app.data.curIndex = index;
		if(this.app.data.curState === this.app.config.COMPLETE_STATE){
			this.app.data.curState = this.app.config.INIT_STATE;
		}
	}

	/**
	 * 修改砝码按钮的颜色和显示砝码
	 * @param curWeight
	 */
	watchWeightChange(curWeight){
		if(curWeight===0){
			this.$weight1.hide();
			this.$weight2.hide();
			this.$reduce.addClass("disabled");
			this.$plus.removeClass("disabled");
		}else if(curWeight===1){
			this.$weight1.css("left","3.6em");
			this.$weight1.show();
			this.$weight2.hide();
			this.$reduce.removeClass("disabled")
			this.$plus.removeClass("disabled")
		}else {
			this.$weight1.css("left","1.6em");
			this.$weight1.show();
			this.$weight2.show();
			this.$reduce.removeClass("disabled");
			this.$plus.addClass("disabled");
		}
	}

	watchStart(state){
		switch(state){
			case 0:
				this.renderStart(this.app.i18N.i18nData["btn_start"],state);
				break;
			case 1:
				this.renderStart(this.app.i18N.i18nData["btn_pause"],state);
				break;
			case 2:
				this.renderStart(this.app.i18N.i18nData["btn_continue"],state);
				break;
			case 3:
				this.renderStart(this.app.i18N.i18nData["btn_start"],state);
		}
	}

	watchSpeed(speed){
		this.$singleSpeed.children().removeClass("ui_btn_active")
		this.$doubleSpeed.children().removeClass("ui_btn_active")
		if(speed===this.app.config.SINGLE_SPEED){
			this.$singleSpeed.children().addClass("ui_btn_active")
		}else{
			this.$doubleSpeed.children().addClass("ui_btn_active")
		}
	}

	watchTexture(index){
		//修改侧边栏的选中状态
		this.$aside.children().removeClass("active");
		this.$aside.children().eq(index).addClass("active");
		//修改frictionalForce_scene
		let name = index===0?"frictional-wood":(index===1?"frictional-towel":"frictional-glass");
		name = "frictionalForce_scene "+name;
		this.$frictionalForce.attr("class",name);
		//切换到当前材质预设
		$("bg div").eq(index).show().siblings().hide();
	}

	renderStart(text,state){
		this.$starSport.html(text);
		//修改开始和复位按钮的颜色
		this.$resumeButton.find("a").removeClass("click_disabled");
		this.$startButton.find("a").removeClass("btn_active");
		if(state===0){//复位按钮
			this.$resumeButton.find("a").addClass("click_disabled");
		}
		if(state===1){//暂停按钮
			this.$startButton.find("a").addClass("btn_active");
		}
	}


	/**
	 * 提示框
	 */
	popPropmt() {
		this.$prompt.show();
		if(!this.timeout){
			this.timeout = setTimeout(function(){
				this.clearPopPropmt();
			}.bind(this),1000)
		}
	}


    /**
     * 取消定时器
     */
    clearPopPropmt(){
        this.$prompt.hide();
        this.timeout=null;  //这里不使用clearTimeout，因为本来要执行的动作已经执行完，并且需要将this.clearTimeout置为null
    }


	/**
	 * 析构
	 */
	destroy(){
		FunctionControl._inst = null;
	}

}