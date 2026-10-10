export function scenario(baseline, percent, minutes) {
  const reduction = Math.min(50, Math.max(0, Number(percent) || 0));
  const handling = Math.min(60, Math.max(0, Number(minutes) || 0));
  const messages = Math.round(baseline * reduction / 100);
  return {messages, hours: handling > 0 ? baseline * reduction / 100 * handling / 60 : null, reduction, handling};
}
export function csv(rows) {
  const keys = ['topic','visits','mature_queries','review_exposure_visits','gap_visits','gap_rate_pct','same_topic_return_visits','friction_flag_visits'];
  const escape = value => {
    let text = String(value ?? '');
    if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
    return '"' + text.replaceAll('"','""') + '"';
  };
  return '\ufeff' + [keys.join(','), ...rows.map(r => keys.map(k => escape(r[k])).join(','))].join('\r\n');
}
