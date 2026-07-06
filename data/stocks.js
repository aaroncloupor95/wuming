const STOCKS = [
  { "code": "688981", "name": "中芯国际", "base_price": 143.99 },
  { "code": "688256", "name": "寒武纪", "base_price": 1369.75 },
  { "code": "002371", "name": "北方华创", "base_price": 803.6 },
  { "code": "688012", "name": "中微公司", "base_price": 420.0 },
  { "code": "603501", "name": "韦尔股份", "base_price": 97.0 },
  { "code": "603986", "name": "兆易创新", "base_price": 654.29 },
  { "code": "688041", "name": "海光信息", "base_price": 339.0 },
  { "code": "600584", "name": "长电科技", "base_price": 95.09 },
  { "code": "002049", "name": "紫光国微", "base_price": 83.2 },
  { "code": "000063", "name": "中兴通讯", "base_price": 36.28 }
];
const LATEST_PRICES = {"688981": {"price": 143.99, "change_pct": 2.62, "volume": 89663055.0, "prev_close": 140.31}, "688256": {"price": 1369.75, "change_pct": 1.24, "volume": 10368377.0, "prev_close": 1353.0}, "002371": {"price": 803.6, "change_pct": -1.52, "volume": 15242691.0, "prev_close": 816.0}, "688012": {"price": 420.0, "change_pct": 1.53, "volume": 30017456.0, "prev_close": 413.69}, "603501": {"price": 97.0, "change_pct": -5.18, "volume": 34978803.0, "prev_close": 102.3}, "603986": {"price": 654.29, "change_pct": -3.46, "volume": 60150228.0, "prev_close": 677.77}, "688041": {"price": 339.0, "change_pct": 4.18, "volume": 36494578.0, "prev_close": 325.4}, "600584": {"price": 95.09, "change_pct": 4.63, "volume": 208421379.0, "prev_close": 90.88}, "002049": {"price": 83.2, "change_pct": 1.76, "volume": 51693747.0, "prev_close": 81.76}, "000063": {"price": 36.28, "change_pct": -0.27, "volume": 151437494.0, "prev_close": 36.38}};
const PRED_COUNTS = {};
const LAST_UPDATE = "2026-07-06 16:00";
