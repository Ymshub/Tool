/*
Surge配置参考注释,感谢@congcong.
https://raw.githubusercontent.com/congcong0806/surge-list/master/Script/ipcheck.js
Surge配置参考注释,感谢@fishingworld.
https://raw.githubusercontent.com/fishingworld/something/main/PanelScripts/net_info.js
示例↓↓↓ 
----------------------------------------
[Script]
# 网络详情 标题显示为根节点名
# 应当修改的字段 group 代理策略组名称
NET_info = type=generic,timeout=10,script-path=https://raw.githubusercontent.com/Ymshub/Surge/Master/JavaScript/IP_Check.js,argument=icon=network.badge.shield.half.filled&color=#9a7ff7n=bonjour&color=#007aff&group=Proxy
[Panel]
NET_info = script-name=NET_info,update-interval=1
----------------------------------------
*/

;(async () => {



let params = getParams($argument)
//获取根节点名
let proxy = await httpAPI("/v1/policy_groups");
let allGroup = [];
for (var key in proxy){
   allGroup.push(key)
    }
let group = params.group
let rootName = (await httpAPI("/v1/policy_groups/select?group_name="+encodeURIComponent(group)+"")).policy;
while(allGroup.includes(rootName)==true){
	rootName = (await httpAPI("/v1/policy_groups/select?group_name="+encodeURIComponent(rootName)+"")).policy;
}

$httpClient.get('http://ip-api.com/json/?lang=zh-CN', function (error, response, data) {
    const jsonData = JSON.parse(data);
    $done({
      title:rootName,
      content:
		`位置：${jsonData.country} - ${jsonData.city}\n`+
      `运营：${jsonData.isp}`,
      icon: params.icon,
		  "icon-color":params.color
    });
  });

})();


function httpAPI(path = "", method = "GET", body = null) {
    return new Promise((resolve) => {
        $httpAPI(method, path, body, (result) => {
            resolve(result);
        });
    });
};

function getParams(param) {
  return Object.fromEntries(
    $argument
      .split("&")
      .map((item) => item.split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  );
}
