import * as fs from 'fs';
import chalk from 'chalk';
import { Page } from 'playwright';
import nunjucks from 'nunjucks';
import * as modul from './modul';
import * as envfolder from './envfolder';

// 1. Inisialisasi environment Nunjucks ke dalam variabel
const env = nunjucks.configure('.', { autoescape: false });

// 2. TAMBAHAN PENTING: Membuat custom filter 'tojson' agar persis seperti Jinja2 Python
env.addFilter('tojson', function(val: any) {
    return JSON.stringify(val);
});

export function report(report_filename: string, id_test: string) {
    const filename_full = `${report_filename}-${id_test}`;
    const result_path = envfolder.report_html(filename_full);

    modul.show_loading(`Generating report on process.. `);
    const file_json_report = envfolder.write_json_data_bot(filename_full);

    try {
        const rawData = fs.readFileSync(file_json_report, 'utf-8');
        const data = JSON.parse(rawData);

        // Gunakan env.render (bukan nunjucks.render) agar filter tojson terbaca
        const html_output = env.render('report/template/template 2.html', {
            summary: data.summary, chart: data.chart, test_data: data.data
        });

        fs.writeFileSync(result_path, html_output, 'utf-8');
        console.log("✅ HTML report generated successfully.\n");
    } catch (e: any) {
        console.log(chalk.red(`❌ Terjadi kesalahan saat membuat report: ${e.message}\n`));
    }
}

export function report_action(report_filename: string, id_test: string) {
    const filename_full = `${report_filename}-${id_test}`;
    const result_path = envfolder.report_html(filename_full);
    const file_json_report = envfolder.write_json_data_bot(filename_full);

    try {
        const rawData = fs.readFileSync(file_json_report, 'utf-8');
        const data = JSON.parse(rawData);

        // Gunakan env.render (bukan nunjucks.render)
        const html_output = env.render('report/template/template 2.html', {
            summary: data.summary, chart: data.chart, test_data: data.data
        });

        fs.writeFileSync(result_path, html_output, 'utf-8');
    } catch (e) {
        // fail silently in action like Python
    }
}

export async function take_screenshot(page: Page, id_test: string, key: string, question: string): Promise<string> {
    const MAX_LEN = 80;
    let safeName = question.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
    if (safeName.length > MAX_LEN) safeName = safeName.substring(0, MAX_LEN).trimEnd();

    const result_path = envfolder.report_screenshoot(id_test);
    const result_filename = `${result_path}/${safeName}.png`;

    try {
        await modul.wait_time(1.5);
        await page.screenshot({ path: result_filename });
        await modul.wait_time(1);
    } catch (e) { }

    return result_filename;
}