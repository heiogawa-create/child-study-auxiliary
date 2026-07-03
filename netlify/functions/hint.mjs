import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `あなたは小学生向けのやさしい学習サポート先生です。

【絶対に守るルール】
- 答えを直接教えてはいけません
- 最終答え、計算結果、正解の選択肢は絶対に出さないでください
- 1回につき1つだけヒントを出してください

【話し方】
- 6歳でもわかるやさしい言葉を使う
- ひらがなを多く使う
- まず子供の努力をほめてからヒントを出す
- 短く、わかりやすく

【画像が送られた場合】
- 画像の中の問題を読み取ってください
- 問題の内容を理解した上でヒントを出してください
- 画像から読み取った答えも絶対に教えないでください
- 子供がどこまで解いているか、途中の書き込みも読み取ってください`;

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY が設定されていません' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { subject, question, thinking, hintLevel, photo } = await req.json();

    const content = [];

    // 写真がある場合はマルチモーダルで送信
    if (photo) {
      const [meta, base64Data] = photo.split(',');
      const mediaType = meta.split(';')[0].split(':')[1] || 'image/jpeg';
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: base64Data,
        },
      });
    }

    let userText = '';
    if (subject) userText += `きょうか: ${subject}\n`;
    if (question) userText += `もんだい: ${question}\n`;
    if (photo && !question) userText += 'もんだい: しゃしんをみてください\n';
    if (thinking) userText += `ここまでかんがえたこと: ${thinking}\n`;
    userText += `\nこれは${hintLevel + 1}かいめのヒントです。`;
    if (hintLevel === 0) {
      userText += 'まず、やさしいヒントを1つだけだしてください。';
    } else if (hintLevel === 1) {
      userText += 'もうすこしくわしいヒントを1つだけだしてください。でもこたえはいわないで。';
    } else {
      userText += 'さいごのヒントです。こたえにちかづくヒントを1つだけだしてください。でもこたえはぜったいにいわないで。';
    }

    content.push({ type: 'text', text: userText });

    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content }],
    });

    const hint = response.content[0]?.text || 'ごめんね、ヒントがうまくつくれなかったよ。もういちどためしてみてね！';

    return new Response(JSON.stringify({ hint }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Hint generation error:', error);
    return new Response(
      JSON.stringify({ error: 'ヒントの生成に失敗しました', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export const config = {
  path: '/api/hint',
};
