        function renderMrGreenWeekdayChips(person) {
            const selected = mrGreenLegendWeekdays(person);
            let html = `<span class="mr-green-dows">`;
            MR_GREEN_WEEKDAY_DOW.forEach(dow => {
                const on = selected.indexOf(dow) !== -1;
                html += `<button type="button" class="mr-green-dow${on ? ' is-on' : ''}" `;
                html += `aria-pressed="${on ? 'true' : 'false'}" `;
                html += `onclick="toggleMrGreenWeekday('${person}', ${dow})">`;
                html += `${MR_GREEN_WEEKDAY_NAMES[dow]}</button>`;
            });
            html += `</span>`;
            if (mrGreenWeekdayOverride(person)) {
                html += `<button type="button" class="mr-green-reset" onclick="resetMrGreenWeekdays('${person}')">Reset</button>`;
            }
            return html;
        }

        function renderMrGreenMonthCalendar(ctx, year, month) {
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
            const dowNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const first = new Date(year, month, 1);
            let lead = first.getDay() - 1;
            if (lead < 0) lead = 6;
            const dim = new Date(year, month + 1, 0).getDate();
            const prevDim = new Date(year, month, 0).getDate();
            const today = mrGreenToday();

            let html = `<section class="office-month"><h3>${monthNames[month]}</h3>`;
            html += `<div class="office-cal">`;
            dowNames.forEach(name => {
                html += `<div class="office-cal-dow">${name}</div>`;
            });

            for (let i = 0; i < lead; i++) {
                const dayNum = prevDim - lead + 1 + i;
                html += `<div class="office-day is-outside"><div class="office-day-num">${dayNum}</div></div>`;
            }

            for (let day = 1; day <= dim; day++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const info = mrGreenDescribeDay(ctx, dateStr);
                let cls = 'office-day';
                if (info.weekend) cls += ' is-weekend';
                if (info.holidayTitle) cls += ' is-holiday';
                if (dateStr === today) cls += ' is-today';
                const tip = info.absent.length
                    ? 'Not in office: ' + info.absent.map(a => `${a.person} (${a.reason})`).join(', ')
                    : '';
                html += `<div class="${cls}"${tip ? ` data-tooltip="${mrGreenAttr(tip)}"` : ''}>`;
                html += `<div class="office-day-num">${day}</div>`;
                if (info.holidayTitle) {
                    html += `<div class="mr-green-names"><span class="holiday-chip public-holiday">${mrGreenEscape(info.holidayTitle)}</span></div>`;
                } else if (!info.weekend && info.scheduleOpen) {
                    html += `<div class="mr-green-names"><span class="mr-green-office-label">Office:</span>`;
                    if (info.people.length === 0) {
                        html += `<span class="mr-green-none">—</span>`;
                    } else {
                        info.people.forEach(row => {
                            const days = mrGreenWeekdayLabel(row.weekdays);
                            const phrase = row.expectedDays == null || row.expectedDays === ''
                                ? ''
                                : 'expected office days: ' + row.expectedDays;
                            const chipTip = phrase ? `${row.person}\n${days}\n${phrase}` : `${row.person}\n${days}`;
                            html += `<span class="holiday-chip office-chip" data-tooltip="${mrGreenAttr(chipTip)}">${mrGreenEscape(row.person)}</span>`;
                        });
                    }
                    html += `</div>`;
                }
                html += `</div>`;
            }

            const used = lead + dim;
            const trail = (7 - (used % 7)) % 7;
            for (let day = 1; day <= trail; day++) {
                html += `<div class="office-day is-outside"><div class="office-day-num">${day}</div></div>`;
            }
            html += `</div></section>`;
            return html;
        }

        function renderOfficeView() {
            let html = `<div class="holiday-view office-view">`;
            html += `<h2>🏢 Mr Green office — ${currentYear}</h2>`;
            html += `<p class="mr-green-intro">Who is expected at Mr Green, Amsterdam. Weekdays from 1 Dec 2026. Click a weekday to change that person's office days from today onward. A Netherlands public holiday is shown instead of names. Anyone with a holiday or WFH abroad booked in their name is left off that day.</p>`;
            html += `<div class="legend mr-green-legend">`;
            html += `<div class="legend-item${showMrGreenOffice ? '' : ' dimmed'}" onclick="toggleMrGreenOffice()" title="Click to hide or show">`;
            html += `<div class="legend-color" style="background:#27ae60;"></div><span>Mr Green office</span></div>`;

            OFFICE_SCHEDULE.forEach(row => {
                const days = mrGreenWeekdayLabel(mrGreenLegendWeekdays(row.person));
                const expected = mrGreenExpectedLabel(row);
                const tip = expected ? `${row.person}\n${days}\n${expected}` : `${row.person}\n${days}`;
                html += `<div class="mr-green-person">`;
                html += `<span class="mr-green-person-name" data-tooltip="${mrGreenAttr(tip)}">${mrGreenEscape(row.person)}</span>`;
                html += renderMrGreenWeekdayChips(row.person);
                if (expected) {
                    html += `<span class="mr-green-expected">${mrGreenEscape(expected)}</span>`;
                }
                html += `</div>`;
            });
            html += `</div>`;

            if (showMrGreenOffice) {
                const ctx = mrGreenYearContext(currentYear);
                const blocks = [];
                for (let month = 0; month < 12; month++) {
                    const dim = new Date(currentYear, month + 1, 0).getDate();
                    const monthEnd = `${currentYear}-${String(month + 1).padStart(2, '0')}-${String(dim).padStart(2, '0')}`;
                    if (!OFFICE_SCHEDULE.some(row => monthEnd >= row.startDate)) continue;
                    blocks.push(renderMrGreenMonthCalendar(ctx, currentYear, month));
                }
                if (blocks.length === 0) {
                    html += `<p class="mr-green-empty">No Mr Green office days in ${currentYear}. The schedule starts 1 Dec 2026.</p>`;
                } else {
                    html += `<div class="office-months">${blocks.join('')}</div>`;
                }
            }

            html += `</div>`;
            document.getElementById('calendarContent').innerHTML = html;
            document.getElementById('currentPeriod').textContent = currentYear;
        }

        function renderHolidayView() {
            const shortMonth = ['Jan','Feb','Mar','Apr','May','Jun',
                                'Jul','Aug','Sep','Oct','Nov','Dec'];

            // Gather employee holidays, WFH (Abroad), and public holidays for the current year
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

            // Permanent team members — always shown even without holidays booked
            const TEAM_MEMBERS = ['Irene', 'Altug'];
            const peopleSet = new Set([...TEAM_MEMBERS, ...empHolidays.map(e => e.title)]);
            const people = Array.from(peopleSet).sort();

            // Helper: get all days between two date strings inclusive
            // Uses local date components to avoid UTC timezone offset shifting dates
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

            // Working days for the NL team: not Saturday, Sunday, or a Dutch public holiday.
            // China, Singapore, and Belgium holidays stay on the reference table below.
            // They are not days off for this team. People have no country field, so every
            // person in this view uses the Netherlands list (isNetherlandsPublicHoliday).
            const pubHolidayDates = new Set();
            pubHolidays.forEach(ph => {
                if (!isNetherlandsPublicHoliday(ph)) return;
                getDaysInRange(ph.start, ph.end).forEach(d => pubHolidayDates.add(d));
            });

            function isWorkingDay(dateStr) {
                const dow = new Date(dateStr + 'T00:00:00').getDay();
                return dow !== 0 && dow !== 6 && !pubHolidayDates.has(dateStr);
            }

            // Helpers for tooltip formatting
            const fullMonthNames = ['January','February','March','April','May','June',
                                    'July','August','September','October','November','December'];
            const wkDayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

            function ordinalDate(dateStr) {
                const dt = new Date(dateStr + 'T00:00:00');
                const n = dt.getDate();
                const suffix = (n === 1 || n === 21 || n === 31) ? 'st' :
                               (n === 2 || n === 22) ? 'nd' :
                               (n === 3 || n === 23) ? 'rd' : 'th';
                return `${n}${suffix} ${fullMonthNames[dt.getMonth()]}`;
            }

            // ISO week number for a date string
            function getISOWeek(dateStr) {
                const d = new Date(dateStr + 'T00:00:00');
                const thu = new Date(d);
                const dow = d.getDay() || 7;
                thu.setDate(d.getDate() + (4 - dow));
                const yearStart = new Date(thu.getFullYear(), 0, 1);
                return Math.ceil(((thu - yearStart) / 86400000 + 1) / 7);
            }

            // Build weeks: group all days of the year into ISO weeks
            const weeksMap = new Map();
            for (let m = 0; m < 12; m++) {
                const daysInMonth = new Date(currentYear, m + 1, 0).getDate();
                for (let day = 1; day <= daysInMonth; day++) {
                    const dateStr = `${currentYear}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                    const wn = getISOWeek(dateStr);
                    if (!weeksMap.has(wn)) {
                        // Assign week to the month its Thursday falls in
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

            // Group weeks by month for colspan header row
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

            // Build HTML
            // Determine current ISO week for highlighting
            const _todayLocal = new Date();
            const todayStr = `${_todayLocal.getFullYear()}-${String(_todayLocal.getMonth()+1).padStart(2,'0')}-${String(_todayLocal.getDate()).padStart(2,'0')}`;
            const currentISOWeek = getISOWeek(todayStr);
            const isCurrentYear = currentYear === _todayLocal.getFullYear();

            let html = `<div class="holiday-view">`;
            html += `<h2>🏖️ Employee Holiday Overview — ${currentYear}</h2>`;

            if (people.length === 0 && empHolidays.length === 0) {
                html += `<div class="no-holidays">No employee holidays recorded yet.<br>Add holidays using the <strong>+</strong> button and select "Employee Holiday".</div>`;
            } else {
                html += `<div style="overflow-x:auto;">`;
                html += `<table class="holiday-table weekly-table">`;
                html += `<thead>`;

                // Row 1: Person (rowspan 2) + month group headers + Total (rowspan 2)
                html += `<tr><th class="person-col" rowspan="2">Person</th>`;
                monthGroups.forEach(mg => {
                    html += `<th colspan="${mg.count}" class="month-group-header">${shortMonth[mg.month]}</th>`;
                });
                html += `<th class="total-col" rowspan="2">Total</th></tr>`;

                // Row 2: ISO week numbers
                html += `<tr>`;
                weeks.forEach(wk => {
                    const isThisWeek = isCurrentYear && wk.w === currentISOWeek;
                    const weekStyle = isThisWeek ? ' style="background:#ffd700;color:#2c3e50;"' : '';
                    html += `<th class="week-num-header"${weekStyle} data-week="${wk.w}">W${wk.w}</th>`;
                });
                html += `</tr>`;
                html += `</thead><tbody>`;

                people.forEach(person => {
                    const personHols = empHolidays.filter(e => e.title === person);
                    html += `<tr><td class="person-name">${person}</td>`;
                    let totalDays = 0;

                    weeks.forEach(wk => {
                        // Count unique working days in this week covered by any of person's holidays
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

                        // Public holidays that fall inside this person's booked period this week
                        const phThisWeek = wk.days.filter(d =>
                            pubHolidayDates.has(d) &&
                            personHols.some(ev => d >= ev.start && d <= ev.end)
                        );

                        if (cnt === 0) {
                            // Nothing to show — either no holiday or only PHs (which everyone has off)
                            const cwBg = (isCurrentYear && wk.w === currentISOWeek) ? ' style="background:rgba(255,215,0,0.18);"' : '';
                            html += `<td class="week-cell"${cwBg}></td>`;
                        } else {
                            // Show as date range if consecutive, otherwise list individually
                            const sortedDays = Array.from(coveredDays).sort();
                            let dateLabel;
                            if (sortedDays.length > 1) {
                                dateLabel = `${ordinalDate(sortedDays[0])} - ${ordinalDate(sortedDays[sortedDays.length - 1])}`;
                            } else {
                                dateLabel = ordinalDate(sortedDays[0]);
                            }

                            // Public holiday note
                            let phNote = '';
                            if (phThisWeek.length > 0) {
                                const phStr = phThisWeek.map(d => {
                                    const phEvent = pubHolidays.find(ph =>
                                        isNetherlandsPublicHoliday(ph) && ph.start <= d && ph.end >= d);
                                    return phEvent
                                        ? `${phEvent.title} — ${ordinalDate(d)}`
                                        : ordinalDate(d);
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

                // WFH (Abroad) section
                if (wfhHolidays.length > 0) {
                    const wfhPeople = Array.from(new Set(wfhHolidays.map(e => e.title))).sort();
                    html += `<h2 style="margin-top:24px;">✈️ WFH (Abroad) — ${currentYear}</h2>`;
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
                        html += `<th class="week-num-header"${weekStyle} data-week="${wk.w}">W${wk.w}</th>`;
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
                            const phThisWeek = wk.days.filter(d =>
                                pubHolidayDates.has(d) &&
                                personWfh.some(ev => d >= ev.start && d <= ev.end)
                            );
                            if (cnt === 0) {
                                const cwBg = (isCurrentYear && wk.w === currentISOWeek) ? ' style="background:rgba(255,215,0,0.18);"' : '';
                                html += `<td class="week-cell"${cwBg}></td>`;
                            } else {
                                const sortedDays = Array.from(coveredDays).sort();
                                const dateLabel = sortedDays.length > 1
                                    ? `${ordinalDate(sortedDays[0])} - ${ordinalDate(sortedDays[sortedDays.length - 1])}`
                                    : ordinalDate(sortedDays[0]);
                                let phNote = '';
                                if (phThisWeek.length > 0) {
                                    const phStr = phThisWeek.map(d => {
                                        const phEvent = pubHolidays.find(ph =>
                                            isNetherlandsPublicHoliday(ph) && ph.start <= d && ph.end >= d);
                                        return phEvent
                                            ? `${phEvent.title} — ${ordinalDate(d)}`
                                            : ordinalDate(d);
                                    }).join(', ');
                                    phNote = ` excl. public holiday: ${phStr}`;
                                }
                                const tooltip = `${person} WFH — ${dateLabel}${phNote}`;
                                const alpha = (0.35 + Math.min(cnt / 5, 1) * 0.65).toFixed(2);
                                const phClass = phThisWeek.length > 0 ? ' ph-overlap' : '';
                                html += `<td class="week-cell holiday-week${phClass}" style="background:rgba(23,162,184,${alpha})" data-tooltip="${tooltip.replace(/"/g, '&quot;')}">${cnt}</td>`;
                            }
                        });
                        html += `<td class="total-days-cell">${totalDays}</td></tr>`;
                    });

                    html += `</tbody></table></div>`;
                }

                // Public holidays reference table (stays monthly)
                if (pubHolidays.length > 0) {
                    html += `<h2 style="margin-top:24px;">🗓️ Public Holidays — ${currentYear}</h2>`;
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

            // Scroll holiday + WFH week tables to current week (show future, not Jan)
            if (isCurrentYear) {
                requestAnimationFrame(() => {
                    document.querySelectorAll('.holiday-view .weekly-table').forEach(table => {
                        const th = table.querySelector(`th.week-num-header[data-week="${currentISOWeek}"]`);
                        if (!th) return;
                        const scroller = table.closest('div[style*="overflow-x"]') || table.parentElement;
                        if (!scroller) return;
                        const sticky = table.querySelector('th.person-col');
                        const stickyW = sticky ? sticky.offsetWidth : 0;
                        const thLeft = th.offsetLeft;
                        scroller.scrollLeft = Math.max(0, thLeft - stickyW - 4);
                    });
                });
            }
        }
