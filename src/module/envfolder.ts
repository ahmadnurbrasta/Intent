import * as fs from 'fs';
import * as path from 'path';

function getTodayStr(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

export function json_converted(json_file: string): string {
    const tanggal_hari_ini = getTodayStr();
    const folder_path = `assets/json/converted/${tanggal_hari_ini}`;
    const result_path = `${folder_path}/${json_file}.json`;
    if (!fs.existsSync(folder_path)) fs.mkdirSync(folder_path, { recursive: true });
    return result_path;
}

export function read_json(json_file: string): string {
    const tanggal_hari_ini = getTodayStr();
    const folder_path = `assets/json/converted/${tanggal_hari_ini}`;
    const result_path = `${folder_path}/${json_file}.json`;
    if (!fs.existsSync(folder_path)) fs.mkdirSync(folder_path, { recursive: true });
    return result_path;
}

export function write_json_data_bot(report_filename: string): string {
    const tanggal_hari_ini = getTodayStr();
    const folder_path = `report/json/${tanggal_hari_ini}`;
    const result_path = `${folder_path}/${report_filename}.json`;
    if (!fs.existsSync(folder_path)) fs.mkdirSync(folder_path, { recursive: true });
    return result_path;
}

export function write_json_data_summary(report_filename: string): string {
    const tanggal_hari_ini = getTodayStr();
    const folder_path = `report/json/${tanggal_hari_ini}`;
    const result_path = `${folder_path}/${report_filename}.json`;
    if (!fs.existsSync(folder_path)) fs.mkdirSync(folder_path, { recursive: true });
    return result_path;
}

export function write_json_chart(report_filename: string): string {
    const tanggal_hari_ini = getTodayStr();
    const folder_path = `report/json/${tanggal_hari_ini}`;
    const result_path = `${folder_path}/${report_filename}.json`;
    if (!fs.existsSync(folder_path)) fs.mkdirSync(folder_path, { recursive: true });
    return result_path;
}

export function calculate(report_filename: string): string {
    const tanggal_hari_ini = getTodayStr();
    const folder_path = `report/json/${tanggal_hari_ini}`;
    const result_path = `${folder_path}/${report_filename}.json`;
    if (!fs.existsSync(folder_path)) fs.mkdirSync(folder_path, { recursive: true });
    return result_path;
}

export function log(report_filename: string, id_test: string): string {
    const tanggal_hari_ini = getTodayStr();
    const folder_path = `log/${tanggal_hari_ini}`;
    const result_path = `${folder_path}/${report_filename}-${id_test}.log`;
    if (!fs.existsSync(folder_path)) fs.mkdirSync(folder_path, { recursive: true });
    return result_path;
}

export function report_html(report_filename: string): string {
    const tanggal_hari_ini = getTodayStr();
    const folder_path = `report/html/${tanggal_hari_ini}`;
    const result_path = `${folder_path}/${report_filename}.html`;
    if (!fs.existsSync(folder_path)) fs.mkdirSync(folder_path, { recursive: true });
    return result_path;
}

export function report_screenshoot(id_test: string): string {
    const tanggal_hari_ini = getTodayStr();
    const folder_path = `report/screenshoot/${tanggal_hari_ini}`;
    const result_path = `${folder_path}/${id_test}`;
    if (!fs.existsSync(folder_path)) fs.mkdirSync(folder_path, { recursive: true });
    if (!fs.existsSync(result_path)) fs.mkdirSync(result_path, { recursive: true });
    return result_path;
}

export function report_screenrecord(id_test: string): string {
    const tanggal_hari_ini = getTodayStr();
    const folder_path = `report/video/${tanggal_hari_ini}`;
    const result_path = `${folder_path}/${id_test}`;
    if (!fs.existsSync(folder_path)) fs.mkdirSync(folder_path, { recursive: true });
    if (!fs.existsSync(result_path)) fs.mkdirSync(result_path, { recursive: true });
    return result_path;
}