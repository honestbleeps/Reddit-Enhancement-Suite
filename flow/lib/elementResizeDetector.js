declare module 'element-resize-detector' {
	declare class ElementResizeDetector {
		listenTo(element: HTMLElement, callback: (e: HTMLElement) => void): void;
		removeListener(element: HTMLElement, callback: (e: HTMLElement) => void): void;
		removeAllListeners(element: HTMLElement): void;
		uninstall(element: HTMLElement): void;
	}

	declare class ElementResizeDetectorFactory {
		(options?: { strategy: 'scroll' | 'object' }): ElementResizeDetector;
	}

	declare var exports: ElementResizeDetectorFactory;
}
