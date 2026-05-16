export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'GET' && (path === '/' || path === '')) {
      return new Response(CRM_HTML, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    const cors = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method === 'GET' && path === '/api/patients') {
      const { results } = await env.DB.prepare('SELECT * FROM patients ORDER BY last ASC, first ASC').all();
      return new Response(JSON.stringify(results), { headers: cors });
    }

    if (request.method === 'POST' && path === '/api/patients') {
      const p = await request.json();
      await env.DB.prepare('INSERT OR REPLACE INTO patients (id,first,last,phone,type,provider,address,device,status,tech,delivdate,paperwork,notes,lawfirm,invoicesent,invoicedate,rxdate) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(p.id,p.first,p.last,p.phone||'',p.type||'',p.provider||'',p.address||'',p.device||'',p.status||'',p.tech||'',p.delivdate||'',p.paperwork||'',p.notes||'',p.lawfirm||'',p.invoicesent||'',p.invoicedate||'',p.rxdate||'').run();
      return new Response(JSON.stringify({ok:true}), { headers: cors });
    }

    if (request.method === 'PUT' && path.startsWith('/api/patients/')) {
      const p = await request.json();
      await env.DB.prepare('UPDATE patients SET first=?,last=?,phone=?,type=?,provider=?,address=?,device=?,status=?,tech=?,delivdate=?,paperwork=?,notes=?,lawfirm=?,invoicesent=?,invoicedate=?,rxdate=? WHERE id=?').bind(p.first,p.last,p.phone||'',p.type||'',p.provider||'',p.address||'',p.device||'',p.status||'',p.tech||'',p.delivdate||'',p.paperwork||'',p.notes||'',p.lawfirm||'',p.invoicesent||'',p.invoicedate||'',p.rxdate||'',p.id).run();
      return new Response(JSON.stringify({ok:true}), { headers: cors });
    }

    if (request.method === 'DELETE' && path.startsWith('/api/patients/')) {
      const id = decodeURIComponent(path.replace('/api/patients/', ''));
      await env.DB.prepare('DELETE FROM patients WHERE id=?').bind(id).run();
      return new Response(JSON.stringify({ok:true}), { headers: cors });
    }

    if (request.method === 'GET' && path === '/api/users') {
      const { results } = await env.DB.prepare('SELECT * FROM users ORDER BY last ASC').all();
      return new Response(JSON.stringify(results), { headers: cors });
    }

    if (request.method === 'POST' && path === '/api/users') {
      const u = await request.json();
      await env.DB.prepare('INSERT OR REPLACE INTO users (username,first,last,pin,email,phone,role) VALUES (?,?,?,?,?,?,?)').bind(u.username,u.first,u.last||'',u.pin||'',u.email||'',u.phone||'',u.role||'Admin').run();
      return new Response(JSON.stringify({ok:true}), { headers: cors });
    }

    if (request.method === 'DELETE' && path.startsWith('/api/users/')) {
      const username = decodeURIComponent(path.replace('/api/users/', ''));
      await env.DB.prepare('DELETE FROM users WHERE username=?').bind(username).run();
      return new Response(JSON.stringify({ok:true}), { headers: cors });
    }

    if (request.method === 'POST' && path === '/') {
      try {
        const body = await request.json();
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify(body),
        });
        const data = await response.json();
        return new Response(JSON.stringify(data), { headers: cors });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: cors });
      }
    }

    if (request.method === 'POST' && path === '/api/migrate') {
      try {
        await env.DB.prepare("ALTER TABLE patients ADD COLUMN rxdate TEXT DEFAULT ''").run();
        return new Response(JSON.stringify({ok:true, msg:'rxdate column added'}), { headers: cors });
      } catch(e) {
        return new Response(JSON.stringify({ok:true, msg:'Column may already exist: '+e.message}), { headers: cors });
      }
    }

    return new Response('Not found', { status: 404 });
  },
};

const CRM_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Progressive Recovery CRM</title>
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="PR CRM">
<meta name="theme-color" content="#1a56a0">
<meta name="mobile-web-app-capable" content="yes">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@500&display=swap" rel="stylesheet">
<style>
:root{
  --blue:#1a56a0;--blue-d:#134080;--blue-l:#e8f0fb;
  --amber:#d97706;--amber-bg:#fef3c7;
  --green:#16a34a;--green-bg:#dcfce7;
  --pink:#be185d;--pink-bg:#fce7f3;
  --purple:#7c3aed;--purple-bg:#ede9fe;
  --teal:#0d9488;--teal-bg:#ccfbf1;
  --g50:#f9fafb;--g100:#f3f4f6;--g200:#e5e7eb;--g300:#d1d5db;
  --g400:#9ca3af;--g500:#6b7280;--g600:#4b5563;--g700:#374151;
  --g800:#1f2937;--g900:#111827;
  --font:'DM Sans',system-ui,sans-serif;
  --mono:'DM Mono',monospace;
  --r:10px;--rs:6px;
  --sh:0 1px 3px rgba(0,0,0,.08);
  --shm:0 4px 12px rgba(0,0,0,.1);
}
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
body{font-family:var(--font);background:var(--g100);color:var(--g800);min-height:100vh;font-size:15px}
#login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--blue);padding:20px}
.login-card{background:#fff;border-radius:16px;padding:32px 28px;width:100%;max-width:360px;box-shadow:0 8px 32px rgba(0,0,0,.2)}
.login-logo{width:56px;height:56px;background:var(--blue);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:#fff;margin:0 auto 16px}
.login-title{text-align:center;font-size:20px;font-weight:600;margin-bottom:4px}
.login-sub{text-align:center;font-size:13px;color:var(--g400);margin-bottom:28px}
.login-label{font-size:12px;font-weight:500;color:var(--g600);display:block;margin-bottom:5px}
.login-input{width:100%;padding:10px 12px;border:1px solid var(--g200);border-radius:var(--rs);font-size:15px;font-family:var(--font);background:var(--g50);margin-bottom:14px}
.login-input:focus{outline:none;border-color:var(--blue)}
.login-btn{width:100%;padding:12px;background:var(--blue);color:#fff;border:none;border-radius:var(--rs);font-size:15px;font-weight:600;font-family:var(--font);cursor:pointer}
.login-btn:hover{background:var(--blue-d)}
.login-err{background:#fef2f2;border:1px solid #fca5a5;color:#dc2626;border-radius:var(--rs);padding:9px 12px;font-size:13px;margin-bottom:12px;display:none}
.login-err.show{display:block}
#app{display:none}
.topbar{background:var(--blue);padding:0 16px;height:56px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;box-shadow:0 2px 8px rgba(0,0,0,.2)}
.tb-left{display:flex;align-items:center;gap:10px}
.tb-logo{width:34px;height:34px;background:rgba(255,255,255,.18);border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:13px;color:#fff}
.tb-title{color:#fff;font-size:17px;font-weight:600}
.tb-right{display:flex;align-items:center;gap:8px}
.role-pill{background:rgba(255,255,255,.18);color:rgba(255,255,255,.9);font-size:10px;font-weight:600;padding:3px 9px;border-radius:20px;font-family:var(--mono)}
.logout-btn{background:rgba(255,255,255,.12);color:#fff;border:none;border-radius:6px;padding:5px 10px;font-size:11px;font-family:var(--font);cursor:pointer}
.tabs{display:flex;background:#fff;border-bottom:1px solid var(--g200);position:sticky;top:56px;z-index:90;overflow-x:auto}
.tab{flex:1;min-width:68px;padding:11px 4px;text-align:center;font-size:11px;font-weight:500;color:var(--g500);cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap}
.tab.active{color:var(--blue);border-bottom-color:var(--blue)}
.tab:hover:not(.active){background:var(--g50)}
.page{display:none}
.page.active{display:block}
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:12px 12px 0}
@media(max-width:480px){.stats-row{grid-template-columns:repeat(2,1fr)}}
.stat-card{background:#fff;border:1px solid var(--g200);border-radius:var(--r);padding:10px 12px;box-shadow:var(--sh)}
.stat-num{font-size:22px;font-weight:600}
.blue{color:var(--blue)}.amber{color:var(--amber)}.green{color:var(--green)}.teal{color:var(--teal)}
.stat-lbl{font-size:10px;color:var(--g400);margin-top:2px}
.toolbar{display:flex;gap:8px;padding:10px 12px;background:#fff;border-bottom:1px solid var(--g200);flex-wrap:wrap;align-items:center}
.sw{flex:1;min-width:130px;position:relative}
.sw svg{position:absolute;left:9px;top:50%;transform:translateY(-50%);width:14px;height:14px;color:var(--g400);pointer-events:none}
.si{width:100%;padding:7px 8px 7px 30px;border:1px solid var(--g200);border-radius:var(--rs);font-size:13px;font-family:var(--font);background:var(--g50)}
.si:focus{outline:none;border-color:var(--blue)}
.fs{padding:7px 8px;border:1px solid var(--g200);border-radius:var(--rs);font-size:12px;font-family:var(--font);background:var(--g50)}
.btn-add{padding:7px 14px;background:var(--blue);color:#fff;border:none;border-radius:var(--rs);font-size:13px;font-weight:600;font-family:var(--font);cursor:pointer}
.btn-add:hover{background:var(--blue-d)}
.btn-exp{padding:7px 10px;background:#fff;color:var(--g600);border:1px solid var(--g200);border-radius:var(--rs);font-size:12px;font-family:var(--font);cursor:pointer}
.date-range-row{display:flex;gap:6px;padding:8px 12px;background:#fff;border-bottom:1px solid var(--g200);flex-wrap:wrap;align-items:center}
.date-range-label{font-size:11px;font-weight:600;color:var(--g500);white-space:nowrap}
.date-range-input{padding:6px 8px;border:1px solid var(--g200);border-radius:var(--rs);font-size:12px;font-family:var(--font);background:var(--g50);color:var(--g800)}
.date-range-input:focus{outline:none;border-color:var(--blue)}
.btn-clear-dates{padding:5px 10px;background:#fff;color:var(--g500);border:1px solid var(--g200);border-radius:var(--rs);font-size:11px;font-family:var(--font);cursor:pointer}
.btn-clear-dates:hover{border-color:var(--blue);color:var(--blue)}
.date-match-count{font-size:11px;color:var(--blue);font-weight:600;margin-left:4px}
.plist{padding:10px 12px;display:flex;flex-direction:column;gap:7px}
.pcard{background:#fff;border:1px solid var(--g200);border-radius:var(--r);padding:12px 13px;cursor:pointer;display:flex;align-items:center;gap:11px;box-shadow:var(--sh)}
.pcard:hover{box-shadow:var(--shm);transform:translateY(-1px)}
.avatar{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;flex-shrink:0}
.av-c{background:#dbeafe;color:#1d4ed8}
.av-pi{background:#fef3c7;color:#92400e}
.av-wc{background:#ede9fe;color:#5b21b6}
.av-u{background:#d1fae5;color:#065f46}
.cbody{flex:1;min-width:0}
.cname{font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.csub{font-size:11px;color:var(--g500);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cmeta{display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0}
.badge{font-size:10px;font-weight:600;padding:2px 7px;border-radius:20px;white-space:nowrap}
.b-scheduled{background:var(--amber-bg);color:#92400e}
.b-delivered{background:var(--green-bg);color:#14532d}
.b-pending{background:var(--pink-bg);color:#9d174d}
.b-outfordelivery{background:var(--teal-bg);color:#134e4a}
.b-yes{background:var(--green-bg);color:#14532d}
.b-no{background:var(--g100);color:var(--g600)}
.empty{text-align:center;padding:50px 20px;color:var(--g400);font-size:13px}
.dh{background:#fff;border-bottom:1px solid var(--g200);padding:13px 16px;display:flex;align-items:center;gap:11px;position:sticky;top:56px;z-index:80}
.btn-back{padding:6px 11px;background:var(--g100);color:var(--g700);border:1px solid var(--g200);border-radius:var(--rs);font-size:12px;font-family:var(--font);cursor:pointer;flex-shrink:0}
.dtw{flex:1;min-width:0}
.dname{font-size:17px;font-weight:600}
.dcid{font-size:11px;color:var(--blue);font-family:var(--mono)}
.btn-edit{padding:6px 14px;background:var(--blue);color:#fff;border:none;border-radius:var(--rs);font-size:12px;font-weight:600;font-family:var(--font);cursor:pointer;flex-shrink:0}
.dbody{padding:12px}
.dsec{background:#fff;border:1px solid var(--g200);border-radius:var(--r);overflow:hidden;margin-bottom:10px;box-shadow:var(--sh)}
.dsec-t{font-size:10px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;color:var(--g500);padding:9px 13px 7px;border-bottom:1px solid var(--g100);background:var(--g50)}
.fr{display:flex;justify-content:space-between;align-items:flex-start;padding:9px 13px;border-bottom:1px solid var(--g100)}
.fr:last-child{border-bottom:none}
.fl{font-size:12px;color:var(--g500);flex-shrink:0;margin-right:12px}
.fv{font-size:13px;text-align:right;word-break:break-word}
.fv a{color:var(--blue);text-decoration:none}
.btn-go{width:100%;padding:13px;background:var(--blue);color:#fff;border:none;border-radius:var(--r);font-size:14px;font-weight:600;font-family:var(--font);cursor:pointer;margin-bottom:9px;display:flex;align-items:center;justify-content:center;gap:8px}
.btn-call{width:100%;padding:10px;background:#fff;color:var(--blue);border:1px solid var(--blue);border-radius:var(--r);font-size:13px;font-weight:500;font-family:var(--font);cursor:pointer;margin-bottom:9px;display:flex;align-items:center;justify-content:center;gap:7px}
.btn-del{width:100%;padding:9px;background:#fff;color:#dc2626;border:1px solid #fca5a5;border-radius:var(--r);font-size:13px;font-family:var(--font);cursor:pointer;margin-bottom:16px}
.fh{background:#fff;border-bottom:1px solid var(--g200);padding:13px 16px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:56px;z-index:80}
.ftitle{font-size:16px;font-weight:600}
.factions{display:flex;gap:8px}
.btn-cancel{padding:7px 13px;background:#fff;color:var(--g600);border:1px solid var(--g300);border-radius:var(--rs);font-size:13px;font-family:var(--font);cursor:pointer}
.btn-submit{padding:7px 17px;background:var(--blue);color:#fff;border:none;border-radius:var(--rs);font-size:13px;font-weight:600;font-family:var(--font);cursor:pointer}
.fbody{padding:12px}
.fsec{background:#fff;border:1px solid var(--g200);border-radius:var(--r);padding:13px;margin-bottom:10px;box-shadow:var(--sh)}
.fsec-t{font-size:10px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;color:var(--g500);margin-bottom:11px;padding-bottom:7px;border-bottom:1px solid var(--g100)}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:9px}
@media(max-width:400px){.frow{grid-template-columns:1fr}}
.fg{margin-bottom:9px}.fg:last-child{margin-bottom:0}
.flabel{font-size:11px;font-weight:500;color:var(--g600);display:block;margin-bottom:4px}
.finput,.fselect,.ftarea{width:100%;padding:8px 9px;border:1px solid var(--g200);border-radius:var(--rs);font-size:13px;font-family:var(--font);background:var(--g50)}
.finput:focus,.fselect:focus,.ftarea:focus{outline:none;border-color:var(--blue)}
.ftarea{resize:vertical;min-height:68px}
.pdf-upload-panel{background:linear-gradient(135deg,#0f3460 0%,#1a56a0 100%);border-radius:var(--r);padding:16px;margin-bottom:10px;box-shadow:0 4px 16px rgba(26,86,160,.25);position:relative;overflow:hidden;}
.pdf-upload-panel::before{content:'';position:absolute;top:-30px;right:-30px;width:120px;height:120px;background:rgba(255,255,255,.05);border-radius:50%;}
.pdf-panel-header{display:flex;align-items:center;gap:10px;margin-bottom:14px;}
.pdf-panel-icon{width:38px;height:38px;background:rgba(255,255,255,.15);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
.pdf-panel-title{color:#fff;font-size:14px;font-weight:600}
.pdf-panel-sub{color:rgba(255,255,255,.65);font-size:11px;margin-top:2px}
.pdf-dropzone{border:2px dashed rgba(255,255,255,.35);border-radius:8px;padding:20px 16px;text-align:center;cursor:pointer;transition:border-color .2s,background .2s;position:relative;}
.pdf-dropzone:hover,.pdf-dropzone.drag-over{border-color:rgba(255,255,255,.7);background:rgba(255,255,255,.07);}
.pdf-dropzone input[type=file]{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;}
.pdf-dz-icon{font-size:28px;margin-bottom:6px}
.pdf-dz-text{color:rgba(255,255,255,.8);font-size:13px;font-weight:500}
.pdf-dz-sub{color:rgba(255,255,255,.5);font-size:11px;margin-top:3px}
.pdf-file-selected{background:rgba(255,255,255,.1);border-radius:8px;padding:11px 13px;display:flex;align-items:center;gap:10px;margin-bottom:10px;}
.pdf-file-name{color:#fff;font-size:13px;font-weight:500;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pdf-file-size{color:rgba(255,255,255,.6);font-size:11px;flex-shrink:0}
.pdf-clear-btn{background:rgba(255,255,255,.15);border:none;color:#fff;border-radius:6px;padding:4px 9px;font-size:11px;cursor:pointer;font-family:var(--font);flex-shrink:0}
.pdf-extract-btn{width:100%;padding:11px;background:#fff;color:var(--blue);border:none;border-radius:8px;font-size:13px;font-weight:700;font-family:var(--font);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:opacity .2s,transform .1s;}
.pdf-extract-btn:hover{opacity:.92;transform:translateY(-1px)}
.pdf-extract-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
.pdf-loading{display:none;flex-direction:column;align-items:center;gap:10px;padding:16px 0 4px;}
.pdf-loading.show{display:flex}
.pdf-spinner{width:32px;height:32px;border:3px solid rgba(255,255,255,.2);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;}
@keyframes spin{to{transform:rotate(360deg)}}
.pdf-loading-text{color:rgba(255,255,255,.8);font-size:12px;font-weight:500}
.pdf-loading-step{color:rgba(255,255,255,.5);font-size:11px}
.pdf-result{display:none;background:rgba(22,163,74,.15);border:1px solid rgba(22,163,74,.4);border-radius:8px;padding:10px 13px;margin-top:10px;align-items:center;gap:8px;}
.pdf-result.show{display:flex}
.pdf-result-icon{font-size:16px;flex-shrink:0}
.pdf-result-text{color:#fff;font-size:12px;font-weight:500;flex:1}
.pdf-result-count{color:rgba(255,255,255,.7);font-size:11px}
.pdf-error{display:none;background:rgba(220,38,38,.15);border:1px solid rgba(220,38,38,.4);border-radius:8px;padding:10px 13px;margin-top:10px;align-items:center;gap:8px;}
.pdf-error.show{display:flex}
.pdf-error-text{color:#fca5a5;font-size:12px;font-weight:500;flex:1}
.finput.ai-filled,.fselect.ai-filled,.ftarea.ai-filled{border-color:#16a34a;background:#f0fdf4;transition:border-color .3s,background .3s;}
.tech-banner{background:linear-gradient(135deg,#1a56a0,#2e6dc4);color:#fff;padding:16px;margin:12px 12px 0;border-radius:var(--r)}
.tech-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}
.tech-stat{background:rgba(255,255,255,.15);border-radius:var(--rs);padding:8px 10px;text-align:center}
.update-panel{background:#fff;border:2px solid var(--blue);border-radius:var(--r);padding:16px;margin-bottom:10px}
.update-select{width:100%;padding:9px 10px;border:1px solid var(--g200);border-radius:var(--rs);font-size:14px;font-family:var(--font);background:var(--g50);margin-top:5px}
.btn-save{width:100%;padding:12px;background:var(--green);color:#fff;border:none;border-radius:var(--rs);font-size:14px;font-weight:600;font-family:var(--font);cursor:pointer;margin-top:12px}
.settings-user{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--g100);cursor:pointer}
.settings-user:last-child{border-bottom:none}
.overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:200;align-items:center;justify-content:center;padding:20px}
.overlay.show{display:flex}
.modal{background:#fff;border-radius:var(--r);padding:22px;max-width:300px;width:100%;box-shadow:var(--shm)}
.modal h3{font-size:16px;font-weight:600;margin-bottom:7px}
.modal p{font-size:13px;color:var(--g500);margin-bottom:18px}
.mbtns{display:flex;gap:8px;justify-content:flex-end}
.mbtns button{padding:8px 15px;border-radius:var(--rs);font-size:13px;font-family:var(--font);cursor:pointer;font-weight:500}
.mcancel{background:#fff;color:var(--g700);border:1px solid var(--g300)}
.mconfirm{background:#dc2626;color:#fff;border:none}
.toast{position:fixed;bottom:22px;left:50%;transform:translateX(-50%) translateY(8px);background:var(--g900);color:#fff;padding:8px 18px;border-radius:24px;font-size:13px;font-weight:500;opacity:0;transition:opacity .25s,transform .25s;pointer-events:none;z-index:9999;white-space:nowrap}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:var(--g300);border-radius:4px}
</style>
</head>
<body>
<div id="login-wrap">
  <div class="login-card">
    <div class="login-logo">PR</div>
    <div class="login-title">Progressive Recovery</div>
    <div class="login-sub">Sign in to continue</div>
    <div class="login-err" id="login-err">Incorrect username or PIN</div>
    <label class="login-label">Username</label>
    <input class="login-input" id="l-user" placeholder="Enter username" autocapitalize="none">
    <label class="login-label">PIN</label>
    <input class="login-input" id="l-pin" type="password" placeholder="Enter PIN" inputmode="numeric" maxlength="6">
    <button class="login-btn" onclick="doLogin()">Sign In</button>
  </div>
</div>
<div id="app">
  <div class="topbar">
    <div class="tb-left">
      <div class="tb-logo">PR</div>
      <div class="tb-title">Progressive Recovery</div>
    </div>
    <div class="tb-right">
      <div class="role-pill" id="role-pill">ADMIN</div>
      <button class="logout-btn" onclick="doLogout()">Sign out</button>
    </div>
  </div>
  <div class="tabs" id="admin-tabs">
    <div class="tab active" onclick="goTab('master')">All Patients</div>
    <div class="tab" onclick="goTab('commercial')">Commercial</div>
    <div class="tab" onclick="goTab('pi')">Personal Injury</div>
    <div class="tab" onclick="goTab('wc')">Work Comp</div>
    <div class="tab" onclick="goTab('users')">Users</div>
    <div class="tab" onclick="goTab('settings')">&#9881; Settings</div>
  </div>
  <div class="tabs" id="tech-tabs" style="display:none">
    <div class="tab active" onclick="goTechTab('queue')">My Queue</div>
    <div class="tab" onclick="goTechTab('done')">Completed</div>
  </div>
  <div id="p-master" class="page active">
    <div class="stats-row" id="stats-row"></div>
    <div class="toolbar">
      <div class="sw"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path stroke-linecap="round" d="M21 21l-4.35-4.35"/></svg><input class="si" id="si-master" placeholder="Search name, case ID, device, law firm..." oninput="renderMaster()"></div>
      <select class="fs" id="sf-type" onchange="renderMaster()"><option value="">All types</option><option>Commercial</option><option>Personal Injury</option><option>Work Comp</option></select>
      <select class="fs" id="sf-status" onchange="renderMaster()"><option value="">All status</option><option>Scheduled</option><option>Out for Delivery</option><option>Delivered</option><option>Pending</option></select>
      <button class="btn-add" onclick="openForm(null,'master')">+ Add</button>
      <button class="btn-exp" onclick="exportCSV()">&#8595; CSV</button>
    </div>
    <div class="date-range-row">
      <span class="date-range-label">&#128197; Rx Date:</span>
      <input class="date-range-input" type="date" id="dr-from" onchange="renderMaster()">
      <span class="date-range-label">to</span>
      <input class="date-range-input" type="date" id="dr-to" onchange="renderMaster()">
      <button class="btn-clear-dates" onclick="clearDateRange()">&#10005; Clear</button>
      <span class="date-match-count" id="dr-count"></span>
    </div>
    <div class="plist" id="list-master"></div>
  </div>
  <div id="p-commercial" class="page">
    <div class="toolbar"><div class="sw"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path stroke-linecap="round" d="M21 21l-4.35-4.35"/></svg><input class="si" id="si-commercial" placeholder="Search..." oninput="renderTab('commercial')"></div><select class="fs" id="sf-commercial-status" onchange="renderTab('commercial')"><option value="">All status</option><option>Scheduled</option><option>Out for Delivery</option><option>Delivered</option><option>Pending</option></select><button class="btn-add" onclick="openForm('Commercial','commercial')">+ Add</button></div>
    <div class="plist" id="list-commercial"></div>
  </div>
  <div id="p-pi" class="page">
    <div class="toolbar"><div class="sw"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path stroke-linecap="round" d="M21 21l-4.35-4.35"/></svg><input class="si" id="si-pi" placeholder="Search..." oninput="renderTab('pi')"></div><select class="fs" id="sf-pi-status" onchange="renderTab('pi')"><option value="">All status</option><option>Scheduled</option><option>Out for Delivery</option><option>Delivered</option><option>Pending</option></select><button class="btn-add" onclick="openForm('Personal Injury','pi')">+ Add</button></div>
    <div class="plist" id="list-pi"></div>
  </div>
  <div id="p-wc" class="page">
    <div class="toolbar"><div class="sw"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path stroke-linecap="round" d="M21 21l-4.35-4.35"/></svg><input class="si" id="si-wc" placeholder="Search..." oninput="renderTab('wc')"></div><select class="fs" id="sf-wc-status" onchange="renderTab('wc')"><option value="">All status</option><option>Scheduled</option><option>Out for Delivery</option><option>Delivered</option><option>Pending</option></select><button class="btn-add" onclick="openForm('Work Comp','wc')">+ Add</button></div>
    <div class="plist" id="list-wc"></div>
  </div>
  <div id="p-users" class="page">
    <div class="toolbar"><div class="sw"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path stroke-linecap="round" d="M21 21l-4.35-4.35"/></svg><input class="si" id="si-users" placeholder="Search users..." oninput="renderUsers()"></div><button class="btn-add" onclick="openUserForm(-1)">+ Add user</button></div>
    <div class="plist" id="list-users"></div>
  </div>
  <div id="p-settings" class="page">
    <div class="fbody" style="padding-top:14px">
      <div class="fsec">
        <div class="fsec-t">User Logins &amp; PINs</div>
        <p style="font-size:12px;color:var(--g500);margin-bottom:14px">Click any user to change their username or PIN.</p>
        <div id="settings-list"></div>
      </div>
      <div class="fsec" id="pin-card" style="display:none;border:2px solid var(--blue)">
        <div class="fsec-t" id="pin-title">Edit credentials</div>
        <div class="fg"><label class="flabel">Username</label><input class="finput" id="pe-user" autocapitalize="none"></div>
        <div class="fg"><label class="flabel">New PIN (leave blank to keep)</label><input class="finput" id="pe-pin" type="password" inputmode="numeric" maxlength="6"></div>
        <div class="fg"><label class="flabel">Confirm PIN</label><input class="finput" id="pe-pin2" type="password" inputmode="numeric" maxlength="6"></div>
        <div style="display:flex;gap:8px;margin-top:4px">
          <button class="btn-cancel" style="flex:1" onclick="document.getElementById('pin-card').style.display='none'">Cancel</button>
          <button class="btn-submit" style="flex:2" onclick="savePinEdit()">&#10003; Save</button>
        </div>
      </div>
      <div class="fsec">
        <div class="fsec-t">Change My PIN</div>
        <div class="fg"><label class="flabel">Current PIN</label><input class="finput" id="my-cur" type="password" inputmode="numeric" maxlength="6"></div>
        <div class="fg"><label class="flabel">New PIN</label><input class="finput" id="my-new" type="password" inputmode="numeric" maxlength="6"></div>
        <div class="fg"><label class="flabel">Confirm</label><input class="finput" id="my-con" type="password" inputmode="numeric" maxlength="6"></div>
        <button class="btn-submit" style="width:100%;margin-top:4px" onclick="changeMyPin()">&#10003; Update my PIN</button>
      </div>
    </div>
  </div>
  <div id="p-detail" class="page">
    <div class="dh">
      <button class="btn-back" onclick="goBack()">&#8592; Back</button>
      <div class="dtw"><div class="dname" id="d-name"></div><div class="dcid" id="d-caseid"></div></div>
      <button class="btn-edit" onclick="openEditForm()">&#9998; Edit</button>
    </div>
    <div class="dbody">
      <div id="d-actions"></div>
      <div id="d-sections"></div>
      <button class="btn-del" onclick="confirmDel()">&#128465; Delete patient</button>
    </div>
  </div>
  <div id="p-form" class="page">
    <div class="fh">
      <div class="ftitle" id="form-title">Add patient</div>
      <div class="factions">
        <button class="btn-cancel" onclick="goBack()">Cancel</button>
        <button class="btn-submit" onclick="submitForm()">Submit</button>
      </div>
    </div>
    <div class="fbody">
      <div class="pdf-upload-panel" id="pdf-panel">
        <div class="pdf-panel-header">
          <div class="pdf-panel-icon">&#129302;</div>
          <div>
            <div class="pdf-panel-title">AI Auto-Fill from PDF</div>
            <div class="pdf-panel-sub">Upload a patient PDF and Claude will extract all fields instantly</div>
          </div>
        </div>
        <div class="pdf-dropzone" id="pdf-dropzone">
          <input type="file" id="pdf-file-input" accept=".pdf,application/pdf" onchange="onPdfSelected(this)">
          <div class="pdf-dz-icon">&#128196;</div>
          <div class="pdf-dz-text">Tap to choose a PDF</div>
          <div class="pdf-dz-sub">or drag and drop here</div>
        </div>
        <div class="pdf-file-selected" id="pdf-file-info" style="display:none">
          <span style="font-size:18px">&#128196;</span>
          <span class="pdf-file-name" id="pdf-file-name">&#8212;</span>
          <span class="pdf-file-size" id="pdf-file-size"></span>
          <button class="pdf-clear-btn" onclick="clearPdfSelection()">&#10005;</button>
        </div>
        <button class="pdf-extract-btn" id="pdf-extract-btn" style="display:none" onclick="extractFromPdf()">
          <span id="pdf-btn-icon">&#10024;</span>
          <span id="pdf-btn-text">Extract and Fill Form</span>
        </button>
        <div class="pdf-loading" id="pdf-loading">
          <div class="pdf-spinner"></div>
          <div class="pdf-loading-text">Analyzing PDF with Claude...</div>
          <div class="pdf-loading-step" id="pdf-loading-step">Reading document content</div>
        </div>
        <div class="pdf-result" id="pdf-result">
          <span class="pdf-result-icon">&#9989;</span>
          <span class="pdf-result-text">Fields filled successfully!</span>
          <span class="pdf-result-count" id="pdf-result-count"></span>
        </div>
        <div class="pdf-error" id="pdf-error">
          <span style="font-size:15px;flex-shrink:0">&#9888;</span>
          <span class="pdf-error-text" id="pdf-error-text">Could not extract data. Please fill manually.</span>
        </div>
      </div>
      <div class="fsec" style="border:1px solid var(--g200)">
        <div class="fsec-t">Manual Quick-Fill</div>
        <div style="font-size:11px;color:var(--g500);margin-bottom:10px">Type key info and hit Apply or use the AI panel above.</div>
        <div class="frow">
          <div class="fg"><label class="flabel">Patient name</label><input class="finput" id="qf-name" placeholder="First Last"></div>
          <div class="fg"><label class="flabel">Phone</label><input class="finput" id="qf-phone" placeholder="(555) 000-0000"></div>
        </div>
        <div class="fg"><label class="flabel">Address</label><input class="finput" id="qf-address" placeholder="Street, City, State ZIP"></div>
        <div class="frow">
          <div class="fg"><label class="flabel">Patient type</label><select class="fselect" id="qf-type"><option value="">select</option><option>Commercial</option><option>Personal Injury</option><option>Work Comp</option></select></div>
          <div class="fg"><label class="flabel">Provider / Doctor</label><input class="finput" id="qf-provider" placeholder="e.g. Victor Bruce MD"></div>
        </div>
        <div class="fg"><label class="flabel">Device(s)</label><input class="finput" id="qf-device" placeholder="e.g. Lumbar PBM; TENS Unit"></div>
        <div class="frow">
          <div class="fg"><label class="flabel">Diagnosis / notes</label><input class="finput" id="qf-notes" placeholder="e.g. M54.5 Low Back Pain"></div>
          <div class="fg"><label class="flabel">Law firm (PI only)</label><input class="finput" id="qf-lawfirm" placeholder="Law firm name"></div>
        </div>
        <button class="btn-submit" style="width:100%;margin-top:8px;background:var(--green)" onclick="quickFill()">&#10003; Apply all to form below</button>
      </div>
      <div class="fsec">
        <div class="fsec-t">Identity</div>
        <div class="frow">
          <div class="fg"><label class="flabel">Case ID</label><input class="finput" id="f-id" placeholder="e.g. CM-3010"></div>
          <div class="fg"><label class="flabel">Patient type</label><select class="fselect" id="f-type"><option>Commercial</option><option>Personal Injury</option><option>Work Comp</option></select></div>
        </div>
        <div class="frow">
          <div class="fg"><label class="flabel">First name *</label><input class="finput" id="f-first" placeholder="First"></div>
          <div class="fg"><label class="flabel">Last name *</label><input class="finput" id="f-last" placeholder="Last"></div>
        </div>
        <div class="frow">
          <div class="fg"><label class="flabel">Phone</label><input class="finput" id="f-phone" type="tel" placeholder="(555) 000-0000"></div>
          <div class="fg"><label class="flabel">Prescription date</label><input class="finput" id="f-rxdate" type="date"></div>
        </div>
      </div>
      <div class="fsec">
        <div class="fsec-t">Provider and location</div>
        <div class="fg"><label class="flabel">Provider</label><input class="finput" id="f-provider" placeholder="Clinic or doctor name"></div>
        <div class="fg"><label class="flabel">Address</label><input class="finput" id="f-address" placeholder="Street, City, State ZIP"></div>
      </div>
      <div class="fsec">
        <div class="fsec-t">Device and delivery</div>
        <div class="fg"><label class="flabel">Device(s)</label><input class="finput" id="f-device" placeholder="e.g. ManaEZ ROM Ice CCT Brace; TENS Unit"></div>
        <div class="frow">
          <div class="fg"><label class="flabel">Delivery status</label><select class="fselect" id="f-status"><option>Scheduled</option><option>Out for Delivery</option><option>Pending</option><option>Delivered</option></select></div>
          <div class="fg"><label class="flabel">Delivery date</label><input class="finput" id="f-delivdate" type="date"></div>
        </div>
        <div class="frow">
          <div class="fg"><label class="flabel">Assigned tech</label><input class="finput" id="f-tech" placeholder="Tech name"></div>
          <div class="fg"><label class="flabel">Paperwork signed</label><select class="fselect" id="f-paperwork"><option>No</option><option>Yes</option></select></div>
        </div>
      </div>
      <div class="fsec">
        <div class="fsec-t">Legal and billing</div>
        <div class="fg"><label class="flabel">Law firm</label><input class="finput" id="f-lawfirm" placeholder="Law firm name"></div>
        <div class="frow">
          <div class="fg"><label class="flabel">Invoice sent</label><select class="fselect" id="f-invoicesent"><option value="">--</option><option>Yes</option><option>No</option></select></div>
          <div class="fg"><label class="flabel">Invoice date</label><input class="finput" id="f-invoicedate" type="date"></div>
        </div>
      </div>
      <div class="fsec">
        <div class="fsec-t">Clinical notes</div>
        <div class="fg"><textarea class="ftarea" id="f-notes" placeholder="Diagnosis, procedure, clinical details..."></textarea></div>
      </div>
    </div>
  </div>
  <div id="p-userform" class="page">
    <div class="fh">
      <div class="ftitle" id="uf-title">Add user</div>
      <div class="factions">
        <button class="btn-cancel" onclick="goTab('users')">Cancel</button>
        <button class="btn-submit" onclick="submitUserForm()">Submit</button>
      </div>
    </div>
    <div class="fbody">
      <div class="fsec">
        <div class="fsec-t">User info</div>
        <div class="frow">
          <div class="fg"><label class="flabel">First name *</label><input class="finput" id="u-first" placeholder="First"></div>
          <div class="fg"><label class="flabel">Last name *</label><input class="finput" id="u-last" placeholder="Last"></div>
        </div>
        <div class="fg"><label class="flabel">Username</label><input class="finput" id="u-username" autocapitalize="none"></div>
        <div class="fg"><label class="flabel">PIN</label><input class="finput" id="u-pin" type="password" inputmode="numeric" maxlength="6"></div>
        <div class="fg"><label class="flabel">Email</label><input class="finput" id="u-email" type="email"></div>
        <div class="fg"><label class="flabel">Phone</label><input class="finput" id="u-phone" type="tel"></div>
        <div class="fg"><label class="flabel">Role</label><select class="fselect" id="u-role"><option>Admin</option><option>Technician</option><option>Sales Rep</option><option>Manager</option></select></div>
      </div>
    </div>
  </div>
  <div id="p-queue" class="page">
    <div id="tech-banner"></div>
    <div class="plist" id="list-queue"></div>
  </div>
  <div id="p-done" class="page">
    <div class="plist" id="list-done"></div>
  </div>
  <div id="p-techdetail" class="page">
    <div class="dh">
      <button class="btn-back" onclick="goBackTech()">&#8592; Back</button>
      <div class="dtw"><div class="dname" id="td-name"></div><div class="dcid" id="td-device"></div></div>
    </div>
    <div class="dbody">
      <div id="td-actions"></div>
      <div id="td-info"></div>
      <div class="update-panel">
        <div style="font-size:12px;font-weight:600;color:var(--blue);text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px">Update this delivery</div>
        <div style="margin-bottom:12px"><div style="font-size:12px;font-weight:500;color:var(--g600)">Delivery Status</div><select class="update-select" id="td-status"><option>Scheduled</option><option>Out for Delivery</option><option>Delivered</option><option>Pending</option></select></div>
        <div><div style="font-size:12px;font-weight:500;color:var(--g600)">Paperwork Signed</div><select class="update-select" id="td-paperwork"><option>No</option><option>Yes</option></select></div>
        <button class="btn-save" onclick="saveTechUpdate()">&#10003; Save Update</button>
      </div>
    </div>
  </div>
</div>
<div class="overlay" id="del-modal">
  <div class="modal">
    <h3>Delete patient?</h3>
    <p>This cannot be undone.</p>
    <div class="mbtns">
      <button class="mcancel" onclick="closeModal()">Cancel</button>
      <button class="mconfirm" onclick="doDelete()">Delete</button>
    </div>
  </div>
</div>
<div class="toast" id="toast"></div>
<script>
var CREDS=[
  {username:'admin',pin:'1234',role:'admin',name:'Administrator'},
  {username:'cox',pin:'5678',role:'tech',name:'Christopher Cox',techName:'Christopher Cox'}
];
var SEED=[
  {id:'CM-3001',first:'Joseph',last:'Broderick',phone:'(859) 533-4887',type:'Commercial',provider:'Jaffee Sports Clinic',address:'',device:'PlasmaFlow DVT',status:'Scheduled',tech:'',delivdate:'',paperwork:'No',notes:'Pre-op left hip arthroplasty; hip DJD',lawfirm:'',invoicesent:'',invoicedate:'',rxdate:''},
  {id:'CM-3002',first:'Cassandra',last:'Caraway',phone:'(515) 720-3252',type:'Commercial',provider:'Jaffee Sports Clinic',address:'',device:'ManaEZ ROM Ice CCT Brace',status:'Delivered',tech:'',delivdate:'',paperwork:'No',notes:'Suspected ACL tear left knee',lawfirm:'',invoicesent:'',invoicedate:'',rxdate:''},
  {id:'CM-3003',first:'Cheryl',last:'Emerson',phone:'(715) 781-3634',type:'Commercial',provider:'Jaffee Sports Clinic',address:'',device:'ManaEZ ROM Ice CCT Brace',status:'Delivered',tech:'',delivdate:'2026-04-19',paperwork:'Yes',notes:'Right knee insufficiency fracture, meniscus tear',lawfirm:'',invoicesent:'',invoicedate:'',rxdate:''},
  {id:'CM-3004',first:'Eriber',last:'Maldonado',phone:'(239) 776-5073',type:'Commercial',provider:'Jaffee Sports Clinic',address:'',device:'ManaEZ ROM Ice CCT Brace; PlasmaFlow DVT',status:'Scheduled',tech:'',delivdate:'',paperwork:'No',notes:'Left knee meniscus tear',lawfirm:'',invoicesent:'',invoicedate:'',rxdate:''},
  {id:'CM-3005',first:'Scott',last:'Onanian',phone:'(508) 317-0994',type:'Commercial',provider:'Jaffee Sports Clinic',address:'',device:'ManaEZ Shoulder Ice CCT Brace',status:'Scheduled',tech:'',delivdate:'',paperwork:'No',notes:'Right rotator cuff tear',lawfirm:'',invoicesent:'',invoicedate:'',rxdate:''},
  {id:'CM-3006',first:'Barbara',last:'Rink',phone:'(239) 228-5868',type:'Commercial',provider:'Jaffee Sports Clinic',address:'',device:'ManaEZ ROM Ice CCT Brace',status:'Scheduled',tech:'',delivdate:'',paperwork:'No',notes:'Left knee insufficiency fracture',lawfirm:'',invoicesent:'',invoicedate:'',rxdate:''},
  {id:'CM-3007',first:'Bryan',last:'Twente',phone:'',type:'Commercial',provider:'Jaffee Sports Clinic',address:'',device:'ManaEZ ROM Ice CCT Brace; ManaFlexx2 (NMES)',status:'Scheduled',tech:'',delivdate:'',paperwork:'No',notes:'Right knee fibular fracture',lawfirm:'',invoicesent:'',invoicedate:'',rxdate:''},
  {id:'CM-3008',first:'Rolaine',last:'Winter',phone:'(949) 482-7671',type:'Commercial',provider:'Jaffee Sports Clinic',address:'',device:'ManaEZ ROM Ice CCT Brace',status:'Scheduled',tech:'',delivdate:'',paperwork:'No',notes:'Left knee DJD, Bakers cyst',lawfirm:'',invoicesent:'',invoicedate:'',rxdate:''},
  {id:'WC-2001',first:'Roberto',last:'Garcia',phone:'(240) 273-2133',type:'Work Comp',provider:'Jaffee Sports Clinic',address:'123 Main St',device:'PBM (Light Therapy); Portable Ultrasound; CryoPush CCT',status:'Scheduled',tech:'',delivdate:'',paperwork:'No',notes:'Right shoulder injury; acute biceps tendon rupture',lawfirm:'',invoicesent:'',invoicedate:'',rxdate:''},
  {id:'PI-1001',first:'Ameishia',last:'Milam',phone:'562-608-5490',type:'Personal Injury',provider:'Victor Bruce MD',address:'5324 Desert Blossom Rd, Las Vegas NV',device:'PBM Cervical; NMES',status:'Scheduled',tech:'Christopher Cox',delivdate:'',paperwork:'Yes',notes:'',lawfirm:'Diecira Burr and Associates',invoicesent:'',invoicedate:'',rxdate:''},
  {id:'PI-1002',first:'Dinina',last:'Denson',phone:'702-682-5247',type:'Personal Injury',provider:'Victor Bruce MD',address:'1405 S Nellis Blvd, Las Vegas NV',device:'TENS Unit; Back Brace',status:'Scheduled',tech:'Christopher Cox',delivdate:'',paperwork:'Yes',notes:'',lawfirm:'Winners Circle Injury Law',invoicesent:'',invoicedate:'',rxdate:''},
  {id:'PI-1003',first:'Lester',last:'Denson',phone:'702-488-5522',type:'Personal Injury',provider:'Victor Bruce MD',address:'1405 S Nellis Blvd, Las Vegas NV',device:'TENS Unit',status:'Scheduled',tech:'Christopher Cox',delivdate:'',paperwork:'Yes',notes:'',lawfirm:'Winners Circle Injury Law',invoicesent:'Yes',invoicedate:'2026-01-28',rxdate:''},
  {id:'PI-1004',first:'Chaucey',last:'Bryant',phone:'702-686-8031',type:'Personal Injury',provider:'Victor Bruce MD',address:'9717 Plateau Heights PL Las Vegas NV 89196',device:'Lumbar PBM',status:'Scheduled',tech:'Christopher Cox',delivdate:'',paperwork:'Yes',notes:'',lawfirm:'Law Office of Ryan Alexander',invoicesent:'',invoicedate:'',rxdate:''},
  {id:'PI-1005',first:'George',last:'Sadler',phone:'725-206-9406',type:'Personal Injury',provider:'Victor Bruce MD',address:'4817 Pagoda Springs Dr Las Vegas 89319',device:'Shoulder CCT; Universal Wrap; Lumbar PBM; Cervical PBM; NMES (2)',status:'Scheduled',tech:'Christopher Cox',delivdate:'',paperwork:'Yes',notes:'',lawfirm:'CEGA Law Group',invoicesent:'',invoicedate:'',rxdate:''},
  {id:'PI-1006',first:'Antonio',last:'Lewis',phone:'415-724-8977',type:'Personal Injury',provider:'Victor Bruce MD',address:'3001 West Warm Springs Rd Henderson NV 89014',device:'Lumbar PBM; Thoracic Brace',status:'Scheduled',tech:'Christopher Cox',delivdate:'',paperwork:'Yes',notes:'',lawfirm:'Richard Harris Law Firm',invoicesent:'',invoicedate:'',rxdate:''},
  {id:'PI-1007',first:'Arturo',last:'Jaimes',phone:'702-569-8098',type:'Personal Injury',provider:'Victor Bruce MD',address:'6955 N Durango Dr #2004 Las Vegas NV 89149',device:'Lumbar PBM; TENS',status:'Scheduled',tech:'Christopher Cox',delivdate:'',paperwork:'No',notes:'',lawfirm:'',invoicesent:'',invoicedate:'',rxdate:''},
  {id:'PI-1008',first:'Katrina',last:'Larson',phone:'725-321-9242',type:'Personal Injury',provider:'Victor Bruce MD',address:'1645 Sobatini Dr Henderson NV 59082',device:'Lumbar PBM; Cervical Brace',status:'Scheduled',tech:'Christopher Cox',delivdate:'',paperwork:'No',notes:'',lawfirm:'JG Law',invoicesent:'',invoicedate:'',rxdate:''}
];
var SEED_USERS=[
  {first:'Admin',last:'User',username:'admin',pin:'1234',email:'admin@progressiverec.com',phone:'',role:'Admin'},
  {first:'Christopher',last:'Cox',username:'cox',pin:'5678',email:'c.cox@progressiverec.com',phone:'702-555-0100',role:'Technician'}
];
var API='';
var patients=[],users=[];
var dataLoaded=false;
async function apiGet(path){var r=await fetch(API+path);return r.json();}
async function apiPost(path,data){var r=await fetch(API+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});return r.json();}
async function apiPut(path,data){var r=await fetch(API+path,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});return r.json();}
async function apiDelete(path){var r=await fetch(API+path,{method:'DELETE'});return r.json();}
async function loadData(){
  try{
    await fetch(API+'/api/migrate',{method:'POST'}).catch(function(){});
    var pResult=await apiGet('/api/patients');
    var uResult=await apiGet('/api/users');
    patients=Array.isArray(pResult)?pResult:SEED;
    users=(Array.isArray(uResult)&&uResult.length>0)?uResult:SEED_USERS;
    if(!Array.isArray(uResult)||uResult.length===0){
      for(var i=0;i<SEED_USERS.length;i++){await apiPost('/api/users',SEED_USERS[i]);}
      users=SEED_USERS;
    }
    dataLoaded=true;
  }catch(e){
    patients=SEED;users=SEED_USERS;dataLoaded=true;
  }
}
var CU=null,curTab='master',curIdx=-1,editP=false,editUIdx=-1,retTab='master',techTab='queue',techIdx=-1,pinIdx=-1;
var TAB_TYPE={commercial:'Commercial',pi:'Personal Injury',wc:'Work Comp'};
var ALL_PAGES=['master','commercial','pi','wc','users','settings','detail','form','userform','queue','done','techdetail'];
function showPage(id){ALL_PAGES.forEach(function(p){var el=document.getElementById('p-'+p);if(el)el.classList.toggle('active',p===id);});window.scrollTo(0,0);}
function doLogin(){
  var u=document.getElementById('l-user').value.trim().toLowerCase();
  var p=document.getElementById('l-pin').value.trim();
  var m=CREDS.find(function(c){return c.username===u&&c.pin===p;});
  if(!m){document.getElementById('login-err').classList.add('show');return;}
  document.getElementById('login-err').classList.remove('show');
  CU=m;
  document.getElementById('login-wrap').style.display='none';
  document.getElementById('app').style.display='block';
  document.getElementById('role-pill').textContent=m.role==='admin'?'ADMIN':'TECH';
  document.getElementById('app').style.opacity='0.5';
  loadData().then(function(){
    document.getElementById('app').style.opacity='1';
    users.forEach(function(u){var c=CREDS.find(function(c){return c.username===u.username;});if(c&&u.pin)c.pin=u.pin;});
    if(m.role==='admin'){
      document.getElementById('admin-tabs').style.display='flex';
      document.getElementById('tech-tabs').style.display='none';
      showPage('master');renderStats();renderMaster();
    }else{
      document.getElementById('admin-tabs').style.display='none';
      document.getElementById('tech-tabs').style.display='flex';
      showPage('queue');renderTechQueue();
    }
  });
}
document.getElementById('l-pin').addEventListener('keydown',function(e){if(e.key==='Enter')doLogin();});
document.getElementById('l-user').addEventListener('keydown',function(e){if(e.key==='Enter')document.getElementById('l-pin').focus();});
function doLogout(){CU=null;document.getElementById('l-user').value='';document.getElementById('l-pin').value='';document.getElementById('app').style.display='none';document.getElementById('login-wrap').style.display='flex';}
function goTab(t){
  curTab=t;
  document.querySelectorAll('#admin-tabs .tab').forEach(function(el,i){el.classList.toggle('active',['master','commercial','pi','wc','users','settings'][i]===t);});
  showPage(t);
  if(t==='master'){renderStats();renderMaster();}
  else if(t==='users')renderUsers();
  else if(t==='settings')renderSettings();
  else renderTab(t);
}
function goBack(){
  showPage(retTab);
  document.querySelectorAll('#admin-tabs .tab').forEach(function(el,i){el.classList.toggle('active',['master','commercial','pi','wc','users','settings'][i]===retTab);});
  if(retTab==='master'){renderStats();renderMaster();}
  else if(retTab==='users')renderUsers();
  else if(retTab==='settings')renderSettings();
  else renderTab(retTab);
}
function goTechTab(t){techTab=t;document.querySelectorAll('#tech-tabs .tab').forEach(function(el,i){el.classList.toggle('active',['queue','done'][i]===t);});showPage(t);if(t==='queue')renderTechQueue();else renderTechDone();}
function goBackTech(){showPage(techTab);if(techTab==='queue')renderTechQueue();else renderTechDone();}
function ini(p){return(p.first[0]||'').toUpperCase()+(p.last[0]||'').toUpperCase();}
function avCls(t){return t==='Commercial'?'av-c':t==='Personal Injury'?'av-pi':'av-wc';}
function statusBadge(s){var c=s==='Delivered'?'b-delivered':s==='Pending'?'b-pending':s==='Out for Delivery'?'b-outfordelivery':'b-scheduled';return '<span class="badge '+c+'">'+s+'</span>';}
function yesNo(v){return (v||'').toLowerCase()==='yes'?'<span class="badge b-yes">Yes</span>':'<span class="badge b-no">No</span>';}
function toast(m){var t=document.getElementById('toast');t.textContent=m;t.classList.add('show');setTimeout(function(){t.classList.remove('show');},2200);}
function fmtDate(d){if(!d)return'--';var parts=d.split('-');if(parts.length===3)return parts[1]+'/'+parts[2]+'/'+parts[0];return d;}
function renderStats(){
  var tot=patients.length,sch=0,ofd=0,del=0,pend=0;
  patients.forEach(function(p){if(p.status==='Scheduled')sch++;else if(p.status==='Out for Delivery')ofd++;else if(p.status==='Delivered')del++;else pend++;});
  document.getElementById('stats-row').innerHTML='<div class="stat-card"><div class="stat-num blue">'+tot+'</div><div class="stat-lbl">Total patients</div></div><div class="stat-card"><div class="stat-num amber">'+sch+'</div><div class="stat-lbl">Scheduled</div></div><div class="stat-card"><div class="stat-num teal">'+ofd+'</div><div class="stat-lbl">Out for Del.</div></div><div class="stat-card"><div class="stat-num green">'+del+'</div><div class="stat-lbl">Delivered</div></div>';
}
function clearDateRange(){document.getElementById('dr-from').value='';document.getElementById('dr-to').value='';document.getElementById('dr-count').textContent='';renderMaster();}
function inDateRange(rxdate,from,to){if(!from&&!to)return true;if(!rxdate)return false;if(from&&rxdate<from)return false;if(to&&rxdate>to)return false;return true;}
function cardHTML(p){
  var idx=patients.indexOf(p);
  var rxBadge=p.rxdate?'<span style="font-size:10px;color:var(--g400)">'+fmtDate(p.rxdate)+'</span>':'';
  return '<div class="pcard" onclick="showDetail('+idx+')" role="button"><div class="avatar '+avCls(p.type)+'">'+ini(p)+'</div><div class="cbody"><div class="cname">'+p.first+' '+p.last+'</div><div class="csub">'+p.id+' - '+(p.lawfirm||p.provider)+'</div></div><div class="cmeta">'+statusBadge(p.status)+rxBadge+'</div></div>';
}
function filterList(list,q,sf){return list.filter(function(p){var nm=(p.first+' '+p.last+' '+p.id+' '+p.provider+' '+p.device+' '+(p.lawfirm||'')).toLowerCase();return nm.indexOf(q)>-1&&(!sf||p.status===sf);});}
function renderMaster(){
  var q=(document.getElementById('si-master').value||'').toLowerCase();
  var tf=document.getElementById('sf-type').value;
  var sf=document.getElementById('sf-status').value;
  var from=document.getElementById('dr-from').value;
  var to=document.getElementById('dr-to').value;
  var list=patients.filter(function(p){var nm=(p.first+' '+p.last+' '+p.id+' '+p.device+' '+(p.lawfirm||'')).toLowerCase();return nm.indexOf(q)>-1&&(!tf||p.type===tf)&&(!sf||p.status===sf)&&inDateRange(p.rxdate,from,to);});
  var countEl=document.getElementById('dr-count');
  if(from||to){countEl.textContent=list.length+' match'+(list.length!==1?'es':'');}else{countEl.textContent='';}
  document.getElementById('list-master').innerHTML=list.length?list.map(cardHTML).join(''):'<div class="empty">No patients found</div>';
}
function renderTab(tab){var q=(document.getElementById('si-'+tab).value||'').toLowerCase();var sf=document.getElementById('sf-'+tab+'-status').value;var list=filterList(patients.filter(function(p){return p.type===TAB_TYPE[tab];}),q,sf);document.getElementById('list-'+tab).innerHTML=list.length?list.map(cardHTML).join(''):'<div class="empty">No patients found</div>';}
function showDetail(idx){
  curIdx=idx;retTab=curTab;
  var p=patients[idx];
  document.getElementById('d-name').textContent=p.first+' '+p.last;
  document.getElementById('d-caseid').textContent=p.id+' - '+p.type;
  var act='';
  if(p.address)act+='<button class="btn-go" onclick="window.open(\'https://maps.google.com/?q=\'+encodeURIComponent(patients['+idx+'].address),\'_blank\')">Navigate to Patient</button>';
  if(p.phone)act+='<button class="btn-call" onclick="window.location.href=\'tel:\'+patients['+idx+'].phone">Call '+p.phone+'</button>';
  document.getElementById('d-actions').innerHTML=act;
  function row(l,v){return'<div class="fr"><span class="fl">'+l+'</span><span class="fv">'+v+'</span></div>';}
  var s1='<div class="dsec"><div class="dsec-t">Patient info</div>'+row('Phone',p.phone?'<a href="tel:'+p.phone+'">'+p.phone+'</a>':'--')+row('Provider',p.provider||'--')+(p.rxdate?row('Prescription date',fmtDate(p.rxdate)):'')+( p.address?row('Address',p.address):'')+(p.notes?row('Notes',p.notes):'')+' </div>';
  var s2='<div class="dsec"><div class="dsec-t">Device and delivery</div>'+row('Device(s)',p.device||'--')+row('Status',statusBadge(p.status))+(p.delivdate?row('Delivery date',fmtDate(p.delivdate)):'')+row('Assigned tech',p.tech||'--')+row('Paperwork',yesNo(p.paperwork))+'</div>';
  var s3=(p.lawfirm||p.invoicesent||p.invoicedate)?'<div class="dsec"><div class="dsec-t">Legal and billing</div>'+(p.lawfirm?row('Law firm',p.lawfirm):'')+row('Invoice sent',yesNo(p.invoicesent))+(p.invoicedate?row('Invoice date',fmtDate(p.invoicedate)):'')+' </div>':'';
  document.getElementById('d-sections').innerHTML=s1+s2+s3;
  showPage('detail');
}
function clearForm(){
  ['id','first','last','phone','provider','address','device','tech','delivdate','notes','lawfirm','invoicedate','rxdate'].forEach(function(f){document.getElementById('f-'+f).value='';});
  document.getElementById('f-type').value='Commercial';
  document.getElementById('f-status').value='Scheduled';
  document.getElementById('f-paperwork').value='No';
  document.getElementById('f-invoicesent').value='';
  ['qf-name','qf-phone','qf-address','qf-provider','qf-device','qf-notes','qf-lawfirm'].forEach(function(id){document.getElementById(id).value='';});
  document.getElementById('qf-type').value='';
  clearPdfSelection();
  resetPdfResult();
  document.querySelectorAll('.ai-filled').forEach(function(el){el.classList.remove('ai-filled');});
}
function openForm(preType,fromTab){editP=false;retTab=fromTab||curTab;document.getElementById('form-title').textContent='Add patient';clearForm();if(preType)document.getElementById('f-type').value=preType;document.getElementById('pdf-panel').style.display='block';showPage('form');}
function openEditForm(){
  editP=true;var p=patients[curIdx];
  document.getElementById('form-title').textContent='Edit patient';
  document.getElementById('f-id').value=p.id;
  document.getElementById('f-first').value=p.first;
  document.getElementById('f-last').value=p.last;
  document.getElementById('f-phone').value=p.phone;
  document.getElementById('f-type').value=p.type;
  document.getElementById('f-provider').value=p.provider;
  document.getElementById('f-address').value=p.address;
  document.getElementById('f-device').value=p.device;
  document.getElementById('f-status').value=p.status;
  document.getElementById('f-delivdate').value=p.delivdate;
  document.getElementById('f-tech').value=p.tech;
  document.getElementById('f-paperwork').value=(p.paperwork||'No').toLowerCase()==='yes'?'Yes':'No';
  document.getElementById('f-notes').value=p.notes;
  document.getElementById('f-lawfirm').value=p.lawfirm||'';
  document.getElementById('f-invoicesent').value=p.invoicesent||'';
  document.getElementById('f-invoicedate').value=p.invoicedate||'';
  document.getElementById('f-rxdate').value=p.rxdate||'';
  document.getElementById('pdf-panel').style.display='block';
  showPage('form');
}
function quickFill(){
  var name=document.getElementById('qf-name').value.trim();
  if(name){var parts=name.split(' ');document.getElementById('f-first').value=parts[0]||'';document.getElementById('f-last').value=parts.slice(1).join(' ')||'';}
  var map={phone:'f-phone',address:'f-address',provider:'f-provider',device:'f-device',notes:'f-notes',lawfirm:'f-lawfirm'};
  Object.keys(map).forEach(function(k){var v=document.getElementById('qf-'+k).value;if(v)document.getElementById(map[k]).value=v;});
  var t=document.getElementById('qf-type').value;if(t)document.getElementById('f-type').value=t;
  toast('Form filled - review and submit!');
  document.getElementById('f-first').scrollIntoView({behavior:'smooth',block:'center'});
}
function submitForm(){
  var first=document.getElementById('f-first').value.trim();
  var last=document.getElementById('f-last').value.trim();
  if(!first||!last){toast('First and last name required');return;}
  var type=document.getElementById('f-type').value;
  var prefix=type==='Commercial'?'CM-':type==='Personal Injury'?'PI-':'WC-';
  var cid=document.getElementById('f-id').value.trim()||prefix+(1000+Math.floor(Math.random()*8999));
  var p={id:cid,first:first,last:last,phone:document.getElementById('f-phone').value.trim(),type:type,provider:document.getElementById('f-provider').value.trim(),address:document.getElementById('f-address').value.trim(),device:document.getElementById('f-device').value.trim(),status:document.getElementById('f-status').value,delivdate:document.getElementById('f-delivdate').value,tech:document.getElementById('f-tech').value.trim(),paperwork:document.getElementById('f-paperwork').value,notes:document.getElementById('f-notes').value.trim(),lawfirm:document.getElementById('f-lawfirm').value.trim(),invoicesent:document.getElementById('f-invoicesent').value,invoicedate:document.getElementById('f-invoicedate').value,rxdate:document.getElementById('f-rxdate').value};
  if(editP){apiPut('/api/patients/'+p.id,p).then(function(){patients[curIdx]=p;toast('Patient updated');showDetail(curIdx);});}
  else{apiPost('/api/patients',p).then(function(){patients.unshift(p);toast('Patient added');goBack();renderStats();});}
}
function confirmDel(){document.getElementById('del-modal').classList.add('show');}
function closeModal(){document.getElementById('del-modal').classList.remove('show');}
function doDelete(){var pid=patients[curIdx].id;apiDelete('/api/patients/'+pid).then(function(){patients.splice(curIdx,1);closeModal();toast('Patient deleted');showPage(retTab);if(retTab==='master'){renderStats();renderMaster();}else renderTab(retTab);});}
function renderUsers(){
  var q=(document.getElementById('si-users').value||'').toLowerCase();
  var list=users.filter(function(u){return(u.first+' '+u.last+' '+(u.email||'')+' '+u.role).toLowerCase().indexOf(q)>-1;});
  document.getElementById('list-users').innerHTML=list.length?list.map(function(u,i){return '<div class="pcard"><div class="avatar av-u">'+(u.first[0]||'').toUpperCase()+(u.last[0]||'').toUpperCase()+'</div><div class="cbody"><div class="cname">'+u.first+' '+u.last+'</div><div class="csub">'+u.role+(u.username?' - @'+u.username:'')+'</div></div><button class="btn-edit" style="font-size:11px;padding:5px 11px" onclick="openUserForm('+i+')">Edit</button></div>';}).join(''):'<div class="empty">No users</div>';
}
function openUserForm(idx){
  editUIdx=idx;
  document.getElementById('uf-title').textContent=idx>=0?'Edit user':'Add user';
  if(idx>=0){var u=users[idx];document.getElementById('u-first').value=u.first;document.getElementById('u-last').value=u.last||'';document.getElementById('u-username').value=u.username||'';document.getElementById('u-pin').value=u.pin||'';document.getElementById('u-email').value=u.email||'';document.getElementById('u-phone').value=u.phone||'';document.getElementById('u-role').value=u.role||'Admin';}
  else{['u-first','u-last','u-username','u-pin','u-email','u-phone'].forEach(function(id){document.getElementById(id).value='';});document.getElementById('u-role').value='Technician';}
  showPage('userform');
}
function submitUserForm(){var first=document.getElementById('u-first').value.trim();if(!first){toast('Name required');return;}var u={first:first,last:document.getElementById('u-last').value.trim(),username:document.getElementById('u-username').value.trim().toLowerCase(),pin:document.getElementById('u-pin').value.trim(),email:document.getElementById('u-email').value.trim(),phone:document.getElementById('u-phone').value.trim(),role:document.getElementById('u-role').value};apiPost('/api/users',u).then(function(){if(editUIdx>=0){users[editUIdx]=u;toast('User updated');}else{users.push(u);toast('User added');}goTab('users');});}
function renderSettings(){document.getElementById('settings-list').innerHTML=users.map(function(u,i){return '<div class="settings-user" onclick="openPinEdit('+i+')"><div class="avatar av-u" style="width:32px;height:32px;font-size:11px">'+(u.first[0]||'').toUpperCase()+(u.last[0]||'').toUpperCase()+'</div><div style="flex:1"><div style="font-size:13px;font-weight:500">'+u.first+' '+u.last+'</div><div style="font-size:11px;color:var(--g500)">@'+(u.username||'--')+' - '+u.role+'</div></div><span style="font-size:11px;color:var(--blue);font-weight:500">Edit</span></div>';}).join('');document.getElementById('pin-card').style.display='none';}
function openPinEdit(idx){pinIdx=idx;var u=users[idx];document.getElementById('pin-title').textContent='Edit - '+u.first+' '+u.last;document.getElementById('pe-user').value=u.username||'';document.getElementById('pe-pin').value='';document.getElementById('pe-pin2').value='';document.getElementById('pin-card').style.display='block';}
function savePinEdit(){
  if(pinIdx<0)return;
  var uname=document.getElementById('pe-user').value.trim().toLowerCase();
  var p1=document.getElementById('pe-pin').value.trim();
  var p2=document.getElementById('pe-pin2').value.trim();
  if(!uname){toast('Username required');return;}
  if(p1||p2){if(p1!==p2){toast('PINs do not match');return;}if(p1.length<4){toast('PIN must be 4+ digits');return;}}
  users[pinIdx].username=uname;if(p1)users[pinIdx].pin=p1;
  var cr=CREDS.find(function(c){return c.username===CU.username;});if(cr){cr.username=uname;if(p1)cr.pin=p1;}
  apiPost('/api/users',users[pinIdx]).then(function(){toast('Credentials updated');renderSettings();});
}
function changeMyPin(){
  var cur=document.getElementById('my-cur').value.trim();
  var n1=document.getElementById('my-new').value.trim();
  var n2=document.getElementById('my-con').value.trim();
  if(cur!==CU.pin){toast('Current PIN incorrect');return;}
  if(!n1||n1!==n2){toast('New PINs do not match');return;}
  if(n1.length<4){toast('PIN must be 4+ digits');return;}
  CU.pin=n1;var u=users.find(function(u){return u.username===CU.username;});if(u){u.pin=n1;apiPost('/api/users',u);}
  document.getElementById('my-cur').value='';document.getElementById('my-new').value='';document.getElementById('my-con').value='';
  toast('Your PIN updated');
}
function exportCSV(){
  var h=['Case ID','First Name','Last Name','Phone','Patient Type','Provider','Address','Device','Delivery Status','Assigned Tech','Delivery Date','Paperwork Signed','Law Firm','Invoice Sent','Invoice Date','Prescription Date','Notes'];
  var rows=patients.map(function(p){return[p.id,p.first,p.last,p.phone,p.type,p.provider,p.address,p.device,p.status,p.tech,p.delivdate,p.paperwork,p.lawfirm||'',p.invoicesent||'',p.invoicedate||'',p.rxdate||'','"'+(p.notes||'').replace(/"/g,'""')+'"'].join(',');});
  var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([[h.join(',')].concat(rows).join('\n')],{type:'text/csv'}));a.download='PR-CRM-'+new Date().toISOString().slice(0,10)+'.csv';a.click();toast('CSV exported');
}
function techPats(){return patients.filter(function(p){return p.tech===CU.techName&&p.type==='Personal Injury';});}
function renderTechQueue(){
  var mine=techPats(),pending=mine.filter(function(p){return p.status!=='Delivered';});
  var del=mine.filter(function(p){return p.status==='Delivered';}).length;
  var ofd=mine.filter(function(p){return p.status==='Out for Delivery';}).length;
  document.getElementById('tech-banner').innerHTML='<div class="tech-banner"><div style="font-size:18px;font-weight:600;margin-bottom:2px">'+CU.name+'</div><div style="font-size:12px;opacity:.8">Personal Injury Technician - Las Vegas</div><div class="tech-stats"><div class="tech-stat"><div style="font-size:20px;font-weight:600">'+pending.length+'</div><div style="font-size:10px;opacity:.8">To Deliver</div></div><div class="tech-stat"><div style="font-size:20px;font-weight:600">'+ofd+'</div><div style="font-size:10px;opacity:.8">Out for Del.</div></div><div class="tech-stat"><div style="font-size:20px;font-weight:600">'+del+'</div><div style="font-size:10px;opacity:.8">Delivered</div></div></div></div>';
  document.getElementById('list-queue').innerHTML=pending.length?pending.map(function(p){return techCard(p,patients.indexOf(p));}).join(''):'<div class="empty">All deliveries complete!</div>';
}
function renderTechDone(){var done=techPats().filter(function(p){return p.status==='Delivered';});document.getElementById('list-done').innerHTML=done.length?done.map(function(p){return techCard(p,patients.indexOf(p));}).join(''):'<div class="empty">No completed deliveries</div>';}
function techCard(p,idx){return '<div class="pcard" onclick="showTechDetail('+idx+')" role="button"><div class="avatar av-pi">'+ini(p)+'</div><div class="cbody"><div class="cname">'+p.first+' '+p.last+'</div><div class="csub">'+p.device+'</div></div><div class="cmeta">'+statusBadge(p.status)+yesNo(p.paperwork)+'</div></div>';}
function showTechDetail(idx){
  techIdx=idx;var p=patients[idx];
  document.getElementById('td-name').textContent=p.first+' '+p.last;
  document.getElementById('td-device').textContent=p.device;
  var act='';
  if(p.address)act+='<button class="btn-go" onclick="window.open(\'https://maps.google.com/?q=\'+encodeURIComponent(patients['+idx+'].address),\'_blank\')">Navigate</button>';
  if(p.phone)act+='<button class="btn-call" onclick="window.location.href=\'tel:\'+patients['+idx+'].phone">Call '+p.phone+'</button>';
  document.getElementById('td-actions').innerHTML=act;
  function row(l,v){return'<div class="fr"><span class="fl">'+l+'</span><span class="fv">'+v+'</span></div>';}
  document.getElementById('td-info').innerHTML='<div class="dsec"><div class="dsec-t">Patient info</div>'+row('Phone',p.phone?'<a href="tel:'+p.phone+'">'+p.phone+'</a>':'--')+row('Address',p.address||'--')+row('Device(s)',p.device||'--')+row('Status',statusBadge(p.status))+row('Paperwork',yesNo(p.paperwork))+'</div>';
  document.getElementById('td-status').value=p.status;
  document.getElementById('td-paperwork').value=(p.paperwork||'No').toLowerCase()==='yes'?'Yes':'No';
  showPage('techdetail');
}
function saveTechUpdate(){var p=patients[techIdx];p.status=document.getElementById('td-status').value;p.paperwork=document.getElementById('td-paperwork').value;apiPut('/api/patients/'+p.id,p).then(function(){toast('Updated - '+p.first+' '+p.last);goBackTech();});}
var pdfFile=null;
var PDF_PROXY='https://pr-crm-proxy.jharris-b55.workers.dev';
(function(){var dz=document.getElementById('pdf-dropzone');dz.addEventListener('dragover',function(e){e.preventDefault();dz.classList.add('drag-over');});dz.addEventListener('dragleave',function(){dz.classList.remove('drag-over');});dz.addEventListener('drop',function(e){e.preventDefault();dz.classList.remove('drag-over');var f=e.dataTransfer.files[0];if(f&&f.type==='application/pdf')applyPdfFile(f);else toast('Please drop a PDF file');});})();
function onPdfSelected(input){var f=input.files[0];if(f)applyPdfFile(f);}
function applyPdfFile(f){pdfFile=f;document.getElementById('pdf-dropzone').style.display='none';document.getElementById('pdf-file-info').style.display='flex';document.getElementById('pdf-file-name').textContent=f.name;document.getElementById('pdf-file-size').textContent=formatBytes(f.size);document.getElementById('pdf-extract-btn').style.display='flex';resetPdfResult();}
function clearPdfSelection(){pdfFile=null;document.getElementById('pdf-file-input').value='';document.getElementById('pdf-dropzone').style.display='block';document.getElementById('pdf-file-info').style.display='none';document.getElementById('pdf-extract-btn').style.display='none';resetPdfResult();}
function resetPdfResult(){document.getElementById('pdf-result').classList.remove('show');document.getElementById('pdf-error').classList.remove('show');document.getElementById('pdf-loading').classList.remove('show');document.getElementById('pdf-extract-btn').disabled=false;document.getElementById('pdf-btn-icon').textContent='Extract';document.getElementById('pdf-btn-text').textContent='Extract and Fill Form';}
function formatBytes(b){if(b<1024)return b+'B';if(b<1048576)return (b/1024).toFixed(1)+'KB';return (b/1048576).toFixed(1)+'MB';}
function setLoadingStep(msg){document.getElementById('pdf-loading-step').textContent=msg;}
async function extractFromPdf(){
  if(!pdfFile){toast('No PDF selected');return;}
  document.getElementById('pdf-extract-btn').style.display='none';
  document.getElementById('pdf-loading').classList.add('show');
  document.getElementById('pdf-result').classList.remove('show');
  document.getElementById('pdf-error').classList.remove('show');
  try{
    setLoadingStep('Reading PDF file...');
    var base64Data=await new Promise(function(resolve,reject){var reader=new FileReader();reader.onload=function(e){resolve(e.target.result.split(',')[1]);};reader.onerror=function(){reject(new Error('Failed to read file'));};reader.readAsDataURL(pdfFile);});
    setLoadingStep('Sending to Claude AI...');
    var systemPrompt='You are a medical records data extractor. Extract patient information from the PDF and return ONLY a valid JSON object with these fields: {"firstName":"","lastName":"","phone":"","address":"","provider":"","device":"","patientType":"","lawFirm":"","notes":"","paperwork":"","rxdate":""}. patientType must be Commercial, Personal Injury, Work Comp, or empty. rxdate must be in YYYY-MM-DD format. paperwork must be Yes or No. device: separate multiple with semicolons. Return ONLY the JSON, no other text.';
    var requestBody={model:'claude-sonnet-4-6',max_tokens:1000,system:systemPrompt,messages:[{role:'user',content:[{type:'document',source:{type:'base64',media_type:'application/pdf',data:base64Data}},{type:'text',text:'Extract all patient fields from this medical PDF. Return only the JSON object.'}]}]};
    setLoadingStep('Extracting patient fields...');
    var MODEL_IDS=['claude-sonnet-4-6','claude-haiku-4-5-20251001','claude-3-5-sonnet-20241022','claude-3-5-haiku-20241022'];
    var response=null;
    for(var mi=0;mi<MODEL_IDS.length;mi++){
      requestBody.model=MODEL_IDS[mi];
      setLoadingStep('Trying model: '+MODEL_IDS[mi]+'...');
      var attempt=await fetch(PDF_PROXY,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(requestBody)});
      if(attempt.ok){response=attempt;break;}
      var attemptText=await attempt.text();
      var isModelErr=attemptText.toLowerCase().includes('model')||attempt.status===404||attempt.status===400;
      if(!isModelErr)throw new Error('Proxy '+attempt.status+': '+attemptText.slice(0,200));
    }
    if(!response)throw new Error('No valid model available. Please try again.');
    var data=await response.json();
    var rawText='';
    if(data.content&&Array.isArray(data.content)){rawText=data.content.filter(function(b){return b.type==='text';}).map(function(b){return b.text;}).join('');}
    else if(data.error){throw new Error('API error: '+(data.error.message||JSON.stringify(data.error)));}
    setLoadingStep('Parsing extracted data...');
    var clean=rawText.trim();
    var jsonMatch=clean.match(/\{[\s\S]*\}/);
    if(!jsonMatch)throw new Error('Could not parse response.');
    var extracted=JSON.parse(jsonMatch[0]);
    var filledCount=applyExtractedData(extracted);
    document.getElementById('pdf-loading').classList.remove('show');
    document.getElementById('pdf-result').classList.add('show');
    document.getElementById('pdf-result-count').textContent=filledCount+' field'+(filledCount!==1?'s':'')+' filled';
    setTimeout(function(){document.getElementById('f-first').scrollIntoView({behavior:'smooth',block:'center'});},400);
    toast(filledCount+' fields auto-filled from PDF!');
  }catch(err){
    document.getElementById('pdf-loading').classList.remove('show');
    document.getElementById('pdf-error').classList.add('show');
    document.getElementById('pdf-error-text').textContent=err.message||'Extraction failed. Please fill manually.';
    document.getElementById('pdf-extract-btn').style.display='flex';
    document.getElementById('pdf-extract-btn').disabled=false;
    toast('Could not extract PDF data');
  }
}
function applyExtractedData(d){
  var count=0;
  document.querySelectorAll('.ai-filled').forEach(function(el){el.classList.remove('ai-filled');});
  function setField(id,value){if(!value||value==='')return;var el=document.getElementById(id);if(!el)return;el.value=value;el.classList.add('ai-filled');count++;}
  function setSelect(id,value){if(!value||value==='')return;var el=document.getElementById(id);if(!el)return;var opts=Array.from(el.options).map(function(o){return o.value;});if(opts.indexOf(value)>-1){el.value=value;el.classList.add('ai-filled');count++;}}
  if(d.firstName)setField('f-first',d.firstName);
  if(d.lastName)setField('f-last',d.lastName);
  if(d.phone)setField('f-phone',d.phone);
  if(d.address)setField('f-address',d.address);
  if(d.provider)setField('f-provider',d.provider);
  if(d.device)setField('f-device',d.device);
  if(d.lawFirm)setField('f-lawfirm',d.lawFirm);
  if(d.notes)setField('f-notes',d.notes);
  if(d.rxdate)setField('f-rxdate',d.rxdate);
  if(d.patientType)setSelect('f-type',d.patientType);
  if(d.paperwork==='Yes'||d.paperwork==='No')setSelect('f-paperwork',d.paperwork);
  return count;
}
</script>
</body>
</html>
`;
