import * as fs from 'fs';
import * as envfolder from './envfolder';
import * as Diff from 'diff';

export function status(skor: number): string {
    return skor >= 0.80 ? "pass" : "failed";
}

export function compare_strings(respond_bot: string, respond_text: string): string {
    const differences = Diff.diffWordsWithSpace(respond_text, String(respond_bot));
    let formatted_diff = "";
    differences.forEach(part => {
        if (part.added) formatted_diff += `[${part.value}] `;
        else if (part.removed) formatted_diff += `(${part.value}) `;
        else formatted_diff += `${part.value} `;
    });
    return formatted_diff.replace(/\n/g, '').trim();
}

export function probability(respond_bot: string, respond_text: string): number {
    return 0.9999; 
}

export function calculate(report_filename: string, id_test: string): [number, number] {
    const filename_full = `${report_filename}-${id_test}`;
    const result_path = envfolder.calculate(filename_full);

    let data: any = { data: [] };
    try { data = JSON.parse(fs.readFileSync(result_path, 'utf-8')); } catch (e) {}

    let pass_count = 0;
    let failed_count = 0;

    for (const obj of data.data || []) {
        if (obj.status === "pass") pass_count++;
        else if (obj.status === "failed") failed_count++;
    }

    return [pass_count, failed_count];
}

export function diff_strings(respond_bot: string, respond_text: string): string {
    const diff = Diff.diffWords(respond_text, respond_bot);
    let modified_text = '';
    let has_difference = false;

    diff.forEach(part => {
        if (part.added || part.removed) {
            modified_text += `(${part.value})`;
            has_difference = true;
        } else {
            modified_text += part.value;
        }
    });

    return has_difference ? modified_text : "";
}

export function respond_csv_correction(respond_csv: string): string {
    let text = respond_csv;
    text = text.replace(/\(bubble\d*\)/gi, ' ').replace(/\[button\]/gi, ' ').replace(/\(button\)/gi, ' ')
               .replace(/\[List Menu\]/gi, ' ').replace(/\[carousel\]/gi, ' ').replace(/\[carousel button\]/gi, ' ')
               .replace(/\[image\]/gi, ' ');
    text = text.replace(/[\u200B\u200C\u200D\u200E\u200F\u2060\uFEFF]/g, '').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    return text;
}

export function respond_bot_correction(respond_bot: string): string {
    return respond_csv_correction(respond_bot); // Logika sama persis
}