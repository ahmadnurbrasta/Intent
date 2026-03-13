import { Page, BrowserContext, Browser } from 'playwright';
import chalk from 'chalk';
import * as modul from './modul';
import * as envdhai from './envdhai';
import * as envwebchat from './envwebchat';
import * as envstatus from './envstatus';
import * as envfile from './envfile';
import * as envreport from './envreport';
import * as envllmscore from './envllmscore';

export async function actions(
    browser: Browser,
    context: BrowserContext,
    page: Page,
    json_data: any[],
    channel: string, // <--- TAMBAHKAN INI
    report_filename: string,
    id_test: string,
    time: string,
    today: string,
    tester_name: string,
    url: string,
    title_page: string,
    browser_name: string,
    record_video: boolean,
    headless_mode: boolean // <--- TAMBAHKAN INI (Parameter ke-14)
) {
    // Tentukan modul target berdasarkan channel
    // Pastikan kedua modul memiliki nama fungsi yang SAMA (send_message, wait_reply, get_reply_chat)
    const env = channel === "dhai" ? envdhai : envwebchat;
    const start = modul.start_time();
    let title_counter = 0;
    let question_count = 0;
    let intent_count = 0;
    let restart_part = 1;

    console.log(`\n=== 🚀 Start Testing Channel: ${channel.toUpperCase()} ===\n`);
    for (let i = 0; i < json_data.length; i++) {
        const element = json_data[i];
        title_counter++;
        await modul.wait_time(2);

        const duration_pertitle = modul.start_time();
        console.log(chalk.cyan(`[TOPIK] ${element['title']}`));

        let question_count_per_topic = 0;

        for (const [key, value] of Object.entries(element)) {
            if (key.startsWith("pertanyaan") && value !== "" && value !== null) {
                question_count++;
                question_count_per_topic++;

                const duration_perquestion = modul.start_time();
                const question = value as string;

                await env.send_message(page, question);
                await env.wait_reply(page, question, 20, 1.2);

                let image_capture = await envreport.take_screenshot(page, id_test, key, question);
                image_capture = image_capture.replace('report/', '');

                let [reply_texts, total_bubbles] = await env.get_reply_chat(page, question);
                let respond_bot = reply_texts.join("\n").trim();
                respond_bot = envstatus.respond_bot_correction(respond_bot);

                let respond_csv = String(element["context"]).trim();
                respond_csv = envstatus.respond_csv_correction(respond_csv);

                const scoreData = await envllmscore.llm_score(respond_bot, respond_csv);
                const score = scoreData.metrics_formatted.correctness.score;
                const status = envstatus.status(score);

                const dur_q = modul.end_time(duration_perquestion);

                const status_icon = status === "pass" ? "✔" : "❌";
                modul.show_loading(chalk.yellow(`[Q-${question_count_per_topic}] ${question}`));
                console.log(chalk.magenta(`  ${status_icon} | Score: ${score.toFixed(2)} [${status}] | Durasi Pertanyaan: ${dur_q}s | Durasi API: ${scoreData.api_dur}s | Bubble: ${total_bubbles}`));
                console.log(chalk.white(`  🟡 | Explanation: ${scoreData.explanation}`));

                const data_bot = {
                    no: element["no"], title: element["title"], question: question,
                    response_kb: respond_csv, response_llm: respond_bot, status: status,
                    duration: dur_q, image_capture: image_capture, metrics: scoreData.metrics_formatted, explanation: scoreData.explanation
                };
                envfile.write_json_data_bot(data_bot, report_filename, id_test);

                const [pass_count, failed_count] = envstatus.calculate(report_filename, id_test);
                const data_summary = {
                    id_test: id_test, tester_name: tester_name, ai_evaluation: scoreData.AI,
                    url: url, page_name: title_page, browser_name: browser_name,
                    date_test: today, start_time_test: time, total_title: title_counter,
                    total_question: question_count, success: pass_count, failed: failed_count
                };
                envfile.write_json_data_summary(data_summary, report_filename, id_test);
                envreport.report_action(report_filename, id_test);
            }
        }

        const dur_topic = modul.end_time(duration_pertitle);
        envfile.write_json_chart({ [element["title"]]: dur_topic }, report_filename, id_test);
        console.log(`  \nTopik Selesai (durasi: ${dur_topic}s)\n`);

        intent_count++;

        if (intent_count < json_data.length && intent_count % 40 === 0) {
            await modul.wait_time(3);
            console.log(`[RESTART] Topik ke-${intent_count} selesai → restart browser...\n`);

            // UBAH BARIS INI: Panggil dengan argumen lengkap
            await modul.close_browser(browser, context, page, report_filename, id_test, restart_part);
            restart_part++; // Tambah counter part video

            const newEnv = await modul.read_browser(url, "chrome", id_test, record_video, headless_mode);
            browser = newEnv.browser;
            context = newEnv.context;
            page = newEnv.page;

            await env.prechat_form(page, "Halo");
        } else if (intent_count === json_data.length) {
            console.log(`[INFO] Semua topik selesai → langsung ke END TEST.\n`);
        }
    }

    const duration_test = modul.end_time(start);
    const [pass_count, failed_count] = envstatus.calculate(report_filename, id_test);
    console.log(`[SELESAI] TotalTopik = ${title_counter} | TotalQuestion = ${question_count} | Pass = ${pass_count} | Failed = ${failed_count} | Durasi = ${duration_test}s\n`);

    const data_summary = {
        id_test: id_test, tester_name: tester_name, ai_evaluation: "GEMINI AI",
        url: url, page_name: title_page, browser_name: browser_name,
        date_test: today, start_time_test: time, total_title: title_counter,
        total_question: question_count, success: pass_count, failed: failed_count
    };

    envfile.write_json_data_summary(data_summary, report_filename, id_test);
    await modul.close_browser(browser, context, page, report_filename, id_test, restart_part);
}