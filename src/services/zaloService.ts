// Hàm lấy access token từ Zalo SDK, export cho FE dùng
export const getAccessToken = async (): Promise<string | null> => {
  try {
    const tokenResponse = await zmpGetAccessToken();
    return (tokenResponse as any).accessToken || (tokenResponse as string) || null;
  } catch (e) {
    return null;
  }
};
import { getUserInfo as zmpGetUserInfo, authorize, getPhoneNumber, getAccessToken as zmpGetAccessToken } from 'zmp-sdk/apis';
import { API_BASE } from '@/config/zalo';
// Lấy thông tin user từ backend (API /api/users/me)
// Lấy token từ localStorage hoặc nơi bạn lưu sau khi đăng nhập
const getToken = () => {
  return localStorage.getItem('token');
};

export const getUserInfo = async () => {
  const token = getToken();
  if (!token) {
    // Không log lỗi ra console nữa, chỉ trả về null để FE tự xử lý
    return null;
  }

  const response = await fetch(`${API_BASE}/api/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) return null;
  return response.json();
}

// Function decode phone token trên Frontend (IP Việt Nam)
const decodePhoneToken = async (phoneToken: string, accessToken: string) => {
  const SECRET_KEY = '7BWPKw3F6cKn5YMABoLD'; // Secret key từ Zalo Developer Console
  try {
    // Thử endpoint chính với secret_key
    const url = `https://graph.zalo.me/v2.0/me/info?access_token=${accessToken}&code=${phoneToken}&secret_key=${SECRET_KEY}&fields=id,name,picture`;
    console.log('Calling Zalo API with secret_key:', url);
    const response = await fetch(url);
    console.log('API response status:', response.status);
    const data = await response.json();
    console.log('Frontend phone decode response:', data);
    if (data.error === 0 && data.data && data.data.number) {
      console.log('✅ Successfully decoded phone:', data.data.number);
      return data.data.number;
    } else {
      console.log('❌ Phone decode failed. Error:', data.error, 'Message:', data.message);
    }
    return null;
  } catch (error) {
    console.error('Frontend phone decode error:', error);
    return null;
  }
};

// Flow đăng nhập chính
export const handleZaloLogin = async () => {
  try {
    console.log('Bắt đầu đăng nhập Zalo...');
    // 1. Xin quyền
    await authorize({ 
      scopes: ['scope.userInfo', 'scope.userPhonenumber'] 
    });
    // 2. Lấy thông tin user
    const userInfo = await zmpGetUserInfo({
      autoRequestPermission: true
    });
    console.log('User info from Zalo:', userInfo);
    // 3. Lấy access token
    let accessToken: string | null = null;
    try {
      const tokenResponse = await zmpGetAccessToken();
      accessToken = (tokenResponse as any).accessToken || (tokenResponse as string);
      console.log('Access token:', accessToken);
    } catch (tokenError) {
      console.log('Cannot get access token:', tokenError);
    }
    // 4. Decode phone trên Frontend (IP Việt Nam)
    let phoneNumber: string | null = null;
    console.log('=== PHONE DECODE PROCESS START ===');
    try {
      console.log('Step 1: About to call getPhoneNumber()...');
      const phoneResult = await getPhoneNumber();
      console.log('Step 2: Phone result received:', phoneResult);
      const phoneToken = phoneResult?.token || null;
      console.log('Step 3: Phone token extracted:', phoneToken);
      console.log('Step 4: Access token available:', accessToken);
      if (phoneToken && accessToken) {
        console.log('Step 5: Both tokens available, calling decodePhoneToken...');
        phoneNumber = await decodePhoneToken(phoneToken, accessToken);
        console.log('Step 6: Decoded phone number result:', phoneNumber);
      } else {
        console.log('Step 5: Missing tokens!', { 
          hasPhoneToken: !!phoneToken, 
          hasAccessToken: !!accessToken,
          phoneToken: phoneToken,
          accessToken: accessToken 
        });
        // Nếu không có phoneToken, thử lại sau 1 giây
        if (!phoneToken && accessToken) {
          console.log('Step 5.1: Retrying getPhoneNumber after 1 second...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          try {
            const retryPhoneResult = await getPhoneNumber();
            console.log('Step 5.2: Retry phone result:', retryPhoneResult);
            const retryPhoneToken = retryPhoneResult?.token || null;
            if (retryPhoneToken) {
              console.log('Step 5.3: Retry successful, decoding...');
              phoneNumber = await decodePhoneToken(retryPhoneToken, accessToken);
              console.log('Step 5.4: Retry decoded phone:', phoneNumber);
            }
          } catch (retryError) {
            console.log('Step 5.5: Retry failed:', retryError);
          }
        }
      }
    } catch (phoneError) {
      console.error('=== PHONE DECODE ERROR ===');
      console.error('Error details:', phoneError);
      if (phoneError instanceof Error) {
        console.error('Error message:', phoneError.message);
        console.error('Error stack:', phoneError.stack);
      }
    }
    console.log('=== PHONE DECODE PROCESS END ===');
    console.log('Final phoneNumber:', phoneNumber);
    // 5. Validate userInfo
    if (!userInfo || !userInfo.userInfo) {
      throw new Error('Không thể lấy thông tin user từ Zalo');
    }
    console.log('Full userInfo structure:', JSON.stringify(userInfo, null, 2));
    console.log('userInfo.userInfo:', JSON.stringify(userInfo.userInfo, null, 2));
    // 6. Gửi phoneNumber lên Backend (KHÔNG phải phoneToken)
    const requestData = {
      userInfo: userInfo.userInfo,  // ✅ Lấy nested userInfo ra
      accessToken,
      phoneNumber // ← GỬI PHONE NUMBER THAY VÌ phoneToken
    };
    console.log('Sending to backend:', requestData);
    const response = await fetch(`${API_BASE}/api/zalo/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    const result = await response.json();
    console.log('Backend response:', result);
    if (result.success) {
      console.log('Đăng nhập thành công:', result.user);
      // result.user.phone sẽ có số điện thoại thực nếu user cho phép
      const token = result.token;
      const user = result.user;
      return { token, user };
    } else {
      throw new Error(result.message || 'Đăng nhập thất bại');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra';
    console.error('Đăng nhập thất bại:', error);
    console.error('Error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });

    alert('Đăng nhập thất bại: ' + errorMessage);
    return null;
  }
};

// Helper cho API calls với token
export const apiCall = async (endpoint: string, options: any = {}, token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });
  
  return response.json();
};