export type ExhibitionStatus = 'upcoming' | 'ongoing' | 'ended'
export type ExhibitionRegion = '全国' | '华北' | '华东' | '华南' | '海外'
export type ExhibitionType = '综合矿业' | '矿机设备' | '煤炭' | '有色' | '贵金属' | '智慧矿山' | '安全环保'

export interface ExhibitionItem {
  id: string
  title: string
  dateRange: string
  startDate: string
  endDate: string
  city: string
  venue: string
  region: ExhibitionRegion
  country?: string
  type: ExhibitionType
  status: ExhibitionStatus
  organizer: string
  cycle: string
  scale: string
  summary: string
  tags: string[]
  heat: number
  publishedAt: string
  image: string
  intro: string[]
  exhibitors: Array<{
    name: string
    booth: string
    business: string
    type: string
  }>
  activities: Array<{
    time: string
    title: string
    location: string
  }>
  guide: Array<{
    label: string
    value: string
  }>
  reports: Array<{
    title: string
    date: string
  }>
}

export const exhibitionTimeFilters = [
  { label: '全部', value: 'all' },
  { label: '近3个月', value: 'next3months' },
  { label: '上半年', value: 'firstHalf' },
  { label: '下半年', value: 'secondHalf' },
  { label: '2026', value: '2026' },
] as const

export const exhibitionRegions = ['全国', '华北', '华东', '华南', '海外'] as const
export const exhibitionTypes = ['综合矿业', '矿机设备', '煤炭', '有色', '贵金属', '智慧矿山', '安全环保'] as const

export const exhibitionStatusOptions = [
  { label: '全部', value: 'all' },
  { label: '预告', value: 'upcoming' },
  { label: '进行中', value: 'ongoing' },
  { label: '已结束', value: 'ended' },
] as const

export const exhibitionSortOptions = [
  { label: '最新发布', value: 'latest' },
  { label: '时间最近', value: 'nearest' },
  { label: '人气最高', value: 'popular' },
] as const

export const exhibitions: ExhibitionItem[] = [
  {
    id: 'china-mining-2026',
    title: '2026中国国际矿业大会',
    dateRange: '2026-10-23～25',
    startDate: '2026-10-23',
    endDate: '2026-10-25',
    city: '天津',
    venue: '天津梅江会展中心',
    region: '华北',
    type: '综合矿业',
    status: 'upcoming',
    organizer: '中国矿业联合会、天津市人民政府',
    cycle: '一年一届',
    scale: '800+展商，6万+专业观众',
    summary: '覆盖勘探、开采、选矿、装备、投资、矿权交易和国际合作，是国内综合矿业领域的核心展会。',
    tags: ['国家级', '全产业链', '热门'],
    heat: 9820,
    publishedAt: '2026-05-12',
    image: 'linear-gradient(135deg, #164a7a, #1d7fa3 55%, #ff8a1f)',
    intro: [
      '中国国际矿业大会面向矿业企业、设备商、投资机构和服务商，集中展示找矿突破、绿色矿山、智能开采和矿权合作成果。',
      '展区覆盖矿产资源、矿山装备、智慧矿山、安全环保、矿业金融和国际合作，适合企业做品牌展示、项目推介和商务对接。',
      '往届展会聚集国内外矿业主管部门、协会、矿企、装备制造商和技术服务机构，是矿业B端人脉对接效率最高的综合平台之一。',
    ],
    exhibitors: [
      { name: '中国黄金集团', booth: 'A1-01', business: '黄金资源开发、冶炼、投资', type: '矿业集团' },
      { name: '紫金矿业', booth: 'A1-08', business: '有色金属、海外矿业投资', type: '矿业集团' },
      { name: '中煤科工集团', booth: 'B2-16', business: '矿山智能化、安全生产系统', type: '技术服务' },
      { name: '三一重装', booth: 'C3-10', business: '露天矿山装备、掘进设备', type: '装备制造' },
    ],
    activities: [
      { time: '10月23日 09:30', title: '全球矿业投资合作论坛', location: '主论坛厅' },
      { time: '10月24日 14:00', title: '绿色矿山与ESG闭门会', location: '会议室 206' },
      { time: '10月25日 10:00', title: '矿权项目路演与签约仪式', location: '路演区' },
    ],
    guide: [
      { label: '预登记', value: '建议提前完成企业信息认证，现场凭二维码换证入场。' },
      { label: '交通', value: '天津站、滨海机场均可换乘地铁或出租车抵达梅江会展中心。' },
      { label: '住宿', value: '会展中心周边商务酒店充足，热门论坛期间建议提前预订。' },
      { label: '门票', value: '专业观众实名登记后免费参观，论坛票以主办方公布为准。' },
    ],
    reports: [
      { title: '往届中国国际矿业大会签约项目覆盖十余个国家和地区', date: '2025-10-28' },
      { title: '绿色矿山和智慧矿山成为展区咨询热点', date: '2025-10-26' },
    ],
  },
  {
    id: 'shanghai-mining-equipment-2026',
    title: '2026上海国际矿山机械与智能装备展',
    dateRange: '2026-06-15～17',
    startDate: '2026-06-15',
    endDate: '2026-06-17',
    city: '上海',
    venue: '上海新国际博览中心',
    region: '华东',
    type: '矿机设备',
    status: 'upcoming',
    organizer: '中国重型机械工业协会矿山机械分会',
    cycle: '一年一届',
    scale: '500+展商，3.5万+专业观众',
    summary: '聚焦破碎筛分、磨矿选矿、输送提升、无人矿卡和智能运维，适合矿山业主集中看设备、比方案。',
    tags: ['设备', '智慧矿山', '采购'],
    heat: 8160,
    publishedAt: '2026-05-09',
    image: 'linear-gradient(135deg, #27313f, #35637c 58%, #ff7d00)',
    intro: [
      '展会以矿山机械设备采购和技术升级为核心，覆盖采矿、破碎、筛分、选矿、尾矿处理和矿山智能化系统。',
      '现场设置设备选型专区和供应商洽谈区，方便矿山企业按产能、工况、预算进行集中对比。',
    ],
    exhibitors: [
      { name: '美卓奥图泰', booth: 'E1-06', business: '破碎筛分、磨矿选矿解决方案', type: '装备制造' },
      { name: '山特维克矿山工程机械', booth: 'E2-12', business: '地下采矿设备、钻机', type: '装备制造' },
      { name: '徐工矿机', booth: 'E3-01', business: '矿用挖掘机、矿卡', type: '装备制造' },
      { name: '北矿机电', booth: 'E4-19', business: '选矿设备与自动化系统', type: '技术服务' },
    ],
    activities: [
      { time: '6月15日 13:30', title: '大型露天矿装备选型论坛', location: 'N1 论坛区' },
      { time: '6月16日 10:00', title: '智慧矿山运维与无人化专场', location: 'N2 会议室' },
    ],
    guide: [
      { label: '预登记', value: '采购负责人可申请VIP买家证，享受供需匹配服务。' },
      { label: '交通', value: '地铁7号线花木路站可直达展馆。' },
      { label: '住宿', value: '浦东龙阳路、花木区域酒店选择较多。' },
      { label: '门票', value: '专业观众实名预登记免费。' },
    ],
    reports: [
      { title: '矿山无人化设备采购需求明显升温', date: '2025-06-18' },
      { title: '破碎筛分和尾矿处理方案成现场热门品类', date: '2025-06-17' },
    ],
  },
  {
    id: 'australia-mining-2026',
    title: '2026澳洲国际矿业与资源展',
    dateRange: '2026-09-02～04',
    startDate: '2026-09-02',
    endDate: '2026-09-04',
    city: '珀斯',
    venue: 'Perth Convention and Exhibition Centre',
    region: '海外',
    country: '澳大利亚',
    type: '综合矿业',
    status: 'upcoming',
    organizer: '澳大利亚矿业协会及资源行业机构',
    cycle: '两年一届',
    scale: '650+展商，2.5万+观众',
    summary: '面向铁矿、锂矿、镍矿、黄金和矿业投资合作，适合海外项目拓展、设备出海和资源对接。',
    tags: ['海外', '投资', '锂矿'],
    heat: 7690,
    publishedAt: '2026-05-03',
    image: 'linear-gradient(135deg, #123c69, #2f7f6f 56%, #f5a623)',
    intro: [
      '澳洲资源类展会以铁矿、锂矿、镍矿和黄金项目为核心，聚集矿业公司、工程公司、设备商和投资机构。',
      '对中国企业而言，该展适合开展海外矿权项目调研、设备出海渠道拓展和本地服务商对接。',
    ],
    exhibitors: [
      { name: 'Rio Tinto', booth: 'P1-02', business: '铁矿、铝、铜资源开发', type: '矿业集团' },
      { name: 'BHP', booth: 'P1-10', business: '铁矿、铜、镍、煤炭', type: '矿业集团' },
      { name: 'Mineral Resources', booth: 'P2-08', business: '锂矿、铁矿、矿业服务', type: '矿业集团' },
      { name: 'Liebherr Mining', booth: 'P3-20', business: '大型矿用装备', type: '装备制造' },
    ],
    activities: [
      { time: '9月2日 10:00', title: '澳洲关键矿产投资论坛', location: 'Main Theatre' },
      { time: '9月3日 15:00', title: '矿业设备出海与本地化服务专场', location: 'Business Lounge' },
    ],
    guide: [
      { label: '预登记', value: '海外展会建议提前完成护照、签证及企业英文资料准备。' },
      { label: '交通', value: '珀斯机场至会展中心约25分钟车程。' },
      { label: '住宿', value: '建议选择CBD或Elizabeth Quay周边酒店。' },
      { label: '门票', value: '商务观众需提前在线注册，部分论坛单独收费。' },
    ],
    reports: [
      { title: '关键矿产供应链合作成为澳洲矿业展焦点', date: '2025-09-05' },
      { title: '锂矿设备和矿山自动化方案咨询热度提升', date: '2025-09-04' },
    ],
  },
  {
    id: 'china-coal-expo-2026',
    title: '2026中国国际煤炭采矿技术交流及设备展',
    dateRange: '2026-05-28～30',
    startDate: '2026-05-28',
    endDate: '2026-05-30',
    city: '北京',
    venue: '中国国际展览中心',
    region: '华北',
    type: '煤炭',
    status: 'upcoming',
    organizer: '中国煤炭工业协会',
    cycle: '两年一届',
    scale: '450+展商，4万+观众',
    summary: '重点展示煤矿智能化、综采装备、安全监测、瓦斯治理和绿色低碳技术。',
    tags: ['煤炭', '安全', '智能化'],
    heat: 6420,
    publishedAt: '2026-04-27',
    image: 'linear-gradient(135deg, #202833, #44566c 58%, #ff7d00)',
    intro: [
      '煤炭设备展面向煤矿业主、设备供应商和安全服务机构，突出智能化采掘、运输、通风、安全监控和绿色矿山建设。',
      '适合煤矿企业集中了解智能工作面、机器人巡检、瓦斯治理和安全生产解决方案。',
    ],
    exhibitors: [
      { name: '郑煤机', booth: 'B1-01', business: '液压支架、综采装备', type: '装备制造' },
      { name: '天地科技', booth: 'B1-18', business: '煤矿智能化、安全技术', type: '技术服务' },
      { name: '中煤装备', booth: 'B2-06', business: '煤机装备与工程服务', type: '装备制造' },
    ],
    activities: [
      { time: '5月28日 14:00', title: '煤矿智能化建设经验交流会', location: '论坛区 A' },
      { time: '5月29日 09:30', title: '矿山安全监测与瓦斯治理专场', location: '会议室 302' },
    ],
    guide: [
      { label: '预登记', value: '煤矿企业观众可填写采购需求获取定向邀约。' },
      { label: '交通', value: '北京地铁可接驳展馆周边站点。' },
      { label: '住宿', value: '建议选择三元桥、国展周边酒店。' },
      { label: '门票', value: '专业观众登记入场。' },
    ],
    reports: [
      { title: '智能化综采装备成为煤炭展采购热点', date: '2025-05-31' },
      { title: '安全监测系统供应商集中发布新产品', date: '2025-05-30' },
    ],
  },
  {
    id: 'smm-metals-forum-2026',
    title: '2026有色金属产业链大会暨矿业展',
    dateRange: '2026-07-08～10',
    startDate: '2026-07-08',
    endDate: '2026-07-10',
    city: '上海',
    venue: '上海跨国采购会展中心',
    region: '华东',
    type: '有色',
    status: 'upcoming',
    organizer: '有色金属行业机构及产业服务平台',
    cycle: '一年一届',
    scale: '300+展商，2万+观众',
    summary: '覆盖铜铝铅锌、锂钴镍、稀土和贵金属，适合矿产品贸易、冶炼加工和原料采购对接。',
    tags: ['有色', '价格', '供需'],
    heat: 6130,
    publishedAt: '2026-04-19',
    image: 'linear-gradient(135deg, #163f5f, #2e8e9d 55%, #ff9f1c)',
    intro: [
      '大会结合论坛、展览和供需洽谈，围绕有色金属价格、矿端供应、冶炼产能和新能源材料展开。',
      '适合矿产品贸易商、冶炼厂、材料企业和投资机构进行市场研判与供需对接。',
    ],
    exhibitors: [
      { name: '江西铜业', booth: 'M1-03', business: '铜矿、冶炼、加工', type: '有色企业' },
      { name: '洛阳钼业', booth: 'M1-16', business: '钼、钨、铜钴资源', type: '有色企业' },
      { name: '赣锋锂业', booth: 'M2-05', business: '锂资源及锂盐产品', type: '新能源材料' },
    ],
    activities: [
      { time: '7月8日 09:00', title: '铜铝铅锌市场展望论坛', location: '主会场' },
      { time: '7月9日 13:30', title: '锂钴镍资源供需闭门会', location: 'VIP会议室' },
    ],
    guide: [
      { label: '预登记', value: '贸易商和采购企业建议提前填写关注品类。' },
      { label: '交通', value: '展馆位于上海市普陀区，地铁和出租车均较方便。' },
      { label: '住宿', value: '中山公园、长风商务区周边酒店选择较多。' },
      { label: '门票', value: '展览免费，部分产业论坛需购票。' },
    ],
    reports: [
      { title: '锂钴镍矿端供应成为产业链大会讨论焦点', date: '2025-07-11' },
      { title: '矿产品长协和现货采购洽谈活跃', date: '2025-07-10' },
    ],
  },
  {
    id: 'guangzhou-green-mine-2026',
    title: '2026华南绿色矿山与安全环保展',
    dateRange: '2026-03-18～20',
    startDate: '2026-03-18',
    endDate: '2026-03-20',
    city: '广州',
    venue: '广交会展馆',
    region: '华南',
    type: '安全环保',
    status: 'ended',
    organizer: '华南矿业协会、环保产业服务机构',
    cycle: '一年一届',
    scale: '260+展商，1.8万+观众',
    summary: '聚焦矿山生态修复、尾矿库治理、粉尘治理、水处理和安全生产服务。',
    tags: ['环保', '安全', '华南'],
    heat: 4380,
    publishedAt: '2026-02-25',
    image: 'linear-gradient(135deg, #1f4f46, #4d8f71 56%, #ff7d00)',
    intro: [
      '展会服务绿色矿山建设、安全环保改造和生态修复需求，覆盖尾矿库、废水、粉尘、边坡监测和矿山修复。',
      '华南地区矿山企业、环保服务商和工程公司参会较集中，适合寻找安全环保改造方案。',
    ],
    exhibitors: [
      { name: '中节能生态修复', booth: 'G1-05', business: '矿山生态修复工程', type: '工程服务' },
      { name: '华测检测', booth: 'G1-17', business: '环境检测、安全评价', type: '技术服务' },
      { name: '广州环保装备研究院', booth: 'G2-09', business: '粉尘治理、水处理设备', type: '技术服务' },
    ],
    activities: [
      { time: '3月18日 14:00', title: '绿色矿山建设政策解读', location: '论坛区 B' },
      { time: '3月19日 10:00', title: '尾矿库安全与生态修复案例分享', location: '会议室 108' },
    ],
    guide: [
      { label: '预登记', value: '本届已结束，可关注会后资料和下届预告。' },
      { label: '交通', value: '广交会展馆地铁可达。' },
      { label: '住宿', value: '琶洲展馆周边酒店便利。' },
      { label: '门票', value: '专业观众登记入场。' },
    ],
    reports: [
      { title: '绿色矿山与尾矿库治理项目需求集中释放', date: '2026-03-21' },
      { title: '安全环保服务商现场对接华南矿企', date: '2026-03-20' },
    ],
  },
  {
    id: 'smart-mine-shenzhen-2026',
    title: '2026深圳智慧矿山与工业互联网大会',
    dateRange: '2026-11-12～14',
    startDate: '2026-11-12',
    endDate: '2026-11-14',
    city: '深圳',
    venue: '深圳国际会展中心',
    region: '华南',
    type: '智慧矿山',
    status: 'upcoming',
    organizer: '工业互联网产业联盟、智慧矿山技术机构',
    cycle: '一年一届',
    scale: '350+展商，2.2万+观众',
    summary: '面向矿山自动驾驶、工业互联网、AI巡检、数字孪生和生产调度系统。',
    tags: ['智慧矿山', '工业互联网', 'AI'],
    heat: 5890,
    publishedAt: '2026-04-10',
    image: 'linear-gradient(135deg, #112a46, #165dff 56%, #ff7d00)',
    intro: [
      '大会重点展示矿山数字化、智能调度、无人驾驶、AI安全巡检和生产经营一体化平台。',
      '适合正在做智能矿山建设、生产系统升级和数字化招采的矿企技术团队参加。',
    ],
    exhibitors: [
      { name: '华为矿山军团', booth: 'S1-01', business: '矿山工业互联网、5G专网', type: '数字化服务' },
      { name: '踏歌智行', booth: 'S2-08', business: '矿区无人驾驶运输系统', type: '智能装备' },
      { name: '百度智能云', booth: 'S2-20', business: 'AI巡检、数字孪生平台', type: '数字化服务' },
    ],
    activities: [
      { time: '11月12日 09:30', title: '智慧矿山建设高峰论坛', location: '主论坛厅' },
      { time: '11月13日 14:00', title: '矿区无人驾驶商业化案例专场', location: '会议室 501' },
    ],
    guide: [
      { label: '预登记', value: '建议技术、采购、生产负责人分别填写关注场景。' },
      { label: '交通', value: '深圳机场至展馆交通便利。' },
      { label: '住宿', value: '展馆周边酒店需提前预订。' },
      { label: '门票', value: '展览免费，部分技术论坛需预约。' },
    ],
    reports: [
      { title: '矿山数字孪生和无人驾驶成为智慧矿山大会核心看点', date: '2025-11-15' },
      { title: '智能调度系统进入矿企规模化采购阶段', date: '2025-11-14' },
    ],
  },
  {
    id: 'africa-mining-indaba-2026',
    title: '2026非洲矿业投资大会',
    dateRange: '2026-02-09～12',
    startDate: '2026-02-09',
    endDate: '2026-02-12',
    city: '开普敦',
    venue: 'Cape Town International Convention Centre',
    region: '海外',
    country: '南非',
    type: '贵金属',
    status: 'ended',
    organizer: '非洲矿业投资大会组委会',
    cycle: '一年一届',
    scale: '900+机构，1万+参会代表',
    summary: '聚焦非洲金、铜、钴、锰、铂族金属等矿业投资和项目融资，是非洲矿业投资最重要的会议之一。',
    tags: ['海外', '贵金属', '融资'],
    heat: 7210,
    publishedAt: '2026-01-18',
    image: 'linear-gradient(135deg, #2b2a25, #7a6234 58%, #ffb000)',
    intro: [
      '非洲矿业投资大会更偏会议和投资属性，聚集矿业部长、上市矿企、基金、律所、工程公司和设备服务商。',
      '适合关注非洲金矿、铜钴矿、锰矿和铂族金属项目的投资机构、矿业公司和工程服务企业。',
    ],
    exhibitors: [
      { name: 'Anglo American', booth: 'I1-02', business: '铂族金属、铜、铁矿', type: '矿业集团' },
      { name: 'Ivanhoe Mines', booth: 'I1-16', business: '铜、锌、铂族金属', type: '矿业集团' },
      { name: 'SRK Consulting', booth: 'I2-06', business: '矿业技术咨询、尽调', type: '技术服务' },
    ],
    activities: [
      { time: '2月9日 09:00', title: '非洲关键矿产投资主论坛', location: 'Main Hall' },
      { time: '2月11日 11:00', title: '矿业项目融资与并购专场', location: 'Investor Lounge' },
    ],
    guide: [
      { label: '预登记', value: '本届已结束，可关注下一届报名开放时间。' },
      { label: '交通', value: '开普敦机场至会展中心约25分钟车程。' },
      { label: '住宿', value: '建议选择Waterfront或CBD区域。' },
      { label: '门票', value: '会议票价格较高，需提前注册。' },
    ],
    reports: [
      { title: '非洲关键矿产项目融资热度延续', date: '2026-02-13' },
      { title: '铜钴和贵金属项目成为机构关注重点', date: '2026-02-12' },
    ],
  },
  {
    id: 'rare-earth-baotou-2026',
    title: '2026中国稀土与战略金属产业展',
    dateRange: '2026-08-20～22',
    startDate: '2026-08-20',
    endDate: '2026-08-22',
    city: '包头',
    venue: '包头国际会展中心',
    region: '华北',
    type: '有色',
    status: 'upcoming',
    organizer: '稀土行业协会、地方产业园区',
    cycle: '一年一届',
    scale: '220+展商，1.5万+观众',
    summary: '围绕稀土矿、分离冶炼、永磁材料、战略金属和高端应用，促进矿端到材料端供需对接。',
    tags: ['稀土', '战略金属', '材料'],
    heat: 4770,
    publishedAt: '2026-03-28',
    image: 'linear-gradient(135deg, #143d59, #497b8d 56%, #ff7d00)',
    intro: [
      '展会聚焦稀土资源、分离冶炼、磁材应用和战略金属产业链协同，适合资源企业、材料企业和下游采购方参观。',
      '包头产业基础明显，现场供需对接更偏稀土和战略金属细分领域。',
    ],
    exhibitors: [
      { name: '北方稀土', booth: 'R1-01', business: '稀土资源、冶炼分离、材料', type: '有色企业' },
      { name: '中国稀土集团', booth: 'R1-09', business: '稀土资源整合与产业链服务', type: '有色企业' },
      { name: '宁波韵升', booth: 'R2-12', business: '稀土永磁材料', type: '材料企业' },
    ],
    activities: [
      { time: '8月20日 10:00', title: '稀土产业高质量发展论坛', location: '主会场' },
      { time: '8月21日 14:00', title: '战略金属供需对接会', location: '对接区' },
    ],
    guide: [
      { label: '预登记', value: '材料企业和采购方可提前填写关注品类。' },
      { label: '交通', value: '包头机场、包头站均可到达展馆。' },
      { label: '住宿', value: '建议选择青山区或会展中心周边酒店。' },
      { label: '门票', value: '专业观众实名登记入场。' },
    ],
    reports: [
      { title: '稀土永磁和战略金属应用成为产业展亮点', date: '2025-08-23' },
      { title: '矿端资源保障与材料应用协同成为论坛重点', date: '2025-08-22' },
    ],
  },
]

export const featuredExhibitions = exhibitions
  .filter((item) => item.status !== 'ended')
  .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  .slice(0, 3)

