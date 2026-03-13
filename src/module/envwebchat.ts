import {
    Page
} from 'playwright'
import chalk from 'chalk'
import * as modul from './modul'


export async function prechat_form(page: Page, greeting: string, name: string, email: string, phone: string) {
    modul.show_loading("Checking for webchat pre-chat form...")
    let webform_available = false
    const fields = [{
        label: "Name",
        id: "registername",
        value: name
    }, {
        label: "Email",
        id: "registeremail",
        value: email
    }, {
        label: "Phone",
        id: "registerphone",
        value: phone
    }]
    for (const field of fields) {
        try {
            const input = page.locator(`#${field.id}`)
            await input.waitFor({
                state: "attached",
                timeout: 5000
            })
            await input.fill(field.value)
            console.log(chalk.green(`[OK] ${field.label} field detected & filled.`))
            webform_available = true
        } catch {
            console.log(chalk.red(`[SKIP] ${field.label} field not found.`))
        }
    }
    if (webform_available) {
        try {
            const btn = page.locator(`//button[@type='submit']`)
            await btn.click()
            console.log(chalk.green("\n[OK] Pre-chat form submitted."))
            await modul.wait_time(12)
            try {
                const msg_box = page.locator('#input-message')
                await msg_box.waitFor({
                    state: "attached",
                    timeout: 5000
                })
                await msg_box.fill(greeting)
                await msg_box.press("Enter")
                console.log(chalk.green("\n[OK] Greeting sent."))
            } catch {
                console.log(chalk.red("[ERROR] Failed to send greeting. Input box not found."))
            }
        } catch {
            console.log(chalk.red("\n[ERROR] Submit button not found."))
        }
    } else {
        console.log(chalk.yellow("\n[INFO] No pre-chat form available. Sending greeting..."))
    }
    if (!webform_available) {
        try {
            const msg_box = page.locator('#input-message')
            await msg_box.waitFor({
                state: "attached",
                timeout: 5000
            })
            await msg_box.fill(greeting)
            await msg_box.press("Enter")
            console.log(chalk.green("\n[OK] Greeting sent."))
        } catch {
            console.log(chalk.red("[ERROR] Failed to send greeting. Input box not found."))
        }
    }
    await wait_reply(page, greeting, 20, 1.0)
}
export async function wait_reply(page: Page, last_user_msg: string, timeout: number, stable_delay: number): Promise < boolean > {
    const start_time = Date.now() / 1000
    const elements_before = page.locator('.message-content-wrapper')
    const initial_count = await elements_before.count()
    let last_seen_text = ""
    let last_change_time: number | null = null
    while (true) {
        await modul.wait_time(0.3)
        const elements_now = page.locator('.message-content-wrapper')
        const current_count = await elements_now.count()
        if (current_count <= initial_count) {
            if ((Date.now() / 1000) - start_time > timeout) return false
            continue
        }
        try {
            const last_elem = elements_now.nth(current_count - 1)
            const text = (await last_elem.locator('.content').innerText()).trim()
            if (!text || text.length < 3) continue
            if (text.toLowerCase() === last_user_msg.toLowerCase().trim()) continue
            if (text !== last_seen_text) {
                last_seen_text = text
                last_change_time = Date.now() / 1000
                continue
            }
            if (last_change_time && ((Date.now() / 1000) - last_change_time) >= stable_delay) return true
        } catch {}
        if ((Date.now() / 1000) - start_time > timeout) return false
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
export async function get_reply_chat(page: Page, user_message: string): Promise < [string[], number] > {
    const reply: string[] = []
    let total_bubbles = 0
    const msg = user_message.toLowerCase().trim()
    const elements = page.locator('.message-content-wrapper')
    const count = await elements.count()
    for (let total_reply = 1; total_reply < 10; total_reply++) {
        try {
            const idx = count - (total_reply + 1)
            if (idx < 0) continue
            const sent_elem = await elements.nth(idx).locator('.content').innerText()
            if (sent_elem.toLowerCase().trim() === msg) {
                for (let i = 0; i < total_reply; i++) {
                    try {
                        const chat_elem = elements.nth(count - (i + 1))
                        const bubbles = chat_elem.locator('.message-content')
                        const bubble_count = await bubbles.count()
                        for (let b = 0; b < bubble_count; b++) {
                            const text = await bubbles.nth(b).innerText()
                            reply.push(text)
                        }
                        total_bubbles += bubble_count
                    } catch {}
                }
                break
            }
        } catch {
            continue
        }
    }
    return [reply, total_bubbles]
}