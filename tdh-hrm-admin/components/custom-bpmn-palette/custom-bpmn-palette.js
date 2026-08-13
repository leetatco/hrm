// CustomPalette.js
export default class CustomPalette {
  constructor(create, elementFactory, palette, translate) {
    this.create = create;
    this.elementFactory = elementFactory;
    this.translate = translate;
    palette.registerProvider(this); // 将此提供者注册到palette
  }

  // 此函数是绘制工具栏的核心，返回工具栏的所有条目
  getPaletteEntries() {
    const { create, elementFactory, translate } = this;

    // 创建一个用于拖拽和点击事件的工厂函数
    const createTask = (type = 'bpmn:Task') => (event) => {
      const shape = elementFactory.createShape({ type: type });
      create.start(event, shape);
    };

    // 返回的对象定义了工具栏条目
    return {
      // 定义一个名为"create.cake"的工具栏条目
      'create.cake': {
        group: 'activity', // 条目所属分组，例如 'activity', 'event'
        className: 'icon-custom bpmn-icon-cake', // 自定义CSS类
        title: translate('创建自定义任务节点'), // 鼠标悬停提示
        action: { // 用户操作时触发的事件
          dragstart: createTask('bpmn:Task'),
          click: createTask('bpmn:Task')
        }
      }
      // 你可以在此处继续添加更多自定义条目...
    };
  }
}

// 依赖注入
CustomPalette.$inject = [
  'create',
  'elementFactory',
  'palette',
  'translate'
];