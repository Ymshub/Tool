var tlist = {
  1: ["腊八", "2022-12-30"], 
  2: ["元旦", "2023-01-01"],
  3: ["春节", "2023-01-22"],
  4: ["立春", "2023-02-04"],
  5: ["元宵", "2023-02-05"],
  6: ["情人节", "2023-02-14"],
  7: ["龙抬头", "2023-02-21"]
  8: ["清明", "2023-04-05"],
  9: ["劳动", "2023-05-01"],
  10: ["母亲节", "2023-05-14"],
  11: ["端午", "2023-06-18"],
  12: ["夏至", "2023-06-21"],
  13: ["父亲节", "2023-06-22"],
  14: ["建党", "2023-07-01"],
  15: ["建军", "2023-08-01"],
  16: ["七夕", "2023-08-22"],
  17: ["中元", "2023-08-30"],
  18: ["秋分", "2023-09-23"],
  19: ["中秋", "2023-09-29"],
  20: ["国庆", "2023-10-01"],
  21: ["重阳", "2023-10-23"],
  22: ["万圣节", "2023-10-31"],
  23: ["光棍节", "2023-11-11"],
  24: ["感恩节", "2023-11-23"],
  25: ["冬至", "2023-12-22"],
  26: ["平安夜", "2023-12-24"],
  27: ["圣诞节", "2023-12-25"],
  
};
let tnow = new Date();
let tnowf =
  tnow.getFullYear() + "-" + (tnow.getMonth() + 1) + "-" + tnow.getDate();

/* 计算2个日期相差的天数，不包含今天，如：2016-12-13到2016-12-15，相差2天
 * @param startDateString
 * @param endDateString
 * @returns
 */
function dateDiff(startDateString, endDateString) {
  var separator = "-"; //日期分隔符
  var startDates = startDateString.split(separator);
  var endDates = endDateString.split(separator);
  var startDate = new Date(startDates[0], startDates[1] - 1, startDates[2]);
  var endDate = new Date(endDates[0], endDates[1] - 1, endDates[2]);
  return parseInt(
    (endDate - startDate) / 1000 / 60 / 60 / 24
  ).toString();
}

//计算输入序号对应的时间与现在的天数间隔
function tnumcount(num) {
  let dnum = num;
  return dateDiff(tnowf, tlist[dnum][1]);
}

//获取最接近的日期
function now() {
  for (var i = 1; i <= Object.getOwnPropertyNames(tlist).length; i++) {
    if (Number(dateDiff(tnowf, tlist[i.toString()][1])) >= 0) {
      //console.log("最近的日期是:" + tlist[i.toString()][0]);
      //console.log("列表长度:" + Object.getOwnPropertyNames(tlist).length);
      //console.log("时间差距:" + Number(dateDiff(tnowf, tlist[i.toString()][1])));
      return i;
    }
  }
}

//如果是0天，发送emoji;
let nowlist = now();
function today(day) {
  let daythis = day;
  if (daythis == "0") {
    datenotice();
    return "🎉";
  } else {
    return daythis;
  }
}

//提醒日当天发送通知
function datenotice() {
  if ($persistentStore.read("timecardpushed") != tlist[nowlist][1] && tnow.getHours() >= 6) {
    $persistentStore.write(tlist[nowlist][1], "timecardpushed");
    $notification.post("假日祝福","", "今天是" + tlist[nowlist][1] + "日 " + tlist[nowlist][0] + "   🎉")
  } else if ($persistentStore.read("timecardpushed") == tlist[nowlist][1]) {
    //console.log("当日已通知");
  }
}
$done({
title:"节假提醒",
icon:"list.dash.header.rectangle",
'icon-color': "#5AC8FA",
content:tlist[nowlist][0]+"  :  "+today(tnumcount(nowlist))+"天\n"+tlist[Number(nowlist) + Number(1)][0] +"  :  "+ tnumcount(Number(nowlist) + Number(1))+ "天\n"+tlist[Number(nowlist) + Number(2)][0]+"  :  "+tnumcount(Number(nowlist) + Number(2))+"天"
})
