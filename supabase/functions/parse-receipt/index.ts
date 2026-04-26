// Parse receipt via Lovable AI Gateway (Gemini vision)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { fileBase64, mimeType } = await req.json();
    if (!fileBase64 || !mimeType) {
      return new Response(JSON.stringify({ error: "fileBase64 and mimeType required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    // Only images supported by vision; PDFs fall back to filename only
    const isImage = mimeType.startsWith("image/");
    if (!isImage) {
      return new Response(JSON.stringify({
        merchant: null, total: null, currency: "$", purchase_date: null,
        warranty_months: null, warranty_detected: false, items: [],
        note: "PDF parsing not supported — please enter details manually.",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const dataUrl = `data:${mimeType};base64,${fileBase64}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You validate and extract data from receipt/bill images. FIRST decide if the image is actually a receipt, bill, invoice or proof of purchase. If it is NOT (e.g. selfies, random photos, memes, unrelated documents), set is_receipt=false and leave other fields empty. Only extract merchant/total/etc when is_receipt=true. Always call the submit_receipt tool.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Validate and extract this image. Is it a real receipt/bill?" },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        tools: [{
          type: "function",
          function: {
            name: "submit_receipt",
            description: "Submit extracted receipt fields after validating the image is a receipt or bill",
            parameters: {
              type: "object",
              properties: {
                is_receipt: { type: "boolean", description: "True ONLY if the image is clearly a receipt, bill, invoice, or proof of purchase (showing merchant, items/total, payment). False for unrelated photos, screenshots, selfies, memes, random documents, etc." },
                confidence: { type: "number", description: "Confidence 0-1 that this is a valid receipt/bill" },
                merchant: { type: "string", description: "Store / merchant name" },
                total: { type: "number", description: "Final total amount paid" },
                currency: { type: "string", description: "Currency symbol or code, e.g. $, €, USD" },
                purchase_date: { type: "string", description: "ISO date YYYY-MM-DD" },
                warranty_detected: { type: "boolean", description: "True if receipt explicitly mentions warranty/guarantee terms" },
                warranty_months: { type: "number", description: "Warranty duration in months if mentioned" },
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      price: { type: "number" },
                    },
                    required: ["name"],
                  },
                },
              },
              required: ["is_receipt", "confidence"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "submit_receipt" } },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI gateway error", aiRes.status, errText);
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Lovable Cloud." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway ${aiRes.status}`);
    }

    const data = await aiRes.json();
    const call = data?.choices?.[0]?.message?.tool_calls?.[0];
    let parsed: any = {};
    try { parsed = call?.function?.arguments ? JSON.parse(call.function.arguments) : {}; } catch { parsed = {}; }

    return new Response(JSON.stringify({
      merchant: parsed.merchant ?? null,
      total: typeof parsed.total === "number" ? parsed.total : null,
      currency: parsed.currency ?? "$",
      purchase_date: parsed.purchase_date ?? null,
      warranty_detected: !!parsed.warranty_detected,
      warranty_months: parsed.warranty_months ?? null,
      items: Array.isArray(parsed.items) ? parsed.items : [],
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("parse-receipt failed", e);
    return new Response(JSON.stringify({ error: e?.message ?? "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
