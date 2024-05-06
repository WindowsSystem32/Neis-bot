/* 참고사항:
 * 
 * API 키는 
 *   https://open.neis.go.kr/portal/guide/actKeyPage.do
 *   에서 발급받으실 수 있습니다.
 * 
 * 시도교육청코드 및 행정표준코드는 
 *   https://open.neis.go.kr/portal/data/service/selectServicePage.do?infId=OPEN17020190531110010104913&infSeq=1
 *   에서 찾으실 수 있습니다.
 * 
 * 교시 목록은 웬만하면 수정 안 하시는 게 좋습니다..?
 * 
 * 본 소스는 Dark Tornado님께서 제작하신 responseFix (a.k.a 대응 소스, 라이선스: CC BY-NC 4.0)를 사용합니다.
 * 
 * 개발자 목록
 *  - Ki ( https://open.kakao.com/me/Kei_0320 ): 베이스가 되는 소스 제작자 및 일부 API 요청 코드 작성
 *  - Windows ( https://open.kakao.com/me/Windows / https://github.com/WindowsSystem32 ): 시간표 계산 기능 및 예외 처리, 파싱, Time 클래스, 날짜 구하기, 예약 메시지, main 함수 등 제작
 * 
 * 본 소스의 라이선스는 CC BY-NC 4.0입니다.
 */

// 아래의 변수를 수정하여 사용하세요!
const KEY                = "API 키",                           // https://open.neis.go.kr/portal/guide/actKeyPage.do 에서 발급받은 API 키
      schoolType         = 1,                                  // 0: 초등학교, 1: 중학교, 2: 고등학교
      ATPT_OFCDC_SC_CODE = "",                                 // 시도교육청코드
      SD_SCHUL_CODE      = "",                                 // 행정 표준 코드
      Grade              = "",                                 // 학년
      Class              = "",                                 // 반
      alarmEnabled       = false,                              // 예약 메시지를 보낼지의 여부
      alarmTarget        = "",                                 // 예약 메시지를 보낼 방
      alarmTime          = [ 7,  0],                           // 예약 메시지를 보낼 시각 (시, 분)
      showErrorInMessage = true,                               // 오류가 났을 때 오류 내용을 메시지에 표시할지의 여부
      timeTableKeys      = {                                   // 교시 목록 (시간표에 사용됨)
          "defaults": {                                        // 기본값
            "duration": [ 0, 45],                                // 수업 시간의 길이 (시간, 분)
            "breakTime": {                                       // 쉬는 시간
              "duration": [ 0, 10],                              // 쉬는 시간의 길이 (시간, 분)
              "name"    : ""                                     // 쉬는 시간의 이름
            }
          }, 
          "sequences": [
            {                                                  //한 교시
              "title"     : "1교시",                             // 이 교시의 제목
              "valueIndex": 0,                                   // 이 교시에 해당하는 데이터의 인덱스
              "timeStart" : [ 9,  0]                             // 교시 시작 시간 (시, 분)
            }, 
            {
              "title"     : "2교시", 
              "valueIndex": 1
            }, 
            {
              "title"     : "3교시", 
              "valueIndex": 2
            }, 
            {
              "title"     : "4교시", 
              "valueIndex": 3,  
              "breakTime"     : {
                "duration": [ 1,  0], 
                "name"    : "급식 시간"
              }
            }, 
            {
              "title"     : "5교시", 
              "valueIndex": 4
            }, 
            {
              "title"     : "6교시", 
              "valueIndex": 5
            }, 
            {
              "title"     : "7교시", 
              "valueIndex": 6
            }, 
            {
              "title"     : "8교시", 
              "valueIndex": 7
            }
          ]
        };
// 여기까지!

/* 
  responseFix 함수: 
   - 제작자  : Dark Tornado
   - 라이선스: CC BY-NC 4.0
   - 출처    : https://cafe.naver.com/msgbot/2067
*/

function onNotificationPosted(sbn, sm) {
    var packageName = sbn.getPackageName();
    if (!packageName.startsWith("com.kakao.tal")) return;
    var actions = sbn.getNotification().actions;
    if (actions == null) return;
    var userId = sbn.getUser().hashCode();
    for (var n = 0; n < actions.length; n++) {
        var action = actions[n];
        if (action.getRemoteInputs() == null) continue;
        var bundle = sbn.getNotification().extras;
        var msg = bundle.get("android.text").toString();
        var sender = bundle.getString("android.title");
        var room = bundle.getString("android.subText");
        if (room == null) room = bundle.getString("android.summaryText");
        var isGroupChat = room != null;
        if (room == null) room = sender;
        var replier = new com.xfl.msgbot.script.api.legacy.SessionCacheReplier(packageName, action, room, false, "");
        var icon = bundle.getParcelableArray("android.messages")[0].get("sender_person").getIcon().getBitmap();
        var image = bundle.getBundle("android.wearable.EXTENSIONS");
        if (image != null) image = image.getParcelable("background");
        var imageDB = new com.xfl.msgbot.script.api.legacy.ImageDB(icon, image);
        com.xfl.msgbot.application.service.NotificationListener.Companion.setSession(packageName, room, action);
        if (this.hasOwnProperty("responseFix")) {
            responseFix(room, msg, sender, isGroupChat, replier, imageDB, packageName, userId != 0);
        }
    }
}

/******************** 잠깐만요! ********************/
/*                                                 */
/* 귀하가 만약 JS를 어느 정도 아는 사람이 아니라면 */
/* 이 아래의 코드는 수정하지 않는 것을 권장드리며, */
/* 코드를 수정하여 피해가 발생하더라도             */
/* 개발자들은 책임을 질 수 없습니다.               */
/*                                                 */
/*                  2024-03-16, 공동개발자 Windows */
/*                                                 */
/***************************************************/

if (!([0, 1, 2].includes(schoolType))) throw new Error("schoolType은 0, 1, 2 중 하나여야 합니다.");
const timeTableName = ["els", "mis", "his"][schoolType] + "Timetable";

const Time = function (hour, min) {
        if (Array.isArray(hour)) {
          min = hour[1];
          hour = hour[0];
        }
        if (!isFinite(hour)) throw new Error("hour 인자가 유리수가 아닙니다.");
        hour = +hour;
        if (min === undefined || min === null) {
          this._time = hour;
        } else {
          if (!isFinite(min)) throw new Error("min 인자가 유리수가 아닙니다.");
          min = +min;
          this._time = hour * 60 + min;
        }
        this.correct();
      }, 
      lunchApiUrl     = "https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=" + KEY + "&Type=json&ATPT_OFCDC_SC_CODE=" + ATPT_OFCDC_SC_CODE + "&SD_SCHUL_CODE=" + SD_SCHUL_CODE + "&MLSV_YMD=", 
      timeTableApiUrl = "https://open.neis.go.kr/hub/" + timeTableName + "?KEY=" + KEY + "&Type=json&ATPT_OFCDC_SC_CODE=" + ATPT_OFCDC_SC_CODE + "&SD_SCHUL_CODE=" + SD_SCHUL_CODE + "&Grade=" + Grade + "&Class_NM=" + Class + "&ALL_TI_YMD=";

Time.isConvertable = function (hour, min) {
  try {
    new Time(hour, min);
    return true;
  } catch (e) {
    return false;
  }
};

Time.prototype.correct = function () {
  const mx = 1440;
  this._time %= mx;
  if (this._time < 0) this._time += mx;
  return this;
};

Time.prototype.getTime = function () {
  return this.correct()._time;
};

Time.prototype.getMinutes = function () {
  this.correct();
  return this._time % 60;
};

Time.prototype.getHours = function () {
  this.correct();
  return (this._time - (this._time % 60)) / 60 % 24;
};

Time.prototype.add = function (time) {
  if (!(time instanceof Time)) throw new Error("time 인자가 Time 객체가 아닙니다.");
  return new Time(this._time + time._time).correct();
};

Time.prototype.subtract = function (time) {
  if (!(time instanceof Time)) throw new Error("time 인자가 Time 객체가 아닙니다.");
  return new Time(this._time - time._time).correct();
};

Time.prototype.toString = function (pad) {
  if (pad === undefined || pad === null) pad = true;
  this.correct();
  let min = this._time % 60 + "";
  let hour = (this._time - min) / 60 + "";
  return pad
    ? hour.padStart(2, 0) + ":" + min.padStart(2, 0)
    : hour + ":" + min;
};

function calcTimeTable (dats) {
  let sequences = timeTableKeys.sequences.map(e => e), 
      output = [], 
      defaults  = timeTableKeys.defaults;
  function merge (objA, objB) {
    let output = {};
    Object.getOwnPropertyNames(objB).forEach(e => {
      output[e] = objA.hasOwnProperty(e)? objA[e] : objB[e];
    });
    return output;
  }
  for (let i = 0; i < sequences.length; i++) {
    let time = sequences[i], timeStart;

    if ("timeStart" in time && Time.isConvertable(time.timeStart)) {
      timeStart = new Time(time.timeStart);
    } else if (i != 0) {
      let prevTime = output[i - 1];
      timeStart = prevTime.timeEnd.add(prevTime.breakTime.duration);
    } else {
      Log.e("calcTimeTable() 오류: 시작 시간이 없는 구간이 존재합니다. (인덱스: " + i + ")");
      return [{
        timeStart: "!!:!!", 
        timeEnd: "!!:!!", 
        duration: "!!:!!", 
        title: "오류", 
        value: "시간표 계산 오류. 관리자에게 문의해 주세요."
      }];
    }

    let duration = new Time( 0,  0), timeEnd = timeStart.add(duration);
    if ("timeEnd" in time && Time.isConvertable(time.timeEnd)) {
      timeEnd = new Time(time.timeEnd);
      duration = timeStart.subtract(timeEnd);
    } else if ("duration" in time && Time.isConvertable(time.duration)) {
      duration = new Time(time.duration);
      timeEnd = timeStart.add(duration);
    } else if ("duration" in defaults && Time.isConvertable(defaults.duration)) {
      duration = new Time(defaults.duration);
      timeEnd = timeStart.add(duration);
    } else {
      Log.e("calcTimeTable() 오류: 끝나는 시간 / 기간이 없는 구간이 존재합니다. (인덱스: " + i + ")");
      return [{
        timeStart: "!!:!!", 
        timeEnd: "!!:!!", 
        duration: "!!:!!", 
        title: "오류", 
        value: "시간표 계산 오류. 관리자에게 문의해 주세요."
      }];
    }

    let title = "";
    if ("title" in time) {
      title = time.title;
    } else if ("title" in defaults) {
      title = defaults.title;
    }

    let breakTime = {};
    if ("breakTime" in time && time.breakTime instanceof Object) {
      breakTime = time.breakTime;
    }
    if ("breakTime" in defaults && defaults.breakTime instanceof Object) {
      breakTime = merge(breakTime, defaults.breakTime);
    }
    if (!("duration" in breakTime && Time.isConvertable(breakTime.duration))) breakTime.duration = new Time( 0,  0);
    else breakTime.duration = new Time(breakTime.duration);

    let value = null;
    if ("valueIndex" in time) {
      if (!(time.valueIndex in dats)) break;
      value = dats[time.valueIndex];
    }

    output.push({
      timeStart: timeStart, 
      timeEnd: timeEnd, 
      duration: duration, 
      breakTime: breakTime, 
      title: title, 
      value: value
    });
  }

  return output;
}

// 날짜 구하기
function getCurrentDate (time, ext) {
  if (time === null || time === undefined) time = Date.now();
  const currentDate = new Date(time), 
        con = ext? "-" : "";
  return currentDate.getFullYear() + con + 
    (currentDate.getMonth() + 1 + "").padStart(2, 0) + con + 
    (currentDate.getDate() + "").padStart(2, 0) + 
    (ext? " (" + ("일월화수목금토"[currentDate.getDay()]) + ")" : "");
}

let nativeDate = new Date(), 
    javaDate = java.util.Date(nativeDate.getFullYear() - 1900, nativeDate.getMonth(), nativeDate.getDate(), alarmTime[0], alarmTime[1]);
if (javaDate.before(
  java.util.Date(nativeDate.getFullYear() - 1900, nativeDate.getMonth(), nativeDate.getDate(), nativeDate.getHours(), nativeDate.getMinutes())
)) {
  // 만약 현재 시간이 전송 예약 시간을 넘은 시간이라면
  let cal = java.util.Calendar.getInstance();
  cal.setTime(javaDate);
  cal.add(java.util.Calendar.DATE, 1);
  javaDate = cal.getTime(); // 다음 날로 예약 시간을 변경
}

if (alarmEnabled) {
  const timer = new java.util.Timer();
  timer.schedule(
    java.util.TimerTask({
      run: () => {
        if (!Api.replyRoom(alarmTarget, "[자동 전송]\n" + main())) {
          Log.d("메시지 전송에 실패하였습니다. (메시지 전송을 시도한 방: " + alarmTarget + ")");
        }
      }
    }), 
    javaDate, // 타이머 예약 (javaDate부터 1일 간격으로)
    24 * 60 * 60 * 1000 // 타이머 간격 (1일)
  );

  onStartCompile = function () {
    timer.stop();
  };
}

function main (date) {
  if (!isFinite(date)) {
    date = Date.now();
  }
  let lunchApiUrlFinal    , 
      lunch               , 
      lunchResult         , 
      lunchOutput         , 
      timeTableApiUrlFinal, 
      timeTable           , 
      timeTableResult     , 
      timeTableOutput     ;
  try {
    lunchApiUrlFinal     = lunchApiUrl + getCurrentDate(date);
    lunch                = org.jsoup.Jsoup.connect(lunchApiUrlFinal).ignoreContentType(true).execute().body();
    lunchResult          = JSON.parse(lunch);
    timeTableApiUrlFinal = timeTableApiUrl + getCurrentDate(date);
    timeTable            = org.jsoup.Jsoup.connect(timeTableApiUrlFinal).ignoreContentType(true).execute().body();
    timeTableResult      = JSON.parse(timeTable);
    if ("mealServiceDietInfo" in lunchResult) {
      lunchOutput        = lunchResult.mealServiceDietInfo[1].row[0].DDISH_NM.replace(/\<br\/\>/g, "\n");
    } else {
      lunchOutput        = lunchResult.RESULT.MESSAGE;
    }
    if (timeTableName in timeTableResult) {
      timeTableOutput    = calcTimeTable(
          timeTableResult[timeTableName][1].row.map(e => e.ITRT_CNTNT)
        ).map(e => e.title + "(" + e.timeStart + "-" + e.timeEnd + " (" + e.duration + ")) " + e.value).join("\n");
    } else {
      timeTableOutput    = timeTableResult.RESULT.MESSAGE;
    }
    return (
      getCurrentDate(date, true) + "\n" + 
      "\n" + 
      timeTableOutput + "\n" + 
      "\n" + 
      lunchOutput
    );
  } catch (e) {
    // Log.d(["lunchApiUrlFinal", "lunch", "lunchResult", "timeTableApiUrlFinal", "timeTable", "timeTableResult"].map(e => e + ": " + JSON.stringify(this[e], null, 2)).join("\n"));
    Log.e("main() 함수에서 오류 발생: " + e);
    Log.d(
      "lunchApiUrlFinal    : " + lunchApiUrlFinal + "\n" + 
      "lunch               : " + lunch + "\n" + 
      "lunchResult         : " + JSON.stringify(lunchResult, null, 2) + "\n" + 
      "lunchOutput         : " + lunchOutput + "\n" + 
      "timeTableApiUrlFinal: " + timeTableApiUrlFinal + "\n" + 
      "timeTable           : " + timeTable + "\n" + 
      "timeTableResult     : " + JSON.stringify(timeTableResult, null, 2) + 
      "timeTableOutput     : " + timeTableOutput
    );
    return "오류 발생, 관리자에게 문의해 주세요." + (showErrorInMessage? ("\n - 오류: " + e) : "");
  }
}

// 메인
function responseFix(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
  if (msg == ".수동") {
    replier.reply(main());
  } else if (msg.startsWith(".수동 ")) {
    let dt = new Date(msg.split(" ").slice(1).join(" ")).getTime();
    if (isNaN(dt)) {
      replier.reply("날짜를 인식하지 못했습니다.");
      return;
    }
    replier.reply(main(dt));
  }
}