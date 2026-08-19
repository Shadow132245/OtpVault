const https = require('https');

const token = 'yPkbf9NRWiNTGjiPtE_6QOWsI5zJpv3MfbdAHuXK';

function graphqlRequest(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query, variables });
    const options = {
      hostname: 'api.expo.dev',
      path: '/graphql',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error(`Parse error: ${body.substring(0, 200)}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  try {
    // Get account info
    const meResult = await graphqlRequest(`{ me { id accounts { id name } } }`);
    console.log('User:', JSON.stringify(meResult, null, 2));
    
    const accounts = meResult?.data?.me?.accounts;
    if (!accounts || accounts.length === 0) {
      console.log('No accounts found');
      return;
    }
    
    const accountId = accounts[0].id;
    console.log(`Using account: ${accounts[0].name} (${accountId})`);
    
    // Create project
    const createResult = await graphqlRequest(`
      mutation {
        app {
          createApp(appInput: {
            accountId: "${accountId}",
            projectName: "OtpVault"
          }) {
            id
            name
            slug
            fullName
          }
        }
      }
    `);
    console.log('Create result:', JSON.stringify(createResult, null, 2));
    
    const projectId = createResult?.data?.app?.createApp?.id;
    if (projectId) {
      console.log(`\nProject ID: ${projectId}`);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
