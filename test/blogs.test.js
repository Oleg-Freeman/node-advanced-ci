const Page = require('./helpers/page');

let page;

beforeEach(async() => {
    page = await Page.build();
    await page.goto('http;//localhost:3000');
})

afterEach(async() => {
    await page.close();
})

describe('When logged in', async () => {
    beforeEach(async () => {
        await page.login();
        await page.click('a.btn-floating');
    });

    test('Can see blog creation form', async () => {
        const label = await page.getGontentsOf('form label');
        expect(label).toEqual('Blog Title');
    });

    describe('And using invalid inputs', async () => {
        beforeEach(async () => {
            await page.click('form button');
        });

        test(' the form shows an error message', async () => {
            const titleError = await page.getGontentsOf('.title .red-text');
            const contentError = await page.getGontentsOf('.content .red-text');

            expect(titleError).toEqual('You must provide a value');
            expect(contentError).toEqual('You must provide a value');
        });
    });

    describe('And using valid inputs', async () => {
        beforeEach(async () => {
            await page.type('.title input', 'Test Title');
            await page.type('.content input', 'Test Content');
            await page.click('form button');
        });

        test('Submitting takes user to review screen', async () => {
            const text = await page.getGontentsOf('h5');

            expect(text).toEqual('Please confirm your entries');
        });

        test('Submitting then saving adds blog to index page', async () => {
            await page.click('button.green');
            await page.waitFor('.card'); // waits for smth with class .card to appear

            const title = await page.getGontentsOf('.card-title');
            const content = await page.getGontentsOf('p');

            expect(title).toEqual('Test Title');
            expect(content).toEqual('Test Content');
        });
    });
});

describe('When not logged in', async () => {
    test('User Cannot create post', async () => {
        const result = await page.evaluate(
            () => {
                return fetch('/api/blogs', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ title: 'My title', content: 'My content'})
                }).then(res => res.json());
            }
        )

        expect(result).toEqual({ error: 'You must log in!' });
    });

    test('User Cannot get list of posts', async () => {
        const result = await page.evaluate(
            () => {
                return fetch('/api/blogs', {
                    method: 'GET',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(res => res.json());
            }
        )

        expect(result).toEqual({ error: 'You must log in!' });
    });
})
