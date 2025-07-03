async function testAPICall() {
    try {
      const response = await fetch('http://localhost:3000/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 1000,
          chatterId: 'cmcnaqnxz0002ujeoy5obvm7r',
          modelId: 'isabella',
          clientName: 'Test Client',
          clientProfileUrl: 'https://example.com/test',
          channel: 'Test Channel',
          category: 'Test Category',
          notes: 'Test payment',
          toAccount: 'Revolut',
          source: 'web-form'
        })
      });
  
      const result = await response.json();
      console.log('API Response:', result);
      
      if (!response.ok) {
        console.error('API Error Status:', response.status);
      }
    } catch (error) {
      console.error('Network Error:', error);
    }
  }
  
  testAPICall();