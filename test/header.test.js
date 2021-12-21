const puppeteer = require('puppeteer')

let browser, page;

beforeEach(async() => {
    browser = await puppeteer.launch({
        headless: false
    });

    page = await browser.newPage();
    await page.goto('localhost:3000');
})

afterEach(async() => {
    await browser.close();
})

test('Header has correct text', async () => {
    const text = await page.$eval('a.brand-logo', el => el.innerHTML);

    expect(text).toEqual('Blogster');
})

test('clicking loging starts auth flow', async () => {
    await page.click('.right a');
    const url = await page.url();

    expect(url).toMatch(/accounts\.google\.com/);
})

test('When signed in, shows log out button', async () => {
    const Buffer = require('safe-buffer').Buffer;
    const Keygrip = require('keygrip');
    const keys = require('../config/keys');

    const id = '61c09ea0f8747e6a0717ac6a';

    const sessionObject = {
        passport: {
            user: id
        }
    }
    const sessionString = Buffer.from(
        JSON.stringify(sessionObject)
        ).toString('base64');

    const keygrip = new Keygrip([keys.cookieKey]);
    const sig = keygrip.sign('session=' + sessionString);

    // console.log(sessionString);
    // console.log(sig);
    await page.setCookie({ name: 'session', value: sessionString });
    await page.setCookie({ name: 'session.sig', value: sig });
    await page.goto('localhost:3000');
    await page.waitFor('a[href="/auth/logout"]');

    const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML);

    expect(text).toEqual('Logout');
})