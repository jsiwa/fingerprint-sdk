/**
 * Fingerprint SDK V5 (Enterprise Grade)
 * 集成 Iframe 隔离采样、CSS 字体测量、WebGPU 和高级反调试
 */

export interface FingerprintResult {
  visitorId: string;
  confidence: number;
  isBot: boolean;
  components: Record<string, any> | null;
  meta: { version: string; duration: string };
}

export interface GetOptions {
  debug?: boolean;
  timeout?: number;
}

// MurmurHash3
function x64hash128(key: string, seed: number): string {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < key.length; i++) {
    ch = key.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

// 辅助：在 Iframe 中运行代码以规避简单的全局 Hook
async function withIframe(callback: (win: Window, doc: Document) => Promise<any> | any): Promise<any> {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  try {
    const win = iframe.contentWindow;
    const doc = iframe.contentDocument;
    if (win && doc) {
      return await callback(win, doc);
    }
  } catch (e) {
    return null;
  } finally {
    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
  }
}

const components = {
  // [新] 屏幕指纹
  screen: () => {
    // 只使用“屏幕/设备层面”的相对稳定参数，避免把“视口大小”(innerWidth/innerHeight)
    // 这种会随窗口缩放变化的值混入 visitorId
    const s = window.screen;
    const orientation =
      (s.orientation && typeof s.orientation.type === 'string' ? s.orientation.type : '') || '';

    const dpr = typeof window.devicePixelRatio === 'number' ? window.devicePixelRatio : 1;

    return [
      s.width,
      s.height,
      // s.availWidth,
      // s.availHeight,
      s.colorDepth,
      // pixelDepth 在部分浏览器可能不存在
      (s as any).pixelDepth ?? 0,
      // dpr 可能会受系统缩放/浏览器缩放影响，但不会随“拖动窗口大小”变化
      dpr,
      orientation
    ].join('x');
  },

  // [增强] WebGPU (高熵值)
  webgpu: async () => {
    if (!(navigator as any).gpu) return 'unsupported';
    try {
      const adapter = await (navigator as any).gpu.requestAdapter();
      if (!adapter) return 'no_adapter';
      const info = await adapter.requestAdapterInfo();
      return `${info.vendor};${info.architecture};${info.device};${info.description}`;
    } catch (e) {
      return 'security_error';
    }
  },

  // [重写] 字体指纹：CSS 宽度测量法 (比 fonts.check 更难伪造)
  fonts: async () => {
    return withIframe((win, doc) => {
      const baseFonts = ['monospace', 'sans-serif', 'serif'];
      const fontList = [
        // Windows
        'Segoe UI', 'Calibri', 'Cambria', 'Consolas', 'MS Gothic', 'SimSun',
        // Mac
        'San Francisco', 'Helvetica Neue', 'Monaco', 'Menlo', 'PingFang SC',
        // Linux
        'Ubuntu', 'Roboto', 'DejaVu Sans', 'Liberation Serif',
        // Other
        'Arial', 'Verdana', 'Times New Roman'
      ];
      
      const testString = "mmMwWli";
      const testSize = "72px";
      const h = doc.body;

      // 建立基准宽度
      const baseWidths: Record<string, number> = {};
      const span = doc.createElement("span");
      span.style.fontSize = testSize;
      span.style.visibility = "hidden";
      span.innerHTML = testString;
      
      for (const base of baseFonts) {
        span.style.fontFamily = base;
        h.appendChild(span);
        baseWidths[base] = span.offsetWidth;
        h.removeChild(span);
      }

      const detected = [];
      for (const font of fontList) {
        let matched = false;
        for (const base of baseFonts) {
          span.style.fontFamily = `'${font}', ${base}`;
          h.appendChild(span);
          if (span.offsetWidth !== baseWidths[base]) {
            matched = true;
          }
          h.removeChild(span);
          if (matched) break;
        }
        if (matched) detected.push(font);
      }
      return detected.join(',');
    });
  },

  // [增强] Canvas (使用 Iframe 绕过部分污染)
  canvas: async () => {
    return withIframe((win, doc) => {
      const canvas = doc.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return 'unsupported';
      
      canvas.width = 280;
      canvas.height = 60;
      
      // 复杂的混合模式和 Winding Rule
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      
      ctx.fillStyle = "#069";
      ctx.font = "11pt no-real-font-123";
      ctx.fillText("Cwm fjordbank glyphs vext quiz, \ud83d\ude03", 2, 15);
      
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.font = "18pt Arial";
      ctx.fillText("Cwm fjordbank glyphs vext quiz, \ud83d\ude03", 4, 45);

      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = "rgb(255,0,255)";
      ctx.beginPath();
      ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
      ctx.arc(50, 50, 26, 0, Math.PI * 2, true);
      ctx.fill("evenodd");

      return canvas.toDataURL();
    });
  },

  // [增强] Audio (Iframe 隔离)
  audio: async () => {
    return withIframe(async (win) => {
      const AudioCtx = (win as any).OfflineAudioContext || (win as any).webkitOfflineAudioContext;
      if (!AudioCtx) return 'unsupported';
      
      const ctx = new AudioCtx(1, 44100, 44100);
      const osc = ctx.createOscillator();
      osc.type = 'triangle'; // triangle 比 sine 包含更多谐波，差异更明显
      osc.frequency.value = 10000;
      
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -50;
      comp.knee.value = 40;
      comp.ratio.value = 12;
      comp.attack.value = 0;
      comp.release.value = 0.25;
      
      osc.connect(comp);
      comp.connect(ctx.destination);
      osc.start(0);
      
      const buffer = await ctx.startRendering();
      // 使用更精确的求和逻辑
      let sum = 0;
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
          sum += Math.abs(data[i]);
      }
      return sum.toString();
    });
  },

  // WebGL 保持原样 (很好了)
  webgl: () => {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext;
    if (!gl) return 'none';
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'masked';
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'masked';
    return `${vendor}~${renderer}`;
  },

  // [新] 机器人/篡改 综合评分
  security: () => {
    const checks = [];
    if (navigator.webdriver) checks.push('webdriver');
    if ((navigator as any).languages === '') checks.push('no_lang');
    if (window.outerWidth === 0 && window.outerHeight === 0) checks.push('headless_dim');
    if (navigator.plugins.length === 0) checks.push('no_plugins');
    
    // 检查 toString 篡改
    try {
        if (Function.prototype.toString.toString().includes('native code') === false) checks.push('toString_hook');
    } catch(e) {}
    
    return checks.length > 0 ? checks.join(',') : 'clean';
  },
  
  // 硬件并发与内存
  hardware: () => {
     return `${navigator.hardwareConcurrency || 0}|${(navigator as any).deviceMemory || 0}`;
  }
};

export default class FingerprintSDK {
  static async get(options: GetOptions = {}): Promise<FingerprintResult> {
    const start = performance.now();
    const results: Record<string, any> = {};
    const entropyValues: string[] = [];

    // 并行收集
    const promises = Object.entries(components).map(async ([key, fn]) => {
      try {
        // 设置超时，防止某个 API 卡死 (如 AudioContext 在某些隐私设置下)
        const timeoutPromise = new Promise(resolve => setTimeout(() => resolve('timeout'), 1000));
        const result = await Promise.race([fn(), timeoutPromise]);
        return { key, value: result };
      } catch (err: any) {
        return { key, value: `err_${err.name || 'unknown'}` };
      }
    });

    const settled = await Promise.all(promises);
    
    settled.forEach(({ key, value }) => {
      results[key] = value;
      // security 项不参与 ID 计算，只作为元数据
      if (key !== 'security') {
        entropyValues.push(`${key}:${value}`);
      }
    });

    entropyValues.sort();
    const rawString = entropyValues.join('|');
    const visitorId = x64hash128(rawString, 999);

    return {
      visitorId,
      confidence: results.security === 'clean' ? 0.95 : 0.5,
      isBot: results.security !== 'clean',
      components: options.debug ? results : null,
      meta: {
        version: "5.0.0",
        duration: Math.round(performance.now() - start) + 'ms'
      }
    };
  }
}