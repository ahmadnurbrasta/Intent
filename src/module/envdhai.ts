import { Page } from 'playwright';
import chalk from 'chalk';
import * as modul from './modul';

// export async function prechat_form(page: Page, greeting: string) {
//     modul.show_loading("Tap To Start CLick...");

//     try {
//         const btn_start = page.locator('#button-onboard');
//         await btn_start.waitFor({ state: 'visible', timeout: 6000 });
//         await btn_start.click();
//         console.log(chalk.green("[OK] Tap to Start clicked."));
//         await modul.wait_time(2);
//     } catch (e) {
//         console.log(chalk.red("[ERROR] Tap to Start button not found."));
//         return;
//     }

//     try {
//         const btn_tnc = page.locator('#button-tnc-confirm');
//         await btn_tnc.waitFor({ state: 'visible', timeout: 6000 });
//         await btn_tnc.click();
//         console.log(chalk.green("[OK] TnC Confirm button clicked."));
//         await modul.wait_time(3);
//     } catch (e) {}

//     try {
//         const buttons = page.locator('#button-action-chat');
//         await buttons.first().waitFor({ state: 'attached', timeout: 6000 });
//         const count = await buttons.count();
//         await buttons.nth(count - 1).click();
//         console.log(chalk.green("[OK] Interaction button clicked."));
//     } catch (e) {
//         console.log(chalk.red("[ERROR] Interaction button not found."));
//         return;
//     }
//     await modul.wait_time(2);

//     try {
//         const inputMessage = page.locator('#input-text-message');
//         await inputMessage.waitFor({ state: 'attached', timeout: 10000 });
//         console.log(chalk.green("[OK] Chat interface ready."));
//     } catch (e) {
//         console.log(chalk.red("[ERROR] Chat input not found."));
//         return;
//     }

//     await wait_reply(page, "", 10);
// }

export async function prechat_form(page: Page, greeting: string) {
    modul.show_loading("Tap To Start CLick...");

    try {
        const btn_start = page.locator('#button-onboard');
        await btn_start.waitFor({ state: 'visible', timeout: 6000 });
        await btn_start.click();
        console.log(chalk.green("[OK] Tap to Start clicked."));
        await modul.wait_time(2);
    } catch (e) {
        console.log(chalk.red("[ERROR] Tap to Start button not found."));
        return;
    }

    try {
        const btn_tnc = page.locator('#button-tnc-confirm');
        await btn_tnc.waitFor({ state: 'visible', timeout: 6000 });
        await btn_tnc.click();
        console.log(chalk.green("[OK] TnC Confirm button clicked."));
        await modul.wait_time(3);
    } catch (e) {}

    try {
        const buttons = page.locator('#button-action-chat');
        await buttons.first().waitFor({ state: 'attached', timeout: 6000 });
        const count = await buttons.count();
        await buttons.nth(count - 1).click();
        console.log(chalk.green("[OK] Interaction button clicked."));
    } catch (e) {
        console.log(chalk.red("[ERROR] Interaction button not found."));
        return;
    }
    await modul.wait_time(2);

    try {
        const inputMessage = page.locator('#input-text-message');
        await inputMessage.waitFor({ state: 'attached', timeout: 10000 });
        console.log(chalk.green("[OK] Chat interface ready."));
    } catch (e) {
        console.log(chalk.red("[ERROR] Chat input not found."));
        return;
    }

    await wait_first_bot_message(page, 10);
}

export async function wait_first_bot_message(
    page: Page,
    timeout: number = 10
): Promise<boolean> {

    const start = Date.now()
    const locator = page.locator('.bubble-bot')

    while (true) {
        await modul.wait_time(0.3)

        const count = await locator.count()

        // ✅ begitu ada 1 aja langsung lanjut
        if (count > 0) {
            return true
        }

        if (Date.now() - start > timeout * 1000) {
            return false
        }
    }
}


export async function wait_reply(
    page: Page,
    last_user_msg: string,
    timeout: number = 25
): Promise<boolean> {

    const start = Date.now()

    const wrapper = page.locator('.message-content-wrapper')
    const content = '.content'

    const initialCount = await wrapper.count()
    const userMsg = last_user_msg.toLowerCase().trim()

    while (true) {

        await page.waitForTimeout(250) // sedikit lebih responsif

        const currentCount = await wrapper.count()

        // ✅ ada bubble baru
        if (currentCount > initialCount) {

            const lastElem = wrapper.nth(currentCount - 1)
            const text = await lastElem.locator(content).innerText().catch(() => "")

            const clean = text.trim().toLowerCase()

            // ✅ valid reply (bukan echo user)
            if (clean && clean !== userMsg) {
                return true
            }
        }

        // ⏱ timeout
        if (Date.now() - start > timeout * 1000) {
            return false
        }
    }
}

export async function send_message(page: Page, question: string): Promise<boolean> {
    try {
        const input_message = page.locator('#input-text-message');
        await input_message.fill(question);
    } catch (e) {
        console.log(chalk.red(`[ERROR] Cannot find or type into input-text: ${e}`));
        return false;
    }

    try {
        const input_message = page.locator('#input-text-message');
        await input_message.press('Enter');
        await modul.wait_time(1);
    } catch (e) {
        console.log(chalk.red(`[ERROR] Cannot send message via Enter: ${e}`));
        return false;
    }
    return true;
}

export async function get_reply_chat(page: Page, user_message: string): Promise<[string[], number]> {
    const bubbles = page.locator('.bubble-bot');
    const count = await bubbles.count();

    if (count === 0) {
        console.log("[WARN] No bot bubbles found");
        return [[], 0];
    }

    const bubble = bubbles.nth(count - 1);
    const msg_lower = user_message.toLowerCase().trim();
    const reply_texts: string[] = [];
    let total_bubbles = 0;

    try {
        const spans = bubble.locator('span.whitespace-pre-line');
        const spanCount = await spans.count();

        for (let i = 0; i < spanCount; i++) {
            const text = (await spans.nth(i).innerText()).trim();
            if (!text) continue;
            if (msg_lower === text.toLowerCase()) continue;
            if (reply_texts.length > 0 && reply_texts[reply_texts.length - 1] === text) continue;

            reply_texts.push(text);
            total_bubbles += 1;
        }
    } catch (e) {}

    return [reply_texts, total_bubbles];
}