/*
@XiaoBL
Qx重写的通用格式转化Surge模块
使用方法：
添加模块或本地脚本后将 Qx 脚本链接末端添加“_surge”即可转化 Surge 格式
模块链接：
https://raw.githubusercontent.com/gitupdate/updateTeam/master/QxToSurge.sgmodule
本地添加：
[Script]
格式转换 = type=http-request,pattern=_surge$,requires-body=1,max-size=0,timeout=30,script-path=https://raw.githubusercontent.com/gitupdate/updateTeam/master/QxToSurge.js
[MITM]
hostname = %APPEND% github.com:443, raw.githubusercontent.com:443, gist.githubusercontent.com, gitlab.com
*/
// 需要转换的 Qx 重写脚本文件
let req = $request.url.replace(/_surge$/,'')
let fileName = req.replace(/(.*?\/)*(.+)?\..+/ig, "$2") || '未知'
let version = '2023.02.09'
let name = '#!name= ' + fileName;
let desc = `#!desc= ${fileName}自动转换 版本：${version} 转换时间：${new Date().toLocaleString()}`;

!(async () => {
  let body = await http(req);

  body = body.match(/[^\n]+/g);

  let script = [];
  let URLRewrite = [];
  let HeaderRewrite = [];
  let MapLocal = [];
  let MITM = "";

  body.forEach((x, y, z) => {
    let type = x.match(/script-|enabled=|url\sreject|echo-response|\-header|hostname|url\s(302|307)|\s(request|response)-body/)?.[0];
    if (type) {
      switch (type) {
        case "script-":
          z[y - 1]?.match("#") && script.push(z[y - 1]);

          if (x.match('echo')) {
            // throw '脚本不支持通用'
            script.push(x.replace(/([^\s]+)\surl\sscript-echo-response+\s(http.+\/(.+)\.js)/, `$3 = type=http-request,pattern=$1,script-path=$2`,),);
          } else {
            let requires = x.match('-header') ? "0" : "1";
            let proto = x.match('proto.js') ? ',binary-body-mode=1' : '';
            script.push(x.replace(/([^\s]+)\surl\sscript-(response|request)[^\s]+\s(http.+\/(.+)\.js)/, `$4 = type=http-$2,pattern=$1,requires-body=${requires}${proto},max-size=0,script-path=$3,script-update-interval=0`,),);
          }
          break;

        case "enabled=":
          z[y - 1]?.match("#") && script.push(z[y - 1]);
          script.push(x.replace(/(.+\*)\s([^\,]+).+?\=([^\,]+).+/, `$3 = type=cron,script-path=$2,timeout=60,cronexp=$1,wake-system=1`,),);
          break;

        case "url reject":
          let url = x.match(/[^\s]+/)[0];
          let jct = x.match(/reject?[^\s]+/)[0];
          let obj = {
            "reject-200": 'https://raw.githubusercontent.com/gitupdate/updateTeam/master/reject-200.txt',
            "reject-img": 'https://raw.githubusercontent.com/gitupdate/updateTeam/master/reject-img.gif',
            "reject-dict": 'https://raw.githubusercontent.com/gitupdate/updateTeam/master/reject-dict.json',
            "reject-array": 'https://raw.githubusercontent.com/gitupdate/updateTeam/master/reject-array.json',
            pp: function () {
              return this[jct]
            }
          }
          if (obj = obj.pp()) {
            z[y - 1]?.match("#") && MapLocal.push(z[y - 1]);
            MapLocal.push(`${url} data="${obj}"`);
          } else {
            z[y - 1]?.match("#") && URLRewrite.push(z[y - 1]);
            URLRewrite.push(x.replace(/([^\s]+).+/, "$1 - reject"));
          }
          break;

        case "-header":
          if (x.match(/\(\\r\\n\)/g).length === 2) {
            z[y - 1]?.match("#") && HeaderRewrite.push(z[y - 1]);
            let op = x.match(/\sresponse-header/) ? 'http-response ' : '';
            if (x.match(/\$1\$2/)) {
              HeaderRewrite.push(x.replace(/([^\s]+).+?n\)([^\:]+).+/, `${op}$1 header-del $2`))
            } else {
              HeaderRewrite.push(x.replace(/(http[^\s]+)[^\)]+\)([^:]+):([^\(]+).+\$1\s?\2?\:?([^\$]+)?\$2/, `${op}$1 header-replace-regex $2 $3 $4''`,),);
            }
          } else {
            $notification.post('不支持这条规则转换,已跳过','',`${x}`);
          }
          break;

        case "echo-response":
          z[y - 1]?.match("#") && MapLocal.push(z[y - 1]);
          MapLocal.push(x.replace(/([^\s]+).+(http.+)/, '$1 data="$2"'));
          break;
        case "hostname":
          MITM = x.replace(/hostname\s?=(.*)/, `[MITM]\nhostname = %APPEND% $1`);
          break;
        default:
          if (type.match("url ")) {
            z[y - 1]?.match("#") && URLRewrite.push(z[y - 1]);
            URLRewrite.push(x.replace(/([^\s]+).+(302|307).+(http.+)/, "$1 $3 $2"));
          } else {
            z[y - 1]?.match("#") && script.push(z[y - 1]);
            script.push(x.replace(/([^\s]+)\surl\s(response|request)-body\s(.+)\2-body(.+)/, `test = type=$2,pattern=$1,requires-body=1,script-path=https://raw.githubusercontent.com/gitupdate/updateTeam/master/replace-body.js, argument=$3->$4`,),);
          }
      } //switch结束
    }
  }); //循环结束

  script = (script[0] || '') && `[Script]\n${script.join("\n")}`;

  URLRewrite = (URLRewrite[0] || '') && `[URL Rewrite]\n${URLRewrite.join("\n")}`;

  HeaderRewrite = (HeaderRewrite[0] || '') && `[Header Rewrite]\n${HeaderRewrite.join("\n")}`;

  MapLocal = (MapLocal[0] || '') && `[MapLocal]\n${MapLocal.join("\n")}`;

  body = `${name}
${desc}
${script}
${URLRewrite}
${HeaderRewrite}
${MapLocal}
${MITM}`.replace(/\;/g, '#')
  console.log(`Qx重写 ${fileName} 转换Surge成功`);
  $done({ response: 
   { 
    status: 200 ,
    body: body,
    headers: {
        'Content-Type': 'text/javascript; charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,GET,OPTIONS,PUT,DELETE',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    },
  }
  });
})()
    .catch((e) => {
      e && $notification.post(`${e}`,'','');
      $done()
    })


function http(req) {
  const opt = {
    url: req,
    headers: {
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'zh-CN,zh;q=0.9',
    }
  }
  return new Promise((resolve, reject) => $httpClient.get(opt, (err, resp, data) => {
    resp.status === 200 ? resolve(data) : reject();
  }))
}
