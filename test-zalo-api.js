// Test script để verify Zalo API endpoint
// Chạy bằng Node.js để test API trước khi sửa backend

async function testZaloPhoneAPI() {
  // Thay thế bằng access_token và phone_token thật từ log
  const ACCESS_TOKEN = 'lRW6LkZku7MrlmrHvUdgVRI_2rdezwf_ujy4MVNudoxcqNW9qDoRPUpn13NBrkDtoUDILldpunNE_4yoxyxNHBpfC3JhzQuOxlWkJ-lji1Jgk3vklecp2gYL1c-LjfGMmkW2TisZa23Fat1smesM19QTA676hgC_pA0WO9gNi2o_nb5lailD5yxgLIwIeT9uXuDn2Dg0rcpcYsCYyPlsHgED5MMMd8iZbxzhT9RfsnQ7tsfkkydHFRpXV7wDjznVZk8v3RlbgokFkof9Z97DSAEVU26Clkq6hhLWGfEnn66lhY9OYVg1AgFFP5E-ySOnhQznJlslz1RjZbbDt93u4zs_OKFxa8m-yQ4SPysBeK5GU6Hcr1JjyE5s';
  const PHONE_TOKEN = '0z1wEjEMmSmk_bCQoON2j3NjK1AfYV77AkiR3k6oyVqu-aCDyBRFttRvKm6pji_NSlvv2gYQzkrimdaZjupFpspNK1RkZzl0QiTjA-6FtCCwrrCIkBVSj7__RaIaf-6L9iTkC-6Asvqansvc-gBrp3t7UcBcdFgqFT5XOVknxiivwMuM_B24vINuDXMdjBh38VWc3Q6tkjjh-0W5wxQ4po7u23lajPFkFjS3C-gtZFqn-JulixMoyNZw40Nvj9pRU_W02VstZDT--n0WzRQBzItL50RpjgBB9zCoEEA8kUvcn0W6lQI8ssdy1nQmdhBVUFmJ2VoqeTSx-3fy_hM8eYNu4tVzcuo48_WwIVUTZu0y_sLp-9pKfNpJPcFydlssEyLzUxgcbgvw_trZ_PtYgIRJKtpCWTwvDCblKU-IxwOgsbrMu9N_d2hRSrhXb--cODfqSwA2zBrvp4Pd-8FAlN_CU6V-WzgSTQntTO_0vRLLY0yQdVE7oKcNBnhAzAFC3PmY1kRHZVzvf0qm-E3isYI-31eq';
  
  const endpoints = [
    // Endpoint 1 - Với secret key
    `https://graph.zalo.me/v2.0/me/info?access_token=${ACCESS_TOKEN}&code=${PHONE_TOKEN}&secret_key=YOUR_APP_SECRET_KEY&fields=name,picture`,
    
    // Endpoint 2 - Theo tài liệu chính thức (không secret)
    `https://graph.zalo.me/v2.0/me/info?access_token=${ACCESS_TOKEN}&code=${PHONE_TOKEN}&fields=name,picture`,
    
    // Endpoint 3 - Alternative  
    `https://openapi.zalo.me/v2.0/me/info?access_token=${ACCESS_TOKEN}&code=${PHONE_TOKEN}&fields=name,picture`,
  ];
  
  for (let i = 0; i < endpoints.length; i++) {
    const url = endpoints[i];
    console.log(`\n=== Testing Endpoint ${i + 1} ===`);
    console.log('URL:', url);
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(data, null, 2));
      
      if (data.error === 0 && data.data && data.data.number) {
        console.log('✅ SUCCESS! Phone number:', data.data.number);
        break;
      } else {
        console.log('❌ Failed or no phone number');
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  }
}

// Uncomment để chạy test
testZaloPhoneAPI();

console.log('Để test:');
console.log('1. Thay ACCESS_TOKEN và PHONE_TOKEN bằng giá trị thật từ log');
console.log('2. Uncomment dòng cuối và chạy: node test-zalo-api.js');
console.log('3. Xem endpoint nào work để áp dụng vào backend');
