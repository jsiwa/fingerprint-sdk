/**
 * Fingerprint SDK V5 (Enterprise Grade)
 * 集成 Iframe 隔离采样、CSS 字体测量、WebGPU 和高级反调试
 */
interface FingerprintResult {
    visitorId: string;
    confidence: number;
    isBot: boolean;
    components: Record<string, any> | null;
    meta: {
        version: string;
        duration: string;
    };
}
interface GetOptions {
    debug?: boolean;
    timeout?: number;
}
declare class FingerprintSDK {
    static get(options?: GetOptions): Promise<FingerprintResult>;
}

export { type FingerprintResult, type GetOptions, FingerprintSDK as default };
