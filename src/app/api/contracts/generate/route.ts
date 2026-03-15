import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateAmharicContract(contract: any): string {
  const today = new Date().toLocaleDateString('am-ET', { year: 'numeric', month: 'long', day: 'numeric' });

  if (contract.type === 'long_rent' || contract.type === 'short_rent') {
    const isShort = contract.type === 'short_rent';
    return `
<!DOCTYPE html>
<html lang="am">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: 'Nyala', 'Arial Unicode MS', serif; font-size: 14px; line-height: 1.8; color: #000; margin: 0; padding: 40px; }
  h1 { text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 8px; text-decoration: underline; }
  h2 { font-size: 15px; font-weight: bold; margin-top: 24px; margin-bottom: 8px; }
  .subtitle { text-align: center; font-size: 13px; color: #444; margin-bottom: 32px; }
  .watermark { text-align: center; color: #bbb; font-size: 11px; margin-bottom: 24px; border: 1px solid #eee; padding: 8px; border-radius: 4px; }
  .parties { background: #f9f9f9; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0; }
  .party-row { display: flex; gap: 40px; margin-bottom: 16px; }
  .field { flex: 1; }
  .field-label { font-size: 11px; color: #666; font-weight: bold; text-transform: uppercase; }
  .field-value { font-size: 14px; font-weight: bold; border-bottom: 1px solid #999; padding-bottom: 2px; min-width: 200px; display: inline-block; }
  .terms { margin: 20px 0; }
  .term { margin-bottom: 12px; }
  .signature-block { margin-top: 60px; }
  .sig-row { display: flex; gap: 60px; margin-top: 40px; }
  .sig-box { flex: 1; text-align: center; }
  .sig-line { border-bottom: 1px solid #000; margin-bottom: 6px; height: 50px; }
  .sig-label { font-size: 12px; color: #444; }
  .witness-row { display: flex; gap: 60px; margin-top: 40px; }
  .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #ddd; padding-top: 16px; }
  @media print { body { padding: 20px; } .watermark { display: none; } }
</style>
</head>
<body>

<div class="watermark">⚠️ ይህ ሰነድ ገና በህግ አልጸደቀም — ለህጋዊ ፍጻሜ በሚመለከተው ቢሮ ማስረቀቅ ያስፈልጋል | NOT YET LEGALLY CERTIFIED — Must be notarized by relevant government authority</div>

<h1>${isShort ? 'አጭር ጊዜ የቤት ኪራይ ውል' : 'ረጅም ጊዜ የቤት ኪራይ ውል'}</h1>
<div class="subtitle">${isShort ? 'Short-Term Rental Agreement' : 'Long-Term Rental Agreement'} | የኢትዮጵያ የፍትሐ ብሔር ሕግ መሠረት</div>

<p>ይህ ውል የተዋዋለው በ<strong>${today}</strong> ሲሆን ከዚህ በታች በተዘረዘሩት ወገኖች መካከል ነው።</p>

<div class="parties">
  <h2>ወገን ሀ — አከራይ (Landlord / Party A)</h2>
  <div class="term">ሙሉ ስም: <span class="field-value">${contract.owner_full_name || '___________________'}</span></div>
  <div class="term">መታወቂያ ቁጥር: <span class="field-value">${contract.owner_id_number || '___________________'}</span></div>
  <div class="term">አድራሻ: <span class="field-value">${contract.owner_address || '___________________'}</span></div>
  <div class="term">ስልክ ቁጥር: <span class="field-value">${contract.owner_phone || '___________________'}</span></div>

  <h2 style="margin-top:20px">ወገን ለ — ተከራይ (Tenant / Party B)</h2>
  <div class="term">ሙሉ ስም: <span class="field-value">${contract.tenant_full_name || '___________________'}</span></div>
  <div class="term">መታወቂያ ቁጥር: <span class="field-value">${contract.tenant_id_number || '___________________'}</span></div>
  <div class="term">አድራሻ: <span class="field-value">${contract.tenant_address || '___________________'}</span></div>
  <div class="term">ስልክ ቁጥር: <span class="field-value">${contract.tenant_phone || '___________________'}</span></div>
</div>

<h2>አንቀጽ 1 — የኪራይ ንብረት (The Rental Property)</h2>
<p>አከራዩ ለተከራዩ የሚከተለውን ንብረት ያከራያሉ፦ <strong>${contract.property_address || '___________________'}</strong></p>

<h2>አንቀጽ 2 — የኪራይ ጊዜ (Rental Period)</h2>
<p>የኪራይ ውሉ ከ <strong>${contract.start_date || '___________'}</strong> ጀምሮ እስከ <strong>${contract.end_date || '___________'}</strong> ድረስ ይቆያል።</p>

<h2>አንቀጽ 3 — ኪራይ እና ክፍያ (Rent and Payment)</h2>
<p>ወርሃዊ ኪራይ፦ <strong>ብር ${contract.monthly_rent?.toLocaleString() || '___________'} (${numberToAmharicWords(contract.monthly_rent)} ብር)</strong></p>
<p>ኪራይ የሚከፈልበት ቀን፦ በእያንዳንዱ ወር <strong>${contract.payment_day || '1'}ኛ</strong> ቀን</p>
<p>የዋስትና ክፍያ፦ <strong>ብር ${contract.deposit_amount?.toLocaleString() || '___________'}</strong> — ይህ ተከራዩ ሲወጡ ምንም ጉዳት ካልደረሰ ይመለሳል።</p>

<h2>አንቀጽ 4 — ግዴታዎች (Obligations)</h2>
<p><strong>አከራይ ግዴታዎች፦</strong></p>
<p>1. ቤቱን በጥሩ ሁኔታ አቅርቦ ለተከራዩ ማስረከብ<br/>
2. ዋና ጥገናዎችን ማከናወን<br/>
3. ተከራዩ ቤቱን በሰላም እንዲጠቀሙ ማረጋገጥ</p>
<p><strong>ተከራይ ግዴታዎች፦</strong></p>
<p>1. ኪራዩን በጊዜ መክፈል<br/>
2. ቤቱን በጥንቃቄ መጠቀምና ንብረቱን አለማበላሸት<br/>
3. ቤቱን ለሌላ ሰው ሳይፈቀድ አለማከራየት<br/>
4. ቤቱን ለሌላ ዓላማ አለመጠቀም</p>

<h2>አንቀጽ 5 — ውል ማቋረጥ (Termination)</h2>
<p>${isShort ? 'አጭር ጊዜ ኪራይ በሚቆረጥበት ጊዜ ሁለቱም ወገኖች ቢያንስ 7 ቀን ቀደም ብለው ማሳወቅ አለባቸው።' : 'ረጅም ጊዜ ኪራይ በሚቋረጥበት ጊዜ ሁለቱም ወገኖች ቢያንስ አንድ ወር ቀደም ብለው በጽሑፍ ማሳወቅ አለባቸው።'}</p>
${contract.special_conditions ? `<h2>አንቀጽ 6 — ልዩ ሁኔታዎች (Special Conditions)</h2><p>${contract.special_conditions}</p>` : ''}

<h2>አንቀጽ ${contract.special_conditions ? '7' : '6'} — ክርክር አፈታት (Dispute Resolution)</h2>
<p>ማናቸውም ክርክር ወይም አለመግባባት በሁለቱ ወገኖች መካከል በሰላማዊ መንገድ ለመፍታት ይሞከራል። ካልተቻለ ጉዳዩ ለኢትዮጵያ ፍርድ ቤቶች ቀርቦ ይወሰናል።</p>

<h2>አንቀጽ ${contract.special_conditions ? '8' : '7'} — ተፈጻሚ ሕግ (Governing Law)</h2>
<p>ይህ ውል በኢትዮጵያ ፍትሐ ብሔር ሕግ ቁጥር 2993 እና ተዛማጅ ሕጎች መሠረት ይፈጸማል።</p>

<div class="signature-block">
  <p style="font-weight:bold; margin-bottom: 32px;">ሁለቱም ወገኖች ይህን ውል አንብበው ተረድተው ፈቃደኛ ሆነው ይፈርማሉ፦</p>
  <div class="sig-row">
    <div class="sig-box">
      <div class="sig-line"></div>
      <div class="sig-label">የወገን ሀ ፊርማ (Signature of Party A)<br/>${contract.owner_full_name || '___________________'}<br/>ቀን: _______________</div>
    </div>
    <div class="sig-box">
      <div class="sig-line"></div>
      <div class="sig-label">የወገን ለ ፊርማ (Signature of Party B)<br/>${contract.tenant_full_name || '___________________'}<br/>ቀን: _______________</div>
    </div>
  </div>
  <div class="witness-row">
    <div class="sig-box">
      <div class="sig-line"></div>
      <div class="sig-label">የምስክር ፊርማ 1 (Witness 1)<br/>ሙሉ ስም: ___________________<br/>ቀን: _______________</div>
    </div>
    <div class="sig-box">
      <div class="sig-line"></div>
      <div class="sig-label">የምስክር ፊርማ 2 (Witness 2)<br/>ሙሉ ስም: ___________________<br/>ቀን: _______________</div>
    </div>
  </div>
</div>

<div class="footer">
  ይህ ሰነድ በጎጆ ሪል እስቴት ፕላትፎርም (gojo-et.netlify.app) ተዘጋጅቷል | Generated by ጎጆ Real Estate Platform<br/>
  Document ID: ${contract.id} | Generated: ${today}<br/>
  ⚠️ ይህ ሰነድ ሲፀድቅ ብቻ ህጋዊ ነው — For legal validity, must be notarized at the relevant Kebele/Woreda office
</div>
</body>
</html>`;
  }

  if (contract.type === 'nda') {
    return `<!DOCTYPE html>
<html lang="am">
<head><meta charset="UTF-8">
<style>
  body { font-family: 'Nyala','Arial Unicode MS',serif; font-size:14px; line-height:1.8; color:#000; margin:0; padding:40px; }
  h1 { text-align:center; font-size:20px; font-weight:bold; text-decoration:underline; margin-bottom:8px; }
  h2 { font-size:15px; font-weight:bold; margin-top:24px; }
  .watermark { text-align:center; color:#bbb; font-size:11px; border:1px solid #eee; padding:8px; border-radius:4px; margin-bottom:24px; }
  .sig-row { display:flex; gap:60px; margin-top:40px; }
  .sig-box { flex:1; text-align:center; }
  .sig-line { border-bottom:1px solid #000; height:50px; margin-bottom:6px; }
  .footer { margin-top:40px; text-align:center; font-size:11px; color:#888; border-top:1px solid #ddd; padding-top:16px; }
</style>
</head>
<body>
<div class="watermark">⚠️ ገና ያልጸደቀ ሰነድ — NOT YET LEGALLY CERTIFIED</div>
<h1>የምስጢር ጠባቂነት ስምምነት</h1>
<p style="text-align:center;color:#444">Non-Disclosure Agreement (NDA) | በኢትዮጵያ ፍትሐ ብሔር ሕግ መሠረት</p>
<p>ይህ ስምምነት በ<strong>${today}</strong> ከዚህ በታች በተዘረዘሩት ወገኖች መካከል ተዋዋለ።</p>
<p><strong>ወገን ሀ:</strong> ${contract.owner_full_name} | መታወቂያ: ${contract.owner_id_number} | ${contract.owner_address} | ${contract.owner_phone}</p>
<p><strong>ወገን ለ:</strong> ${contract.tenant_full_name || '___________________'} | መታወቂያ: ${contract.tenant_id_number || '___'} | ${contract.tenant_address || '___'} | ${contract.tenant_phone || '___'}</p>
<h2>አንቀጽ 1 — ምስጢራዊ መረጃ ትርጉም</h2>
<p>${contract.confidential_info_description || '___________________'}</p>
<h2>አንቀጽ 2 — ግዴታዎች</h2>
<p>ወገን ለ ከዚህ ስምምነት ቀደም ብሎ ካልተወሰነ በስተቀር ምስጢራዊ መረጃውን ለሶስተኛ ወገን አይፋታም፣ አይጠቀምበትም፣ አያሰራጭም።</p>
<h2>አንቀጽ 3 — የጊዜ ገደብ</h2>
<p>ይህ ስምምነት ለ<strong>${contract.nda_duration_years || 2} ዓመታት</strong> ሥራ ላይ ይቆያል።</p>
<h2>አንቀጽ 4 — ቅጣት</h2>
<p>ስምምነቱን የጣሰ ወገን በኢትዮጵያ ሕግ መሠረት ተጠያቂ ይሆናል።</p>
<div class="sig-row">
  <div class="sig-box"><div class="sig-line"></div><div style="font-size:12px">ወገን ሀ: ${contract.owner_full_name}<br/>ቀን: ___________</div></div>
  <div class="sig-box"><div class="sig-line"></div><div style="font-size:12px">ወገን ለ: ${contract.tenant_full_name || '___________________'}<br/>ቀን: ___________</div></div>
</div>
<div class="sig-row">
  <div class="sig-box"><div class="sig-line"></div><div style="font-size:12px">ምስክር 1: ___________________<br/>ቀን: ___________</div></div>
  <div class="sig-box"><div class="sig-line"></div><div style="font-size:12px">ምስክር 2: ___________________<br/>ቀን: ___________</div></div>
</div>
<div class="footer">Generated by ጎጆ | Document ID: ${contract.id} | ${today}</div>
</body></html>`;
  }

  // Sale agreement
  return `<!DOCTYPE html>
<html lang="am">
<head><meta charset="UTF-8">
<style>
  body { font-family:'Nyala','Arial Unicode MS',serif; font-size:14px; line-height:1.8; color:#000; margin:0; padding:40px; }
  h1 { text-align:center; font-size:20px; font-weight:bold; text-decoration:underline; margin-bottom:8px; }
  h2 { font-size:15px; font-weight:bold; margin-top:24px; }
  .watermark { text-align:center; color:#bbb; font-size:11px; border:1px solid #eee; padding:8px; border-radius:4px; margin-bottom:24px; }
  .sig-row { display:flex; gap:60px; margin-top:40px; }
  .sig-box { flex:1; text-align:center; }
  .sig-line { border-bottom:1px solid #000; height:50px; margin-bottom:6px; }
  .footer { margin-top:40px; text-align:center; font-size:11px; color:#888; border-top:1px solid #ddd; padding-top:16px; }
</style>
</head>
<body>
<div class="watermark">⚠️ ገና ያልጸደቀ ሰነድ — NOT YET LEGALLY CERTIFIED</div>
<h1>የቤት ሽያጭ ውል</h1>
<p style="text-align:center;color:#444">Property Sale Agreement | በኢትዮጵያ ፍትሐ ብሔር ሕግ መሠረት</p>
<p>ይህ ውል በ<strong>${today}</strong> ተዋዋለ።</p>
<p><strong>ሻጭ (Seller / ወገን ሀ):</strong> ${contract.owner_full_name} | ID: ${contract.owner_id_number} | ${contract.owner_address} | ${contract.owner_phone}</p>
<p><strong>ገዢ (Buyer / ወገን ለ):</strong> ${contract.tenant_full_name || '___________________'} | ID: ${contract.tenant_id_number || '___'} | ${contract.tenant_address || '___'} | ${contract.tenant_phone || '___'}</p>
<h2>አንቀጽ 1 — የሚሸጠው ንብረት</h2>
<p>አድራሻ: <strong>${contract.property_address || '___________________'}</strong></p>
<h2>አንቀጽ 2 — የሽያጭ ዋጋ</h2>
<p>ዋጋ: <strong>ብር ${contract.sale_price?.toLocaleString() || '___________________'}</strong></p>
${contract.payment_schedule ? `<h2>አንቀጽ 3 — የክፍያ መርሃ ግብር</h2><p>${contract.payment_schedule}</p>` : ''}
<h2>አንቀጽ ${contract.payment_schedule ? '4' : '3'} — ዋስትና</h2>
<p>ሻጩ ንብረቱ ከማናቸውም ዕዳ ነጻ እንደሆነ ዋስትና ይሰጣሉ።</p>
<h2>አንቀጽ ${contract.payment_schedule ? '5' : '4'} — ክርክር አፈታት</h2>
<p>ክርክር ካለ በኢትዮጵያ ፍርድ ቤቶች ይወሰናል።</p>
<div class="sig-row">
  <div class="sig-box"><div class="sig-line"></div><div style="font-size:12px">ሻጭ: ${contract.owner_full_name}<br/>ቀን: ___________</div></div>
  <div class="sig-box"><div class="sig-line"></div><div style="font-size:12px">ገዢ: ${contract.tenant_full_name || '___________________'}<br/>ቀን: ___________</div></div>
</div>
<div class="sig-row">
  <div class="sig-box"><div class="sig-line"></div><div style="font-size:12px">ምስክር 1: ___________________<br/>ቀን: ___________</div></div>
  <div class="sig-box"><div class="sig-line"></div><div style="font-size:12px">ምስክር 2: ___________________<br/>ቀን: ___________</div></div>
</div>
<div class="footer">Generated by ጎጆ | Document ID: ${contract.id} | ${today}</div>
</body></html>`;
}

function numberToAmharicWords(num: number): string {
  if (!num) return '';
  if (num >= 1000000) return `${(num/1000000).toFixed(1)} ሚሊዮን`;
  if (num >= 1000) return `${(num/1000).toFixed(0)} ሺህ`;
  return num.toString();
}

export async function POST(req: NextRequest) {
  try {
    const { contractId } = await req.json();
    const { data: contract, error } = await supabase.from('contracts').select('*').eq('id', contractId).single();
    if (error || !contract) return NextResponse.json({ error: 'Contract not found' }, { status: 404 });

    const htmlContent = generateAmharicContract(contract);

    // Store HTML as the document (printable)
    const fileName = `contracts/${contractId}/contract-${Date.now()}.html`;
    const { error: uploadError } = await supabase.storage.from('contracts').upload(fileName, htmlContent, { contentType: 'text/html; charset=utf-8', upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from('contracts').getPublicUrl(fileName);

    await supabase.from('contracts').update({
      pdf_url: urlData.publicUrl,
      status: 'completed',
      generated_at: new Date().toISOString()
    }).eq('id', contractId);

    return NextResponse.json({ success: true, pdfUrl: urlData.publicUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
