import * as fs from 'fs';
import chalk from 'chalk';
import csv from 'csvtojson';
import * as envfolder from './envfolder';
import * as modul from './modul';

export function clean_invisible_chars(text: any): any {
    if (typeof text !== 'string') return text;
    let clean = text.replace(/[\u200B\u200C\u200D\u200E\u200F\u2060\uFEFF]/g, '');
    clean = clean.replace(/\n/g, ' ');
    clean = clean.replace(/\s+/g, ' ').trim();
    return clean;
}

export async function convert(csvFile: string): Promise<any[]> {
    const csvFilePath = `assets/csv/${csvFile}.csv`;
    const jsonFile = csvFile;
    const result_path = envfolder.json_converted(jsonFile);
    modul.show_loading(`Converting CSV → JSON: ${jsonFile}.json`);

    try {
        const jsonArray = await csv().fromFile(csvFilePath);
        const csv_data = jsonArray.map((row: any) => {
            const lowercased_row: any = {};
            for (const key in row) {
                lowercased_row[key.toLowerCase()] = clean_invisible_chars(row[key]);
            }
            return lowercased_row;
        });

        fs.writeFileSync(result_path, JSON.stringify(csv_data, null, 4), 'utf-8');
        console.log(`✅ CSV berhasil dikonversi → ${csvFilePath}`);
        console.log(`📄 JSON disimpan → ${result_path}\n`);
        return csv_data;
    } catch (e: any) {
        console.log(chalk.red(`❌ File CSV tidak ditemukan: ${csvFilePath}`));
        throw e;
    }
}

export function read_json(jsonFile: string): any {
    const result_path = envfolder.read_json(jsonFile);
    modul.show_loading(`Membaca JSON: ${jsonFile}.json`);

    try {
        const rawData = fs.readFileSync(result_path, 'utf-8');
        console.log(`📄 JSON berhasil terbaca → ${result_path}\n`);
        return JSON.parse(rawData);
    } catch (e: any) {
        console.log(chalk.red(`❌ File JSON tidak ditemukan: ${result_path}`));
        throw e;
    }
}

export function write_json_data_bot(data_bot: any, report_filename: string, id_test: string) {
    const filename = `${report_filename}-${id_test}`;
    const result_path = envfolder.write_json_data_bot(filename);

    let data_json: any = { summary: [], chart: [], data: [] };
    if (fs.existsSync(result_path)) {
        try { data_json = JSON.parse(fs.readFileSync(result_path, 'utf-8')); } catch (e) {}
    }

    data_json.data.push(data_bot);
    fs.writeFileSync(result_path, JSON.stringify(data_json, null, 4), 'utf-8');
}

export function write_end_time_summary(time: string, end: string, report_filename: string, id_test: string) {
    const filename = `${report_filename}-${id_test}`;
    const result_path = envfolder.write_json_data_summary(filename);

    let data_json: any = { summary: [], chart: [], data: [] };
    if (fs.existsSync(result_path)) {
        try { data_json = JSON.parse(fs.readFileSync(result_path, 'utf-8')); } catch (e) {}
    }

    let found = false;
    for (let item of data_json.summary) {
        if (item.id_test === id_test) {
            item.duration = end;
            item.end_time_test = time;
            found = true;
            break;
        }
    }

    if (found) {
        fs.writeFileSync(result_path, JSON.stringify(data_json, null, 4), 'utf-8');
    } else {
        console.log(chalk.yellow(`⚠️ id_test ${id_test} tidak ditemukan dalam summary → ${result_path}`));
    }
}

export function write_json_data_summary(data_summary: any, report_filename: string, id_test: string) {
    const filename = `${report_filename}-${id_test}`;
    const result_path = envfolder.write_json_data_summary(filename);

    let data_json: any = { summary: [], chart: [], data: [] };
    if (fs.existsSync(result_path)) {
        try { data_json = JSON.parse(fs.readFileSync(result_path, 'utf-8')); } catch (e) {}
    }

    const exists = data_json.summary.some((obj: any) => obj.id_test === data_summary.id_test);
    if (!exists) {
        data_json.summary.push(data_summary);
    } else {
        for (let obj of data_json.summary) {
            if (obj.id_test === data_summary.id_test) {
                Object.assign(obj, data_summary);
                break;
            }
        }
    }
    fs.writeFileSync(result_path, JSON.stringify(data_json, null, 4), 'utf-8');
}

export function write_json_chart(chart: any, report_filename: string, id_test: string) {
    const filename = `${report_filename}-${id_test}`;
    const result_path = envfolder.write_json_data_bot(filename);

    let data_json: any = { summary: [], chart: [], data: [] };
    if (fs.existsSync(result_path)) {
        try { data_json = JSON.parse(fs.readFileSync(result_path, 'utf-8')); } catch (e) {}
    }

    data_json.chart.push(chart);
    fs.writeFileSync(result_path, JSON.stringify(data_json, null, 4), 'utf-8');
}