import * as envhitllm from './envhitllm';

export async function llm_score(respond_bot: string, respond_text: string) {
    const start_time = Date.now();
    const result = await envhitllm.hit_llm_to_scoring_gemini(respond_bot, respond_text);
    const end_time = (Date.now() - start_time) / 1000;
    const api_dur = end_time.toFixed(2);
    
    return {
        metrics_formatted: result.metrics_formatted,
        output: result.output,
        explanation: result.explanation,
        api_dur: api_dur,
    };
}