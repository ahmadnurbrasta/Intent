import * as fs from 'fs';
import * as modul from './module/modul';
import * as envfile from './module/envfile';
import * as envfolder from './module/envfolder';
import * as envwebchat from './module/envwebchat';
import * as envreport from './module/envreport';
import * as action from './module/action';

// ==========================================
// ⚙️ KONFIGURASI UTAMA
// ==========================================
const CONFIG = {
    record_video: true,
    browser_choice: "chrome", 
    url_target: "https://client.botika.online/virtual-avatar-luna/stream",
    csv_file: "kb_asuransi_2",
    json_file: "kb_asuransi_2",
    tester_name: "Ahmad Nur Brasta",
    greeting: "Halo",
    report_name: "Test Screen Recording"
};
// ==========================================

async function main() {
    modul.initialize("Initialize ...");

    const [today, time] = modul.todays();
    const start = modul.start_time();
    const id_test = modul.id_test();

    modul.setup_logging(CONFIG.report_name, id_test);

    console.log("=".repeat(60));
    console.log("                🚀 TEST EXECUTION STARTED");
    console.log("=".repeat(60));
    console.log(`🆔 Test ID       : ${id_test}`);
    console.log(`📅 Date          : ${today}`);
    console.log(`📄 Report Name   : ${CONFIG.report_name}`);
    console.log(`🎥 Record Video  : ${CONFIG.record_video ? "YES (Playwright Native)" : "NO"}`);
    console.log("=".repeat(60) + "\n");

    // 1. Persiapan Data
    await envfile.convert(CONFIG.csv_file, CONFIG.json_file);
    const json_data = envfile.read_json(CONFIG.json_file);

    // 2. Setup Browser & Video (Video dihandle otomatis di dalam read_browser)
    const { browser, context, page, title_page, browser_name } = await modul.read_browser(
        CONFIG.url_target, 
        CONFIG.browser_choice, 
        id_test,
        CONFIG.record_video // <--- Parameter video masuk ke sini
    );

    // 3. Eksekusi Utama
    try {
        await envwebchat.prechat_form(page, CONFIG.greeting);
        
        await action.actions(
            browser, context, page, json_data, CONFIG.report_name, id_test, 
            time, today, CONFIG.tester_name, CONFIG.url_target, title_page, browser_name, CONFIG.record_video
        );
    } catch (error) {
        console.error("FATAL ERROR DURING EXECUTION:", error);
    } finally {
        // 4. Finalisasi Laporan Waktu
        const end = modul.end_time(start);
        const [, endTimeCurrent] = modul.todays();
        console.log("End Time : ", endTimeCurrent);
        console.log("Duration : ", end, "\n");

        envfile.write_end_time_summary(endTimeCurrent, end, CONFIG.report_name, id_test);
        envreport.report(CONFIG.report_name, id_test);

        modul.test_done("Test Done!");
        console.log("Thank you, Have a great day!✨ \n");
    }
}

main().catch(console.error);