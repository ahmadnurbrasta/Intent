import { chromium, firefox, Browser, BrowserContext, Page } from 'playwright';
import chalk from 'chalk';
import * as envfolder from './envfolder';
import * as fs from 'fs';
import * as path from 'path';

export async function wait_time(numbers: number = 1) {
    await new Promise(resolve => setTimeout(resolve, numbers * 1000));
}

export function show_loading(title: string) {
    process.stdout.write(chalk.blue(`\r${title} ✔\n`));
}

export function show_loading_sampletext(title: string) {
    process.stdout.write(chalk.white(`\r${title} ✔\n`));
}

export function initialize(text: string) {
    console.log(chalk.red(`\n=== ${text} ===\n`));
}

export function test_done(text: string) {
    console.log(chalk.green(`\n=== ${text} ===\n`));
}

export function todays(): [string, string] {
    const now = new Date();
    const dateOpts: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const timeOpts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    return [now.toLocaleDateString('id-ID', dateOpts), now.toLocaleTimeString('id-ID', timeOpts)];
}

export function start_time(): number {
    return Date.now() / 1000;
}

export function end_time(start: number): string {
    const end = (Date.now() / 1000) - start;
    const hours = Math.floor(end / 3600);
    const minutes = Math.floor((end % 3600) / 60);
    const seconds = Math.floor(end % 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function id_test(): string {
    const uuid = require('crypto').randomUUID();
    return uuid.substring(0, 8);
}

export function tester(name: string): string {
    return name;
}

export async function read_browser(url: string, browserType: string, idTest: string, record_video: boolean) {
    browserType = browserType.toLowerCase();
    console.log(`You chose ${chalk.yellow(browserType.toUpperCase())} for the browser test.`);
    
    let browser: Browser;
    let browser_name = "";

    const launchOptions = {
        headless: false, // Bisa Anda ubah ke true jika ingin jalan 100% di background
        args: [
            '--no-sandbox', 
            '--disable-dev-shm-usage', 
            '--window-position=0,0',
            '--window-size=1920,1080',
            '--start-maximized',
            '--force-device-scale-factor=0.8'
        ]
    };

    if (browserType === "chrome" || browserType === "edge") {
        browser = await chromium.launch({ ...launchOptions, channel: browserType === "edge" ? "msedge" : "chrome" });
        browser_name = browserType === "chrome" ? "Google Chrome" : "Microsoft Edge";
    } else if (browserType === "firefox") {
        browser = await firefox.launch(launchOptions);
        browser_name = "Firefox";
    } else {
        browser = await chromium.launch(launchOptions);
        browser_name = "Google Chrome";
    }

    // Opsi dinamis untuk context (mendukung on/off video)
    const contextOptions: any = {
        viewport: null, // Wajib null agar argumen maximize Chrome bekerja
    };

    if (record_video) {
        contextOptions.recordVideo = {
            dir: envfolder.report_screenrecord(idTest),
            size: { width: 1920, height: 1080 } // Mencegah blok abu-abu (gray bars)
        };
        console.log(`\n🎬 Starting screen recording (Handled natively by Playwright)...`);
        console.log("✅ Recording started\n");
    }

    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();
    await page.goto(url);
    const title_page = await page.title();

    return { browser, context, page, title_page, browser_name };
}

export function stop_screen_recording(process: any) {
    console.log("\n🛑 Stopping screen recording (Will finalize when context closes)...");
    console.log("✅ Recording stopped successfully\n");
}

export async function close_browser(browser: Browser, context: BrowserContext, page: Page, report_filename: string, id_test: string, part: number = 1) {
    show_loading("🟡 Closing environment");
    
    // 1. Ambil path asli video dari Playwright SEBELUM context ditutup
    let originalVideoPath = "";
    try {
        const video = page.video();
        if (video) {
            originalVideoPath = await video.path();
        }
    } catch (e) {}

    await context.clearCookies();
    show_loading("🔴 Deleting cookies");
    show_loading("🟠 Close browser");
    
    // 2. TUTUP CONTEXT & BROWSER 
    // (Ini proses PENTING agar file video di-finalize dan tidak corrupt!)
    await context.close();
    await browser.close();
    console.log("\n");

    // 3. RENAME FILE VIDEO SESUAI FORMAT ANDA
    if (originalVideoPath && fs.existsSync(originalVideoPath)) {
        const dir = path.dirname(originalVideoPath);
        // Jika terjadi restart browser, tambahkan _part2, _part3 dst agar tidak tertimpa
        const partSuffix = part > 1 ? `_part${part}` : ``;
        const newVideoName = `${report_filename}_${id_test}${partSuffix}.webm`;
        const newVideoPath = path.join(dir, newVideoName);
        
        try {
            fs.renameSync(originalVideoPath, newVideoPath);
            console.log(chalk.green(`✅ Video berhasil direkam & disimpan: ${newVideoName}`));
        } catch (e) {
            console.log(chalk.red(`❌ Gagal merename video: ${e}`));
        }
    }
}

export function setup_logging(report_filename: string, id_test: string) {
    const logFile = envfolder.log(report_filename, id_test);
}