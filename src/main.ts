import * as dotenv from 'dotenv';
import * as modul from './module/modul';
import * as envfile from './module/envfile';
import * as envreport from './module/envreport';
import * as action from './module/action';
import * as envdhai from './module/envdhai';
import * as envwebchat from './module/envwebchat';

dotenv.config();

async function main() {
    // === TAMPILAN HEADER (JANGAN DIHAPUS) ===
    modul.initialize("Initialize ...");

    const [today, time] = modul.todays();
    const start = modul.start_time();
    const id_test = modul.id_test();

    // Konfigurasi dari ENV
    const channel = (process.env.ACTIVE_CHANNEL || "webchat").toLowerCase();
    const isRecord = process.env.RECORD_VIDEO === "true";
    const isHeadless = process.env.HEADLESS_MODE === "true";
    const reportName = process.env.REPORT_NAME || "Uhuy";
    const csvFile = process.env.CSV_FILE_NAME || "data";
    const browserType = process.env.BROWSER || "chrome";

    modul.setup_logging(reportName, id_test);

    console.log("=".repeat(60));
    console.log("                🚀 TEST EXECUTION STARTED");
    console.log("=".repeat(60));
    console.log(`🆔 Test ID       : ${id_test}`);
    console.log(`📅 Date          : ${today}`);
    console.log(`📄 Report Name   : ${reportName}`);
    console.log(`🎥 Record Video  : ${isRecord ? "YES (Playwright Native)" : "NO"}`);
    console.log(`🌐 Browser Type  : ${browserType.toUpperCase()}`);
    console.log(`🤖 Channel       : ${channel.toUpperCase()}`);
    console.log("=".repeat(60) + "\n");
    // =========================================

    // 1. Data Preparation (Original Flow)
    await envfile.convert(csvFile);
    const json_data = envfile.read_json(csvFile);

    try {
        if (channel === "dhai") {
            const url = process.env.URL_DHAI!;
            const { browser, context, page, title_page, browser_name } = await modul.read_browser(
                url, browserType, id_test, isRecord, isHeadless
            );
            await envdhai.prechat_form(page, "Halo");
            await action.actions(browser, context, page, json_data, channel, reportName, id_test, time, today, process.env.TESTER_NAME!, url, title_page, browser_name, isRecord, isHeadless);

        }
        else if (channel === "webchat") {
            const url = process.env.URL_WEBCHAT!;
            const { browser, context, page, title_page, browser_name } = await modul.read_browser(
                url, browserType, id_test, isRecord, isHeadless
            );
            await envwebchat.prechat_form(page, "Halo");
            await action.actions(browser, context, page, json_data, channel, reportName, id_test, time, today, process.env.TESTER_NAME!, url, title_page, browser_name, isRecord, isHeadless);

        }

    } catch (error) {
        console.error("FATAL ERROR DURING EXECUTION:", error);
    } finally {
        const end = modul.end_time(start);
        const [, endTimeCurrent] = modul.todays();

        envfile.write_end_time_summary(endTimeCurrent, end, reportName, id_test);
        envreport.report(reportName, id_test);

        modul.test_done("Test Done!");
        console.log("Thank you, Have a great day!✨ \n");
    }
}

main().catch(console.error);