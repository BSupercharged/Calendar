        function renderHolidayView() {
            const shortMonth = ['Jan','Feb','Mar','Apr','May','Jun',
                                'Jul','Aug','Sep','Oct','Nov','Dec'];

            const yearStr = String(currentYear);
            const empHolidays = events.filter(e =>
                e.type === 'employee-holiday' && (e.start.startsWith(yearStr) || e.end.startsWith(yearStr))
            );
            const wfhHolidays = events.filter(e =>
                e.type === 'wfh' && (e.start.startsWith(yearStr) || e.end.startsWith(yearStr))
            );
            const pubHolidays = events.filter(e =>
                e.type === 'holiday' && (e.start.startsWith(yearStr) || e.end.startsWith(yearStr))
            );

            const TEAM_MEMBERS = ['Irene', 'Altug'];
            const peopleSet = new Set([...TEAM_MEMBERS, ...empHolidays.map(e => e.title)]);
            const people = Array.from(peopleSet).sort();

            function getDaysInRange(start, end) {
                const days = [];
                const s = new Date(start + 'T00:00:00');
                const e2 = new Date(end + 'T00:00:00');
                for (let d = new Date(s); d <= e2; d.setDate(d.getDate() + 1)) {
                    const y = d.getFullYear();
                    const m = String(d.getMonth() + 1).padStart(2, '0');
                    const dy = String(d.getDate()).padStart(2, '0');
                    days.push(`${y}-${m}-${dy}`);
                }
                return days;
            }

            const pubHolidayDates = new Set();
            pubHolidays.forEach(ph => {
                getDaysInRange(ph.start, ph.end).forEach(d => pubHolidayDates.add(d));
            });

            function isWorkingDay(dateStr) {
                const dow = new Date(dateStr + 'T00:00:00').getDay();
                return dow !== 0 && dow !== 6 && !pubHolidayDates.has(dateStr);
            }

            const fullMonthNames = ['January','February','March','April','May','June',
                                    'July','August','September','October','November','December'];

            function ordinalDate(dateStr) {
                const dt = new Date(dateStr + 'T00:00:00');
                const n = dt.getDate();
                const suffix = (n === 1 || n === 21 || n === 31) ? 'st' :
                               (n === 2 || n === 22) ? 'nd' :
                               (n === 3 || n === 23) ? 'rd' : 'th';
                return `${n}${suffix} ${fullMonthNames[dt.getMonth()]}`;
            }

            function getISOWeek(dateStr) {
                const d = new Date(dateStr + 'T00:00:00');
                const thu = new Date(d);
                const dow = d.getDay() || 7;
                thu.setDate(d.getDate() + (4 - dow));
                const yearStart = new Date(thu.getFullYear(), 0, 1);
                return Math.ceil(((thu - yearStart) / 86400000 + 1) / 7);
            }

            const weeksMap = new Map();
            for (let m = 0; m < 12; m++) {
                const daysInMonth = new Date(currentYear, m + 1, 0).getDate();
                for (let day = 1; day <= daysInMonth; day++) {
                    const dateStr = `${currentYear}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                    const wn = getISOWeek(dateStr);
                    if (!weeksMap.has(wn)) {
                        const d = new Date(dateStr + 'T00:00:00');
                        const thu = new Date(d);
                        const dow2 = d.getDay() || 7;
                        thu.setDate(d.getDate() + (4 - dow2));
                        const weekMonth = thu.getFullYear() === currentYear ? thu.getMonth() : (m < 6 ? 0 : 11);
                        weeksMap.set(wn, { w: wn, month: weekMonth, days: [] });
                    }
                    weeksMap.get(wn).days.push(dateStr);
                }
            }
            const weeks = Array.from(weeksMap.entries())
                .sort((a, b) => a[0] - b[0])
                .map(([, v]) => v);

            const monthGroups = [];
            let curMonth = -1, curGroup = null;
            weeks.forEach(wk => {
                if (wk.month !== curMonth) {
                    curMonth = wk.month;
                    curGroup = { month: curMonth, count: 0 };
                    monthGroups.push(curGroup);
                }
                curGroup.count++;
            });

            const todayStr = new Date().toISOString().slice(0, 10);
            const currentISOWeek = getISOWeek(todayStr);
            const isCurrentYear = currentYear === new Date().getFullYear();

            let html = `<div class="holiday-view">`;
            html += `<h2>Employee Holiday Overview — ${currentYear}</h2>`;

            if (people.length === 0 && empHolidays.length === 0) {
                html += `<div class="no-holidays">No employee holidays recorded yet.<br>Add holidays using the <strong>+</strong> button and select "Employee Holiday".</div>`;
            } else {
                html += `<div style="overflow-x:auto;">`;
                html += `<table class="holiday-table weekly-table">`;
                html += `<thead>`;
                html += `<tr><th class="person-col" rowspan="2">Person</th>`;
                monthGroups.forEach(mg => {
                    html += `<th colspan="${mg.count}" class="month-group-header">${shortMonth[mg.month]}</th>`;
                });
                html += `<th class="total-col" rowspan="2">Total</th></tr>`;
                html += `<tr>`;
                weeks.forEach(wk => {
                    const isThisWeek = isCurrentYear && wk.w === currentISOWeek;
                    const weekStyle = isThisWeek ? ' style="background:#ffd700;color:#2c3e50;"' : '';
                    html += `<th class="week-num-header"${weekStyle}>W${wk.w}</th>`;
                });
                html += `</tr>`;
                html += `</thead><tbody>`;

                people.forEach(person => {
                    const personHols = empHolidays.filter(e => e.title === person);
                    html += `<tr><td class="person-name">${person}</td>`;
                    let totalDays = 0;
                    weeks.forEach(wk => {
                        const coveredDays = new Set();
                        personHols.forEach(ev => {
                            wk.days.forEach(d => {
                                if (d >= ev.start && d <= ev.end && isWorkingDay(d)) {
                                    coveredDays.add(d);
                                }
                            });
                        });
                        const cnt = coveredDays.size;
                        totalDays += cnt;
                        const phThisWeek = wk.days.filter(d =>
                            pubHolidayDates.has(d) &&
                            personHols.some(ev => d >= ev.start && d <= ev.end)
                        );
                        if (cnt === 0) {
                            const cwBg = (isCurrentYear && wk.w === currentISOWeek) ? ' style="background:rgba(255,215,0,0.18);"' : '';
                            html += `<td class="week-cell"${cwBg}></td>`;
                        } else {
                            const sortedDays = Array.from(coveredDays).sort();
                            let dateLabel;
                            if (sortedDays.length > 1) {
                                dateLabel = `${ordinalDate(sortedDays[0])} - ${ordinalDate(sortedDays[sortedDays.length - 1])}`;
                            } else {
                                dateLabel = ordinalDate(sortedDays[0]);
                            }
                            let phNote = '';
                            if (phThisWeek.length > 0) {
                                const phStr = phThisWeek.map(d => {
                                    const phEvent = pubHolidays.find(ph => ph.start <= d && ph.end >= d);
                                    return phEvent ? `${phEvent.title} — ${ordinalDate(d)}` : ordinalDate(d);
                                }).join(', ');
                                phNote = ` excl. public holiday: ${phStr}`;
                            }
                            const tooltip = `W${wk.w} ${dateLabel}${phNote}`;
                            const alpha = (0.35 + Math.min(cnt / 5, 1) * 0.65).toFixed(2);
                            const phClass = phThisWeek.length > 0 ? ' ph-overlap' : '';
                            html += `<td class="week-cell holiday-week${phClass}" style="background:rgba(142,68,173,${alpha})" data-tooltip="${tooltip.replace(/"/g, '&quot;')}">${cnt}</td>`;
                        }
                    });
                    html += `<td class="total-days-cell">${totalDays}</td></tr>`;
                });
                html += `</tbody></table></div>`;

                if (wfhHolidays.length > 0) {
                    const wfhPeople = Array.from(new Set(wfhHolidays.map(e => e.title))).sort();
                    html += `<h2 style="margin-top:24px;">WFH (Abroad) — ${currentYear}</h2>`;
                    html += `<div style="overflow-x:auto;">`;
                    html += `<table class="holiday-table weekly-table">`;
                    html += `<thead><tr><th class="person-col" rowspan="2">Person</th>`;
                    monthGroups.forEach(mg => {
                        html += `<th colspan="${mg.count}" class="month-group-header">${shortMonth[mg.month]}</th>`;
                    });
                    html += `<th class="total-col" rowspan="2">Total</th></tr><tr>`;
                    weeks.forEach(wk => {
                        const isThisWeek = isCurrentYear && wk.w === currentISOWeek;
                        const weekStyle = isThisWeek ? ' style="background:#ffd700;color:#2c3e50;"' : '';
                        html += `<th class="week-num-header"${weekStyle}>W${wk.w}</th>`;
                    });
                    html += `</tr></thead><tbody>`;
                    wfhPeople.forEach(person => {
                        const personWfh = wfhHolidays.filter(e => e.title === person);
                        html += `<tr><td class="person-name">${person}</td>`;
                        let totalDays = 0;
                        weeks.forEach(wk => {
                            const coveredDays = new Set();
                            personWfh.forEach(ev => {
                                wk.days.forEach(d => {
                                    if (d >= ev.start && d <= ev.end && isWorkingDay(d)) coveredDays.add(d);
                                });
                            });
                            const cnt = coveredDays.size;
                            totalDays += cnt;
                            if (cnt === 0) {
                                const cwBg = (isCurrentYear && wk.w === currentISOWeek) ? ' style="background:rgba(255,215,0,0.18);"' : '';
                                html += `<td class="week-cell"${cwBg}></td>`;
                            } else {
                                const sortedDays = Array.from(coveredDays).sort();
                                const dateLabel = sortedDays.length > 1
                                    ? `${ordinalDate(sortedDays[0])} - ${ordinalDate(sortedDays[sortedDays.length - 1])}`
                                    : ordinalDate(sortedDays[0]);
                                const tooltip = `${person} WFH — ${dateLabel}`;
                                const alpha = (0.35 + Math.min(cnt / 5, 1) * 0.65).toFixed(2);
                                html += `<td class="week-cell holiday-week" style="background:rgba(23,162,184,${alpha})" data-tooltip="${tooltip.replace(/"/g, '&quot;')}">${cnt}</td>`;
                            }
                        });
                        html += `<td class="total-days-cell">${totalDays}</td></tr>`;
                    });
                    html += `</tbody></table></div>`;
                }

                if (pubHolidays.length > 0) {
                    html += `<h2 style="margin-top:24px;">Public Holidays — ${currentYear}</h2>`;
                    html += `<table class="holiday-table"><thead><tr><th class="person-col">Holiday</th>`;
                    shortMonth.forEach(m => { html += `<th>${m}</th>`; });
                    html += `</tr></thead><tbody><tr><td class="person-name">Public Holidays</td>`;
                    for (let m = 0; m < 12; m++) {
                        const ph = pubHolidays.filter(e => parseInt(e.start.slice(5, 7)) === m + 1);
                        if (ph.length === 0) {
                            html += `<td></td>`;
                        } else {
                            html += `<td>`;
                            ph.forEach(e => {
                                html += `<span class="holiday-chip public-holiday" title="${e.title}">${e.start.slice(8)} ${shortMonth[m]}: ${e.title}</span>`;
                            });
                            html += `</td>`;
                        }
                    }
                    html += `</tr></tbody></table>`;
                }
            }

            html += `</div>`;
            document.getElementById('calendarContent').innerHTML = html;
            document.getElementById('currentPeriod').textContent = currentYear;
        }
