# Neis-bot
 나이스 API를 이용한 학교 급식 / 시간표 봇입니다.

 ### 사용법

 > 1. [API 키를 발급받습니다.](https://open.neis.go.kr/portal/guide/actKeyPage.do)
 > 2. [여기](https://open.neis.go.kr/portal/data/service/selectServicePage.do?infId=OPEN17020190531110010104913&infSeq=1)에서 시도교육청코드와 행정표준코드를 찾습니다.
 > 3. `main.js`의 변수를 수정합니다.  
 > 3-1. `KEY` 변수 안에 `1번`에서 발급받은 API 키를 넣습니다.  
 > 3-2. `schoolType` 변수 값을 지정합니다. (초등학교는 `0`, 중학교는 `1`, 고등학교는 `2`)  
 > 3-3. `ATPT_OFCDC_SC_CODE` 변수 안에 `2번`에서 찾은 시도교육청코드를 넣습니다.  
 > 3-4. `SD_SCHUL_CODE` 변수 안에 행정표준코드를 넣습니다.  
 > 3-5. `Grade`에 귀하의 학년을,  
 > 3-6. `Class`에 귀하가 속해 있는 반을 넣습니다.
 > 4. 시간표의 시간과 실제 수업 시간이 다른 경우, `timeTableKeys` 변수를 수정합니다.
 > 5. 봇앱에서새 스크립트를 만든 후, 수정된 `main.js`의 내용을 붙여넣습니다.
 > 4. 봇에 `.수동`이라고 메시지를 보냈을 때 정상 작동하면 성공입니다.
 
 메시지를 매일 특정 시간마다 보내도록 하고 싶다면...
 > 1. `alarmEnabled` 변수의 값을 `false`에서 `true`로 바꿉니다.
 > 2. `alarmTarget` 변수 안에 예약 메시지를 보낼 방의 이름을 넣습니다.
 > 3. `alarmTime` 변수의 값을 [`시`, `분`] 형식으로 넣습니다.  
 > 예시: `[9, 0]` (`오전 9시`), `[14, 30]` (`14시 30분 = 오후 2시 30분`)
 > 
 
 ### 주의사항
 >  - `responseFix` 함수는 안드로이드 버전이 `11` 이상이며 카카오톡 버전이 `9.7.0` 이상인 환경에서의 오작동 (방 이름이 계속 전송자 이름으로 인식되거나, 메시지 전송이 안되는 등...)을 고치지만, 대신 디버그룸에서 봇을 테스트할 수 없게 만듭니다.
 >  - 봇앱을 구동하는 환경의 안드로이드 버전이 `11` 미만이거나 카카오톡 버전이 `9.7.0` 미만일 경우, `main.js`에 있는 `useResponseFix` 변수의 값을 `false`로 바꿔야 합니다.
 >  - 봇앱이 시작된 후, 메시지를 보낼 방으로부터 알림을 한 번 이상은 받아야 예약 메시지를 보낼 수 있습니다.
 
 ### 라이선스 정보
 <a rel="license" href="http://creativecommons.org/licenses/by-nc/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc/4.0/88x31.png" /></a>  
 이 소스는 <a rel="license" href="http://creativecommons.org/licenses/by-nc/4.0/deed.ko">CC BY-NC 4.0 라이선스</a> 하에 배포됩니다.  
 This work is licensed under <a rel="license" href="http://creativecommons.org/licenses/by-nc/4.0/">CC BY-NC 4.0</a>.