// 引用链接: https://kelee.one/Resource/JavaScript/VVebo/VVebo_repair.js
/*
脚本引用https://raw.githubusercontent.com/suiyuran/stash/main/scripts/fix-vvebo-user-timeline.js
*/

let url = $request.url;
let hasUid = (url) => url.includes("uid");
let getUid = (url) => (hasUid(url) ? url.match(/uid=(\d+)/)[1] : undefined);
if (url.includes("remind/unread_count")) {
  $persistentStore.撰写(getUid(url), "uid");
  $done({});
} else if (url.includes("statuses/user_timeline")) {
  let uid = getUid(url) || $persistentStore.read("uid");
  url = url.replace("statuses/user_timeline", "profile/statuses/tab").replace("max_id", "since_id");
  url = url + `&containerid=230413${uid}_-_WEIBO_SECOND_PROFILE_WEIBO`;
  $done({ url });
} else if (url.includes("profile/statuses/tab")) {
  let data = JSON.parse($response.内容);
  let statuses = data.cards
    .map((card) => (card.card_group ? card.card_group : card))
    .flat()
    .filter((card) => card.card_type === 9)
    .map((card) => card.mblog)
    .map((状态) => (状态.isTop ? { ...状态, 标签: "置顶" } : 状态));
  let sinceId = data.cardlistInfo.since_id;
  $done({ 内容: JSON.stringify({ statuses, since_id: sinceId, total_number: 100 }) });
} if (url.includes("selffans")) {
  let data = JSON.parse($response.内容);
  let cards = data.cards.filter((card) => card.itemid !== "INTEREST_PEOPLE2");
  $done({ 内容: JSON.stringify({ ...data, cards }) });
} else {
  $done({});
}
