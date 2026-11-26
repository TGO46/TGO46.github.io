'use strict';
/* TGO46 — site content. Each record carries zh/en. Edit here, not in the HTML. */

/* Current roster (2026—2027 term). First row renders as group leader.
   org: company · title shown after the role (leave '' if unknown).
   avatar: file stem in assets/avatars/ (<stem>-128/-256 .webp/.jpg); '' falls back to the name's last character. */
window.TGO_MEMBERS = [
  { name: '郝彦飞', en: 'Hao Yanfei', role: '组长', roleEn: 'Group leader', org: '联甄科技 · CEO', orgEn: '联甄科技 · CEO', avatar: 'hao-yanfei' },
  { name: '刘军立', en: 'Liu Junli', role: '纪律委员', roleEn: 'Discipline', org: '容联七陌 · 技术总监', orgEn: '容联七陌 · Technical Director', avatar: 'liu-junli' },
  { name: '范明辉', en: 'Fan Minghui', role: '学习委员', roleEn: 'Learning', org: '帆软软件 · 技术总监', orgEn: '帆软软件 · Technical Director', avatar: 'fan-minghui' },
  { name: '林顺', en: 'Lin Shun', role: '互动委员', roleEn: 'Engagement', org: '迦游网络 · 技术VP', orgEn: '迦游网络 · VP of Technology', avatar: 'lin-shun' },
  { name: '王龙飞', en: 'Wang Longfei', role: '财务委员', roleEn: 'Finance', org: '企享云 · 联合创始人', orgEn: '企享云 · Co-founder', avatar: 'wang-longfei' },
  { name: '康建华', en: 'Kang Jianhua', role: '团建委员', roleEn: 'Retreats', org: '铂金智慧 · 技术VP', orgEn: '铂金智慧 · VP of Technology', avatar: 'kang-jianhua' },
  { name: '曾惟靖', en: 'Zeng Weijing', role: '观察员', roleEn: 'Observer', org: '万合投资 · CEO', orgEn: '万合投资 · CEO', avatar: 'zeng-weijing' },
  { name: '吴迪华', en: 'Wu Dihua', role: '内容策划', roleEn: 'Content', org: '天源迪科 · 技术VP', orgEn: '天源迪科 · VP of Technology', avatar: 'wu-dihua' },
  { name: '齐永升', en: 'Qi Yongsheng', role: '品宣 · 海报 · AI 流程', roleEn: 'Brand, design & AI workflows', org: '未名脑脑 · 联合创始人', orgEn: 'Weiming Naonao · Co-founder', avatar: 'qi-yongsheng' },
  { name: '唐常芳', en: 'Tang Changfang', role: '商业增长', roleEn: 'Business growth', org: '华鸿汇德 · 总经理', orgEn: '华鸿汇德 · General Manager', avatar: 'tang-changfang' },
  { name: '刘升平', en: 'Liu Shengping', role: 'AI 语音识别与落地案例', roleEn: 'AI speech & applied cases', org: '云知声 · 技术 VP', orgEn: 'Unisound · VP Engineering', avatar: 'liu-shengping' }
];

/* Public charter parameters. Penalties and internal terms are intentionally omitted. */
window.TGO_CHARTER = [
  { k: '使命', kEn: 'Mission', v: '在个人修养与职业技能上，彼此分享、学习、进步', vEn: 'Share, learn and grow in character and craft' },
  { k: '财政年度', kEn: 'Fiscal year', v: '07.01 — 次年 06.30', vEn: 'Jul 01 — Jun 30', mono: true },
  { k: '活动频率', kEn: 'Cadence', v: '每财年 10 次月度组会 + 1 次团建', vEn: '10 monthly group meetings + 1 retreat per fiscal year' },
  { k: '小组规模', kEn: 'Group size', v: '8 — 12 人，不超过 12 人', vEn: '8 — 12 members, never more than 12', mono: true },
  { k: '新人加入', kEn: 'New members', v: '现有成员一致同意', vEn: 'Unanimous agreement of current members' },
  { k: '分享用语', kEn: 'How we speak', v: '只谈经验，不做说教', vEn: 'Experience only, no lecturing' },
  { k: '保密', kEn: 'Confidentiality', v: '小组内容绝不外泄', vEn: 'Nothing said in the group leaves the group' },
  { k: '任期', kEn: 'Term', v: '一年，与财政年度一致', vEn: 'One year, aligned to the fiscal year' },
  { k: '主持', kEn: 'Hosting', v: '按首次会议坐席顺序轮值；组长缺席时抽签产生代理组长', vEn: 'Rotates by first-meeting seating; deputy drawn by lot if the leader is absent' }
];

const P = 'assets/photos/';
function groupMeeting(term, number) {
  return { type: 'share', title: `第${term}届第${number ?? 'xx'}次-小组会议`, titleEn: `Term ${term}, Meeting ${number ?? 'XX'}`,
    time: '19:00-22:00', place: '北京海淀区搜狐大厦', placeEn: 'Sohu Building, Haidian, Beijing' };
}
/* Journey events. type: share | gathering | milestone | outside */
window.TGO_EVENTS = [
  { date: '2025-09-19', label: '2025.09.19', place: null, type: 'milestone',
    title: '46 组成立', titleEn: 'Group 46 is formed', participants: null,
    summary: 'TGO 鲲鹏会北京分会第 46 组正式成立。', summaryEn: 'Group 46 was formed in TGO’s Beijing chapter.' },
  { date: '2025-10-21', label: '2025.10.21', place: null, type: 'milestone',
    title: '第一次自组织会议', titleEn: 'First self-organized meeting', participants: null,
    summary: '这次会议的坐席顺序，成了此后组员轮流主持的顺序。', summaryEn: 'The seating order at this meeting became the group’s hosting rotation.' },
  { date: '2025-11-17', label: '2025.11.17', place: null, type: 'milestone',
    title: '第三次会议：确定首届分工', titleEn: 'Third meeting: first roles assigned', participants: null,
    summary: '组员认领了组长、纪律、财务、互动、团建等职责，任期一个财年。', summaryEn: 'Members took on leadership, discipline, finance, engagement and retreat roles for one fiscal year.' },
  { date: '2026-05-16', label: '2026.05.16', place: '金海湖 · 碧波岛 · 石林峡', placeEn: 'Jinhai Lake · Bibo Island · Shilinxia', type: 'gathering',
    title: '26年京郊小瑞士团建', titleEn: '2026 team retreat: Beijing’s Little Switzerland',
    summary: '组员一起畅游京郊小瑞士，打卡石林峡、山间美术馆，第二天小雨游览碧波岛 和 金海湖也是别有一番风景。', summaryEn: 'We explored Beijing’s Little Switzerland together, visiting Shilinxia Gorge and an art museum in the mountains. The next day, we saw a different side of Bibo Island and Jinhai Lake in the light rain.',
    previewOpen: true, photos: [
      { src: 'summit-group', tone: 'shade', alt: '组员们坐在山顶玻璃平台上，举着“北京 TGO 46 组”横幅', altEn: 'Members on the summit glass platform holding a “TGO Beijing Group 46” banner', w: 3, h: 2 },
      { src: 'summit-banner', tone: 'daylight', alt: '组员在山顶并肩举着横幅合影', altEn: 'The group standing together on the summit with their banners', w: 3, h: 2 },
      { src: 'boat', tone: 'shade', alt: '组员穿着雨衣和救生衣在游船上挥手', altEn: 'Members in raincoats and life jackets waving on the boat', w: 4, h: 3 },
      { src: 'museum-group', tone: 'shade', alt: '组员在美术馆门前合影', altEn: 'Group photo outside the art museum', w: 3, h: 2 },
      { src: 'billiards', tone: 'daylight', alt: '一位组员俯身打台球', altEn: 'A member lining up a pool shot', w: 4, h: 3 },
      { src: 'museum-dog-group', tone: 'backlit', alt: '组员在美术馆里抱着狗合影', altEn: 'Group portrait inside the art museum with a dog in their arms', w: 3, h: 2 }
    ],
    video: { src: 'assets/video/summer-2026.mp4', poster: 'assets/video/jinhai-bibo-shilinxia-cover.webp',
      posterWidth: 2182, posterHeight: 1576,
      title: '夏日游记', titleEn: 'Summer Film' } },
  { date: '2026-07-21', label: '2026.07.21', ...groupMeeting(1, 9),
    talks: [{ speaker: '康建华', speakerEn: 'Kang Jianhua (Kevin)', title: 'AI × 跨境电商：低价红利退潮之后', titleEn: 'AI × cross-border e-commerce, after cheap growth',
      summary: '聊低价红利退潮后的品牌与流量运营。', summaryEn: 'A look at brands and audience growth in cross-border e-commerce as the low-price advantage faded.' }] },
  { date: '2026-08-08', label: '2026.08.08', type: 'outside',
    time: '09:00-18:10', place: '北京中关村东升科技园万丽酒店', placeEn: 'Renaissance Beijing Haidian Hotel',
    title: '全球 AI 生态与创新峰会', titleEn: 'Global AI Ecosystem & Innovation Summit' },
  { date: '2026-10', label: '2026.10', place: null, type: 'milestone',
    title: '第二届换届', titleEn: 'Second term begins', participants: null,
    subtitle: '第二届的 11 位组员重新认领了组内分工。', subtitleEn: 'The 11 members chose their roles for the second term.' },
  { date: '2026-10-19', label: '2026.10.19', ...groupMeeting(1, 10),
    crossGroup: true, talks: [
      { speaker: '刘军立', speakerEn: 'Liu Junli', title: 'AI-Native组织与生产系统重构', titleEn: 'Rebuilding organizations and production systems for the AI-native era' },
      { speaker: '郝彦飞', speakerEn: 'Hao Yanfei', title: null }
    ] },
  { date: '2026-11-16', label: '2026.11.16', ...groupMeeting(2, 1),
    photos: [{ src: 'meeting-2026-11-16', alt: '第二届第一次小组会议：组员在会议桌旁与线上参会者合影', altEn: 'Group photo with members at the meeting table and online at the first meeting of the second term', w: 4, h: 3 }] },
  { date: '2026-11-28', label: '2026.11.28', type: 'outside', scheduled: true,
    title: 'TGO TALKS 第三季', titleEn: 'TGO TALKS · Season 3',
    time: '14:00–17:30', place: '北京海淀区搜狐媒体大厦', placeEn: 'Sohu Media Plaza, Haidian, Beijing',
    summary: 'TGO 鲲鹏会北京分会邀请八位讲者，从跨领域学习、转行做 IP 律师，到 40 岁 IT 管理者的职场选择与日常健康，分享亲身经历。',
    summaryEn: 'TGO Beijing speakers share their experiences learning unfamiliar fields, moving into IP law, navigating an IT management career at 40 and making time for health.',
    poster: { src: 'assets/photos/tgo-talks-s3-kang-jianhua.png', alt: '康建华讲者海报，附 TGO 鲲鹏会直播预约码', altEn: 'Speaker poster for Kang Jianhua with the livestream reservation code',
      caption: '线上预约：扫此海报码。线下报名：扫活动主海报上方的小程序码。', captionEn: 'For the livestream, scan this poster. For in-person registration, use the mini-program code on the main event poster.' } },
  { date: '2026-12-14', label: '2026.12.14', ...groupMeeting(2, 2), scheduled: true }
].map((e) => ({ ...e, photos: (e.photos || []).map((p) => ({ ...p, base: P + p.src })) }));

/* Co-creation: real, shipped work only. */
window.TGO_PROJECTS = [
  { id: 'toolkit', type: '工具', typeEn: 'Tool', title: 'TGO46 会议工具箱', titleEn: 'TGO46 meeting toolkit',
    body: '分享计时、抽签、议程生成均为占位用的样例DEMO，真实工具待大家一起：设计 > 开发 > 提交 > 审核公布。',
    bodyEn: 'The talk timer, drawing lots and agenda builder are placeholder demos. Together we’ll design and build the actual tools, then submit them for review before publication.',
    by: '小组共建', byEn: 'Built by the group', status: 'demo' }
];
