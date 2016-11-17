declare module 'browserEnvironment' {
	declare function sendMessage(type: string, data: mixed): Promise<any>;
	declare function sendSynchronous(type: string, data: mixed): any;
	declare function addListener(type: string, callback: (data: any) => Promise<mixed> | mixed): void;
}
