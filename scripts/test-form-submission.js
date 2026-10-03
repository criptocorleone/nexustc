import { spawn } from 'child_process';
import http from 'http';
import path from 'path';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const brainDir = 'C:\\Users\\Ricardo\\.gemini\\antigravity\\brain\\cdae9f8d-38a2-43c8-87a1-11eb6097fd80';
const port = 9222;

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON from ${url}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.eventListeners = [];

    this.ready = new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      } else if (msg.method) {
        for (const listener of this.eventListeners) {
          listener(msg);
        }
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  on(listener) {
    this.eventListeners.push(listener);
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res.result ? res.result.value : undefined;
  }

  async captureScreenshot(filePath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    fs.writeFileSync(filePath, buffer);
  }

  close() {
    this.ws.close();
  }
}

async function run() {
  console.log('Starting Chrome in headless mode with remote debugging...');
  const chrome = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1280,1400',
    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    'http://127.0.0.1:4321/contato'
  ]);

  await wait(2500);

  try {
    // -------------------------------------------------------------
    // Teste 1: Página /contato
    // -------------------------------------------------------------
    console.log('Connecting to Chrome page target...');
    const targets = await getJson(`http://127.0.0.1:${port}/json/list`);
    const pageTarget = targets.find(t => t.type === 'page');
    if (!pageTarget) throw new Error('No page target found');

    const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await client.ready;

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Network.enable');

    let requestCaptured = null;
    let responseCaptured = null;
    let responseBody = null;

    client.on(async msg => {
      if (msg.method === 'Network.requestWillBeSent') {
        if (msg.params.request.url.includes('web3forms')) {
          requestCaptured = msg.params.request;
          console.log('\n[Network] Web3Forms Request sent:');
          console.log('  URL:', msg.params.request.url);
          console.log('  Headers:', JSON.stringify(msg.params.request.headers));
          console.log('  Payload:', msg.params.request.postData);
        }
      }
      if (msg.method === 'Network.responseReceived') {
        if (msg.params.response.url.includes('web3forms')) {
          responseCaptured = msg.params.response;
          console.log('\n[Network] Web3Forms Response received:');
          console.log('  Status:', msg.params.response.status, msg.params.response.statusText);
          try {
            const bodyRes = await client.send('Network.getResponseBody', { requestId: msg.params.requestId });
            responseBody = bodyRes.body;
            console.log('  Body:', responseBody);
          } catch (e) {
            console.log('  (Could not read response body via CDP):', e.message);
          }
        }
      }
    });

    await wait(2000);

    // Scroll to contact form
    await client.eval(`
      var formEl = document.querySelector('#nexus-contact-form');
      if (formEl) formEl.scrollIntoView({ behavior: 'instant', block: 'center' });
    `);

    // Fill form
    console.log('\nFilling form on /contato...');
    await client.eval(`
      document.getElementById('form-name').value = 'Ricardo Zago - Teste Contato';
      document.getElementById('form-company').value = 'Nexus TC';
      document.getElementById('form-email').value = 'contato@nexustc.com.br';
      document.getElementById('form-phone').value = '(11) 99999-9999';
      document.getElementById('form-segment').value = 'industria';
      document.getElementById('form-message').value = 'Teste de envio real do formulário na página de contato da Nexus TC.';
    `);

    // Intercept/monitor submit button state and submit
    console.log('Submitting form on /contato...');
    
    // We execute submit
    await client.eval(`
      var form = document.getElementById('nexus-contact-form');
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    `);

    // Immediately capture state 1: Enviando
    await wait(50);
    const isBtnDisabled = await client.eval(`document.getElementById('form-submit-btn').disabled`);
    const btnText = await client.eval(`document.getElementById('form-submit-btn').textContent.trim()`);
    console.log('Button state right after submit: disabled =', isBtnDisabled, '| text =', btnText);

    const sendingPath = path.join(brainDir, 'estado-1-enviando.png');
    await client.captureScreenshot(sendingPath);
    console.log('Captured screenshot:', sendingPath);

    // Wait for response
    let attempts = 0;
    while (!responseCaptured && attempts < 30) {
      await wait(500);
      attempts++;
    }

    await wait(1500);

    const isSuccessVisible = await client.eval(`
      var box = document.getElementById('form-success');
      box && box.style.display !== 'none';
    `);
    const isFormHidden = await client.eval(`
      var form = document.getElementById('nexus-contact-form');
      form && form.style.display === 'none';
    `);

    console.log('\nResult on /contato:');
    console.log('  Form hidden:', isFormHidden);
    console.log('  Success box visible:', isSuccessVisible);

    const successPath = path.join(brainDir, 'estado-2-sucesso.png');
    await client.captureScreenshot(successPath);
    console.log('Captured screenshot:', successPath);

    // -------------------------------------------------------------
    // Teste 2: Segmento /segmentos/industria
    // -------------------------------------------------------------
    console.log('\n----------------------------------------');
    console.log('Navigating to /segmentos/industria...');
    responseCaptured = null;
    requestCaptured = null;

    await client.send('Page.navigate', { url: 'http://127.0.0.1:4321/segmentos/industria' });
    await wait(3000);

    await client.eval(`
      var formEl = document.querySelector('#nexus-contact-form');
      if (formEl) formEl.scrollIntoView({ behavior: 'instant', block: 'center' });
      document.getElementById('form-name').value = 'Ricardo Zago - Teste Segmento Indústria';
      document.getElementById('form-company').value = 'Indústria Modelo Ltda';
      document.getElementById('form-email').value = 'contato@nexustc.com.br';
      document.getElementById('form-phone').value = '(11) 99999-9999';
      document.getElementById('form-segment').value = 'industria';
      document.getElementById('form-message').value = 'Teste de envio real do formulário na página de segmento indústria.';
    `);

    console.log('Submitting form on /segmentos/industria...');
    await client.eval(`
      document.getElementById('nexus-contact-form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    `);

    attempts = 0;
    while (!responseCaptured && attempts < 30) {
      await wait(500);
      attempts++;
    }

    await wait(1500);

    const isSegmentSuccess = await client.eval(`
      var box = document.getElementById('form-success');
      box && box.style.display !== 'none';
    `);
    console.log('Result on /segmentos/industria: Success visible =', isSegmentSuccess);

    const segmentSuccessPath = path.join(brainDir, 'sucesso-segmento-industria.png');
    await client.captureScreenshot(segmentSuccessPath);
    console.log('Captured screenshot:', segmentSuccessPath);

    // -------------------------------------------------------------
    // Teste 3: Estado de Erro
    // -------------------------------------------------------------
    console.log('\n----------------------------------------');
    console.log('Navigating to /contato for Error State simulation...');
    await client.send('Page.navigate', { url: 'http://127.0.0.1:4321/contato' });
    await wait(3000);

    await client.eval(`
      var formEl = document.querySelector('#nexus-contact-form');
      if (formEl) formEl.scrollIntoView({ behavior: 'instant', block: 'center' });
      document.getElementById('form-name').value = 'João Silva';
      document.getElementById('form-company').value = 'Empresa Teste Erro';
      document.getElementById('form-email').value = 'joao@empresa.com.br';
      document.getElementById('form-phone').value = '(11) 98888-8888';
      document.getElementById('form-segment').value = 'web3';
      document.getElementById('form-message').value = 'Mensagem preenchida que deve ser mantida intacta na tela quando o envio falha.';

      // Acionar exibição do erro (simulando falha de rede/API)
      var errorBox = document.getElementById('form-error');
      if (errorBox) errorBox.style.display = 'block';
    `);

    const errorPath = path.join(brainDir, 'estado-3-erro.png');
    await client.captureScreenshot(errorPath);
    console.log('Captured error state screenshot:', errorPath);

    client.close();
  } finally {
    chrome.kill();
  }
}

run().catch(console.error);
