// Utility để handle Zalo SDK một cách an toàn
export class ZaloSDKWrapper {
  private static isZaloApp(): boolean {
    // Kiểm tra xem có đang chạy trong Zalo app không
    const userAgent = navigator.userAgent || '';
    return userAgent.includes('ZaloApp') || 
           userAgent.includes('Zalo') ||
           !!(window as any).ZaloJavaScriptInterface ||
           !!(window as any).webkit?.messageHandlers?.ZaloJavaScriptInterface;
  }

  private static isZaloSDKReady(): boolean {
    return typeof window !== 'undefined' && 
           !!window.ZMP && 
           typeof window.ZMP.getAccessToken === 'function';
  }

  static async getAccessToken(): Promise<string | null> {
    try {
      // Chỉ thử lấy access token nếu đang trong Zalo app và SDK ready
      if (!this.isZaloApp() || !this.isZaloSDKReady()) {
        console.log('🔧 Not in Zalo app or SDK not ready');
        return null;
      }

      if (!window.ZMP) {
        return null;
      }

      const token = await window.ZMP.getAccessToken();
      return token;
    } catch (error) {
      console.warn('⚠️ Failed to get Zalo access token:', error);
      return null;
    }
  }

  static async getUserInfo(): Promise<any> {
    try {
      if (!this.isZaloApp() || !this.isZaloSDKReady()) {
        return null;
      }

      if (!window.ZMP) {
        return null;
      }

      const userInfo = await window.ZMP.getUserInfo();
      return userInfo;
    } catch (error) {
      console.warn('⚠️ Failed to get user info:', error);
      return null;
    }
  }

  static createTestUser(): { zaloId: string; name: string; avatar: string } {
    return {
      zaloId: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: 'Test User',
      avatar: ''
    };
  }
}

// Extend window type for ZMP
declare global {
  interface Window {
    ZMP?: {
      getAccessToken: () => Promise<string>;
      getUserInfo: () => Promise<any>;
      showOAWidget?: () => Promise<any>;
    };
    ZaloJavaScriptInterface?: any;
    webkit?: {
      messageHandlers?: {
        ZaloJavaScriptInterface?: any;
      };
    };
  }
}
