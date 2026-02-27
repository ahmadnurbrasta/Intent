import { Page } from 'playwright';
import chalk from 'chalk';
import * as modul from './modul';

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

    await wait_reply(page, "", 10, 1.2);
}

export async function wait_reply(page: Page, last_user_msg: string, timeout: number, stable_delay: number): Promise<boolean> {
    const start_time = Date.now() / 1000;
    let last_seen_text = "";
    let last_change_time: number | null = null;
    const last_user_msg_lower = last_user_msg.toLowerCase().trim();

    let initial_count = await page.locator('.bubble-bot').count();

    while (true) {
        await modul.wait_time(0.3);
        const current_count = await page.locator('.bubble-bot').count();

        if (current_count <= initial_count) {
            if ((Date.now() / 1000) - start_time > timeout) return false;
            continue;
        }

        try {
            const last_elem = page.locator('.bubble-bot').nth(current_count - 1);
            const text = (await last_elem.innerText()).trim();

            if (!text || text.toLowerCase() === last_user_msg_lower) continue;

            if (text !== last_seen_text) {
                last_seen_text = text;
                last_change_time = Date.now() / 1000;
                continue;
            }

            if (last_change_time && ((Date.now() / 1000) - last_change_time) >= stable_delay) {
                return true;
            }
        } catch (e) {}

        if ((Date.now() / 1000) - start_time > timeout) return false;
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