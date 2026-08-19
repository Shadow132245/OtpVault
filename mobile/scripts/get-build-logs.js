const https = require('https');
const token = 'yPkbf9NRWiNTGjiPtE_6QOWsI5zJpv3MfbdAHuXK';
const buildId = '9cb8ea3b-fdec-4ee7-9d3f-9489f9db91cb';

function gql(query) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query });
    const req = https.request({ hostname: 'api.expo.dev', path: '/graphql', method: 'POST', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } }, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => { try { resolve(JSON.parse(body)); } catch (e) { reject(e); } });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  const r = await gql(`{
    builds {
      byId(buildId: "${buildId}") {
        id
        status
        error { message errorCode }
        logFileUrls
        artifacts { applicationArchiveUrl buildUrl }
      }
    }
  }`);
  console.log(JSON.stringify(r, null, 2));
}
main();
