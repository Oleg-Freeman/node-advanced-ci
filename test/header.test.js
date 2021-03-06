const Page = require('./helpers/page');

let page;

beforeEach(async() => {
    page = await Page.build();
    await page.goto('http;//localhost:3000');
})

afterEach(async() => {
    await page.close();
})

test('Header has correct text', async () => {
    const text = await page.getGontentsOf('a.brand-logo');

    expect(text).toEqual('Blogster');
})

test('clicking loging starts auth flow', async () => {
    await page.click('.right a');
    const url = await page.url();

    expect(url).toMatch(/accounts\.google\.com/);
})

test('When signed in, shows log out button', async () => {
    await page.login();
    
    const text = await page.getGontentsOf('a[href="/auth/logout"]');

    expect(text).toEqual('Logout');
})