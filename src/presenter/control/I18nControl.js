/**
 * 功能控制器
 */
import lang from '../../resources/locations/zh/lang.json';

export default class I18NControl {
    /**
     * 单例
     */
    static _inst;

    static getInst() {
        I18NControl._inst = I18NControl._inst || new I18NControl();
        return I18NControl._inst;
    }

    /**
     * 构造
     */
    constructor() {
        this.i18nData = lang;
    }

    /**
     * 析构
     */
    destroy() {
        I18NControl._inst = null;
    }

    /**
     * 初始化事件
     */
    init(app) {
        this.app = app;
        //TODO 多语言初始化事件
        let data = this.i18nData;
        this.$start = this.app.$view.find(".list-middle .btns-primary-txt:eq(0)");
        this.$reset = this.app.$view.find(".list-middle .btns-primary-txt:eq(1)");
        this.$initSpeed = this.app.$view.find(".list-right .btns-primary-txt:eq(0)");
        this.$doubleSpeed = this.app.$view.find(".list-right .btns-primary-txt:eq(1)");
        this.$wood = this.app.$view.find(".woodMenu .btn-txt");
        this.$towel = this.app.$view.find(".towelMenu .btn-txt");
        this.$glass = this.app.$view.find(".glassMenu .btn-txt");
        this.$msg = this.app.$view.find(".pullObject .con-detail");

        this.$start.text(data['btn_start']);
        this.$reset.text(data['btn_reset']);
        this.$initSpeed.text(data['btn_init_speed']);
        this.$doubleSpeed.text(data['btn_double_speed']);
        this.$wood.text(data['btn_wood']);
        this.$towel.text(data['btn_towel']);
        this.$glass.text(data['btn_glass']);
        this.$msg.text(data['msg_animate']);
        //test

        return this;
    }

}