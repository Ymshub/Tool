/*
Surge配置参考注释,感谢@MuTu
https://raw.githubusercontent.com/githubdulong/Script/master/surgepro_flushdns.js
示例↓↓↓ 
----------------------------------------
[Script]
附带DNS刷新,Surge Pro标题,可显示启动时间,点击刷新为DNS刷新
SurgePro_FlushDNS = type=generic,timeout=10,script-path=https://raw.githubusercontent.com/YmsHub/Surge/Master/JavaScripts/SurgePro_FlushDNS.js,argument=icon=power.circle=#f6c970
[Panel]
SurgePro_FlushDNS = script-name=SurgePro_FlushDNS,update-interval=1
----------------------------------------
*/

let params = getParams($argument)

!(async () => {
/* 时间获取 */
let traffic = (await httpAPI("/v1/traffic","GET"))
let dateNow = new Date()
let dateTime = Math.floor(traffic.startTime*1000)
let startTime = timeTransform(dateNow,dateTime)
let title = params.title

if ($trigger == "button") await httpAPI("/v1/dns/flush");

  $done({
      title:"Surge ® 丨 2023-01-01",
      content:`开启时长: ${startTime}`,
		icon: params.icon,
		"icon-color":params.color
    });

})();

function timeTransform(dateNow,dateTime) {
let dateDiff = dateNow - dateTime;
let days = Math.floor(dateDiff / (24 * 3600 * 1000));//计算出相差天数
let leave1=dateDiff%(24*3600*1000)    //计算天数后剩余的毫秒数
let hours=Math.floor(leave1/(3600*1000))//计算出小时数
//计算相差分钟数
let leave2=leave1%(3600*1000)    //计算小时数后剩余的毫秒数
let minutes=Math.floor(leave2/(60*1000))//计算相差分钟数
//计算相差秒数
let leave3=leave2%(60*1000)      //计算分钟数后剩余的毫秒数
let seconds=Math.round(leave3/1000)

if(days==0){

	if(hours==0){
	if(minutes==0)return(`${seconds}秒`);
	return(`${minutes}分${seconds}秒`)
	}
	return(`${hours}时${minutes}分${seconds}秒`)
	}else {
	return(`${days}天${hours}时${minutes}分`)
	}

}


function httpAPI(path = "", method = "POST", body = null) {
    return new Promise((resolve) => {
        $httpAPI(method, path, body, (result) => {
            resolve(result);
        });
    });
}

function getParams(param) {
  return Object.fromEntries(
    $argument
      .split("&")
      .map((item) => item.split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  );
}
