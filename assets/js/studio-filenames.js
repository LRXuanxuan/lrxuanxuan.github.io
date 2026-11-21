/* File-safe Beijing time in the studio owner's year/day/month order. */
(function () {
  'use strict';
  const clock = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Shanghai', year: 'numeric', day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  });
  window.studioExportName = function (date = new Date()) {
    const parts = Object.fromEntries(clock.formatToParts(date).map(part => [part.type, part.value]));
    return parts.year + '年' + parts.day + '日' + parts.month + '月' + parts.hour + '时' + parts.minute + '分';
  };
})();
