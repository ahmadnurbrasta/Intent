import {
    Page
} from 'playwright'
import chalk from 'chalk'
import * as modul from './modul'


export async function prechat_form(page: Page, greeting: string, name: string, email: string, phone: string) {
    modul.show_loading("Checking for webchat pre-chat form...")

    const form = page.locator("form")

    let webform_available = false

    try {
        await form.waitFor({ state: "attached", timeout: 2000 })
        webform_available = true
        console.log(chalk.green("[OK] Pre-chat form detected."))
    } catch {
        console.log(chalk.yellow("[INFO] No pre-chat form detected."))
    }

    if (webform_available) {
        // langsung fill tanpa nunggu satu-satu
        await page.fill("#registername", name)
        await page.fill("#registeremail", email)
        await page.fill("#registerphone", phone)

        console.log(chalk.green("[OK] Form filled."))

        try {
            await page.locator("form button[type='submit']").click()
            console.log(chalk.green("[OK] Pre-chat form submitted."))
        } catch {
            console.log(chalk.red("[ERROR] Submit button not found."))
        }

        await modul.wait_time(12)

    } else {
        console.log(chalk.yellow("[INFO] Skipping form, sending greeting directly."))
    }

    // kirim chat (baik form ada atau tidak)
    try {
        const msg_box = page.locator('#input-message')
        await msg_box.waitFor({ state: "attached", timeout: 5000 })
        await msg_box.fill(greeting)
        await msg_box.press("Enter")
        console.log(chalk.green("[OK] Greeting sent."))
    } catch {
        console.log(chalk.red("[ERROR] Chat input not found."))
    }

    await wait_reply(page, greeting, 20)
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

export async function send_message(page: Page, question: string): Promise < boolean > {
    try {
        const input_message = page.locator("#input-message")
        await input_message.fill(question)
    } catch (e) {
        console.log(chalk.red(`[ERROR] Cannot find or type into input-message: ${e}`))
        return false
    }
    try {
        const button_send = page.locator("#button-send")
        await modul.wait_time(1)
        await button_send.click()
    } catch (e) {
        console.log(chalk.red(`[ERROR] Cannot click send button: ${e}`))
        return false
    }
    return true
}

export async function get_reply_chat(page: Page, user_message: string): Promise<[string[], number]> {
    const msg = user_message.toLowerCase().trim()
    const elements = page.locator('.message-content-wrapper')

    const count = await elements.count()
    const reply: string[] = []
    let total_bubbles = 0

    for (let i = count - 2; i >= 0 && i >= count - 11; i--) {
        try {
            const sent = await elements.nth(i).locator('.content').innerText()

            if (sent.toLowerCase().trim() === msg) {
                // ambil SEMUA elemen setelah user message
                for (let j = i + 1; j < count; j++) {
                    const bubbles = elements.nth(j).locator('.message-content')

                    // ⚡ ambil sekaligus (bukan loop await)
                    const texts = await bubbles.allTextContents()

                    reply.push(...texts)
                    total_bubbles += texts.length
                }
                break
            }
        } catch {}
    }

    return [reply, total_bubbles]
}