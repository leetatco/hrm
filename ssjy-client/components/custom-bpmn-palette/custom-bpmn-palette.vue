<template>
	<view class="page-body">
		<view class="bpmn-designer">
			<!-- 确保容器有明确的尺寸 -->
			<div class="canvas-container">
				<div class="canvas" ref="canvas"></div>
			</div>
			<div class="properties-panel" id="js-properties-panel"></div>
			<!-- 添加加载状态提示 -->
			<view v-if="loading" class="loading-state">
				<text>BPMN设计器加载中...</text>
			</view>
			<view v-if="error" class="error-state">
				<text>加载失败: {{ error }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	// 引入 BPMN 相关的模块
	import BpmnModeler from 'bpmn-js/lib/Modeler';
	import propertiesPanelModule from 'bpmn-js-properties-panel';
	import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda';
	import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json';
	import customModule from '@/components/custom-bpmn-palette/custom-bpmn-palette.js';

	export default {
		// 接受父组件的值
		props: {
			inputxml: {
				type: String,
				required: true,
				default: ''
			}
		},
		data() {
			return {
				bpmnModeler: null,
				xmlString: '',
				isInitialized: false,
				loading: false,
				error: null,
				initAttempts: 0,
				maxInitAttempts: 3
			};
		},
		watch: {
			// 监听 inputxml 变化
			inputxml: {
				immediate: true,
				handler(newVal) {
					console.log('Input XML changed:', newVal ? 'has value' : 'empty');
					if (newVal) {
						this.xmlString = newVal;
						if (this.isInitialized) {
							this.reloadBpmn();
						}
					}
				}
			}
		},
		mounted() {
			console.log('BPMN Component mounted');
			this.initBpmnWithRetry();
		},
		beforeDestroy() {
			console.log('BPMN Component destroying');
			if (this.bpmnModeler) {
				this.bpmnModeler.destroy();
				this.bpmnModeler = null;
			}
		},
		methods: {
			async initBpmnWithRetry() {
				this.loading = true;
				this.error = null;
				
				try {
					await this.initializeBpmn();
					this.loading = false;
				} catch (err) {
					console.error('Initialization failed:', err);
					this.initAttempts++;
					
					if (this.initAttempts < this.maxInitAttempts) {
						console.log(`Retrying initialization (${this.initAttempts}/${this.maxInitAttempts})...`);
						setTimeout(() => {
							this.initBpmnWithRetry();
						}, 500);
					} else {
						this.error = `初始化失败: ${err.message}`;
						this.loading = false;
					}
				}
			},
			
			async initializeBpmn() {
				return new Promise((resolve, reject) => {
					// 使用 nextTick 确保 DOM 更新
					this.$nextTick(async () => {
						try {
							// 检查 canvas 元素
							if (!this.$refs.canvas) {
								throw new Error('Canvas 元素未找到');
							}
							
							console.log('Canvas element found:', this.$refs.canvas);
							
							// 检查元素是否在 DOM 中且有尺寸
							const canvasElement = this.$refs.canvas;
							if (!canvasElement.offsetParent) {
								throw new Error('Canvas 元素不在可视 DOM 中');
							}
							
							// 初始化 BPMN 模型器
							this.bpmnModeler = new BpmnModeler({
								container: canvasElement,
								propertiesPanel: {
									parent: '#js-properties-panel'
								},
								additionalModules: [
									propertiesPanelModule,
									propertiesProviderModule,
									customModule
								],
								moddleExtensions: {
									camunda: camundaModdleDescriptor
								}
							});

							// 监听 BPMN 事件
							this.bpmnModeler.on('import.done', (event) => {
								console.log('BPMN import successful');
								if (!event.error) {
									const canvas = this.bpmnModeler.get('canvas');
									canvas.zoom('fit-viewport');
								}
							});

							this.isInitialized = true;
							console.log('BPMN modeler initialized successfully');

							// 加载 XML
							const xmlToLoad = this.xmlString || this.inputxml;
							if (xmlToLoad && xmlToLoad.trim()) {
								await this.loadDiagram(xmlToLoad);
							} else {
								await this.loadDefaultDiagram();
							}
							
							resolve();
						} catch (err) {
							reject(err);
						}
					});
				});
			},
			
			async loadDiagram(xml) {
				try {
					console.log('Loading diagram from XML');
					const result = await this.bpmnModeler.importXML(xml);
					
					if (result.warnings && result.warnings.length > 0) {
						console.warn('XML import warnings:', result.warnings);
					}
					
					console.log('Diagram loaded successfully');
					
				} catch (err) {
					console.error('Error loading XML:', err);
					// 尝试加载默认图表
					await this.loadDefaultDiagram();
					throw err;
				}
			},
			
			async loadDefaultDiagram() {
				const defaultXML = `<?xml version="1.0" encoding="UTF-8"?>
				<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" 
				             xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
				             xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
				             targetNamespace="http://bpmn.io/schema/bpmn">
				  <process id="Process_1" isExecutable="false">
				    <startEvent id="StartEvent_1"/>
				  </process>
				  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
				    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
				      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
				        <dc:Bounds x="173" y="102" width="36" height="36"/>
				      </bpmndi:BPMNShape>
				    </bpmndi:BPMNPlane>
				  </bpmndi:BPMNDiagram>
				</definitions>`;
				
				try {
					await this.bpmnModeler.importXML(defaultXML);
					console.log('Default diagram loaded');
				} catch (err) {
					console.error('Error loading default diagram:', err);
					throw err;
				}
			},
			
			async reloadBpmn() {
				if (!this.isInitialized || !this.bpmnModeler) {
					console.warn('BPMN not initialized, skipping reload');
					return;
				}
				
				try {
					if (this.xmlString && this.xmlString.trim() !== '') {
						await this.loadDiagram(this.xmlString);
					} else {
						await this.loadDefaultDiagram();
					}
				} catch (err) {
					console.error('Error reloading BPMN:', err);
				}
			},
			
			async diagramToXml() {
				if (!this.bpmnModeler) {
					console.error('BPMN modeler not initialized');
					return null;
				}
				
				try {
					const { xml } = await this.bpmnModeler.saveXML({ format: true });
					this.xmlString = xml;
					uni.showToast({
						title: '流程定义转XML成功！',
						icon: 'success'
					});
					return xml;
				} catch (err) {
					console.error('Error saving diagram:', err);
					uni.showToast({
						title: '流程定义转XML失败！',
						icon: 'error'
					});
					return null;
				}
			},
			
			// 手动重新初始化方法
			reinitialize() {
				this.isInitialized = false;
				this.initAttempts = 0;
				if (this.bpmnModeler) {
					this.bpmnModeler.destroy();
					this.bpmnModeler = null;
				}
				this.initBpmnWithRetry();
			}
		}
	};
</script>

<style lang="scss" scoped>
	.page-body {
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
	}
	
	.bpmn-designer {
		flex: 1;
		height: 100%;
		width: 100%;
		position: relative;
		display: flex;
		flex-direction: column;
		background: #f5f5f5;
		border: 1px solid #ddd;
		border-radius: 4px;
		overflow: hidden;
	}

	.canvas-container {
		flex: 1;
		height: 100%;
		width: 100%;
		min-height: 500px;
		position: relative;
	}

	.canvas {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100%;
		height: 100%;
		background: white;
	}

	.properties-panel {
		position: absolute;
		top: 0;
		right: 0;
		width: 300px;
		height: 100%;
		overflow: auto;
		background: #f8f9fa;
		border-left: 1px solid #ddd;
		box-shadow: -2px 0 5px rgba(0,0,0,0.1);
		z-index: 10;
	}

	.loading-state, .error-state {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		padding: 20px;
		background: white;
		border-radius: 4px;
		box-shadow: 0 2px 10px rgba(0,0,0,0.1);
		z-index: 100;
		text-align: center;
	}

	.loading-state {
		color: #666;
	}

	.error-state {
		color: #f56c6c;
		background: #fef0f0;
		border: 1px solid #fbc4c4;
	}
</style>